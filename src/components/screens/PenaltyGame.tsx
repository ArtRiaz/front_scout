"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";
import { PENALTY_CONFIG, type ShotResult } from "@/lib/penaltyConfig";
import { getBestScore, saveBestScore } from "@/lib/gameStorage";

type Phase = "intro" | "ready" | "shooting" | "result" | "over";

interface PenaltyGameProps {
  onExit: () => void;
}

const { goal, ballStart, swipe, keeper, ball, curve } = PENALTY_CONFIG;
const goalHalfSpan = ((goal.rightFrac - goal.leftFrac) / 2) * 0.92;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Measure how much a swipe arced, as a signed value roughly in [-1, 1].
 * Positive = bowed to the right. Uses the largest perpendicular deviation of
 * the drawn path from the straight start→end chord, normalized by chord length.
 */
function measureCurve(path: { x: number; y: number }[]): number {
  if (path.length < 3) return 0;
  const a = path[0];
  const b = path[path.length - 1];
  const cx = b.x - a.x;
  const cy = b.y - a.y;
  const chord = Math.hypot(cx, cy);
  if (chord < 1) return 0;

  let maxDev = 0;
  for (let i = 1; i < path.length - 1; i++) {
    const p = path[i];
    // Signed perpendicular distance of p from line a→b.
    const dev = (cx * (p.y - a.y) - cy * (p.x - a.x)) / chord;
    if (Math.abs(dev) > Math.abs(maxDev)) maxDev = dev;
  }

  const raw = maxDev / chord;
  if (Math.abs(raw) < swipe.curveDeadzone) return 0;
  return clamp(raw * swipe.curveGain, -1, 1) * curve.direction;
}

/**
 * Convert a swipe vector (+ measured spin) into a resolved shot: where the
 * ball lands, whether it's on target, and where the keeper dives.
 */
function resolveShot(
  dx: number,
  dy: number,
  spin: number,
  width: number,
  height: number,
) {
  const dist = Math.hypot(dx, dy);
  const power = dist / (height * swipe.referenceFrac);
  // Spin curls the ball beyond the raw aim, into the corners.
  const aimX = clamp(
    dx / (width * swipe.aimWidthFrac) + spin * curve.aimFactor,
    -1,
    1,
  );

  const landXFrac = 0.5 + aimX * goalHalfSpan;
  let landYFrac: number;
  let onTarget = true;

  if (power < swipe.weakBelow) {
    // Too soft — ball trickles and stops well short of the line.
    onTarget = false;
    landYFrac = 0.62;
  } else if (power > swipe.overAbove) {
    // Too hard — sails over the crossbar.
    onTarget = false;
    landYFrac = goal.topFrac - 0.08;
  } else {
    const tp = (power - swipe.weakBelow) / (swipe.overAbove - swipe.weakBelow);
    landYFrac = goal.bottomFrac - tp * (goal.bottomFrac - (goal.topFrac + 0.02));
  }

  // Honest keeper: dives to a random spot along the goal line.
  const keeperAim = Math.random() * 2 - 1;
  const keeperXFrac = 0.5 + keeperAim * goalHalfSpan;

  let result: ShotResult;
  if (!onTarget) {
    result = "miss";
  } else if (Math.abs(landXFrac - keeperXFrac) < keeper.saveRadiusFrac) {
    result = "save";
  } else {
    result = "goal";
  }

  return { result, landXFrac, landYFrac, keeperXFrac, keeperAim };
}

