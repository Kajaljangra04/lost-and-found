import csv
import json
import hashlib
from pathlib import Path
from collections import defaultdict
from PIL import Image, ImageDraw

ROOT = Path.home() / "Downloads/findora-dataset"
OUTPUT = Path("dataset/output")
MANIFEST = OUTPUT / "image_manifest.json"

records = json.loads(MANIFEST.read_text())
groups = defaultdict(list)

for record in records:
    image_path = Path(record["image_path"])
    digest = hashlib.sha256(image_path.read_bytes()).hexdigest()
    label_path = Path(record["label_path"]) if record["label_path"] else None

    annotations = []
    if label_path and label_path.exists():
        annotations = [
            line.split()
            for line in label_path.read_text().splitlines()
            if line.strip()
        ]

    groups[digest].append({
        "image": image_path,
        "label": label_path,
        "split": record["split"],
        "annotations": annotations
    })

conflicts = []

for digest, items in groups.items():
    if len(items) < 2:
        continue

    first = items[0]["annotations"]
    if any(item["annotations"] != first for item in items[1:]):
        conflicts.append((digest, items))

review_dir = OUTPUT / "duplicate_conflict_sheets"
review_dir.mkdir(parents=True, exist_ok=True)

def draw_boxes(image, annotations):
    draw = ImageDraw.Draw(image)
    width, height = image.size

    for annotation in annotations:
        values = list(map(float, annotation[1:]))
        if len(values) < 4:
            continue

        x, y, w, h = values[:4]

        if len(values) == 4:
            box = (
                (x - w / 2) * width,
                (y - h / 2) * height,
                (x + w / 2) * width,
                (y + h / 2) * height
            )
            draw.rectangle(box, outline="red", width=3)
        else:
            points = [
                (values[i] * width, values[i + 1] * height)
                for i in range(0, len(values), 2)
            ]
            if len(points) >= 3:
                draw.polygon(points, outline="red", width=3)

for index, (digest, items) in enumerate(conflicts, start=1):
    tiles = []

    for item in items:
        image = Image.open(item["image"]).convert("RGB")
        image.thumbnail((500, 420))
        draw_boxes(image, item["annotations"])

        tile = Image.new("RGB", (520, 480), "white")
        tile.paste(image, ((520 - image.width) // 2, 35))
        draw = ImageDraw.Draw(tile)
        draw.text(
            (10, 10),
            f'{item["split"]} | {item["image"].name[:45]}',
            fill="black"
        )
        draw.text(
            (10, 460),
            f'Annotations: {len(item["annotations"])}',
            fill="black"
        )
        tiles.append(tile)

    sheet = Image.new("RGB", (520 * len(tiles), 480), "#dddddd")
    for position, tile in enumerate(tiles):
        sheet.paste(tile, (position * 520, 0))

    sheet.save(review_dir / f"conflict_{index:03d}.jpg", quality=90)

print("Annotation conflict groups:", len(conflicts))
print("Review images:", review_dir)
print("Generated:", len(list(review_dir.glob("*.jpg"))))
