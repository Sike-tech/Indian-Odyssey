"""Unit tests for GyaanQuest core logic (no Kivy needed)."""
import random
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from gyaanquest.core.achievements import ACHIEVEMENTS, check_new, get
from gyaanquest.core.engine import QuizSession
from gyaanquest.core.player import PlayerProfile, level_for_xp, title_for_level, xp_to_reach
from gyaanquest.data.questions import CATEGORIES, QUESTIONS, questions_for_category


class TestQuestionBank(unittest.TestCase):
    def test_bank_integrity(self):
        ids = set()
        for q in QUESTIONS:
            self.assertNotIn(q["id"], ids)
            ids.add(q["id"])
            self.assertIn(q["category"], CATEGORIES)
            self.assertIn(q["difficulty"], ("easy", "medium", "hard"))
            self.assertEqual(len(q["options"]), 4, q["id"])
            self.assertTrue(0 <= q["answer"] < 4, q["id"])
            self.assertTrue(q["fact"].strip(), q["id"])
            self.assertTrue(q["question"].strip(), q["id"])

    def test_each_category_has_enough_questions(self):
        for cat in CATEGORIES:
            self.assertGreaterEqual(len(questions_for_category(cat)), 10, cat)

    def test_mixed_returns_all(self):
        self.assertEqual(len(questions_for_category("mixed")), len(QUESTIONS))
        self.assertEqual(len(questions_for_category(None)), len(QUESTIONS))


