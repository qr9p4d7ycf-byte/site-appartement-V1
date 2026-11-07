"""Lit le calendrier iCal d'Airbnb et ne garde QUE les nuits occupées (aucun nom, aucun détail)."""
import os, json, re, urllib.request
from datetime import datetime, timedelta, timezone

raw = urllib.request.urlopen(os.environ["ICAL_URL"], timeout=30).read().decode("utf-8", "ignore")
raw = re.sub(r"\r?\n[ \t]", "", raw)
booked = set()
for ev in raw.split("BEGIN:VEVENT")[1:]:
    s = re.search(r"DTSTART[^:]*:(\d{8})", ev)
    e = re.search(r"DTEND[^:]*:(\d{8})", ev)
    if not (s and e):
        continue
    d = datetime.strptime(s.group(1), "%Y%m%d").date()
    end = datetime.strptime(e.group(1), "%Y%m%d").date()
    while d < end:
        booked.add(d.isoformat())
        d += timedelta(days=1)
out = {"booked": sorted(booked), "updated": datetime.now(timezone.utc).isoformat(timespec="minutes")}
json.dump(out, open("availability.json", "w"))
