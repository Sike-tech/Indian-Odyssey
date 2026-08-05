"""GyaanQuest KivyMD app — screens, theming and glue to the game engine.

Colour theme: deep royal navy + gold (Bharat Gyaan heritage style).
Gradient backgrounds use PIL-generated PNG textures (stable on software-GL).
"""
from __future__ import annotations

import os
import tempfile as _tf
from pathlib import Path

from kivy.animation import Animation
from kivy.clock import Clock
from kivy.metrics import dp
from kivy.properties import BooleanProperty
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.image import Image
from kivy.uix.relativelayout import RelativeLayout
from kivy.utils import get_color_from_hex as hex_col

from kivymd.app import MDApp
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.button import MDFlatButton, MDRaisedButton, MDIconButton
from kivymd.uix.card import MDCard
from kivymd.uix.dialog import MDDialog
from kivymd.uix.gridlayout import MDGridLayout
from kivymd.uix.label import MDIcon, MDLabel
from kivymd.uix.progressbar import MDProgressBar
from kivymd.uix.screen import MDScreen
from kivymd.uix.screenmanager import MDScreenManager
from kivymd.uix.scrollview import MDScrollView
from kivy.uix.screenmanager import SlideTransition

from gyaanquest.core.achievements import ACHIEVEMENTS
from gyaanquest.core.engine import QuizSession
from gyaanquest.core.player import PlayerProfile, title_for_level
from gyaanquest.data.questions import CATEGORIES, DIFFICULTY_LABEL

# ─────────────────────── PALETTE ───────────────────────
BG_DARK = "#0A1628"
BG_MID = "#0D1B2A"
BG_CARD = "#0F1E35"
BG_CARD_LT = "#162842"
GOLD = "#C9A96E"
GOLD_BRIGHT = "#D4A843"
GOLD_DIM = "#8B7340"
GOLD_DARK = "#5C4D2F"
WHITE = (1, 1, 1, 1)
WHITE_85 = (1, 1, 1, 0.85)
WHITE_60 = (1, 1, 1, 0.60)
LIGHT_TEXT = (0.92, 0.93, 0.96, 1)
HINT_TEXT = (0.58, 0.62, 0.72, 1)
CORRECT = "#4CAF50"
WRONG = "#EF5350"
GREY = "#6B7280"

ACH_COLORS = [
    "#C9A96E", "#FF8A65", "#FF7043", "#EF5350",
    "#66BB6A", "#26A69A", "#8D6E63", "#AB47BC",
    "#FFA726", "#5C6BC0", "#29B6F6", "#FFCA28",
    "#FFD54F", "#4CAF50", "#2E7D32", "#42A5F5",
]

_ach_grad_cache: dict = {}


# ─────────────────────── HELPERS ───────────────────────
def label(text, style="Body1", halign="left", adaptive=True,
          text_color=None, **kw):
    lbl = MDLabel(text=text, font_style=style, halign=halign,
                  size_hint_y=None, **kw)
    lbl.valign = "middle"
    if text_color is not None:
        lbl.theme_text_color = "Custom"
        lbl.text_color = text_color
    if adaptive:
        lbl.bind(width=lambda inst, w: setattr(inst, "text_size", (w, None)))
        lbl.bind(texture_size=lambda inst, ts: setattr(inst, "height", ts[1]))
        lbl.height = dp(28)
    return lbl


def toast(screen, text):
    card = MDCard(orientation="vertical", padding=[dp(16), dp(8)],
                  radius=[dp(20)], elevation=8,
                  md_bg_color=hex_col(BG_CARD_LT),
                  size_hint=(None, None), width=dp(300), opacity=0)
    lbl = label(text, style="Body2", halign="center", text_color=WHITE)
    card.add_widget(lbl)
    card.height = dp(48)
    lbl.bind(height=lambda inst, h: setattr(card, "height", h + dp(24)))
    card.pos = (screen.width / 2 - dp(150), dp(28))
    screen.add_widget(card)
    anim = (Animation(opacity=1, duration=0.2)
            + Animation(opacity=1, duration=1.6)
            + Animation(opacity=0, duration=0.3))
    anim.bind(on_complete=lambda *_: screen.remove_widget(card))
    anim.start(card)


