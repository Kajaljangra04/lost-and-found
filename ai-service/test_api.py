import requests

base = "http://127.0.0.1:8001"

print("Health:", requests.get(f"{base}/health", timeout=10).json())

payload = {
    "lost": {
        "name": "Black leather wallet",
        "description": "Black wallet containing several cards",
        "category": "Accessories",
        "location": "University library",
        "date": "2026-10-20",
    },
    "found": {
        "name": "Dark leather card holder",
        "description": "Dark wallet found near the library",
        "category": "Accessories",
        "location": "University library",
        "date": "2026-10-20",
    },
}

response = requests.post(f"{base}/match", json=payload, timeout=180)
response.raise_for_status()
print("Match result:", response.json())
