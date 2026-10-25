"""Task 11: process selected web images into public/images/ for the site."""
from PIL import Image
import os

SRC = "/home/z/my-project/agent-ctx/imgsearch"
OUT = "/home/z/my-project/public/images"
os.makedirs(OUT, exist_ok=True)

# (source file, output name, max width, quality)
JOBS = [
    ("cand-lavasa1.jpg", "lavasa-lake.jpg", 1400, 82),
    ("cand-lavasa2.jpg", "lavasa-promenade.jpg", 1400, 82),
    ("cand-doc5.jpeg", "doctor-clinic.jpg", 1400, 82),
    ("cand-pharm3.jpg", "pharmacist.jpg", 816, 82),
    ("cand-care2.jpg", "caregiver.jpg", 1400, 82),
]

for src, out, maxw, q in JOBS:
    im = Image.open(os.path.join(SRC, src)).convert("RGB")
    if im.width > maxw:
        h = round(im.height * maxw / im.width)
        im = im.resize((maxw, h), Image.LANCZOS)
    path = os.path.join(OUT, out)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)
    kb = os.path.getsize(path) / 1024
    print(f"{out}: {im.width}x{im.height} {kb:.0f}KB")

print("DONE")
