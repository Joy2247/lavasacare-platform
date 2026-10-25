"""Sample cross-face pixels from hero screenshots to compare rendered colors."""
from PIL import Image

# Points on the cross body (from 1280x800 screenshots)
POINTS = {
    "vertical-bar": (895, 420),
    "horizontal-bar-left": (830, 480),
    "horizontal-bar-right": (990, 480),
}

for name in [
    "verify-green-hero",      # forest dark cross
    "verify-lightplus-hero",  # 8fd0ab/79c49a
    "verify-lightplus2",      # a9e0c1/8fd4ae
    "verify-lightplus3",      # c6ecd6/abe0c3
    "verify-lightplus4",      # c6ecd6 cache-busted
    "verify-lightplus5",      # d8f2e2/bfe8cf env .95
    "verify-lightplus6",      # d8f2e2 after restart
]:
    try:
        img = Image.open(f"agent-ctx/{name}.png").convert("RGB")
    except FileNotFoundError:
        print(f"{name}: MISSING")
        continue
    samples = []
    for label, (x, y) in POINTS.items():
        # average 5x5 block
        px = [img.getpixel((x + dx, y + dy)) for dx in range(-2, 3) for dy in range(-2, 3)]
        r = sum(p[0] for p in px) // 25
        g = sum(p[1] for p in px) // 25
        b = sum(p[2] for p in px) // 25
        samples.append(f"{label}=#{r:02x}{g:02x}{b:02x}")
    print(f"{name}: {', '.join(samples)}")
