import type { EmotionalStateValues, NeurotransmitterState } from '@/types';

export const AMADEUS_BASELINE_NEUROCHEMISTRY: NeurotransmitterState = {
  dopamine: 52,
  serotonin: 48,
  norepinephrine: 45,
  acetylcholine: 60,
  cortisol: 30,
  oxytocin: 25,
  endorphin: 40,
  gabaGlutamate: 50,
};

export const emotionsToNeurochemistry = (
  emotions: EmotionalStateValues,
  baseline: NeurotransmitterState = AMADEUS_BASELINE_NEUROCHEMISTRY
): NeurotransmitterState => {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  return {
    dopamine: clamp(baseline.dopamine + (emotions.curiosity - 50) * 0.35 + (emotions.dopamine - 50) * 0.4 - emotions.melancholy * 0.2),
    serotonin: clamp(baseline.serotonin + (emotions.warmth - 50) * 0.3 - emotions.annoyance * 0.25),
    norepinephrine: clamp(baseline.norepinephrine + emotions.anxiety * 0.4 + emotions.stress * 0.35),
    acetylcholine: clamp(baseline.acetylcholine + (emotions.curiosity - 50) * 0.4),
    cortisol: clamp(baseline.cortisol + emotions.stress * 0.45),
    oxytocin: clamp(baseline.oxytocin + emotions.warmth * 0.45 + emotions.trust * 0.4),
    endorphin: clamp(baseline.endorphin + emotions.playfulness * 0.3),
    gabaGlutamate: clamp(baseline.gabaGlutamate + emotions.anxiety * 0.2),
  };
};

export const neurochemistryModulatesEmotions = (
  emotions: EmotionalStateValues,
  nc: NeurotransmitterState
): EmotionalStateValues => {
  const e = { ...emotions };
  if (nc.serotonin < 30) e.annoyance = Math.min(100, e.annoyance + 10);
  if (nc.cortisol > 65) e.anxiety = Math.min(100, e.anxiety + 10);
  return e;
};
