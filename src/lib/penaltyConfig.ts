/**
 * Penalty mini-game tuning.
 *
 * Everything that affects difficulty / feel lives here as plain data, so the
 * game rules can be re-balanced later without touching the component logic.
 * Positions are expressed as fractions (0..1) of the play area, so the game
 * scales to any screen size inside the Telegram WebView.
 */
export const PENALTY_CONFIG = {
  /** Shots per series (classic format). Change to re-length a round. */
  shots: 5,

  swipe: {
    /** Minimum swipe length (px) to register as a shot. */
    minDistancePx: 36,
    /** Swipe of this fraction of the stage height maps to power = 1.0. */
    referenceFrac: 0.32,
    /** Horizontal reach: swipe of this fraction of width = full side aim. */
    aimWidthFrac: 0.45,
    /** Power below this → weak shot (ball stops short, no goal). */
    weakBelow: 0.24,
    /** Power above this → over the bar (miss). */
    overAbove: 1.05,
    /** Ignore arcs smaller than this (fraction of chord) as "straight". */
    curveDeadzone: 0.07,
    /** How strongly the measured arc maps to spin (-1..1). */
    curveGain: 2.6,
  },

  curve: {
    /** Flip if the ball curls opposite to the swipe arc. */
    direction: 1 as 1 | -1,
    /** How much spin shifts the final landing across the goal. */
    aimFactor: 0.34,
    /** Sideways bow of the flight path, as a fraction of stage width. */
    bendFrac: 0.17,
  },

  keeper: {
    /** Horizontal reach as a fraction of the goal width. Bigger = harder. */
    saveRadiusFrac: 0.15,
    diveDurationMs: 300,
  },

  ball: {
    flightMs: 560,
    /** Shrink factor at the goal to fake depth/distance. */
    landingScale: 0.42,
  },

  /** Goal opening, as fractions of the play area. */
  goal: {
    topFrac: 0.17,
    bottomFrac: 0.4,
    leftFrac: 0.17,
    rightFrac: 0.83,
  },

  /** Ball resting position (penalty spot). */
  ballStart: {
    xFrac: 0.5,
    yFrac: 0.84,
  },

  /** How long the GOAL / SAVE / MISS banner stays before the next shot. */
  resultHoldMs: 1150,
} as const;

export type ShotResult = "goal" | "save" | "miss";

/**
 * Pilot access gate: the penalty entry button is only shown to these Telegram
 * user IDs. Add IDs (or clear the list to open it to everyone) after the pilot.
 */
export const PILOT_GAME_USER_IDS: readonly number[] = [1064938479];

export function isGameEnabledForUser(telegramUserId: number | null): boolean {
  if (PILOT_GAME_USER_IDS.length === 0) return true;
  return telegramUserId != null && PILOT_GAME_USER_IDS.includes(telegramUserId);
}
