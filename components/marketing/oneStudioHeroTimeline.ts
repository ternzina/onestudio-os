export const HERO_PLAYBACK_SPEED = 1.1;

export const HERO_TIMELINE = {
  cycle: 26.2,
  intro: { firstNodeStart: .22, firstNodeEnd: 1.18 },
  secondNode: { revealStart: 2.64, revealEnd: 2.98 },
  pairSettle: { reduceStart: 4.05, reducedAt: 4.95 },
  thirdNode: { revealStart: 5.18, revealEnd: 5.82, connectionStart: 5.72, reduceStart: 7.18, reducedAt: 7.86 },
  branchReveal: { start: 7.82, duration: .58 },
  outerNodes: { revealStart: 9.03, revealEnd: 9.62, reduceStart: 9.66, reducedAt: 9.9 },
  networkConvergence: { start: 11.4, firstPull: 11.9, pullSettle: 12.75, finalPull: 13.7, end: 14.4 },
  puck: { revealStart: 14.4, visibleAt: 15.12, shrinkStart: 15.24, shrinkEnd: 16.82 },
  primaryPage: { hintAt: 17.04, revealStart: 17.18, revealAt: 17.42, formedAt: 18.72, moduleStarts: [19.05, 19.62, 20.19, 20.76], completeAt: 21.9 },
  multiPage: { start: 22.55, firstSecondaryStart: 22.68, stagger: .2, primarySettledAt: 23.15, formedAt: 23.56 },
  finalExit: { shrinkStart: 24.42, systemFadeAt: 24.52, resetAt: 25.65 },
} as const;

export const HERO_STORY_DURATION = HERO_TIMELINE.cycle;
export const HERO_PLAYBACK_DURATION = HERO_STORY_DURATION / HERO_PLAYBACK_SPEED;

export const HERO_FINAL_PHASES = {
  hold: { startsAt: HERO_TIMELINE.multiPage.formedAt, endsAt: HERO_TIMELINE.finalExit.shrinkStart },
  exit: { startsAt: HERO_TIMELINE.finalExit.shrinkStart, endsAt: HERO_TIMELINE.finalExit.resetAt },
  resetAt: HERO_TIMELINE.finalExit.resetAt,
} as const;

export const HERO_SEMANTIC_PHASE_ENDS = [
  HERO_TIMELINE.intro.firstNodeEnd,
  HERO_TIMELINE.secondNode.revealEnd,
  HERO_TIMELINE.pairSettle.reducedAt,
  HERO_TIMELINE.thirdNode.reducedAt,
  HERO_TIMELINE.branchReveal.start + HERO_TIMELINE.branchReveal.duration,
  HERO_TIMELINE.outerNodes.reducedAt,
  HERO_TIMELINE.networkConvergence.end,
  HERO_TIMELINE.puck.shrinkEnd,
  HERO_TIMELINE.primaryPage.completeAt,
  HERO_TIMELINE.multiPage.formedAt,
  HERO_FINAL_PHASES.hold.endsAt,
  HERO_FINAL_PHASES.exit.endsAt,
] as const;

export function toHeroPlaybackTime(storyTimestamp: number) {
  return storyTimestamp / HERO_PLAYBACK_SPEED;
}

export function getHeroTimelineInvariants() {
  const finalHoldEndsAt = toHeroPlaybackTime(HERO_FINAL_PHASES.hold.endsAt);
  const finalExitEndsAt = toHeroPlaybackTime(HERO_FINAL_PHASES.exit.endsAt);
  const resetAt = toHeroPlaybackTime(HERO_FINAL_PHASES.resetAt);
  const semanticPhaseEndsAt = HERO_SEMANTIC_PHASE_ENDS.map(toHeroPlaybackTime);

  return {
    storyDuration: HERO_STORY_DURATION,
    playbackDuration: HERO_PLAYBACK_DURATION,
    finalHoldEndsAt,
    finalExitEndsAt,
    resetAt,
    semanticPhaseEndsAt,
    allSemanticPhasesFit: semanticPhaseEndsAt.every((phaseEnd) => phaseEnd <= HERO_PLAYBACK_DURATION),
    finalHoldFits: finalHoldEndsAt <= HERO_PLAYBACK_DURATION,
    finalExitFits: finalExitEndsAt <= HERO_PLAYBACK_DURATION,
    resetFollowsFinalExit: resetAt >= finalExitEndsAt,
  };
}
