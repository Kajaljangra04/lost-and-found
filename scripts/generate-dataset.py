import csv
import json
import random
from pathlib import Path

random.seed(42)

OUTPUT = Path("dataset/output")
OUTPUT.mkdir(parents=True, exist_ok=True)

categories = {
    "Electronics": [
        "Smartphone", "Laptop", "Tablet", "Headphones",
        "Smartwatch", "Camera", "Power Bank"
    ],
    "Bags and Backpacks": [
        "Backpack", "Laptop Bag", "School Bag", "Travel Bag"
    ],
    "Wallets and Accessories": [
        "Wallet", "Purse", "Watch", "Sunglasses"
    ],
    "Documents and ID Cards": [
        "Student ID Card", "Driving Licence",
        "Identity Card", "Document Folder"
    ],
    "Clothing": [
        "Jacket", "Sweater", "Shirt", "Cap", "Shoes"
    ],
    "Keys and Miscellaneous": [
        "House Keys", "Car Keys", "Umbrella",
        "Water Bottle", "Books", "Calculator"
    ]
}

category_counts = {
    "Electronics": 500,
    "Bags and Backpacks": 350,
    "Wallets and Accessories": 300,
    "Documents and ID Cards": 250,
    "Clothing": 250,
    "Keys and Miscellaneous": 350
}

colors = [
    "Black", "Blue", "Red", "Brown", "White",
    "Silver", "Grey", "Green", "Navy", "Pink"
]

conditions = [
    "Good condition",
    "Minor signs of use",
    "Visible scratches",
    "Like new"
]

locations = [
    "College Campus",
    "Library",
    "Cafeteria",
    "Parking Area",
    "Computer Lab",
    "Sports Ground",
    "Main Entrance",
    "Auditorium",
    "Hostel",
    "Public Transport Area"
]

records = []
counter = 1

for category, count in category_counts.items():
    for _ in range(count):
        item = random.choice(categories[category])
        color = random.choice(colors)
        condition = random.choice(conditions)
        report_type = "FOUND" if counter <= 1200 else "LOST"

        records.append({
            "sample_id": f"FND-SAMPLE-{counter:05d}",
            "is_sample": True,
            "source_type": "USER_PROVIDED",
            "report_type": report_type,
            "title": f"{color} {item}",
            "category": category,
            "subcategory": item,
            "color": color,
            "condition": condition,
            "description": (
                f"{color} {item}. {condition}. "
                f"This is a synthetic sample record for Findora testing."
            ),
            "location": random.choice(locations),
            "image_url": "",
            "image_local_path": "",
            "image_license": "",
            "verification_status": "NOT_VERIFIED",
            "ai_analysis_status": "PENDING"
        })

        counter += 1

random.shuffle(records)

# Restore exact found/lost distribution after shuffling.
found = [r for r in records if r["report_type"] == "FOUND"]
lost = [r for r in records if r["report_type"] == "LOST"]

records = found + lost

fields = list(records[0].keys())

with open(OUTPUT / "findora-dataset.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(records)

with open(OUTPUT / "findora-dataset.json", "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print("Dataset generated successfully")
print("Total:", len(records))
print("Found:", len(found))
print("Lost:", len(lost))
print("CSV:", OUTPUT / "findora-dataset.csv")
print("JSON:", OUTPUT / "findora-dataset.json")
print("Note: image URLs are intentionally blank until real images are assigned.")
