# CareTriage contract (v1 DRAFT)

Agreed between the offline side (web/) and the online side (gateway/, core/). If either side needs to change anything here, change this file and the schema in the same commit and tell the other person.

Files this contract covers, all in `shared/`:

| File | Purpose |
|---|---|
| `rules.json` | The only source of triage decisions. Both engines read it. |
| `test-cases.json` | Both engines must pass every case. |
| `schemas/fields.schema.json` | The 17 clinical field names and ranges. |
| `schemas/triage-request.schema.json` | `POST /triage` body. |
| `schemas/triage-response.schema.json` | `POST /triage` reply. The offline engine returns the same shape. |
| `schemas/red-alert.schema.json` | WebSocket message to the PHC doctor view. |
| `schemas/qr-payload.schema.json` | Compact summary inside the QR code and RED alerts. |

## 1. Rules for both engines

1. Field names are camelCase exactly as in `fields.schema.json`. If the Python side uses snake_case internally, map them using `fieldAliases` in `rules.json`.
2. Age is **only** `ageMonths`. The extractor converts years to months.
3. A condition on a missing or `null` field is **false**. Never throw, never default to 0.
4. Every rule that matches is returned in `rulesFired`, in `rules.json` order. The tier is the highest among them. If none match, `rulesFired` is empty and `defaultApplied` carries the default block.
5. The tier comes only from `rules.json`. AI output (Gemini extraction, YAMNet wheeze) may fill fields, and `rules.json` evaluates those fields deterministically.
6. Comparison operators: `gte, gt, lte, lt, eq`. Booleans match by equality.

## 2. `POST /triage`

Request (see schema). Send `fields` when the worker has confirmed them; send `transcript` to have the server extract them first. If both are sent, `fields` wins and the transcript is ignored.

```json
{
  "requestId": "r-7f3a21",
  "lang": "ta",
  "fields": { "pregnant": true, "gestWeeks": 30, "sys": 150, "dia": 100, "headache": true },
  "location": { "lat": 11.0168, "lng": 76.9558, "accuracyM": 25 }
}
```

Response (see schema):

```json
{
  "requestId": "r-7f3a21",
  "tier": "RED",
  "rulesFired": [
    { "id": "MAT_RED_PE", "tier": "RED",
      "flag": "Imminent eclampsia / severe gestational hypertension",
      "action": "Arrange 108 transport immediately. Keep airway clear.",
      "source": "see docs/PROTOCOLS.md" }
  ],
  "fields": { "pregnant": true, "gestWeeks": 30, "sys": 150, "dia": 100, "headache": true },
  "lowConfidence": [],
  "missingForSafety": ["ageMonths"],
  "rulesVersion": "1.0",
  "disclaimer": "Decision support only. Follow local protocol and clinical judgement."
}
```

Notes:
- `missingForSafety`: when `ageMonths` is missing, put `"ageMonths"` here, because the pediatric rules cannot fire without it and the result could be a falsely reassuring GREEN. The UI asks for it before showing GREEN.
- Errors: HTTP 422 with `{ "error": "<message>" }` for a body that fails the request schema.

## 3. RED alert (WebSocket)

Sent by the gateway to every connected doctor view when a RED result is confirmed. `alertId` is the idempotency key: the doctor view ignores an `alertId` it has already shown, so the phone can safely resend queued alerts.

```json
{
  "type": "RED_ALERT",
  "v": 1,
  "alertId": "a-91c2e4",
  "sentAt": 1761200100,
  "queuedOffline": false,
  "summary": { "v": 1, "id": "P1A2B3", "t": 1761200000, "tier": "RED",
               "rules": ["MAT_RED_PE"], "gw": 30, "bp": [150, 100], "sx": ["HA"] },
  "flag": "Imminent eclampsia / severe gestational hypertension",
  "action": "Arrange 108 transport immediately. Keep airway clear.",
  "location": { "lat": 11.0168, "lng": 76.9558, "accuracyM": 25 }
}
```

## 4. QR payload

The QR carries this JSON itself (not a link), so it works offline. Keep it to a few hundred bytes. Include a key only when the value is known.

| Key | Meaning | From field |
|---|---|---|
| `v` | payload version, always 1 | |
| `id` | random case id (not a name or phone number) | |
| `t` | unix seconds | |
| `tier` | GREEN, YELLOW or RED | |
| `rules` | ids of every rule that fired | `rulesFired[].id` |
| `am` | age in months | `ageMonths` |
| `gw` | gestation weeks (implies pregnant) | `gestWeeks` |
| `bp` | `[sys, dia]` | `sys`, `dia` |
| `rr` | breaths per minute | `rr` |
| `fd` | fever days | `feverDays` |
| `sx` | symptom codes that were true | see below |

Symptom codes:
- `HA`: `headache`
- `BLUR`: `blurredVision`
- `CIND`: `chestIndrawing`
- `STRI`: `stridor`
- `NOFD`: `unableToFeed`
- `BLD`: `bleeding`
- `LETH`: `lethargic`
- `CONV`: `convulsions`
- `VOM`: `vomitingEverything`
- `WHZ`: `wheeze`

This is a triage summary / hand-off report, not a diagnostic report.

## 5. Open points for the two of you

1. Who generates `requestId`, `alertId` and the QR `id`? Proposal: the web app, as short random strings, so offline cases have ids before any server contact.
2. Does the doctor view need the transcript? Proposal: no. It is not in the QR or the alert, to keep the payload small and avoid carrying free text about a patient.
3. Breath audio upload format and the 16 kHz resampling (browser or gateway) are not covered here. Decide in the audio phase.