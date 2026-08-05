"""Player profile: XP, levels, titles, streaks and persistent stats."""
from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from pathlib import Path

# (min_level, title) — checked top-down, first match wins.
LEVEL_TITLES = [
    (13, "Grandmaster"),
    (11, "Illuminated"),
    (9, "Mentor"),
    (7, "Pundit"),
    (5, "Scholar"),
    (3, "Apprentice"),
    (1, "Novice"),
]

# Total XP required to *be* a given level: 0, 100, 300, 600, 1000, ...
def xp_to_reach(level: int) -> int:
    return 50 * (level - 1) * level


def level_for_xp(total_xp: int) -> int:
    level = 1
    while xp_to_reach(level + 1) <= total_xp:
        level += 1
    return level


def title_for_level(level: int) -> str:
    for min_level, title in LEVEL_TITLES:
        if level >= min_level:
            return title
    return LEVEL_TITLES[-1][1]


@dataclass
class PlayerProfile:
    total_xp: int = 0
    total_answered: int = 0
    total_correct: int = 0
    best_streak: int = 0
    games_played: int = 0
    perfect_games: int = 0
    category_answered: dict = field(default_factory=dict)
    category_correct: dict = field(default_factory=dict)
    achievements: list = field(default_factory=list)

    # ---------------- levels ----------------
    @property
    def level(self) -> int:
        return level_for_xp(self.total_xp)

    @property
    def title(self) -> str:
        return title_for_level(self.level)

    def xp_progress(self):
        """Return (xp_into_current_level, xp_needed_for_next_level)."""
        current_floor = xp_to_reach(self.level)
        next_floor = xp_to_reach(self.level + 1)
        return self.total_xp - current_floor, next_floor - current_floor

    def add_xp(self, amount: int):
        """Add XP. Return (old_level, new_level)."""
        old = self.level
        self.total_xp += max(0, int(amount))
        return old, self.level

    # ---------------- stats ----------------
    def record_answer(self, category: str, correct: bool):
        self.total_answered += 1
        self.category_answered[category] = self.category_answered.get(category, 0) + 1
        if correct:
            self.total_correct += 1
            self.category_correct[category] = self.category_correct.get(category, 0) + 1

    def record_session(self, best_streak: int, perfect: bool):
        self.games_played += 1
        self.best_streak = max(self.best_streak, best_streak)
        if perfect:
            self.perfect_games += 1

    # ---------------- persistence ----------------
    def save(self, path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(asdict(self), indent=2))

    @classmethod
    def load(cls, path) -> "PlayerProfile":
        path = Path(path)
        if not path.exists():
            return cls()
        try:
            data = json.loads(path.read_text())
            valid = {f for f in cls.__dataclass_fields__}
            return cls(**{k: v for k, v in data.items() if k in valid})
        except (json.JSONDecodeError, TypeError, ValueError):
            return cls()