# ─────── GRADIENT (PIL-generated PNG texture) ───────
class Gradient(RelativeLayout):
    def __init__(self, top=BG_DARK, bottom=BG_MID, **kw):
        super().__init__(**kw)
        key = (top, bottom)
        if key not in _ach_grad_cache:
            from PIL import Image as PILImage
            t = tuple(int(top.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
            b = tuple(int(bottom.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
            img = PILImage.new("RGB", (4, 256))
            px = img.load()
            for y in range(256):
                f = y / 255.0
                c = tuple(int(t[k] * (1 - f) + b[k] * f) for k in range(3))
                for x in range(4):
                    px[x, y] = c
            fd, path = _tf.mkstemp(suffix=".png")
            os.close(fd)
            img.save(path, format="png")
            _ach_grad_cache[key] = path
        self._img = Image(source=_ach_grad_cache[key])
        self.add_widget(self._img)
        self.bind(size=self._resize, pos=self._resize)

    def _resize(self, *_):
        self._img.size = self.size
        self._img.pos = self.pos


def bg(top=BG_DARK, bottom=BG_MID):
    return Gradient(top=top, bottom=bottom)


# ─────── GOLD BORDER CARD (simulated ornate border) ───────
def gold_card(inner_height, **kw):
    """MDCard with a gold border effect (outer gold + inner dark)."""
    outer = MDCard(radius=[dp(12)], elevation=3,
                   md_bg_color=hex_col(GOLD_DIM), **kw)
    inner = MDCard(radius=[dp(10)], md_bg_color=hex_col(BG_CARD),
                   size_hint=(1, 1), padding=0)
    outer.add_widget(inner)
    return outer, inner


def gold_circle(size_dp, icon, icon_color=GOLD, bg_color=BG_CARD):
    """Circular gold-bordered card with an icon."""
    circ = MDCard(radius=[dp(size_dp // 2)], size_hint=(None, None),
                  size=(dp(size_dp), dp(size_dp)),
                  md_bg_color=hex_col(GOLD_DIM), padding=0, elevation=2)
    inner = MDCard(radius=[dp(size_dp // 2 - 2)],
                   size_hint=(None, None),
                   size=(dp(size_dp - 4), dp(size_dp - 4)),
                   md_bg_color=hex_col(bg_color), padding=0)
    inner.add_widget(MDIcon(icon=icon, halign="center",
                            font_size=dp(size_dp * 0.4),
                            theme_text_color="Custom",
                            text_color=hex_col(icon_color)))
    circ.add_widget(inner)
    return circ


# ─────── OPTION CARD ───────
class OptionCard(MDCard):
    def __init__(self, text, index, callback, **kw):
        super().__init__(orientation="horizontal", padding=[dp(14), dp(10)],
                         radius=[dp(14)], elevation=3,
                         md_bg_color=hex_col(BG_CARD_LT),
                         size_hint_y=None, **kw)
        self.index = index
        self.callback = callback
        self.locked = False

        self.badge = MDCard(radius=[dp(15)], size_hint=(None, None),
                            size=(dp(30), dp(30)),
                            md_bg_color=hex_col(GOLD), padding=0)
        blbl = MDLabel(text=chr(ord("A") + index), halign="center",
                       valign="middle", theme_text_color="Custom",
                       text_color=hex_col(BG_DARK), font_style="H6")
        self.badge.add_widget(blbl)

        self.text_lbl = label(text, style="Body1", text_color=LIGHT_TEXT)
        self.add_widget(self.badge)
        self.add_widget(self.text_lbl)
        self.height = dp(58)
        self.text_lbl.bind(height=lambda inst, h: setattr(
            self, "height", max(dp(58), h + dp(22))))

    def on_release(self):
        if not self.locked and self.callback:
            self.callback(self)

    def mark_correct(self):
        self.md_bg_color = hex_col("#1B3A2A")
        self.badge.md_bg_color = hex_col(CORRECT)

    def mark_wrong(self):
        self.md_bg_color = hex_col("#3A1B1B")
        self.badge.md_bg_color = hex_col(WRONG)

    def mark_removed(self):
        self.locked = True
        self.md_bg_color = hex_col(BG_CARD)
        self.text_lbl.text = ""
        self.badge.children[0].text = "—"
        self.badge.md_bg_color = hex_col(GREY)


# ============================ HOME ============================
class HomeScreen(MDScreen):
    def __init__(self, app, **kw):
        super().__init__(name="home", **kw)
        self.app = app
        self.add_widget(bg("#071120", "#040B14"))

        scroll = MDScrollView()
        root = MDBoxLayout(orientation="vertical", padding=[dp(12), dp(8)],
                           spacing=dp(10), size_hint_y=None)
        root.bind(minimum_height=root.setter("height"))
        scroll.add_widget(root)
        self.add_widget(scroll)

        # ════════════ TOP PLAYER BAR ════════════
        top_bar = MDBoxLayout(size_hint_y=None, height=dp(56),
                              spacing=dp(8), padding=[dp(4), dp(4)])

        # left: avatar circle + level info
        avatar = gold_circle(46, "account", GOLD, BG_DARK)
        top_bar.add_widget(avatar)

        level_box = MDBoxLayout(orientation="vertical", spacing=dp(2),
                                size_hint_x=None, width=dp(130))
        self.level_lbl = label("", style="Subtitle1",
                               theme_text_color="Custom",
                               text_color=hex_col(GOLD))
        self.xp_bar = MDProgressBar(value=0, max=100,
                                    color=hex_col(GOLD_BRIGHT),
                                    size_hint_y=None, height=dp(6))
        level_box.add_widget(self.level_lbl)
        level_box.add_widget(self.xp_bar)
        top_bar.add_widget(level_box)

        top_bar.add_widget(MDBoxLayout(size_hint_x=0.01))  # spacer

        # right: streak + achievements count
        streak_box = MDBoxLayout(spacing=dp(4), size_hint_x=None, width=dp(80))
        streak_box.add_widget(MDIcon(icon="fire", theme_text_color="Custom",
                                     text_color=hex_col(GOLD),
                                     size_hint_x=None, width=dp(22)))
        self.streak_val = label("0", style="Subtitle2",
                                theme_text_color="Custom",
                                text_color=WHITE, size_hint_x=None,
                                width=dp(50))
        streak_box.add_widget(self.streak_val)
        top_bar.add_widget(streak_box)

        ach_box = MDBoxLayout(spacing=dp(4), size_hint_x=None, width=dp(80))
        ach_box.add_widget(MDIcon(icon="trophy", theme_text_color="Custom",
                                  text_color=hex_col(GOLD),
                                  size_hint_x=None, width=dp(22)))
        self.ach_val = label("0", style="Subtitle2",
                             theme_text_color="Custom",
                             text_color=WHITE, size_hint_x=None,
                             width=dp(50))
        ach_box.add_widget(self.ach_val)
        top_bar.add_widget(ach_box)

        settings = MDIconButton(icon="cog", icon_size=dp(22),
                                theme_text_color="Custom",
                                text_color=hex_col(GOLD_DIM))
        top_bar.add_widget(settings)

        root.add_widget(top_bar)

        # ════════════ HERO TITLE ════════════
        hero_outer = MDCard(radius=[dp(20)], elevation=6,
                            md_bg_color=hex_col(GOLD_DIM),
                            size_hint_y=None, height=dp(140))
        hero_inner = MDCard(radius=[dp(18)], md_bg_color=hex_col(BG_DARK))
        hero_bg = bg("#0C1A30", "#060E1C")
        hero_inner.add_widget(hero_bg)
        hero_content = MDBoxLayout(orientation="vertical", spacing=dp(0),
                                   padding=[dp(8), dp(4)])
        hero_content.add_widget(MDIcon(icon="flower-tulip",
                                       halign="center", font_size=dp(22),
                                       theme_text_color="Custom",
                                       text_color=hex_col(GOLD),
                                       size_hint_y=None, height=dp(26)))
        bharat = label("BHARAT GYAAN", style="H6", halign="center",
                       theme_text_color="Custom",
                       text_color=hex_col(GOLD_BRIGHT))
        hero_content.add_widget(bharat)
        hero_content.add_widget(label("A Journey Through Our Heritage",
                                      style="Caption", halign="center",
                                      theme_text_color="Custom",
                                      text_color=hex_col(GOLD_DIM)))
        hero_inner.add_widget(hero_content)
        hero_outer.add_widget(hero_inner)
        root.add_widget(hero_outer)

        # ════════════ CATEGORIES ROW ════════════
        cat_scroll = MDScrollView(size_hint_y=None, height=dp(90),
                                  do_scroll_x=True, do_scroll_y=False)
        cat_row = MDBoxLayout(size_hint_y=None, height=dp(86),
                              spacing=dp(10), padding=[dp(8), dp(4)],
                              size_hint_x=None)
        cat_row.bind(minimum_width=cat_row.setter("width"))
        cat_entries = [
            ("history", "History", "bank"),
            ("culture", "Culture", "theater"),
            ("festivals", "Festivals", "party-popper"),
            ("mythology", "Mythology", "book-open-page-variant"),
            ("geography", "Geography", "earth"),
        ]
        for key, name, icon in cat_entries:
            col = MDBoxLayout(orientation="vertical", spacing=dp(2),
                              size_hint_x=None, width=dp(68))
            circ = gold_circle(50, icon, GOLD, BG_CARD)
            circ.pos_hint = {"center_x": 0.5}
            col.add_widget(circ)
            lbl = label(name, style="Caption", halign="center",
                        theme_text_color="Custom",
                        text_color=hex_col(GOLD))
            lbl.shorten = True
            col.add_widget(lbl)
            col.bind(on_touch_down=lambda inst, touch, k=key:
                     app.start_game(k) if inst.collide_point(*touch.pos) else None)
            cat_row.add_widget(col)
        cat_scroll.add_widget(cat_row)
        root.add_widget(cat_scroll)

        # ════════════ MIXED QUIZ (center card) ════════════
        mixed_row = MDBoxLayout(size_hint_y=None, height=dp(56),
                                padding=[dp(40), 0])
        mixed_card = MDCard(radius=[dp(10)], elevation=4,
                            md_bg_color=hex_col(GOLD_DIM),
                            size_hint=(1, 1))
        mixed_bg = bg(GOLD, GOLD_DIM)
        mixed_card.add_widget(mixed_bg)
        mixed_inner = MDBoxLayout(orientation="vertical")
        mixed_inner.add_widget(label("PLAY QUIZ", style="H6", halign="center",
                                     theme_text_color="Custom",
                                     text_color=hex_col(BG_DARK)))
        mixed_inner.add_widget(label("Test Your Knowledge", style="Caption",
                                     halign="center",
                                     theme_text_color="Custom",
                                     text_color=hex_col(GOLD_DARK)))
        mixed_card.add_widget(mixed_inner)
        mixed_card.bind(on_release=lambda *_: app.start_game(None))
        mixed_row.add_widget(mixed_card)
        root.add_widget(mixed_row)

        # ════════════ FEATURE CARDS (4 icon buttons) ════════════
        feat_row = MDBoxLayout(size_hint_y=None, height=dp(72),
                               spacing=dp(8), padding=[dp(4), 0])
        features = [
            ("trophy", "STATS"),
            ("shield-star", "ACHIEVE"),
            ("shuffle", "PLAY"),
            ("restart", "RESET"),
        ]
        for icon, name in features:
            card = MDCard(radius=[dp(12)], elevation=3,
                          md_bg_color=hex_col(GOLD_DIM))
            card_bg = bg(BG_CARD, BG_DARK)
            card.add_widget(card_bg)
            fc = MDBoxLayout(orientation="vertical", spacing=dp(2),
                             padding=[dp(4), dp(6)])
            fc.add_widget(MDIcon(icon=icon, halign="center",
                                 font_size=dp(24),
                                 theme_text_color="Custom",
                                 text_color=hex_col(GOLD),
                                 size_hint_y=None, height=dp(30)))
            fc.add_widget(label(name, style="Caption", halign="center",
                                theme_text_color="Custom",
                                text_color=hex_col(GOLD)))
            card.add_widget(fc)
            feat_row.add_widget(card)
        root.add_widget(feat_row)

        # wire up feature card taps
        def on_feat_touch(inst, touch):
            if inst.collide_point(*touch.pos):
                name = inst.children[0].children[1].text
                if name == "ACHIEVE":
                    app.sm.current = "achievements"
                elif name == "RESET":
                    self.confirm_reset()
                elif name == "STATS":
                    pass
                elif name == "PLAY":
                    app.start_game(None)
                return True
            return False
        for c in feat_row.children:
            c.bind(on_touch_down=on_feat_touch)

        # ════════════ BOTTOM BAR ════════════
        bottom = MDBoxLayout(size_hint_y=None, height=dp(48),
                             spacing=dp(8), padding=[dp(4), dp(4)])

        # streak pill
        streak_pill = MDCard(radius=[dp(20)], elevation=2,
                             md_bg_color=hex_col(BG_CARD),
                             size_hint_x=0.38)
        sp_inner = MDBoxLayout(spacing=dp(4), padding=[dp(8), dp(4)])
        sp_inner.add_widget(MDIcon(icon="fire", theme_text_color="Custom",
                                   text_color=hex_col(GOLD),
                                   size_hint_x=None, width=dp(18)))
        sp_text = MDBoxLayout(orientation="vertical")
        sp_text.add_widget(label("STREAK", style="Caption",
                                 theme_text_color="Custom",
                                 text_color=hex_col(GOLD)))
        self.streak_days = label("0 Days", style="Caption",
                                 theme_text_color="Custom",
                                 text_color=WHITE_60)
        sp_text.add_widget(self.streak_days)
        sp_inner.add_widget(sp_text)
        streak_pill.add_widget(sp_inner)
        bottom.add_widget(streak_pill)

        # diya lamp (center)
        diya = MDIconButton(icon="candle", icon_size=dp(28),
                            theme_text_color="Custom",
                            text_color=hex_col(GOLD_BRIGHT),
                            size_hint_x=0.12)
        bottom.add_widget(diya)

        # quiz of the day pill
        qotd = MDCard(radius=[dp(20)], elevation=2,
                      md_bg_color=hex_col(GOLD_DIM),
                      size_hint_x=0.50)
        qotd_bg = bg(GOLD, GOLD_DIM)
        qotd.add_widget(qotd_bg)
        qotd_inner = MDBoxLayout(spacing=dp(4), padding=[dp(8), dp(4)])
        qotd_text = MDBoxLayout(orientation="vertical")
        qotd_text.add_widget(label("QUIZ OF THE DAY", style="Caption",
                                   halign="left",
                                   theme_text_color="Custom",
                                   text_color=hex_col(BG_DARK)))
        qotd_text.add_widget(label("Play Now", style="Caption",
                                   halign="left",
                                   theme_text_color="Custom",
                                   text_color=hex_col(GOLD_DARK)))
        qotd_inner.add_widget(qotd_text)
        qotd_inner.add_widget(MDIcon(icon="chevron-right",
                                     theme_text_color="Custom",
                                     text_color=hex_col(BG_DARK),
                                     size_hint_x=None, width=dp(20)))
        qotd.add_widget(qotd_inner)
        qotd.bind(on_release=lambda *_: app.start_game(None))
        bottom.add_widget(qotd)

        root.add_widget(bottom)

    def on_pre_enter(self):
        self.refresh()

    def refresh(self):
        p = self.app.profile
        self.level_lbl.text = f"Level {p.level}  {p.title}"
        self.streak_val.text = str(p.best_streak)
        self.ach_val.text = str(len(p.achievements))
        into, needed = p.xp_progress()
        self.xp_bar.max = needed
        self.xp_bar.value = into
        self.streak_days.text = f"{p.best_streak} Days"

    def confirm_reset(self):
        self._dialog = MDDialog(
            title="Reset progress?",
            text="All XP, levels and achievements will be lost.",
            buttons=[
                MDFlatButton(text="NO",
                             on_release=lambda *_: self._dialog.dismiss()),
                MDRaisedButton(text="YES, RESET",
                               md_bg_color=hex_col(WRONG),
                               on_release=lambda *_: self._do_reset()),
            ])
        self._dialog.open()

    def _do_reset(self):
        self._dialog.dismiss()
        self.app.reset_progress()
        self.refresh()


# ============================ QUIZ ============================
class QuizScreen(MDScreen):
    def __init__(self, app, **kw):
        super().__init__(name="quiz", **kw)
        self.app = app
        self.session = None
        self.option_cards = []

        self.float_root = FloatLayout()
        self.float_root.add_widget(bg(BG_DARK, "#040B14"))
        main = MDBoxLayout(orientation="vertical", padding=[dp(16), dp(10)],
                           spacing=dp(8))
        self.float_root.add_widget(main)

        hud = MDBoxLayout(size_hint_y=None, height=dp(32), spacing=dp(6))
        self.back_btn = MDIconButton(icon="arrow-left", icon_size=dp(22),
                                     theme_text_color="Custom",
                                     text_color=hex_col(GOLD),
                                     size_hint=(None, None),
                                     size=(dp(30), dp(30)))
        self.back_btn.bind(on_release=lambda *_: self.app.go_home())
        self.qpos_lbl = label("", style="Subtitle2", adaptive=False,
                              theme_text_color="Custom", text_color=WHITE)
        self.xp_hud = MDBoxLayout(spacing=dp(2))
        self.xp_hud.add_widget(MDIcon(icon="star", theme_text_color="Custom",
                                      text_color=hex_col(GOLD),
                                      size_hint_x=None, width=dp(24)))
        self.xp_val = label("0", style="Subtitle2", adaptive=False,
                            size_hint_x=None, width=dp(52),
                            theme_text_color="Custom", text_color=WHITE)
        self.xp_hud.add_widget(self.xp_val)
        self.streak_hud = MDBoxLayout(spacing=dp(2))
        self.streak_icon = MDIcon(icon="fire", theme_text_color="Custom",
                                  text_color=hex_col(GREY),
                                  size_hint_x=None, width=dp(24))
        self.streak_hud.add_widget(self.streak_icon)
        self.streak_val = label("0", style="Subtitle2", adaptive=False,
                                size_hint_x=None, width=dp(40),
                                theme_text_color="Custom", text_color=WHITE)
        self.streak_hud.add_widget(self.streak_val)
        self.level_lbl = label("", style="Subtitle2", halign="right",
                               adaptive=False, theme_text_color="Custom",
                               text_color=WHITE)
        hud.add_widget(self.back_btn)
        hud.add_widget(self.qpos_lbl)
        hud.add_widget(self.xp_hud)
        hud.add_widget(self.streak_hud)
        hud.add_widget(self.level_lbl)
        main.add_widget(hud)

        self.progress = MDProgressBar(value=0, max=10,
                                      color=hex_col(GOLD_BRIGHT),
                                      size_hint_y=None, height=dp(6))
        main.add_widget(self.progress)
        self.cat_lbl = label("", style="Caption",
                             theme_text_color="Custom",
                             text_color=hex_col(GOLD_DIM))
        main.add_widget(self.cat_lbl)

        self.scroll = MDScrollView()
        self.middle = MDBoxLayout(orientation="vertical", spacing=dp(10),
                                  size_hint_y=None, padding=[0, dp(4)])
        self.middle.bind(minimum_height=self.middle.setter("height"))
        self.scroll.add_widget(self.middle)
        main.add_widget(self.scroll)

        life = MDBoxLayout(size_hint_y=None, height=dp(46), spacing=dp(10))
        self.fifty_btn = MDRaisedButton(text="50 : 50 (2)",
                                        md_bg_color=hex_col(GOLD),
                                        text_color=hex_col(BG_DARK),
                                        size_hint_x=0.5)
        self.skip_btn = MDRaisedButton(text="SKIP (2)",
                                       md_bg_color=hex_col(GOLD_DIM),
                                       text_color=WHITE,
                                       size_hint_x=0.5)
        self.fifty_btn.bind(on_release=lambda *_: self.on_fifty())
        self.skip_btn.bind(on_release=lambda *_: self.on_skip())
        life.add_widget(self.fifty_btn)
        life.add_widget(self.skip_btn)
        main.add_widget(life)

        self.add_widget(self.float_root)

    def load_session(self, session):
        self.session = session
        self.progress.max = session.total
        self.show_question()

    def show_question(self):
        self.middle.clear_widgets()
        self.option_cards = []
        q = self.session.current_question()
        meta = CATEGORIES[q.category]
        diff = DIFFICULTY_LABEL[q.difficulty]
        self.cat_lbl.text = f"{meta['name']}  •  {diff}"
        self.cat_lbl.text_color = hex_col(meta["color"])
        self.qpos_lbl.text = f"Question {q.position}/{q.total}"
        self.level_lbl.text = f"Lvl {self.app.profile.level}"
        self.update_hud()

        qcard = MDCard(orientation="vertical", padding=dp(18),
                       radius=[dp(18)], elevation=6,
                       md_bg_color=hex_col(BG_CARD_LT), size_hint_y=None)
        qlbl = label(q.text, style="H6", text_color=WHITE)
        qcard.add_widget(qlbl)
        qcard.height = qlbl.height + dp(36)
        qlbl.bind(height=lambda inst, h: setattr(qcard, "height", h + dp(36)))
        qcard.opacity = 0
        self.middle.add_widget(qcard)
        Animation(opacity=1, duration=0.25).start(qcard)

        for i, opt in enumerate(q.options):
            card = OptionCard(opt, i, self.on_option)
            self.middle.add_widget(card)
            self.option_cards.append(card)
        self.refresh_lifelines()

    def update_hud(self):
        self.xp_val.text = str(self.session.xp_earned)
        self.streak_val.text = str(self.session.streak)
        self.streak_icon.text_color = (hex_col(GOLD)
                                       if self.session.streak >= 2
                                       else hex_col(GREY))
        self.progress.value = self.session.index

    def refresh_lifelines(self):
        s = self.session
        self.fifty_btn.text = f"50 : 50 ({s.lifelines['fifty']})"
        self.skip_btn.text = f"SKIP ({s.lifelines['skip']})"
        self.fifty_btn.disabled = s.lifelines["fifty"] <= 0
        self.skip_btn.disabled = s.lifelines["skip"] <= 0

    def on_option(self, card):
        try:
            result = self.session.answer(card.index)
        except (RuntimeError, ValueError):
            return
        for c in self.option_cards:
            c.locked = True
        self.option_cards[result.correct_index].mark_correct()
        if not result.correct:
            card.mark_wrong()
        self.update_hud()
        self.fifty_btn.disabled = True
        self.skip_btn.disabled = True
        if result.xp_gained:
            self.xp_popup(result.xp_gained)
        for lvl in result.level_ups:
            toast(self, f"Level Up! You are now Level {lvl} - "
                        f"'{title_for_level(lvl)}'!")
        self.show_fact_card(result)

    def show_fact_card(self, result):
        correct_text = self.session._current_options[result.correct_index]
        heading = "Correct!" if result.correct else \
            f"Wrong! Correct answer: {correct_text}"
        card = MDCard(orientation="vertical", padding=dp(16), spacing=dp(8),
                      radius=[dp(16)], elevation=6,
                      md_bg_color=hex_col(BG_CARD_LT), size_hint_y=None)
        card.add_widget(label(heading, style="Subtitle1",
                              theme_text_color="Custom",
                              text_color=(hex_col(CORRECT) if result.correct
                                          else hex_col(WRONG))))
        card.add_widget(label(f"Fun fact: {result.fact}", style="Body2",
                              text_color=LIGHT_TEXT))
        nxt = MDRaisedButton(
            text="SEE RESULT" if result.finished else "NEXT",
            md_bg_color=hex_col(GOLD), text_color=hex_col(BG_DARK),
            size_hint_y=None, height=dp(44))
        nxt.bind(on_release=lambda *_: self.on_next())
        card.add_widget(nxt)

        def fit(*_):
            card.height = sum(ch.height for ch in card.children) + dp(40)
        Clock.schedule_once(fit, 0)
        for ch in card.children:
            if isinstance(ch, MDLabel):
                ch.bind(height=lambda *_a: fit())
        self.middle.add_widget(card)
        Clock.schedule_once(lambda *_: self.scroll.scroll_to(card), 0.15)

    def on_next(self):
        if self.session.finished:
            self.app.finish_session()
        else:
            self.show_question()

    def on_fifty(self):
        try:
            removed = self.session.use_fifty_fifty()
        except RuntimeError as e:
            toast(self, str(e))
            return
        for i in removed:
            self.option_cards[i].mark_removed()
        self.refresh_lifelines()

    def on_skip(self):
        try:
            self.session.use_skip()
        except RuntimeError as e:
            toast(self, str(e))
            return
        self.update_hud()
        if self.session.finished:
            self.app.finish_session()
        else:
            self.show_question()

    def xp_popup(self, amount):
        popup = MDLabel(text=f"+{amount} XP", font_style="H6",
                        halign="center", theme_text_color="Custom",
                        text_color=hex_col(GOLD),
                        size_hint=(None, None), size=(dp(120), dp(40)),
                        opacity=0)
        popup.pos = (self.float_root.width / 2 - dp(60),
                     self.float_root.height * 0.7)
        self.float_root.add_widget(popup)
        anim = (Animation(opacity=1, y=popup.y + dp(50), duration=0.5)
                + Animation(opacity=0, duration=0.4))
        anim.bind(on_complete=lambda *_: self.float_root.remove_widget(popup))
        anim.start(popup)


# ============================ RESULT ============================
class ResultScreen(MDScreen):
    def __init__(self, app, **kw):
        super().__init__(name="result", **kw)
        self.app = app
        self.add_widget(bg(BG_DARK, "#040B14"))
        self.scroll = MDScrollView()
        self.add_widget(self.scroll)

    def show_result(self, summary, new_badges):
        p = self.app.profile
        root = MDBoxLayout(orientation="vertical", padding=dp(24),
                           spacing=dp(12), size_hint_y=None)
        root.bind(minimum_height=root.setter("height"))

        root.add_widget(label("Quiz Complete!", style="H4", halign="center",
                              theme_text_color="Custom",
                              text_color=hex_col(GOLD)))
        if summary["perfect"]:
            root.add_widget(label("FLAWLESS VICTORY! No wrong answers!",
                                  style="Subtitle1", halign="center",
                                  theme_text_color="Custom",
                                  text_color=hex_col(GOLD_BRIGHT)))
        root.add_widget(label(
            f"{summary['correct']} / {summary['total']} correct",
            style="H5", halign="center",
            theme_text_color="Custom", text_color=WHITE))

        stats = MDCard(orientation="vertical", padding=dp(16), spacing=dp(6),
                       radius=[dp(16)], elevation=4,
                       md_bg_color=hex_col(BG_CARD),
                       size_hint_y=None, height=dp(130))
        stats.add_widget(label(f"+{summary['xp_earned']} XP earned",
                               style="H6", theme_text_color="Custom",
                               text_color=hex_col(GOLD)))
        stats.add_widget(label(
            f"Best streak this game: {summary['best_streak']}",
            style="Body1", theme_text_color="Custom", text_color=WHITE))
        into, needed = p.xp_progress()
        stats.add_widget(label(
            f"Level {p.level} ({p.title})  •  {into}/{needed} XP",
            style="Body1", theme_text_color="Custom", text_color=WHITE))
        stats.add_widget(MDProgressBar(value=into, max=needed,
                                       color=hex_col(GOLD_BRIGHT),
                                       size_hint_y=None, height=dp(8)))
        root.add_widget(stats)

        if summary["level_ups"]:
            lvl = summary["level_ups"][-1]
            root.add_widget(label(
                f"CONGRATULATIONS! You are now Level {lvl} - "
                f"'{title_for_level(lvl)}'!",
                style="Subtitle1", halign="center",
                theme_text_color="Custom", text_color=hex_col(GOLD)))

        if new_badges:
            root.add_widget(label("New Achievements:", style="Subtitle1",
                                  theme_text_color="Custom", text_color=WHITE))
            grid = MDGridLayout(cols=1, spacing=dp(8), size_hint_y=None)
            grid.bind(minimum_height=grid.setter("height"))
            for badge in new_badges:
                row = MDCard(orientation="horizontal", padding=dp(12),
                             spacing=dp(12), radius=[dp(12)], elevation=2,
                             md_bg_color=hex_col(BG_CARD), size_hint_y=None,
                             height=dp(64))
                row.add_widget(MDIcon(icon=badge.icon, halign="center",
                                      theme_text_color="Custom",
                                      text_color=hex_col(GOLD),
                                      size_hint_x=None, width=dp(36)))
                txt = MDBoxLayout(orientation="vertical")
                txt.add_widget(label(badge.name, style="Subtitle1",
                                     theme_text_color="Custom",
                                     text_color=hex_col(GOLD)))
                txt.add_widget(label(badge.description, style="Caption",
                                     theme_text_color="Custom",
                                     text_color=WHITE_60))
                row.add_widget(txt)
                grid.add_widget(row)
            root.add_widget(grid)

        again = MDRaisedButton(text="PLAY AGAIN",
                               md_bg_color=hex_col(GOLD),
                               text_color=hex_col(BG_DARK),
                               size_hint_y=None, height=dp(50))
        again.bind(on_release=lambda *_: self.app.start_game(
            None if summary["category"] == "mixed" else summary["category"]))
        home = MDFlatButton(text="HOME", theme_text_color="Custom",
                            text_color=hex_col(GOLD),
                            size_hint_y=None, height=dp(44))
        home.bind(on_release=lambda *_: setattr(self.app.sm, "current",
                                                "home"))
        root.add_widget(again)
        root.add_widget(home)
        self.scroll.clear_widgets()
        self.scroll.add_widget(root)


# ======================== ACHIEVEMENTS ========================
class FlipCell(MDCard):
    flipped = BooleanProperty(False)

    def __init__(self, front_content, back_content,
                 top=BG_CARD, bottom=BG_CARD, **kw):
        super().__init__(radius=[dp(16)], elevation=4,
                         md_bg_color=(0, 0, 0, 0), **kw)
        self._layer = RelativeLayout()
        self._layer.add_widget(Gradient(top=top, bottom=bottom))
        self.front = front_content
        self.back = back_content
        self.back.opacity = 0
        self._layer.add_widget(self.back)
        self._layer.add_widget(self.front)
        self.add_widget(self._layer)
        self._busy = False

    def on_touch_down(self, touch):
        if self.collide_point(*touch.pos):
            self.flip()
            return True
        return super().on_touch_down(touch)

    def flip(self):
        if self._busy:
            return
        self._busy = True
        self.flipped = not self.flipped
        if self.flipped:
            leaving, entering = self.front, self.back
        else:
            leaving, entering = self.back, self.front
        Animation(opacity=0, duration=0.14).start(leaving)
        entering.opacity = 0
        Animation(opacity=1, duration=0.14).start(entering)
        Clock.schedule_once(lambda *_: setattr(self, "_busy", False), 0.16)


class AchievementsScreen(MDScreen):
    def __init__(self, app, **kw):
        super().__init__(name="achievements", **kw)
        self.app = app
        self.add_widget(bg(BG_DARK, "#040B14"))
        root = MDBoxLayout(orientation="vertical", padding=dp(16),
                           spacing=dp(10))
        bar = MDBoxLayout(size_hint_y=None, height=dp(48), spacing=dp(8))
        back = MDFlatButton(text="< BACK", theme_text_color="Custom",
                            text_color=hex_col(GOLD),
                            size_hint_x=None, width=dp(100))
        back.bind(on_release=lambda *_: setattr(self.app.sm, "current",
                                                "home"))
        bar.add_widget(back)
        bar.add_widget(label("Achievements", style="H5",
                             theme_text_color="Custom",
                             text_color=hex_col(GOLD)))
        root.add_widget(bar)
        self.scroll = MDScrollView()
        self.grid = MDGridLayout(cols=2, spacing=dp(12), size_hint_y=None,
                                 padding=[dp(4), dp(4)])
        self.grid.bind(minimum_height=self.grid.setter("height"))
        self.scroll.add_widget(self.grid)
        root.add_widget(self.scroll)
        self.add_widget(root)

    def on_pre_enter(self):
        self.build_cards()

    def build_cards(self):
        unlocked = set(self.app.profile.achievements)
        self.grid.clear_widgets()
        for i, a in enumerate(ACHIEVEMENTS):
            got = a.id in unlocked
            accent = ACH_COLORS[i % len(ACH_COLORS)]

            fcontent = MDBoxLayout(orientation="vertical", spacing=dp(6),
                                   padding=[dp(6), dp(10)])
            fcontent.bind(minimum_height=fcontent.setter("height"))
            if got:
                circ = gold_circle(64, a.icon, accent, BG_CARD)
            else:
                circ = gold_circle(64, "lock-outline", "#3A4250", BG_CARD)
            circ.pos_hint = {"center_x": 0.5}
            fcontent.add_widget(circ)
            name_lbl = label(a.name, style="Subtitle2", halign="center",
                             theme_text_color="Custom", text_color=WHITE)
            name_lbl.shorten = True
            name_lbl.shorten_from = "right"
            fcontent.add_widget(name_lbl)
            status = label("Completed" if got else "Not Reach",
                           style="Caption", halign="center",
                           theme_text_color="Custom",
                           text_color=hex_col(CORRECT if got else GREY))
            fcontent.add_widget(status)

            bcontent = MDBoxLayout(orientation="vertical", spacing=dp(6),
                                   padding=[dp(10), dp(12)])
            bcontent.bind(minimum_height=bcontent.setter("height"))
            bcontent.add_widget(label(a.name, style="Subtitle1",
                                      halign="center",
                                      theme_text_color="Custom",
                                      text_color=hex_col(GOLD)))
            bcontent.add_widget(label(a.description, style="Caption",
                                      halign="center",
                                      theme_text_color="Custom",
                                      text_color=WHITE_85))
            bcontent.add_widget(label("Unlocked" if got else "Locked",
                                      style="Caption", halign="center",
                                      theme_text_color="Custom",
                                      text_color=hex_col(GREY)))
            bcontent.add_widget(label("tap to close", style="Caption",
                                      halign="center",
                                      theme_text_color="Custom",
                                      text_color=WHITE_60))

            cell = FlipCell(front_content=fcontent, back_content=bcontent,
                            top=BG_CARD, bottom=BG_MID,
                            size_hint=(1, None), height=dp(160))
            self.grid.add_widget(cell)


# ============================ APP ============================
class GyaanQuestApp(MDApp):
    def __init__(self, save_path=None, **kw):
        super().__init__(**kw)
        self._save_path = Path(save_path) if save_path else None
        self.session = None

    @property
    def save_path(self):
        if self._save_path:
            return self._save_path
        return Path(self.user_data_dir) / "save.json"

    def build(self):
        self.title = "GyaanQuest"
        self.theme_cls.theme_style = "Dark"
        self.theme_cls.primary_palette = "BlueGray"
        self.theme_cls.accent_palette = "Amber"
        self.profile = PlayerProfile.load(self.save_path)
        self.sm = MDScreenManager(transition=SlideTransition())
        self.home = HomeScreen(self)
        self.quiz = QuizScreen(self)
        self.result = ResultScreen(self)
        self.achievements = AchievementsScreen(self)
        for s in (self.home, self.quiz, self.result, self.achievements):
            self.sm.add_widget(s)
        self.sm.current = "home"
        auto = os.environ.get("GQ_AUTOSTART")
        if auto:
            Clock.schedule_once(
                lambda dt: self.start_game(None if auto == "mixed" else auto),
                0.5)
        return self.sm

    def start_game(self, category=None):
        self.session = QuizSession(self.profile, category=category)
        self.quiz.load_session(self.session)
        self.sm.current = "quiz"

    def go_home(self):
        self.sm.current = "home"

    def finish_session(self):
        badges = self.session.finalize()
        self.save_profile()
        self.result.show_result(self.session.summary(), badges)
        self.sm.current = "result"

    def reset_progress(self):
        self.profile = PlayerProfile()
        self.save_profile()
        toast(self.home, "Progress reset. Fresh start!")

    def save_profile(self):
        try:
            self.profile.save(self.save_path)
        except OSError:
            pass

    def on_pause(self):
        self.save_profile()
        return True

    def on_stop(self):
        self.save_profile()
