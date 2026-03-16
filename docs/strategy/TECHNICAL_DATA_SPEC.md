# FABT Standardized Technical Rider Spec

## Overview
Moving from "PDF Riders" to "Searchable Data." This allows venues to filter talent by specific hardware and stage requirements.

## 1. The JSON Schema (`technical_rider`)
Every Artist profile will have a structured JSON field containing:

```json
{
  "stage_requirements": {
    "monitor_mixes_required": 4,
    "pa_system_provided_by_artist": false,
    "min_stage_width_ft": 15,
    "power_drops_needed": 6
  },
  "input_list": [
    {"channel": 1, "instrument": "Kick", "mic_pref": "D112", "stand": "Short"},
    {"channel": 2, "instrument": "Snare", "mic_pref": "SM57", "stand": "Short"}
  ],
  "backline": {
    "drums_provided": false,
    "bass_amp_provided": false,
    "guitar_cabs_needed": 2
  },
  "hospitality": {
    "towels": 4,
    "water_bottles": 12,
    "meal_buyout_requested": true
  }
}
```

## 2. Venue Matching Logic (The Value Add)
By standardizing this data, the FABT algorithm can perform **Conflict Checks**:
*   **Alert:** "This band requires 6 monitor mixes, but Venue X only supports 4."
*   **Search:** "Show me all Jazz Trios in NYC who provide their own PA system."

## 3. "Verified" Status
*   A rider becomes **"Verified"** once a Venue completes a gig with that band and confirms the rider was accurate in the post-gig rating flow.
*   Inaccurate riders lead to a **"Rider Warning"** flag on the artist profile.