export function PenaltyGame({ onExit }: PenaltyGameProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const swipePath = useRef<{ x: number; y: number }[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [shotIndex, setShotIndex] = useState(0);
  const [goals, setGoals] = useState(0);
  const [result, setResult] = useState<ShotResult | null>(null);
  const [best, setBest] = useState(0);
  const [isRecord, setIsRecord] = useState(false);

  const [ballAnim, setBallAnim] = useState<{
    mx: number;
    my: number;
    ms: number;
    fx: number;
    fy: number;
    fs: number;
  } | null>(null);
  const [keeperTransform, setKeeperTransform] = useState("none");
  const [resetting, setResetting] = useState(true);
  const [aimLine, setAimLine] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setBest(getBestScore());
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startGame = useCallback(() => {
    clearTimers();
    setShotIndex(0);
    setGoals(0);
    setResult(null);
    setIsRecord(false);
    setBallAnim(null);
    setKeeperTransform("none");
    setResetting(true);
    setPhase("ready");
  }, [clearTimers]);

  const shoot = useCallback(
    (dx: number, dy: number, spin: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();

      const { result: shotResult, landXFrac, landYFrac, keeperAim } = resolveShot(
        dx,
        dy,
        spin,
        rect.width,
        rect.height,
      );

      const startX = ballStart.xFrac * rect.width;
      const startY = ballStart.yFrac * rect.height;
      const targetX = landXFrac * rect.width;
      const targetY = landYFrac * rect.height;

      // Deltas from the ball anchor for the flight keyframes.
      const fx = targetX - startX;
      const fy = targetY - startY;
      // Mid control point bows sideways by the spin, so the path visibly curls.
      const mx = fx * 0.55 + spin * curve.bendFrac * rect.width;
      const my = fy * 0.55;
      const ms = 1 + (ball.landingScale - 1) * 0.55;

      const keeperShiftX = keeperAim * goalHalfSpan * rect.width;

      setResetting(false);
      setPhase("shooting");
      setBallAnim({ mx, my, ms, fx, fy, fs: ball.landingScale });
      setKeeperTransform(
        `translateX(${keeperShiftX}px) rotate(${keeperAim * 20}deg)`,
      );

      timers.current.push(
        setTimeout(() => {
          setResult(shotResult);
          setPhase("result");
          const nextGoals = shotResult === "goal" ? goals + 1 : goals;
          if (shotResult === "goal") setGoals(nextGoals);

          const nextIndex = shotIndex + 1;
          timers.current.push(
            setTimeout(() => {
              if (nextIndex >= PENALTY_CONFIG.shots) {
                const { best: newBest, isRecord: rec } = saveBestScore(nextGoals);
                setBest(newBest);
                setIsRecord(rec);
                setPhase("over");
              } else {
                setShotIndex(nextIndex);
                setResult(null);
                setResetting(true);
                setBallAnim(null);
                setKeeperTransform("none");
                setPhase("ready");
              }
            }, PENALTY_CONFIG.resultHoldMs),
          );
        }, ball.flightMs),
      );
    },
    [goals, shotIndex],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "ready") return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    swipePath.current = [{ x: e.clientX, y: e.clientY }];
    setAimLine({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    swipePath.current.push({ x: e.clientX, y: e.clientY });
    setAimLine({ x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    const path = swipePath.current;
    dragStart.current = null;
    swipePath.current = [];
    setAimLine(null);
    if (!start || phase !== "ready") return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Require a clear upward swipe of a minimum length.
    if (dy > -swipe.minDistancePx || Math.hypot(dx, dy) < swipe.minDistancePx) {
      return;
    }
    shoot(dx, dy, measureCurve(path));
  };

  const resultText = useMemo(() => {
    if (result === "goal") return t("game.result_goal");
    if (result === "save") return t("game.result_save");
    if (result === "miss") return t("game.result_miss");
    return "";
  }, [result]);

  const resultColor =
    result === "goal" ? "text-success" : result === "save" ? "text-white" : "text-club-red";

  // Aim guide (ball → current pointer), in stage-relative coordinates.
  const aimGuide = useMemo(() => {
    const stage = stageRef.current;
    if (!aimLine || !stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x1: ballStart.xFrac * rect.width,
      y1: ballStart.yFrac * rect.height,
      x2: aimLine.x - rect.left,
      y2: aimLine.y - rect.top,
    };
  }, [aimLine]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-brand">
      {/* Playfield */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative flex-1 touch-none select-none"
        style={{ touchAction: "none" }}
      >
        <Image
          src="/game/pitch-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

        {/* Goal frame + net */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={0.7}
            fill="none"
            vectorEffect="non-scaling-stroke"
          >
            <rect
              x={goal.leftFrac * 100}
              y={goal.topFrac * 100}
              width={(goal.rightFrac - goal.leftFrac) * 100}
              height={(goal.bottomFrac - goal.topFrac) * 100}
            />
          </g>
          <g stroke="rgba(255,255,255,0.22)" strokeWidth={0.4}>
            {Array.from({ length: 7 }).map((_, i) => {
              const x =
                (goal.leftFrac + ((goal.rightFrac - goal.leftFrac) * (i + 1)) / 8) * 100;
              return (
                <line key={`v${i}`} x1={x} y1={goal.topFrac * 100} x2={x} y2={goal.bottomFrac * 100} />
              );
            })}
            {Array.from({ length: 4 }).map((_, i) => {
              const y =
                (goal.topFrac + ((goal.bottomFrac - goal.topFrac) * (i + 1)) / 5) * 100;
              return (
                <line key={`h${i}`} x1={goal.leftFrac * 100} y1={y} x2={goal.rightFrac * 100} y2={y} />
              );
            })}
          </g>
        </svg>

        {/* Keeper */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            top: `${goal.bottomFrac * 100}%`,
            width: "26%",
            transform: `translate(-50%, -88%) ${keeperTransform !== "none" ? keeperTransform : ""}`,
            transition: resetting ? "none" : `transform ${keeper.diveDurationMs}ms ease-out`,
          }}
        >
          <Image
            src="/game/keeper.png"
            alt=""
            width={300}
            height={300}
            className="h-auto w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
          />
        </div>

        {/* Aim guide */}
        {aimGuide && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <line
              x1={aimGuide.x1}
              y1={aimGuide.y1}
              x2={aimGuide.x2}
              y2={aimGuide.y2}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={3}
              strokeDasharray="6 7"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Ball */}
        <div
          className="pointer-events-none absolute text-[42px] leading-none"
          style={
            {
              left: `${ballStart.xFrac * 100}%`,
              top: `${ballStart.yFrac * 100}%`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
              ...(ballAnim
                ? {
                    "--mx": `${ballAnim.mx}px`,
                    "--my": `${ballAnim.my}px`,
                    "--ms": ballAnim.ms,
                    "--fx": `${ballAnim.fx}px`,
                    "--fy": `${ballAnim.fy}px`,
                    "--fs": ballAnim.fs,
                    animation: `penaltyFlight ${ball.flightMs}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
                  }
                : {}),
            } as CSSProperties
          }
        >
          ⚽
        </div>

        {/* Result banner */}
        {phase === "result" && result && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className={`step-enter text-5xl font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] ${resultColor}`}
            >
              {resultText}
            </span>
          </div>
        )}

        {/* HUD */}
        {(phase === "ready" || phase === "shooting" || phase === "result") && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[max(1rem,var(--tg-safe-area-top))]">
            <span className="rounded-full bg-black/45 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              {t("game.shot_of", { current: shotIndex + 1, total: PENALTY_CONFIG.shots })}
            </span>
            <span className="rounded-full bg-club-red/90 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
              {t("game.goals")}: {goals}
            </span>
          </div>
        )}

        {/* Swipe hint */}
        {phase === "ready" && !aimLine && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[7%] flex justify-center">
            <span className="animate-pulse rounded-full bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {t("game.swipe_hint")}
            </span>
          </div>
        )}
      </div>

      {/* Intro overlay */}
      {phase === "intro" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand/85 px-6 text-center backdrop-blur-sm">
          <div className="step-enter flex w-full max-w-sm flex-col items-center">
            <div className="mb-5 text-6xl">⚽</div>
            <h1 className="text-2xl font-extrabold text-white">{t("game.title")}</h1>
            <p className="mt-3 text-[0.9375rem] leading-snug text-white/80">
              {t("game.intro_desc")}
            </p>
            <div className="mt-5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {t("game.best")}: {best}
            </div>
            <div className="mt-8 w-full">
              <Button onClick={startGame} className="bg-club-red hover:bg-club-red-hover">
                {t("game.start")}
              </Button>
              <button
                type="button"
                onClick={onExit}
                className="mt-3 w-full py-2 text-sm font-medium text-white/70 hover:text-white"
              >
                {t("game.exit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {phase === "over" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand/90 px-6 text-center backdrop-blur-sm">
          <div className="step-enter flex w-full max-w-sm flex-col items-center">
            <h2 className="text-2xl font-extrabold text-white">{t("game.over_title")}</h2>
            <div className="mt-4 text-6xl font-extrabold text-club-red">
              {goals}
              <span className="text-2xl text-white/50">/{PENALTY_CONFIG.shots}</span>
            </div>
            <p className="mt-2 text-[0.9375rem] text-white/80">
              {t("game.over_score", { goals, total: PENALTY_CONFIG.shots })}
            </p>
            {isRecord ? (
              <div className="mt-4 rounded-full bg-success/20 px-4 py-2 text-sm font-bold text-success">
                {t("game.new_record")}
              </div>
            ) : (
              <div className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {t("game.best")}: {best}
              </div>
            )}
            <div className="mt-8 w-full">
              <Button onClick={startGame} className="bg-club-red hover:bg-club-red-hover">
                {t("game.replay")}
              </Button>
              <button
                type="button"
                onClick={onExit}
                className="mt-3 w-full py-2 text-sm font-medium text-white/70 hover:text-white"
              >
                {t("game.exit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
