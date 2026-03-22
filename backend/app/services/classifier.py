"""
Keyword-based AI classifier. Replace with a real ML model for production.
"""
import re
from typing import Tuple
from app.models import Department, ComplaintPriority

RULES = [
    {"kw": ["pothole","road","pavement","bridge","footpath","crack","asphalt","construction"],
     "cat": "Potholes & Roads", "dept": Department.infrastructure, "pri": ComplaintPriority.high},
    {"kw": ["water","pipe","leak","flood","drainage","sewage","sewer","burst","pressure","main"],
     "cat": "Water Leakage", "dept": Department.water_works, "pri": ComplaintPriority.critical},
    {"kw": ["garbage","waste","trash","rubbish","dumping","litter","bin","collection","smell"],
     "cat": "Garbage Collection", "dept": Department.sanitation, "pri": ComplaintPriority.medium},
    {"kw": ["light","streetlight","lamp","electricity","power","outage","blackout","wire","pole","flickering"],
     "cat": "Street Lighting", "dept": Department.electricity, "pri": ComplaintPriority.medium},
    {"kw": ["tree","park","pest","mosquito","disease","hygiene","cleanliness","health"],
     "cat": "Health & Sanitation", "dept": Department.health, "pri": ComplaintPriority.high},
    {"kw": ["traffic","signal","bus","transport","parking","vehicle","congestion"],
     "cat": "Transport", "dept": Department.transport, "pri": ComplaintPriority.medium},
]
URGENT_KW = {"emergency","urgent","critical","danger","hazard","injury","accident","serious"}


def classify(text: str) -> Tuple[str, Department, ComplaintPriority, float]:
    words = set(re.findall(r'\b\w+\b', text.lower()))
    best, score = None, 0.0
    for rule in RULES:
        s = len(words & set(rule["kw"])) / len(rule["kw"])
        if s > score:
            score, best = s, rule
    urgent = bool(words & URGENT_KW)
    if best and score > 0:
        pri = ComplaintPriority.critical if urgent else best["pri"]
        return best["cat"], best["dept"], pri, round(min(score * 2.5, 0.99), 2)
    return "General Infrastructure", Department.infrastructure, \
        ComplaintPriority.critical if urgent else ComplaintPriority.medium, 0.45


def make_title(description: str) -> str:
    words = description.strip().split()
    title = " ".join(words[:7])
    return title + ("..." if len(words) > 7 else "")
