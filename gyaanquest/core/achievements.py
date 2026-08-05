"""Achievements — badges unlocked by player feats.

Each achievement has a condition over a context object exposing:
    profile fields: total_xp, total_answered, total_correct, best_streak,
                    games_played, perfect_games, level,
                    category_correct (dict)
    session fields: session_perfect, session_best_streak, session_xp,
                    session_correct, session_lifelines_used
"""
from __future__ import annotations

from dataclasses import dataclass
from types import SimpleNamespace
from typing import Callable


@dataclass(frozen=True)
class Achievement:
    id: str
    name: str
    description: str
    icon: str
    condition: Callable[[SimpleNamespace], bool]


def _cat(ctx, category):
    return ctx.category_correct.get(category, 0)


ACHIEVEMENTS = [
    Achievement("first_step", "First Step", "Answer your first question",
                "foot-print", lambda c: c.total_answered >= 1),
    Achievement("streak_3", "Hat-Trick", "Get a 3 answer streak",
                "fire", lambda c: c.best_streak >= 3),
    Achievement("streak_5", "Hot Streak", "Get a 5 answer streak",
                "fire-circle", lambda c: c.best_streak >= 5),
    Achievement("streak_10", "Trial by Fire", "Get a 10 answer streak",
                "lightning-bolt", lambda c: c.best_streak >= 10),
    Achievement("perfect_game", "Flawless Victory", "Finish a game with every answer correct",
                "trophy", lambda c: c.perfect_games >= 1 or c.session_perfect),
    Achievement("no_lifeline", "Apne Dum Par", "Score 8+ in a game without using lifelines",
                "arm-flex",
                lambda c: c.session_lifelines_used == 0 and c.session_correct >= 8),
    Achievement("historian", "History Buff", "Answer 10 History questions correctly",
                "bank", lambda c: _cat(c, "history") >= 10),
    Achievement("culture_fan", "Culture Master", "Answer 10 Culture questions correctly",
                "theater", lambda c: _cat(c, "culture") >= 10),
    Achievement("festival_fan", "Festival Fan", "Answer 10 Festival questions correctly",
                "party-popper", lambda c: _cat(c, "festivals") >= 10),
    Achievement("myth_scholar", "Mythology Scholar", "Answer 10 Mythology questions correctly",
                "book-open-page-variant", lambda c: _cat(c, "mythology") >= 10),
    Achievement("geographer", "Geography Whiz", "Answer 10 Geography questions correctly",
                "earth", lambda c: _cat(c, "geography") >= 10),
    Achievement("level_5", "Scholar", "Reach level 5",
                "shield-star", lambda c: c.level >= 5),
    Achievement("level_10", "Grandmaster", "Reach level 10",
                "crown", lambda c: c.level >= 10),
    Achievement("correct_50", "Half-Century", "50 total correct answers",
                "star-circle", lambda c: c.total_correct >= 50),
    Achievement("correct_100", "Centurion", "100 total correct answers",
                "star-shooting", lambda c: c.total_correct >= 100),
    Achievement("games_10", "Regular Player", "Play 10 games",
                "gamepad-variant", lambda c: c.games_played >= 10),
]

_BY_ID = {a.id: a for a in ACHIEVEMENTS}


def get(achievement_id: str) -> Achievement:
    return _BY_ID[achievement_id]


def check_new(profile, session_summary) -> list[Achievement]:
    """Return achievements newly earned (not already in profile.achievements)."""
    ctx = SimpleNamespace(
        total_xp=profile.total_xp,
        total_answered=profile.total_answered,
        total_correct=profile.total_correct,
        best_streak=profile.best_streak,
        games_played=profile.games_played,
        perfect_games=profile.perfect_games,
        level=profile.level,
        category_correct=dict(profile.category_correct),
        session_perfect=session_summary.get("perfect", False),
        session_best_streak=session_summary.get("best_streak", 0),
        session_xp=session_summary.get("xp_earned", 0),
        session_correct=session_summary.get("correct", 0),
        session_lifelines_used=session_summary.get("lifelines_used", 0),
    )
    earned = set(profile.achievements)
    return [a for a in ACHIEVEMENTS if a.id not in earned and a.condition(ctx)]
