"""Sample cross-face pixels from the Task-7 hero screenshot vs target #2A7C13."""
from PIL import Image

img = Image.open("agent-ctx/verify-t8-plus2.png").convert("RGB")

# Cross pose in verify-t8-plus2.png: vertical bar ~x870-950 y355-580, arms ~x780-1050 y440-560
POINTS = {
    "vertical-upper": (905, 420),
    "vertical-lower": (910, 555),
    "arm-left": (835, 505),
    "arm-right": (1010, 510),
    "center": (905, 490),
}

TARGET = (0x2A, 0x7C, 0x13)
print(f"target: #{TARGET[0]:02x}{TARGET[1]:02x}{TARGET[2]:02x}")
for label, (x, y) in POINTS.items():
    px = [img.getpixel((x + dx, y + dy)) for dx in range(-3, 4) for dy in range(-3, 4)]
    r = sum(p[0] for p in px) // 49
    g = sum(p[1] for p in px) // 49
    b = sum(p[2] for p in px) // 49
    dr, dg, db = r - TARGET[0], g - TARGET[1], b - TARGET[2]
    print(f"{label}: #{r:02x}{g:02x}{b:02x}  (d={dr:+d},{dg:+d},{db:+d})")
