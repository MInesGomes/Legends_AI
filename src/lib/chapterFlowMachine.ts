/**
 * chapterFlowMachine.ts
 *
 * Pure navigation logic for moving through a Tale, completely independent of
 * i18n/localization and React. Nothing in this file reads a translation
 * string or touches component state directly — it only answers the question
 * "given where we are, where do we go next / previous?".
 *
 * Overall shape of the story:
 *
 *   Chapter 0:  act0 -> (avatar gender act -> other gender act)? -> choices? -> Chapter 1
 *   Chapter N (N >= 1): act0 -> choices? -> Chapter N+1
 *   choices:    choices -> choice_act -> choice_feedback? -> (choice1: advance-chapter or back to choices; other choices: back to choices)
 *
 * The avatar-gender branch only exists in Chapter 0, and the "choices" step
 * only exists for chapters that define at least one available choice — both
 * are supplied per-chapter via ChapterMeta so this module never needs to know
 * about ChapterConfig, translations, or the ElDorado/Atlantis special-casing
 * that lives in ChapterFlow.tsx.
 */

export type FlowStep =
  | 'act0'
  | 'male_act'
  | 'female_act'
  | 'choices'
  | 'choice_act'
  | 'choice_feedback';

export type AvatarGender = 'male' | 'female';

export interface FlowPosition {
  chapterNumber: number;
  step: FlowStep;
}

/** Everything the machine needs to know about one chapter to route through it. */
export interface ChapterMeta {
  /** Chapter 0 only: does it play the male/female character acts? */
  hasGenderActs: boolean;
  /** Does this chapter have at least one available choice? */
  hasChoices: boolean;
}

/**
 * Outcome of a transition. `goto` is a plain position change; the other
 * kinds are handed back to the component because they need information the
 * machine doesn't have (which choice is "first", whether a next chapter
 * exists, how to close the flow).
 */
export type FlowOutcome =
  | { kind: 'goto'; position: FlowPosition }
  | { kind: 'select-first-choice' }
  | { kind: 'advance-chapter' }
  | { kind: 'close' }
  | { kind: 'noop' };

const goto = (chapterNumber: number, step: FlowStep): FlowOutcome => ({
  kind: 'goto',
  position: { chapterNumber, step },
});

/** The two character acts in Chapter 0, ordered by which one plays first for this avatar. */
export function getGenderActs(gender: AvatarGender): { avatar: FlowStep; other: FlowStep } {
  return gender === 'male'
    ? { avatar: 'male_act', other: 'female_act' }
    : { avatar: 'female_act', other: 'male_act' };
}

/** Where a chapter's own act/choice sequence starts, used when jumping into it from elsewhere. */
export function landingStepForChapter(
  meta: ChapterMeta,
  chapterNumber: number,
  gender: AvatarGender
): FlowStep {
  if (meta.hasChoices) return 'choices';
  if (chapterNumber === 0 && meta.hasGenderActs) return getGenderActs(gender).other;
  return 'act0';
}

function afterChapterZeroActs(chapterNumber: number, meta: ChapterMeta): FlowOutcome {
  if (meta.hasChoices) return goto(chapterNumber, 'choices');
  return goto(chapterNumber + 1, 'act0');
}

function nextInChapterZero(step: FlowStep, gender: AvatarGender, meta: ChapterMeta): FlowOutcome {
  const { avatar, other } = getGenderActs(gender);

  if (step === 'act0') {
    return meta.hasGenderActs ? goto(0, avatar) : afterChapterZeroActs(0, meta);
  }
  if (step === avatar) return goto(0, other);
  if (step === other) return afterChapterZeroActs(0, meta);
  if (step === 'choices') return { kind: 'select-first-choice' };
  return { kind: 'noop' };
}

function prevInChapterZero(step: FlowStep, gender: AvatarGender, meta: ChapterMeta): FlowOutcome {
  const { avatar, other } = getGenderActs(gender);

  if (step === 'choices') return goto(0, meta.hasGenderActs ? other : 'act0');
  if (step === other) return goto(0, avatar);
  if (step === avatar) return goto(0, 'act0');
  if (step === 'act0') return { kind: 'close' };
  return { kind: 'noop' };
}

function nextInStandardChapter(chapterNumber: number, step: FlowStep, meta: ChapterMeta): FlowOutcome {
  if (step === 'act0') {
    return meta.hasChoices ? goto(chapterNumber, 'choices') : { kind: 'advance-chapter' };
  }
  if (step === 'choices') return { kind: 'select-first-choice' };
  return { kind: 'noop' };
}

function prevInStandardChapter(
  chapterNumber: number,
  step: FlowStep,
  gender: AvatarGender,
  getMeta: (chapterNumber: number) => ChapterMeta
): FlowOutcome {
  if (step === 'choices') return goto(chapterNumber, 'act0');
  if (step === 'act0') {
    const prevChapterNumber = chapterNumber - 1;
    const prevMeta = getMeta(prevChapterNumber);
    return goto(prevChapterNumber, landingStepForChapter(prevMeta, prevChapterNumber, gender));
  }
  return { kind: 'noop' };
}

/**
 * Advance one step forward from `position`. The choice sub-flow
 * (choices -> choice_act -> choice_feedback -> advance-chapter / back to choices)
 * is shared by every chapter, so it's handled once here before delegating to the
 * chapter-0-specific or standard-chapter transition rules.
 */
export function getNextFlowOutcome(
  position: FlowPosition,
  gender: AvatarGender,
  meta: ChapterMeta,
  hasFeedback: boolean,
  isBestChoice = false
): FlowOutcome {
  if (position.step === 'choice_act') {
    if (hasFeedback) {
      return goto(position.chapterNumber, 'choice_feedback');
    }
    return isBestChoice ? { kind: 'advance-chapter' } : goto(position.chapterNumber, 'choices');
  }
  if (position.step === 'choice_feedback') {
    // When the user completed the best choice (choice1), advance to the next chapter;
    // otherwise return to choices so they can try again.
    return isBestChoice ? { kind: 'advance-chapter' } : goto(position.chapterNumber, 'choices');
  }
  return position.chapterNumber === 0
    ? nextInChapterZero(position.step, gender, meta)
    : nextInStandardChapter(position.chapterNumber, position.step, meta);
}

/**
 * Step one step backward from `position`. Crossing a chapter boundary needs
 * to know about the *previous* chapter, so the caller supplies `getMeta` to
 * look that up (kept out of this module so it stays free of ChapterConfig
 * knowledge).
 */
export function getPrevFlowOutcome(
  position: FlowPosition,
  gender: AvatarGender,
  meta: ChapterMeta,
  getMeta: (chapterNumber: number) => ChapterMeta
): FlowOutcome {
  if (position.step === 'choice_feedback') {
    return goto(position.chapterNumber, 'choice_act');
  }
  if (position.step === 'choice_act') {
    return goto(position.chapterNumber, 'choices');
  }
  return position.chapterNumber === 0
    ? prevInChapterZero(position.step, gender, meta)
    : prevInStandardChapter(position.chapterNumber, position.step, gender, getMeta);
}
