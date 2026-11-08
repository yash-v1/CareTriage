import type { Translations } from "./en";

export const ta: Translations = {
  // Navigation / Shell
  appTitle: "CareTriage",
  appSubtitle: "மருத்துவ முடிவு ஆதரவு",
  workerTab: "சுகாதார பணியாளர் பக்கம்",
  doctorTab: "மருத்துவர் பக்கம்",

  // Sync Badge
  syncPending: "ஒத்திசைவு நிலுவை",
  syncSynced: "கிளவுட் ஒத்திசைக்கப்பட்டது",
  syncing: "ஒத்திசைக்கிறது...",

  // Language names
  langEn: "English",
  langTa: "தமிழ்",
  langHi: "हिन्दी",

  // Screen 1: Input & Capture
  recordTitle: "அறிகுறிகளை பதிவு செய்யவும்",
  micReady: "பேச தட்டவும்",
  micListening: "கேட்கிறது...",
  micProcessing: "செயலாக்குகிறது...",
  micStopAria: "கேட்பதை நிறுத்தவும்",
  micStartAria: "பேசத் தொடங்கவும்",
  transcriptLabel: "உரையாடல் / கைமுறை பதிவு",
  transcriptPlaceholder: "எ.கா., 30 வார கர்ப்பம், ரத்த அழுத்தம் 160/105, கடுமையான தலைவலி மற்றும் மங்கலான பார்வை.",
  processButton: "பேச்சை செயலாக்கி புலங்களை பிரித்தெடுக்கவும்",
  micUnsupported: "இந்த உலாவியில் பேச்சு அறிதல் ஆதரிக்கப்படவில்லை. கீழே தட்டச்சு செய்யவும்.",
  micPermissionDenied: "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. அனுமதி வழங்கவும் அல்லது கீழே தட்டச்சு செய்யவும்.",
  micNoSpeech: "பேச்சு கண்டறியப்படவில்லை. மீண்டும் பேசவும் அல்லது கீழே தட்டச்சு செய்யவும்.",
  offlineNotice: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். உள்ளூர் ஆய்வு தொடர்ந்து செயல்படும்.",

  // Screen 2: Verification Form (Safety Gate)
  reviewTitle: "பிரித்தெடுக்கப்பட்ட தரவை மதிப்பாய்வு செய்யவும்",
  reviewSubtitle: "பிரித்தெடுக்கப்பட்ட தரவை மதிப்பாய்வு செய்யவும். மஞ்சள் புலங்கள் குறைந்த நம்பிக்கையைக் குறிக்கின்றன.",
  cancelButton: "← ரத்துசெய்",
  confirmButton: "உறுதிசெய்து மதிப்பிடவும்",
  checkAccuracy: "⚠️ துல்லியத்தை சரிபார்க்கவும்",
  vitalsHeading: "முக்கிய அளவீடுகள்",
  symptomsHeading: "உறுதிசெய்யப்பட்ட அறிகுறிகள்",
  emptyPlaceholder: "வெற்று",

  // Field names (Labels)
  field_ageMonths: "வயது (மாதங்கள்)",
  field_gestWeeks: "கர்ப்ப காலம் (வாரங்கள்)",
  field_sys: "சிஸ்டாலிக் BP (mmHg)",
  field_dia: "டயஸ்டாலிக் BP (mmHg)",
  field_rr: "சுவாச வீதம் (bpm)",
  field_feverDays: "காய்ச்சல் காலம் (நாட்கள்)",
  field_pregnant: "கர்ப்பிணி",
  field_headache: "தலைவலி",
  field_blurredVision: "மங்கலான பார்வை",
  field_chestIndrawing: "நெஞ்சு குழி இறங்குதல்",
  field_stridor: "மூச்சுத்திணறல் சத்தம் (ஸ்ட்ரைடார்)",
  field_unableToFeed: "உணவு / பால் குடிக்க இயலாமை",
  field_lethargic: "மயக்கம் / நினைவின்மை",
  field_convulsions: "வலிப்பு / ஜன்னி",
  field_vomitingEverything: "எல்லாவற்றையும் வாந்தி எடுத்தல்",
  field_wheeze: "இழுப்பு (வீஸிங்)",
  field_bleeding: "ரத்தப்போக்கு",

  // Screen 3: Result (Action & Handoff)
  tier_RED: "சிவப்பு / அவசரம் (RED)",
  tier_YELLOW: "மஞ்சள் / பரிந்துரை (YELLOW)",
  tier_GREEN: "பச்சை / வழக்கம் (GREEN)",
  caseId: "வழக்கு எண்",
  whyHeading: "இந்த முடிவின் காரணம்",
  missingSafetyTitle: "⚠️ முக்கியமான தரவு விடுபட்டுள்ளது",
  missingSafetyPrompt: "துல்லியத்தை உறுதிப்படுத்த விடுபட்ட விவரங்களை உள்ளிடவும்.",
  emergencyCall108: "108 ஆம்புலன்ஸை அழைக்கவும் 📞",
  emergencySms108: "108 ஆம்புலன்ஸ் அனுப்பவும் (SMS)",
  emergencyGpsLocating: "GPS இருப்பிடத்தைப் பெறுகிறது...",
  doctorHandoffTitle: "மருத்துவர் ஒப்படைப்பு (QR)",
  doctorHandoffSubtitle: "ஆஃப்லைன் சுருக்கத்திற்கு ஸ்கேன் செய்யவும்",
  newPatientButton: "புதிய நோயாளி",
  resetConfirmMessage: "புதிய நோயாளியைத் தொடங்கவா? வழக்கு சேமிக்கப்பட்டது.",
};

