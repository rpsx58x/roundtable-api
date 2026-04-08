#!/usr/bin/env python3
"""
RoundTable — App Icon Generator
Generates all required iOS and Android icon sizes from the RoundTable brand mark.

The icon: overhead view of a round table — gold background, white table circle,
6 white seat dots arranged evenly around it, subtle connecting ring.
"""

import os
import math
from PIL import Image, ImageDraw

# ── Colours ─────────────────────────────────────────────────────────────────
GOLD       = (201, 154, 46, 255)     # #C99A2E
WHITE      = (255, 255, 255, 255)
WHITE_90   = (255, 255, 255, 230)    # seats
WHITE_25   = (255, 255, 255,  64)    # subtle connecting ring

# ── Android icon destinations ────────────────────────────────────────────────
ANDROID_BASE = "android/app/src/main/res"
ANDROID_SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

# ── iOS icon destinations ─────────────────────────────────────────────────────
IOS_APPICONSET = "ios/App/App/Assets.xcassets/AppIcon.appiconset"
IOS_SIZES = [
    ("Icon-20@2x.png",   40),
    ("Icon-20@3x.png",   60),
    ("Icon-29@2x.png",   58),
    ("Icon-29@3x.png",   87),
    ("Icon-40@2x.png",   80),
    ("Icon-40@3x.png",  120),
    ("Icon-60@2x.png",  120),
    ("Icon-60@3x.png",  180),
    ("Icon-76.png",      76),
    ("Icon-76@2x.png",  152),
    ("Icon-83.5@2x.png",167),
    ("Icon-1024.png",  1024),
]

# ── Splash screen size ────────────────────────────────────────────────────────
ANDROID_SPLASH = "android/app/src/main/res/drawable/splash.png"
IOS_SPLASH     = "ios/App/App/Assets.xcassets/Splash.imageset/splash.png"


def draw_icon(size: int) -> Image.Image:
    """Draw the RoundTable icon at `size`×`size` pixels, with anti-aliasing."""
    SCALE = 4  # render at 4× then downscale for smooth edges
    s = size * SCALE

    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = s / 2

    # ── Background: rounded square ──────────────────────────────────────────
    radius = s * (8 / 32)   # proportional corner radius (8/32 from SVG)
    draw.rounded_rectangle([0, 0, s, s], radius=radius, fill=GOLD)

    # ── Connecting ring (subtle) ─────────────────────────────────────────────
    ring_r = s * (9.8 / 32)
    ring_w = max(1, s * (0.6 / 32))
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=WHITE_25,
        width=int(ring_w),
    )

    # ── Table surface ────────────────────────────────────────────────────────
    table_r = s * (5.2 / 32)
    draw.ellipse(
        [cx - table_r, cy - table_r, cx + table_r, cy + table_r],
        fill=WHITE,
    )

    # ── 6 seats evenly spaced at r = 9.8/32 ─────────────────────────────────
    seat_orbit = s * (9.8 / 32)
    seat_r     = s * (2.3 / 32)
    for i in range(6):
        angle = math.radians(i * 60)          # 0°, 60°, 120°, 180°, 240°, 300°
        sx = cx + seat_orbit * math.cos(angle)
        sy = cy + seat_orbit * math.sin(angle)
        draw.ellipse(
            [sx - seat_r, sy - seat_r, sx + seat_r, sy + seat_r],
            fill=WHITE_90,
        )

    # Downscale with LANCZOS for crisp edges
    return img.resize((size, size), Image.LANCZOS)


def draw_splash(width: int, height: int) -> Image.Image:
    """Dark-background splash with centred RoundTable icon."""
    img = Image.new("RGBA", (width, height), (14, 15, 24, 255))   # #0E0F18
    icon_size = min(width, height) // 4
    icon = draw_icon(icon_size)
    x = (width  - icon_size) // 2
    y = (height - icon_size) // 2
    img.paste(icon, (x, y), icon)
    return img


def save(img: Image.Image, path: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    img.save(path, "PNG")
    print(f"  ✓  {path}  ({img.width}×{img.height})")


def main():
    print("\n🎨  Generating RoundTable icons...\n")

    # ── Android launcher icons ───────────────────────────────────────────────
    print("Android:")
    for folder, size in ANDROID_SIZES.items():
        icon = draw_icon(size)
        save(icon, f"{ANDROID_BASE}/{folder}/ic_launcher.png")
        save(icon, f"{ANDROID_BASE}/{folder}/ic_launcher_round.png")   # circular mask applied by OS
        # Foreground layer for adaptive icons
        save(icon, f"{ANDROID_BASE}/{folder}/ic_launcher_foreground.png")

    # ── iOS AppIcon set ──────────────────────────────────────────────────────
    print("\niOS:")
    for filename, size in IOS_SIZES:
        icon = draw_icon(size)
        save(icon, f"{IOS_APPICONSET}/{filename}")

    # ── Splash screens ───────────────────────────────────────────────────────
    print("\nSplash:")
    for path, w, h in [
        (ANDROID_SPLASH, 1920, 1920),
        (IOS_SPLASH,     1920, 1920),
    ]:
        splash = draw_splash(w, h)
        save(splash, path)

    print("\n✅  All icons generated!\n")


if __name__ == "__main__":
    main()
