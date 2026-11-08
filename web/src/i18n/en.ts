export const en = {
  // Navigation / Shell
  appTitle: "CareTriage",
  appSubtitle: "Clinical Decision Support",
  workerTab: "Worker View (Triage)",
  doctorTab: "Doctor View (Decode)",

  // Sync Badge
  syncPending: "Pending Sync",
  syncSynced: "Cloud Synced",
  syncing: "Syncing...",

  // Language names
  langEn: "English",
  langTa: "தமிழ்",
  langHi: "हिन्दी",

  // Screen 1: Input & Capture
  recordTitle: "Record Symptoms",
  micReady: "Tap to Speak",
  micListening: "Listening...",
  micProcessing: "Processing...",
  micStopAria: "Stop listening",
  micStartAria: "Start speaking",
  transcriptLabel: "Transcript / Manual Input",
  transcriptPlaceholder: "e.g., Pregnant 30 weeks, BP 160 over 105, severe headache and blurry vision.",
  processButton: "Process Speech & Extract Fields",
  micUnsupported: "Speech recognition is not supported in this browser. Please use the text input below.",
  micPermissionDenied: "Microphone permission was denied. Please allow microphone access or type below.",
  micNoSpeech: "No speech was detected. Please try speaking again or type symptoms below.",
  offlineNotice: "You are currently offline. Local triage and extraction will continue working.",

  // Screen 2: Verification Form (Safety Gate)
  reviewTitle: "Review Extracted Data",
  reviewSubtitle: "Review extracted data. Amber fields indicate low AI confidence.",
  cancelButton: "← Cancel",
  confirmButton: "Confirm & Evaluate",
  checkAccuracy: "⚠️ Check accuracy",
  vitalsHeading: "Vital Signs & Measurements",
  symptomsHeading: "Confirmed Symptoms",
  emptyPlaceholder: "Empty",

  // Field names (Labels)
  field_ageMonths: "Age (Months)",
  field_gestWeeks: "Gestation (Weeks)",
  field_sys: "Systolic BP (mmHg)",
  field_dia: "Diastolic BP (mmHg)",
  field_rr: "Respiratory Rate (bpm)",
  field_feverDays: "Fever Duration (Days)",
  field_pregnant: "Pregnant",
  field_headache: "Headache",
  field_blurredVision: "Blurred Vision",
  field_chestIndrawing: "Chest Indrawing",
  field_stridor: "Stridor",
  field_unableToFeed: "Unable to Feed",
  field_lethargic: "Lethargic / Unconscious",
  field_convulsions: "Convulsions",
  field_vomitingEverything: "Vomiting Everything",
  field_wheeze: "Wheeze",
  field_bleeding: "Bleeding",

  // Screen 3: Result (Action & Handoff)
  tier_RED: "RED / EMERGENCY",
  tier_YELLOW: "YELLOW / REFERRAL",
  tier_GREEN: "GREEN / ROUTINE",
  caseId: "Case ID",
  whyHeading: "Why this result",
  missingSafetyTitle: "⚠️ Missing critical data",
  missingSafetyPrompt: "Please confirm missing values to ensure this result is accurate.",
  emergencyCall108: "Call 108 Ambulance 📞",
  emergencySms108: "Dispatch 108 Ambulance (SMS)",
  emergencyGpsLocating: "Getting GPS location...",
  doctorHandoffTitle: "Doctor Hand-off",
  doctorHandoffSubtitle: "Scan for offline triage summary",
  newPatientButton: "Start New Patient",
  resetConfirmMessage: "Start new patient? Case saved.",
};

export type Translations = typeof en;

