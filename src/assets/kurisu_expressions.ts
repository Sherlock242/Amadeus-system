/**
 * KURISU EXPRESSIONS — Asset Paths
 * All paths point to the root /images/ directory.
 * Mapping follows the 3-frame sequence: [Closed, Half-Open, Fully Open]
 */

const IMAGE_PATH = '/images/';

export const kurisuExpressions: Record<string, string[]> = {
  // ── Basic Emotions (Front Facing) ──
  'normal':              [`${IMAGE_PATH}kurisu_normal1.png`,             `${IMAGE_PATH}kurisu_normal2.png`,             `${IMAGE_PATH}kurisu_normal3.png`],
  'happy':               [`${IMAGE_PATH}kurisu_happy1.png`,              `${IMAGE_PATH}kurisu_happy2.png`,              `${IMAGE_PATH}kurisu_happy3.png`],
  'sad':                 [`${IMAGE_PATH}kurisu_sad1.png`,                `${IMAGE_PATH}kurisu_sad2.png`,                `${IMAGE_PATH}kurisu_sad3.png`],
  'angry':               [`${IMAGE_PATH}kurisu_angry1.png`,              `${IMAGE_PATH}kurisu_angry2.png`,              `${IMAGE_PATH}kurisu_angry2.png`], // angry3 missing
  'annoyed':             [`${IMAGE_PATH}kurisu_annoyed1.png`,            `${IMAGE_PATH}kurisu_annoyed2.png`,            `${IMAGE_PATH}kurisu_annoyed3.png`],
  'blush':               [`${IMAGE_PATH}kurisu_blush1.png`,              `${IMAGE_PATH}kurisu_blush2.png`,              `${IMAGE_PATH}kurisu_blush3.png`],
  'disappointed':        [`${IMAGE_PATH}kurisu_disappointed1.png`,       `${IMAGE_PATH}kurisu_disappointed2.png`,       `${IMAGE_PATH}kurisu_disappointed3.png`],
  'indifferent':         [`${IMAGE_PATH}kurisu_indifferent1.png`,        `${IMAGE_PATH}kurisu_indifferent2.png`,        `${IMAGE_PATH}kurisu_indifferent3.png`],
  'pissed':              [`${IMAGE_PATH}kurisu_pissed1.png`,             `${IMAGE_PATH}kurisu_pissed2.png`,             `${IMAGE_PATH}kurisu_pissed3.png`],
  'eyes_closed':         [`${IMAGE_PATH}kurisu_eyes_closed1.png`,        `${IMAGE_PATH}kurisu_eyes_closed2.png`,        `${IMAGE_PATH}kurisu_eyes_closed3.png`],
  'winking':             [`${IMAGE_PATH}kurisu_winking1.png`,            `${IMAGE_PATH}kurisu_winking2.png`,            `${IMAGE_PATH}kurisu_winking3.png`],

  // ── Sided Perspectives (Profile) ──
  'side':                [`${IMAGE_PATH}kurisu_side1.png`,               `${IMAGE_PATH}kurisu_side2.png`,               `${IMAGE_PATH}kurisu_side3.png`],
  'sided_angry':         [`${IMAGE_PATH}kurisu_sided_angry1.png`,        `${IMAGE_PATH}kurisu_sided_angry2.png`,        `${IMAGE_PATH}kurisu_sided_angry3.png`],
  'sided_blush':         [`${IMAGE_PATH}kurisu_sided_blush1.png`,        `${IMAGE_PATH}kurisu_sided_blush2.png`,        `${IMAGE_PATH}kurisu_sided_blush3.png`],
  'sided_pleasant':      [`${IMAGE_PATH}kurisu_sided_pleasant1.png`,     `${IMAGE_PATH}kurisu_sided_pleasant2.png`,     `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
  'sided_surprised':     [`${IMAGE_PATH}kurisu_sided_surprised1.png`,    `${IMAGE_PATH}kurisu_sided_surprised2.png`,    `${IMAGE_PATH}kurisu_sided_surprised3.png`],
  'sided_thinking':      [`${IMAGE_PATH}kurisu_sided_thinking1.png`,     `${IMAGE_PATH}kurisu_sided_thinking2.png`,     `${IMAGE_PATH}kurisu_sided_thinking3.png`],
  'sided_talking':       [`${IMAGE_PATH}kurisu_sided_talking1.png`,      `${IMAGE_PATH}kurisu_sided_talking2.png`,      `${IMAGE_PATH}kurisu_sided_talking3.png`],
  'sided_eyes_closed':   [`${IMAGE_PATH}kurisu_sided_eyes_closed1.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed2.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed3.png`],

  // ── Logical Aliases ──
  'thinking':            [`${IMAGE_PATH}kurisu_sided_thinking1.png`,     `${IMAGE_PATH}kurisu_sided_thinking2.png`,     `${IMAGE_PATH}kurisu_sided_thinking3.png`],
  'surprised':           [`${IMAGE_PATH}kurisu_sided_surprised1.png`,    `${IMAGE_PATH}kurisu_sided_surprised2.png`,    `${IMAGE_PATH}kurisu_sided_surprised3.png`],
  'pleasant':            [`${IMAGE_PATH}kurisu_sided_pleasant1.png`,     `${IMAGE_PATH}kurisu_sided_pleasant2.png`,     `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
  'worried':             [`${IMAGE_PATH}kurisu_sided_talking1.png`,      `${IMAGE_PATH}kurisu_sided_talking2.png`,      `${IMAGE_PATH}kurisu_sided_talking3.png`],
  'glitching':           [`${IMAGE_PATH}kurisu_pissed1.png`,             `${IMAGE_PATH}kurisu_pissed2.png`,             `${IMAGE_PATH}kurisu_pissed3.png`],

  // ── User Provided Strict Sided Aliases ──
  'kurisu_sided_thinking':    [`${IMAGE_PATH}kurisu_sided_thinking1.png`,     `${IMAGE_PATH}kurisu_sided_thinking2.png`,     `${IMAGE_PATH}kurisu_sided_thinking3.png`],
  'kurisu_sided_surprised':   [`${IMAGE_PATH}kurisu_sided_surprised1.png`,    `${IMAGE_PATH}kurisu_sided_surprised2.png`,    `${IMAGE_PATH}kurisu_sided_surprised3.png`],
  'kurisu_sided_pleasant':    [`${IMAGE_PATH}kurisu_sided_pleasant1.png`,     `${IMAGE_PATH}kurisu_sided_pleasant2.png`,     `${IMAGE_PATH}kurisu_sided_pleasant3.png`],
  'kurisu_sided_eyes_closed': [`${IMAGE_PATH}kurisu_sided_eyes_closed1.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed2.png`,  `${IMAGE_PATH}kurisu_sided_eyes_closed3.png`],
  'kurisu_sided_blush':       [`${IMAGE_PATH}kurisu_sided_blush1.png`,        `${IMAGE_PATH}kurisu_sided_blush2.png`,        `${IMAGE_PATH}kurisu_sided_blush3.png`],
  'kurisu_sided_angry':       [`${IMAGE_PATH}kurisu_sided_angry1.png`,        `${IMAGE_PATH}kurisu_sided_angry2.png`,        `${IMAGE_PATH}kurisu_sided_angry3.png`],
  'kurisu_sided_talking':     [`${IMAGE_PATH}kurisu_sided_talking1.png`,      `${IMAGE_PATH}kurisu_sided_talking2.png`,      `${IMAGE_PATH}kurisu_sided_talking3.png`],
};

export type KurisuExpression = keyof typeof kurisuExpressions;