class TestLevels(unittest.TestCase):
    def test_level_curve(self):
        self.assertEqual(level_for_xp(0), 1)
        self.assertEqual(level_for_xp(99), 1)
        self.assertEqual(level_for_xp(100), 2)
        self.assertEqual(level_for_xp(299), 2)
        self.assertEqual(level_for_xp(300), 3)

    def test_titles(self):
        self.assertEqual(title_for_level(1), "Novice")
        self.assertEqual(title_for_level(5), "Scholar")
        self.assertEqual(title_for_level(13), "Grandmaster")

    def test_add_xp_and_progress(self):
        p = PlayerProfile()
        old, new = p.add_xp(150)
        self.assertEqual((old, new), (1, 2))
        into, needed = p.xp_progress()
        self.assertEqual((into, needed), (50, 200))

    def test_save_load_roundtrip(self):
        p = PlayerProfile(total_xp=350, total_answered=20, total_correct=15,
                          best_streak=6, games_played=2,
                          category_correct={"history": 5}, achievements=["first_step"])
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "save.json"
            p.save(path)
            loaded = PlayerProfile.load(path)
        self.assertEqual(loaded, p)

    def test_load_missing_or_corrupt(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "save.json"
            self.assertEqual(PlayerProfile.load(path), PlayerProfile())
            path.write_text("{not json")
            self.assertEqual(PlayerProfile.load(path), PlayerProfile())


class TestEngine(unittest.TestCase):
    def setUp(self):
        self.profile = PlayerProfile()
        self.rng = random.Random(42)

    def make_session(self, category=None):
        return QuizSession(self.profile, category=category, rng=self.rng)

    def answer_current_correctly(self, session):
        q = session.current_question()
        # find the correct option through a wrong guess probe: answer and reload
        # Instead we answer via result.correct_index knowledge — answer wrong first
        # is not possible; so just try each index via fresh sessions is wasteful.
        # Use internal state: answer with the known correct index.
        return session.answer(session._current_correct)

    def test_ten_questions_per_game(self):
        s = self.make_session()
        self.assertEqual(s.total, 10)
        self.assertFalse(s.finished)

    def test_category_filtering(self):
        s = self.make_session("history")
        while not s.finished:
            q = s.current_question()
            self.assertEqual(q.category, "history")
            s.answer(s._current_correct)

    def test_correct_answer_gives_xp_and_streak(self):
        s = self.make_session()
        s.current_question()
        res = s.answer(s._current_correct)
        self.assertTrue(res.correct)
        self.assertGreater(res.xp_gained, 0)
        self.assertEqual(res.streak, 1)

    def test_wrong_answer_resets_streak(self):
        s = self.make_session()
        s.current_question()
        s.answer(s._current_correct)
        s.current_question()
        wrong_idx = (s._current_correct + 1) % 4
        res = s.answer(wrong_idx)
        self.assertFalse(res.correct)
        self.assertEqual(res.streak, 0)
        self.assertEqual(res.xp_gained, 0)

    def test_streak_multiplier_grows(self):
        s = self.make_session()
        xps = []
        for _ in range(6):
            s.current_question()
            res = s.answer(s._current_correct)
            xps.append(res.xp_gained)
        # later answers in the streak should earn >= earlier ones on average
        self.assertGreaterEqual(xps[-1], xps[0])

    def test_fifty_removes_two_wrong_options(self):
        s = self.make_session()
        s.current_question()
        removed = s.use_fifty_fifty()
        self.assertEqual(len(removed), 2)
        self.assertNotIn(s._current_correct, removed)

    def test_fifty_limited_uses(self):
        s = self.make_session()
        s.current_question()
        s.use_fifty_fifty()
        with self.assertRaises(RuntimeError):
            s.use_fifty_fifty()  # already answered? no — used on same question
        s.answer(s._current_correct)
        s.current_question()
        s.use_fifty_fifty()
        s.answer(s._current_correct)
        s.current_question()
        with self.assertRaises(RuntimeError):
            s.use_fifty_fifty()  # exhausted

    def test_cannot_answer_removed_option(self):
        s = self.make_session()
        s.current_question()
        removed = s.use_fifty_fifty()
        with self.assertRaises(ValueError):
            s.answer(removed[0])

    def test_skip_preserves_streak(self):
        s = self.make_session()
        s.current_question()
        s.answer(s._current_correct)
        self.assertEqual(s.streak, 1)
        s.current_question()
        s.use_skip()
        self.assertEqual(s.streak, 1)
        self.assertEqual(s.skipped_count, 1)

    def test_perfect_game_flag(self):
        s = self.make_session()
        while not s.finished:
            s.current_question()
            s.answer(s._current_correct)
        self.assertTrue(s.perfect)
        self.assertTrue(s.summary()["perfect"])

    def test_not_perfect_with_skip(self):
        s = self.make_session()
        s.current_question()
        s.use_skip()
        while not s.finished:
            s.current_question()
            s.answer(s._current_correct)
        self.assertFalse(s.perfect)

    def test_finalize_records_and_unlocks(self):
        s = self.make_session()
        while not s.finished:
            s.current_question()
            s.answer(s._current_correct)
        badges = s.finalize()
        badge_ids = {b.id for b in badges}
        self.assertIn("first_step", badge_ids)
        self.assertIn("perfect_game", badge_ids)
        self.assertIn("streak_10", badge_ids)
        self.assertEqual(self.profile.games_played, 1)
        self.assertEqual(self.profile.best_streak, 10)
        self.assertEqual(self.profile.perfect_games, 1)

    def test_no_double_unlock(self):
        s = self.make_session()
        s.current_question()
        s.answer(s._current_correct)
        first = s.finalize()
        self.assertIn("first_step", {b.id for b in first})
        s2 = self.make_session()
        s2.current_question()
        s2.answer(s2._current_correct)
        second = s2.finalize()
        self.assertNotIn("first_step", {b.id for b in second})

    def test_level_up_detected(self):
        self.profile.total_xp = 90  # 10 XP from level 2
        s = self.make_session()
        s.current_question()
        res = s.answer(s._current_correct)
        # any correct answer grants >= 10 XP -> level up to 2
        self.assertEqual(res.level_ups, [2])
        self.assertEqual(self.profile.level, 2)


class TestAchievements(unittest.TestCase):
    def test_unique_ids(self):
        ids = [a.id for a in ACHIEVEMENTS]
        self.assertEqual(len(ids), len(set(ids)))

    def test_get(self):
        self.assertEqual(get("first_step").name, "First Step")

    def test_level_achievements(self):
        p = PlayerProfile(total_xp=xp_to_reach(5))
        new = check_new(p, {"perfect": False, "best_streak": 0, "xp_earned": 0,
                            "correct": 0, "lifelines_used": 0})
        self.assertIn("level_5", {b.id for b in new})

    def test_category_achievements(self):
        p = PlayerProfile(category_correct={"history": 10})
        new = check_new(p, {"perfect": False, "best_streak": 0, "xp_earned": 0,
                            "correct": 0, "lifelines_used": 0})
        ids = {b.id for b in new}
        self.assertIn("historian", ids)
        self.assertNotIn("geographer", ids)


if __name__ == "__main__":
    unittest.main()
