/**
 * KURISU EXPRESSIONS — Asset Paths (WebP optimized)
 * All paths point to the root /images/ directory.
 * Mapping follows the 3-frame sequence: [Closed, Half-Open, Fully Open]
 */

const IMAGE_PATH = '/images/';

export const kurisuExpressions: Record<string, string[]> = {
  // ── Basic Emotions (Front Facing) ──
  'normal':              [`${IMAGE_PATH}kurisu_normal1.webp`,             `${IMAGE_PATH}kurisu_normal2.webp`,             `${IMAGE_PATH}kurisu_normal3.webp`],
  'happy':               [`${IMAGE_PATH}kurisu_happy1.webp`,              `${IMAGE_PATH}kurisu_happy2.webp`,              `${IMAGE_PATH}kurisu_happy3.webp`],
  'sad':                 [`${IMAGE_PATH}kurisu_sad1.webp`,                `${IMAGE_PATH}kurisu_sad2.webp`,                `${IMAGE_PATH}kurisu_sad3.webp`],
  'angry':               [`${IMAGE_PATH}kurisu_angry1.webp`,              `${IMAGE_PATH}kurisu_angry2.webp`,              `${IMAGE_PATH}kurisu_angry3.webp`],
  'annoyed':             [`${IMAGE_PATH}kurisu_annoyed1.webp`,            `${IMAGE_PATH}kurisu_annoyed2.webp`,            `${IMAGE_PATH}kurisu_annoyed3.webp`],
  'blush':               [`${IMAGE_PATH}kurisu_blush1.webp`,              `${IMAGE_PATH}kurisu_blush2.webp`,              `${IMAGE_PATH}kurisu_blush3.webp`],
  'disappointed':        [`${IMAGE_PATH}kurisu_disappointed1.webp`,       `${IMAGE_PATH}kurisu_disappointed2.webp`,       `${IMAGE_PATH}kurisu_disappointed3.webp`],
  'indifferent':         [`${IMAGE_PATH}kurisu_indifferent1.webp`,        `${IMAGE_PATH}kurisu_indifferent2.webp`,        `${IMAGE_PATH}kurisu_indifferent3.webp`],
  'pissed':              [`${IMAGE_PATH}kurisu_pissed1.webp`,             `${IMAGE_PATH}kurisu_pissed2.webp`,             `${IMAGE_PATH}kurisu_pissed3.webp`],
  'eyes_closed':         [`${IMAGE_PATH}kurisu_eyes_closed1.webp`,        `${IMAGE_PATH}kurisu_eyes_closed2.webp`,        `${IMAGE_PATH}kurisu_eyes_closed3.webp`],
  'winking':             [`${IMAGE_PATH}kurisu_winking1.webp`,            `${IMAGE_PATH}kurisu_winking2.webp`,            `${IMAGE_PATH}kurisu_winking3.webp`],

  // ── Sided Perspectives (Profile) ──
  'side':                [`${IMAGE_PATH}kurisu_side1.webp`,               `${IMAGE_PATH}kurisu_side2.webp`,               `${IMAGE_PATH}kurisu_side3.webp`],
  'sided_angry':         [`${IMAGE_PATH}kurisu_sided_angry1.webp`,        `${IMAGE_PATH}kurisu_sided_angry2.webp`,        `${IMAGE_PATH}kurisu_sided_angry3.webp`],
  'sided_blush':         [`${IMAGE_PATH}kurisu_sided_blush1.webp`,        `${IMAGE_PATH}kurisu_sided_blush2.webp`,        `${IMAGE_PATH}kurisu_sided_blush3.webp`],
  'sided_pleasant':      [`${IMAGE_PATH}kurisu_sided_pleasant1.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant2.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant3.webp`],
  'sided_surprised':     [`${IMAGE_PATH}kurisu_sided_surprised1.webp`,    `${IMAGE_PATH}kurisu_sided_surprised2.webp`,    `${IMAGE_PATH}kurisu_sided_surprised3.webp`],
  'sided_thinking':      [`${IMAGE_PATH}kurisu_sided_thinking1.webp`,     `${IMAGE_PATH}kurisu_sided_thinking2.webp`,     `${IMAGE_PATH}kurisu_sided_thinking3.webp`],
  'sided_talking':       [`${IMAGE_PATH}kurisu_sided_talking1.webp`,      `${IMAGE_PATH}kurisu_sided_talking2.webp`,      `${IMAGE_PATH}kurisu_sided_talking3.webp`],
  'sided_eyes_closed':   [`${IMAGE_PATH}kurisu_sided_eyes_closed1.webp`,  `${IMAGE_PATH}kurisu_sided_eyes_closed2.webp`,  `${IMAGE_PATH}kurisu_sided_eyes_closed3.webp`],

  // ── Logical Aliases ──
  'thinking':            [`${IMAGE_PATH}kurisu_sided_thinking1.webp`,     `${IMAGE_PATH}kurisu_sided_thinking2.webp`,     `${IMAGE_PATH}kurisu_sided_thinking3.webp`],
  'surprised':           [`${IMAGE_PATH}kurisu_sided_surprised1.webp`,    `${IMAGE_PATH}kurisu_sided_surprised2.webp`,    `${IMAGE_PATH}kurisu_sided_surprised3.webp`],
  'pleasant':            [`${IMAGE_PATH}kurisu_sided_pleasant1.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant2.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant3.webp`],
  'talking':             [`${IMAGE_PATH}kurisu_sided_talking1.webp`,      `${IMAGE_PATH}kurisu_sided_talking2.webp`,      `${IMAGE_PATH}kurisu_sided_talking3.webp`],
  'glitching':           [`${IMAGE_PATH}kurisu_pissed1.webp`,             `${IMAGE_PATH}kurisu_pissed2.webp`,             `${IMAGE_PATH}kurisu_pissed3.webp`],

  // ── Strict Profile Access ──
  'kurisu_sided_thinking':    [`${IMAGE_PATH}kurisu_sided_thinking1.webp`,     `${IMAGE_PATH}kurisu_sided_thinking2.webp`,     `${IMAGE_PATH}kurisu_sided_thinking3.webp`],
  'kurisu_sided_surprised':   [`${IMAGE_PATH}kurisu_sided_surprised1.webp`,    `${IMAGE_PATH}kurisu_sided_surprised2.webp`,    `${IMAGE_PATH}kurisu_sided_surprised3.webp`],
  'kurisu_sided_pleasant':    [`${IMAGE_PATH}kurisu_sided_pleasant1.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant2.webp`,     `${IMAGE_PATH}kurisu_sided_pleasant3.webp`],
  'kurisu_sided_eyes_closed': [`${IMAGE_PATH}kurisu_sided_eyes_closed1.webp`,  `${IMAGE_PATH}kurisu_sided_eyes_closed2.webp`,  `${IMAGE_PATH}kurisu_sided_eyes_closed3.webp`],
  'kurisu_sided_blush':       [`${IMAGE_PATH}kurisu_sided_blush1.webp`,        `${IMAGE_PATH}kurisu_sided_blush2.webp`,        `${IMAGE_PATH}kurisu_sided_blush3.webp`],
  'kurisu_sided_angry':       [`${IMAGE_PATH}kurisu_sided_angry1.webp`,        `${IMAGE_PATH}kurisu_sided_angry2.webp`,        `${IMAGE_PATH}kurisu_sided_angry3.webp`],
  'kurisu_sided_talking':     [`${IMAGE_PATH}kurisu_sided_talking1.webp`,      `${IMAGE_PATH}kurisu_sided_talking2.webp`,      `${IMAGE_PATH}kurisu_sided_talking3.webp`],
};

export type KurisuExpression = keyof typeof kurisuExpressions;
