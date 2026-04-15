/**
 * Lightweight i18n for the Mini App.
 *
 * language_code "uk" | "ru" → Ukrainian, everything else → English.
 */

type Locale = "en" | "uk";

const translations = {
  // ── Welcome screen ──
  "welcome.club_name": { en: "FC Real Pharma (Ukraine)", uk: "FC Real Pharma (Україна)" },
  "welcome.screening": { en: "Official Player Screening", uk: "Офіційний відбір гравців" },
  "welcome.subtitle": { en: "Professional club  |  Ukrainian Second Division", uk: "Професійний клуб  |  Друга ліга України" },
  "welcome.upload_text": { en: "Upload your profile and video for official review.", uk: "Надішліть свій профіль та відео для офіційного розгляду." },
  "welcome.cta": { en: "Start as a Player", uk: "Почати як гравець" },

  // ── Trust card ──
  "trust.official": { en: "Official club process", uk: "Офіційний процес клубу" },
  "trust.real_review": { en: "Real club review", uk: "Реальний розгляд клубом" },
  "trust.next_step": { en: "Next step for selected players", uk: "Наступний крок для обраних гравців" },

  // ── Progress bar / Steps ──
  "step.registration": { en: "Registration", uk: "Реєстрація" },
  "step.video": { en: "Video", uk: "Відео" },
  "step.payment": { en: "Payment", uk: "Оплата" },
  "step.social": { en: "Verification", uk: "Верифікація" },
  "step.of": { en: "Step {current} of {total}", uk: "Крок {current} з {total}" },

  // ── Registration screen ──
  "reg.personal_title": { en: "Personal Information", uk: "Особиста інформація" },
  "reg.personal_desc": { en: "Tell us about yourself", uk: "Розкажіть про себе" },
  "reg.full_name": { en: "Full Name", uk: "Повне ім'я" },
  "reg.full_name_placeholder": { en: "John Okafor", uk: "Іван Петренко" },
  "reg.age": { en: "Age", uk: "Вік" },
  "reg.country": { en: "Country", uk: "Країна" },
  "reg.country_placeholder": { en: "Select", uk: "Обрати" },
  "reg.city": { en: "City", uk: "Місто" },
  "reg.city_placeholder": { en: "Lagos", uk: "Київ" },
  "reg.whatsapp": { en: "WhatsApp Phone", uk: "Телефон WhatsApp" },
  "reg.email": { en: "Email", uk: "Email" },
  "reg.email_placeholder": { en: "you@email.com", uk: "you@email.com" },
  "reg.optional": { en: "(optional)", uk: "(необов'язково)" },

  "reg.football_title": { en: "Football Profile", uk: "Футбольний профіль" },
  "reg.football_desc": { en: "Your playing details", uk: "Ваші ігрові дані" },
  "reg.position": { en: "Position", uk: "Позиція" },
  "reg.position_placeholder": { en: "Select position", uk: "Обрати позицію" },
  "reg.dominant_foot": { en: "Dominant Foot", uk: "Робоча нога" },
  "reg.dominant_foot_placeholder": { en: "Select", uk: "Обрати" },
  "reg.height": { en: "Height (cm)", uk: "Зріст (см)" },
  "reg.weight": { en: "Weight (kg)", uk: "Вага (кг)" },
  "reg.current_club": { en: "Current Club", uk: "Поточний клуб" },
  "reg.current_club_placeholder": { en: "Club name or N/A", uk: "Назва клубу або Н/Д" },
  "reg.free_agent": { en: "I am currently a free agent", uk: "Я зараз вільний агент" },
  "reg.about": { en: "About You", uk: "Про вас" },
  "reg.about_placeholder": {
    en: "Briefly describe your football experience, achievements, or goals...",
    uk: "Коротко опишіть свій футбольний досвід, досягнення або цілі...",
  },
  "reg.consent_terms": { en: "I agree to the", uk: "Я погоджуюся з" },
  "reg.terms": { en: "Terms of Service", uk: "Умовами використання" },
  "reg.and": { en: "and", uk: "та" },
  "reg.privacy": { en: "Privacy Policy", uk: "Політикою конфіденційності" },
  "reg.cta": { en: "Continue", uk: "Продовжити" },

  // ── Registration validation ──
  "val.full_name_required": { en: "Full name is required", uk: "Вкажіть повне ім'я" },
  "val.age_required": { en: "Age is required", uk: "Вкажіть вік" },
  "val.age_range": { en: "Age must be between 10 and 60", uk: "Вік має бути від 10 до 60" },
  "val.country_required": { en: "Country is required", uk: "Оберіть країну" },
  "val.city_required": { en: "City is required", uk: "Вкажіть місто" },
  "val.whatsapp_required": { en: "WhatsApp number is required", uk: "Вкажіть номер WhatsApp" },
  "val.whatsapp_invalid": { en: "Enter a valid phone number", uk: "Введіть коректний номер" },
  "val.position_required": { en: "Position is required", uk: "Оберіть позицію" },
  "val.foot_required": { en: "Select your dominant foot", uk: "Оберіть робочу ногу" },
  "val.height_required": { en: "Height is required", uk: "Вкажіть зріст" },
  "val.height_range": { en: "Height must be 100–250 cm", uk: "Зріст має бути 100–250 см" },
  "val.weight_required": { en: "Weight is required", uk: "Вкажіть вагу" },
  "val.weight_range": { en: "Weight must be 30–200 kg", uk: "Вага має бути 30–200 кг" },
  "val.consent_required": { en: "You must agree to continue", uk: "Потрібно погодитися для продовження" },

  // ── Video screen ──
  "video.title": { en: "Upload Your Video", uk: "Завантажте відео" },
  "video.desc": {
    en: "Show us what you can do on the pitch. Upload a video of your best moments.",
    uk: "Покажіть, на що ви здатні на полі. Завантажте відео з найкращими моментами.",
  },
  "video.requirements": { en: "Video Requirements", uk: "Вимоги до відео" },
  "video.req_duration": { en: "3–5 minutes of highlights", uk: "3–5 хвилин хайлайтів" },
  "video.req_quality": { en: "Good video quality (720p or higher)", uk: "Якість відео 720p або вище" },
  "video.req_skills": { en: "Show your best skills and moves", uk: "Покажіть свої найкращі навички" },
  "video.req_footage": { en: "Real match or training footage", uk: "Реальне відео з матчу або тренування" },
  "video.tap_upload": { en: "Tap to upload video", uk: "Натисніть для завантаження" },
  "video.formats": { en: "MP4, MOV, AVI, WebM", uk: "MP4, MOV, AVI, WebM" },
  "video.max_size": { en: "max {size}MB", uk: "макс. {size}МБ" },
  "video.uploaded_note": { en: "Uploaded to server. Will be submitted after payment.", uk: "Завантажено на сервер. Буде надіслано після оплати." },
  "video.invalid_type": { en: "Please upload MP4, MOV, AVI, or WebM file", uk: "Завантажте файл MP4, MOV, AVI або WebM" },
  "video.too_large": { en: "File is too large. Maximum size is {size}MB", uk: "Файл занадто великий. Максимум {size}МБ" },
  "video.cta": { en: "Continue to Official Review", uk: "Продовжити до офіційного розгляду" },

  // ── Payment screen ──
  "pay.title": { en: "Official Player Screening", uk: "Офіційний відбір гравців" },
  "pay.subtitle": { en: "Official club review", uk: "Офіційний розгляд клубом" },
  "pay.desc": {
    en: "Submit your profile and video for official review by FC Real Pharma. Selected players move to the next stage of the screening process.",
    uk: "Надішліть свій профіль та відео для офіційного розгляду FC Real Pharma. Обрані гравці переходять до наступного етапу відбору.",
  },
  "pay.benefit_profile": { en: "Profile Review", uk: "Розгляд профілю" },
  "pay.benefit_profile_desc": { en: "Your registration is reviewed by the club team", uk: "Вашу реєстрацію розглядає команда клубу" },
  "pay.benefit_video": { en: "Video Review", uk: "Розгляд відео" },
  "pay.benefit_video_desc": { en: "Your footage is reviewed as part of the screening process", uk: "Ваше відео розглядається в рамках процесу відбору" },
  "pay.benefit_decision": { en: "Selection Decision", uk: "Рішення про відбір" },
  "pay.benefit_decision_desc": { en: "You receive a clear next-step decision", uk: "Ви отримаєте чітке рішення щодо наступного кроку" },
  "pay.benefit_submission": { en: "Official Submission", uk: "Офіційна подача" },
  "pay.benefit_submission_desc": { en: "Your application becomes officially submitted after payment", uk: "Ваша заявка офіційно подається після оплати" },
  "pay.stars": { en: "Stars", uk: "Stars" },
  "pay.one_time_fee": { en: "One-time review fee", uk: "Одноразовий збір за розгляд" },
  "pay.secure": { en: "Secure payment via Telegram", uk: "Безпечна оплата через Telegram" },
  "pay.cta": { en: "Complete Submission — {amount} Star{s}", uk: "Завершити подачу — {amount} Star{s}" },
  "pay.upload_first": { en: "Please upload your video first.", uk: "Спочатку завантажте відео." },
  "pay.open_from_tg": { en: "Open this mini app from Telegram to continue.", uk: "Відкрийте міні-додаток з Telegram для продовження." },
  "pay.invoice_unavailable": { en: "Telegram invoice UI is not available.", uk: "Інтерфейс оплати Telegram недоступний." },
  "pay.invoice_missing": { en: "Invoice link is missing. Please try again.", uk: "Посилання на рахунок відсутнє. Спробуйте ще раз." },
  "pay.invoice_invalid_protocol": { en: "Invalid invoice link protocol.", uk: "Невірний протокол посилання на рахунок." },
  "pay.invoice_invalid_format": { en: "Invalid invoice link format. Please try again.", uk: "Невірний формат посилання. Спробуйте ще раз." },
  "pay.not_confirmed": {
    en: "Payment not confirmed yet. If you don't have Stars, you can buy them with @PremiumBot.",
    uk: "Оплата ще не підтверджена. Якщо у вас немає Stars, купіть їх через @PremiumBot.",
  },
  "pay.buy_stars": { en: "Buy Stars with @PremiumBot", uk: "Купити Stars через @PremiumBot" },

  // ── Social verification screen (UKR flow) ──
  "social.title": { en: "Official Club Channels", uk: "\u041e\u0444\u0456\u0446\u0456\u0439\u043d\u0456 \u043a\u0430\u043d\u0430\u043b\u0438 \u043a\u043b\u0443\u0431\u0443" },
  "social.desc": {
    en: "Subscribe to the club\u2019s official channels to complete your application.",
    uk: "\u041f\u0456\u0434\u043f\u0438\u0448\u0456\u0442\u044c\u0441\u044f \u043d\u0430 \u043e\u0444\u0456\u0446\u0456\u0439\u043d\u0456 \u043a\u0430\u043d\u0430\u043b\u0438 \u043a\u043b\u0443\u0431\u0443, \u0449\u043e\u0431 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0438 \u0437\u0430\u044f\u0432\u043a\u0443.",
  },
  "social.instagram": { en: "Instagram", uk: "Instagram" },
  "social.instagram_desc": { en: "Follow our official Instagram", uk: "\u041f\u0456\u0434\u043f\u0438\u0448\u0456\u0442\u044c\u0441\u044f \u043d\u0430 \u043d\u0430\u0448 Instagram" },
  "social.open_instagram": { en: "Open Instagram", uk: "\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438 Instagram" },
  "social.i_subscribed_ig": { en: "I subscribed", uk: "\u042f \u043f\u0456\u0434\u043f\u0438\u0441\u0430\u0432\u0441\u044f" },
  "social.checking": { en: "Verifying subscription\u2026", uk: "\u041f\u0435\u0440\u0435\u0432\u0456\u0440\u044f\u0454\u043c\u043e \u043f\u0456\u0434\u043f\u0438\u0441\u043a\u0443\u2026" },
  "social.telegram": { en: "Telegram Channel", uk: "Telegram-\u043a\u0430\u043d\u0430\u043b" },
  "social.telegram_desc": { en: "Join our official Telegram channel", uk: "\u041f\u0440\u0438\u0454\u0434\u043d\u0430\u0439\u0442\u0435\u0441\u044f \u0434\u043e \u043d\u0430\u0448\u043e\u0433\u043e Telegram-\u043a\u0430\u043d\u0430\u043b\u0443" },
  "social.open_telegram": { en: "Open Channel", uk: "\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438 \u043a\u0430\u043d\u0430\u043b" },
  "social.check_telegram": { en: "Check subscription", uk: "\u041f\u0435\u0440\u0435\u0432\u0456\u0440\u0438\u0442\u0438 \u043f\u0456\u0434\u043f\u0438\u0441\u043a\u0443" },
  "social.tg_not_found": {
    en: "Subscription not found. Please join the channel and try again.",
    uk: "\u041f\u0456\u0434\u043f\u0438\u0441\u043a\u0443 \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e. \u041f\u0440\u0438\u0454\u0434\u043d\u0430\u0439\u0442\u0435\u0441\u044f \u0434\u043e \u043a\u0430\u043d\u0430\u043b\u0443 \u0442\u0430 \u0441\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0437\u043d\u043e\u0432\u0443.",
  },
  "social.cta": { en: "Complete Submission", uk: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0438 \u043f\u043e\u0434\u0430\u0447\u0443" },
  "social.done_ig": { en: "Subscribed", uk: "\u041f\u0456\u0434\u043f\u0438\u0441\u0430\u043d\u043e" },
  "social.done_tg": { en: "Confirmed", uk: "\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043e" },

  // ── Done / Complete screen ──
  "done.title": { en: "You're All Set!", uk: "Все готово!" },
  "done.desc": {
    en: "Your application has been submitted. Our team will review your profile and video, and get back to you within 48 hours.",
    uk: "Вашу заявку надіслано. Наша команда розгляне ваш профіль та відео і зв'яжеться з вами протягом 48 годин.",
  },
  "done.desc_paid": {
    en: "Your application has been officially submitted to FC Real Pharma. Selected players will be contacted with next steps.",
    uk: "Вашу заявку офіційно надіслано до FC Real Pharma. З обраними гравцями зв'яжуться щодо наступних кроків.",
  },
  "done.close": { en: "You can close this window now.", uk: "Тепер можна закрити це вікно." },

  // ── Misc ──
  "misc.open_from_tg": { en: "Please open this mini app from Telegram.", uk: "Відкрийте цей міні-додаток з Telegram." },
  "misc.status_error": {
    en: "Couldn't load your application status. Check your connection and try again.",
    uk: "Не вдалося завантажити статус заявки. Перевірте з'єднання та спробуйте знову.",
  },
  "misc.retry": { en: "Retry", uk: "Повторити" },
  "misc.something_wrong": { en: "Something went wrong. Try again.", uk: "Щось пішло не так. Спробуйте ще раз." },

  // ── Positions (select options) ──
  "pos.goalkeeper": { en: "Goalkeeper", uk: "Воротар" },
  "pos.centre_back": { en: "Centre-Back", uk: "Центральний захисник" },
  "pos.left_back": { en: "Left-Back", uk: "Лівий захисник" },
  "pos.right_back": { en: "Right-Back", uk: "Правий захисник" },
  "pos.defensive_mid": { en: "Defensive Midfielder", uk: "Опорний півзахисник" },
  "pos.central_mid": { en: "Central Midfielder", uk: "Центральний півзахисник" },
  "pos.attacking_mid": { en: "Attacking Midfielder", uk: "Атакуючий півзахисник" },
  "pos.left_winger": { en: "Left Winger", uk: "Лівий вінгер" },
  "pos.right_winger": { en: "Right Winger", uk: "Правий вінгер" },
  "pos.striker": { en: "Striker", uk: "Нападник" },
  "pos.centre_forward": { en: "Centre-Forward", uk: "Центрфорвард" },

  // ── Dominant foot ──
  "foot.right": { en: "Right", uk: "Права" },
  "foot.left": { en: "Left", uk: "Ліва" },
  "foot.both": { en: "Both", uk: "Обидві" },
} as const;

export type TranslationKey = keyof typeof translations;

let currentLocale: Locale = "en";

export function detectLocale(languageCode?: string | null): Locale {
  if (languageCode && (languageCode.toLowerCase() === "uk" || languageCode.toLowerCase() === "ru")) {
    return "uk";
  }
  return "en";
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function initLocale() {
  if (typeof window !== "undefined") {
    const forced = new URLSearchParams(window.location.search).get("force_locale")?.trim().toLowerCase();
    if (forced === "en" || forced === "uk") {
      currentLocale = forced;
      return;
    }
  }

  const webapp = typeof window !== "undefined" ? window.Telegram?.WebApp : null;
  const langCode = webapp?.initDataUnsafe?.user?.language_code;
  currentLocale = detectLocale(langCode);
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const entry = translations[key];
  if (!entry) return key;
  let text: string = entry[currentLocale] || entry.en;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
