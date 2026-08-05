"""GyaanQuest — entry point.

Run:  .venv/bin/python main.py

Dev hooks (optional env vars):
    GQ_AUTOSTART=mixed|history|...   jump straight into a game on launch
    GQ_SCREENSHOT=shot               save a screenshot after launch and exit
    GQ_SHOT_DELAY=3                  seconds to wait before the screenshot
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from kivy.config import Config  # noqa: E402

if not os.environ.get("ANDROID_ARGUMENT"):  # desktop: phone-like window
    Config.set("graphics", "width", "405")
    Config.set("graphics", "height", "760")
    Config.set("graphics", "resizable", "1")


def main():
    from gyaanquest.ui.app import GyaanQuestApp

    app = GyaanQuestApp()

    shot = os.environ.get("GQ_SCREENSHOT")
    if shot:
        from kivy.clock import Clock
        from kivy.core.window import Window

        delay = float(os.environ.get("GQ_SHOT_DELAY", "3"))

        def _take(_dt):
            path = Window.screenshot(name=shot)
            print(f"Screenshot saved: {path}")
            app.stop()

        Clock.schedule_once(_take, delay)

    app.run()


if __name__ == "__main__":
    main()
