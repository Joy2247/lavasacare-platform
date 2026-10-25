"""Sample plus-face pixels from the Task-9 hero screenshot vs target #2A7C13."""
from PIL import Image
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "agent-ctx/verify-t9-hero2.png"
img = Image.open(path).convert("RGB")

# Plus body sample points (outside the white inlay plate)
POINTS = {
    "arm-left": (810, 505),
    "arm-right": (1052, 505),
    "vertical-upper": (950, 385),
    "vertical-lower": (955, 595),
}

TARGET = (0x2A, 0x7C, 0x13)
print(f"file: {path}   target: #{TARGET[0]:02x}{TARGET[1]:02x}{TARGET[2]:02x}")
for label, (x, y) in POINTS.items():
    px = [img.getpixel((x + dx, y + dy)) for dx in range(-3, 4) for dy in range(-3, 4)]
    r = sum(p[0] for p in px) // 49
    g = sum(p[1] for p in px) // 49
    b = sum(p[2] for p in px) // 49
    dr, dg, db = r - TARGET[0], g - TARGET[1], b - TARGET[2]
    print(f"{label}: #{r:02x}{g:02x}{b:02x}  (d={dr:+d},{dg:+d},{db:+d})")

# inlay sanity check
ix, iy = 960, 480
px = [img.getpixel((ix + dx, iy + dy)) for dx in range(-2, 3) for dy in range(-2, 3)]
r = sum(p[0] for p in px) // 25
g = sum(p[1] for p in px) // 25
b = sum(p[2] for p in px) // 25
print(f"inlay: #{r:02x}{g:02x}{b:02x}")
