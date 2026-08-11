/**
 * Layout rectangles for the question-page.png background.
 *
 * All coordinates are in design-space pixels (852 × 1846).
 * They are scaled at runtime via: scale = screenWidth / PNG_WIDTH.
 *
 * Derived from the 373 × 818 reference design, pre-scaled to 852 × 1846.
 */

export const PNG_WIDTH = 852;
export const PNG_HEIGHT = 1846;

// --- Top bar ---

/** Profile icon — circular frame top-left */
export const PROFILE_ICON = { cx: 110, cy: 54, r: 46 };

/** Coin bar — top center */
export const COIN_BAR = { x: 404, y: 36, w: 235, h: 59 };

/** Achievement icon — top right */
export const ACHIEVEMENT_ICON = { cx: 651, cy: 54, r: 28 };

/** Settings icon — top right */
export const SETTINGS_ICON = { cx: 751, cy: 54, r: 28 };

// --- Question section ---

/** Back button — circular frame */
export const BACK_BUTTON = { cx: 118, cy: 376, r: 46 };

/** Category badge — ornate frame near the top */
export const CATEGORY_BADGE = { x: 265, y: 298, w: 331, h: 95 };

/** Progress indicator — small frame top-right */
export const PROGRESS = { x: 619, y: 228, w: 103, h: 63 };

/** Question text — large ornate frame */
export const QUESTION_BOX = { x: 91, y: 514, w: 671, h: 395 };

// --- Answer options ---

/** Answer option A — decorative frame */
export const ANSWER_A = { x: 183, y: 983, w: 525, h: 91 };

/** Answer option B — decorative frame */
export const ANSWER_B = { x: 183, y: 1091, w: 525, h: 91 };

/** Answer option C — decorative frame */
export const ANSWER_C = { x: 183, y: 1196, w: 525, h: 91 };

/** Answer option D — decorative frame */
export const ANSWER_D = { x: 183, y: 1292, w: 525, h: 91 };

/** Select buttons — invisible buttons to the left of each option */
export const SELECT_A = { x: 101, y: 973, w: 90, h: 90 };
export const SELECT_B = { x: 101, y: 1087, w: 90, h: 90 };
export const SELECT_C = { x: 101, y: 1201, w: 90, h: 90 };
export const SELECT_D = { x: 101, y: 1317, w: 90, h: 90 };

/** Glow buttons — decorative circles behind select buttons */
export const GLOW_A = { cx: 147, cy: 1021, r: 35 };
export const GLOW_B = { cx: 147, cy: 1135, r: 35 };
export const GLOW_C = { cx: 147, cy: 1250, r: 35 };
export const GLOW_D = { cx: 147, cy: 1365, r: 35 };

/** Option glow buttons — capsule shape behind answer options */
export const OPT_GLOW_A = { x: 96, y: 977, w: 656, h: 93 };
export const OPT_GLOW_B = { x: 96, y: 1091, w: 656, h: 93 };
export const OPT_GLOW_C = { x: 96, y: 1205, w: 656, h: 93 };
export const OPT_GLOW_D = { x: 96, y: 1316, w: 656, h: 93 };

/** Letter badge circle inside each answer frame */
export const LETTER_BADGE = { r: 34 };

// --- Bottom section ---

/** Hint button — circular frame on the left */
export const HINT = { cx: 117, cy: 1483, r: 48 };

/** Submit button — between Hint and Skip */
export const SUBMIT = { x: 224, y: 1469, w: 400, h: 116 };

/** Skip button — circular frame on the right */
export const SKIP = { cx: 731, cy: 1483, r: 48 };

/** XP/Coins panel — bottom ornamental bar */
export const XP_PANEL = { x: 50, y: 1648, w: 751, h: 124 };
