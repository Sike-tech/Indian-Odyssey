"""Quiz session engine: question flow, scoring, streaks and lifelines."""
from __future__ import annotations

import random
from dataclasses import dataclass

from gyaanquest.data.questions import (
    CATEGORIES, DIFFICULTY_XP, questions_for_category,
)
from gyaanquest.core import achievements as ach

QUESTIONS_PER_GAME = 10
FIFTY_FIFTY_USES = 2
SKIP_USES = 2
# Streak multiplier: +10% XP per consecutive correct answer, capped at +100%.
STREAK_STEP = 0.10
STREAK_CAP = 10


@dataclass
class QuestionView:
    qid: str
    category: str
    difficulty: str
    text: str
    options: list          # shuffled
    position: int          # 1-based
    total: int


@dataclass
class AnswerResult:
    correct: bool
    correct_index: int
    xp_gained: int
    fact: str
    streak: int
    finished: bool
    level_ups: list        # levels gained by this answer, e.g. [4]


class QuizSession:
    def __init__(self, profile, category=None, num_questions=QUESTIONS_PER_GAME, rng=None):
        self.profile = profile
        self.category = category if category in CATEGORIES else None
        self.rng = rng or random.Random()

        pool = questions_for_category(self.category)
        self.rng.shuffle(pool)
        self.questions = pool[:max(1, num_questions)]

        self.index = 0
        self.answered = 0
        self.correct_count = 0
        self.wrong_count = 0
        self.skipped_count = 0
        self.streak = 0
        self.best_streak = 0
        self.xp_earned = 0
        self.level_ups = []
        self.lifelines = {"fifty": FIFTY_FIFTY_USES, "skip": SKIP_USES}
        self._fifty_removed = set()   # option indices removed on current question
        self._answered_current = False
        self._shuffled = []           # prepared questions cache

    # ---------------- question flow ----------------
    @property
    def total(self):
        return len(self.questions)

    @property
    def finished(self):
        return self.index >= self.total

    def current_question(self) -> QuestionView:
        raw = self.questions[self.index]
        order = list(range(4))
        self.rng.shuffle(order)
        self._current_options = [raw["options"][i] for i in order]
        self._current_correct = order.index(raw["answer"])
        self._current_raw = raw
        self._fifty_removed = set()
        self._fifty_used_here = False
        self._answered_current = False
        return QuestionView(
            qid=raw["id"],
            category=raw["category"],
            difficulty=raw["difficulty"],
            text=raw["question"],
            options=list(self._current_options),
            position=self.index + 1,
            total=self.total,
        )

    # ---------------- answering ----------------
    def answer(self, option_index: int) -> AnswerResult:
        if self.finished or self._answered_current:
            raise RuntimeError("No active question to answer")
        if option_index in self._fifty_removed:
            raise ValueError("Option was removed by 50:50")

        self._answered_current = True
        raw = self._current_raw
        is_correct = option_index == self._current_correct
        self.answered += 1
        xp = 0
        gained_levels = []

        if is_correct:
            self.correct_count += 1
            self.streak += 1
            self.best_streak = max(self.best_streak, self.streak)
            base = DIFFICULTY_XP[raw["difficulty"]]
            mult = 1.0 + STREAK_STEP * min(self.streak - 1, STREAK_CAP)
            xp = int(round(base * mult))
            old_level, new_level = self.profile.add_xp(xp)
            self.xp_earned += xp
            if new_level > old_level:
                gained_levels = list(range(old_level + 1, new_level + 1))
                self.level_ups.extend(gained_levels)
        else:
            self.wrong_count += 1
            self.streak = 0

        self.profile.record_answer(raw["category"], is_correct)
        self.index += 1

        return AnswerResult(
            correct=is_correct,
            correct_index=self._current_correct,
            xp_gained=xp,
            fact=raw["fact"],
            streak=self.streak,
            finished=self.finished,
            level_ups=gained_levels,
        )

    # ---------------- lifelines ----------------
    def use_fifty_fifty(self) -> list:
        """Remove two wrong options. Return the removed option indices."""
        if self._answered_current or self.finished:
            raise RuntimeError("Cannot use 50:50 now")
        if self._fifty_used_here:
            raise RuntimeError("50:50 already used on this question")
        if self.lifelines["fifty"] <= 0:
            raise RuntimeError("No 50:50 lifelines left")
        wrong = [i for i in range(4)
                 if i != self._current_correct and i not in self._fifty_removed]
        self.rng.shuffle(wrong)
        removed = sorted(wrong[:2])
        self._fifty_removed.update(removed)
        self._fifty_used_here = True
        self.lifelines["fifty"] -= 1
        return removed

    def use_skip(self) -> None:
        """Skip the current question without losing the streak."""
        if self._answered_current or self.finished:
            raise RuntimeError("Cannot skip now")
        if self.lifelines["skip"] <= 0:
            raise RuntimeError("No skip lifelines left")
        self.lifelines["skip"] -= 1
        self.skipped_count += 1
        self.index += 1

    @property
    def lifelines_used(self):
        return (FIFTY_FIFTY_USES - self.lifelines["fifty"]
                + SKIP_USES - self.lifelines["skip"])

    # ---------------- wrap up ----------------
    @property
    def perfect(self):
        return (self.wrong_count == 0 and self.skipped_count == 0
                and self.correct_count == self.total)

    def summary(self) -> dict:
        return {
            "category": self.category or "mixed",
            "answered": self.answered,
            "correct": self.correct_count,
            "wrong": self.wrong_count,
            "skipped": self.skipped_count,
            "total": self.total,
            "best_streak": self.best_streak,
            "xp_earned": self.xp_earned,
            "perfect": self.perfect,
            "lifelines_used": self.lifelines_used,
            "level_ups": list(self.level_ups),
        }

    def finalize(self) -> list:
        """Record the session on the profile; return newly unlocked achievements."""
        self.profile.record_session(self.best_streak, self.perfect)
        new_badges = ach.check_new(self.profile, self.summary())
        self.profile.achievements.extend(b.id for b in new_badges)
        return new_badges
