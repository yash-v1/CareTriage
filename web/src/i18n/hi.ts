import type { Translations } from "./en";

export const hi: Translations = {
  // Navigation / Shell
  appTitle: "CareTriage",
  appSubtitle: "नैदानिक निर्णय समर्थन",
  workerTab: "आशा कार्यकर्ता (ट्राइएज)",
  doctorTab: "चिकित्सक दृश्य (डिकोड)",

  // Sync Badge
  syncPending: "सिंक बाकी",
  syncSynced: "क्लाउड सिंक पूरा",
  syncing: "सिंक हो रहा है...",

  // Language names
  langEn: "English",
  langTa: "தமிழ்",
  langHi: "हिन्दी",

  // Screen 1: Input & Capture
  recordTitle: "लक्षण रिकॉर्ड करें",
  micReady: "बोलने के लिए टैप करें",
  micListening: "सुन रहे हैं...",
  micProcessing: "प्रोसेसिंग...",
  micStopAria: "सुनना बंद करें",
  micStartAria: "बोलना शुरू करें",
  transcriptLabel: "बातचीत / मैनुअल इनपुट",
  transcriptPlaceholder: "उदा. 30 सप्ताह की गर्भवती, बीपी 160/105, तेज सिरदर्द और धुंधला दिखना।",
  processButton: "आवाज प्रोसेस करें और लक्षण निकालें",
  micUnsupported: "इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया नीचे टाइप करें।",
  micPermissionDenied: "माइक्रोफ़ोन की अनुमति अस्वीकृत की गई। अनुमति दें या नीचे लिखें।",
  micNoSpeech: "कोई आवाज नहीं मिली। कृपया पुनः बोलें या नीचे लिखें।",
  offlineNotice: "आप ऑफलाइन हैं। स्थानीय ट्राइएज सामान्य रूप से काम करता रहेगा।",

  // Screen 2: Verification Form (Safety Gate)
  reviewTitle: "निकाले गए डेटा की समीक्षा करें",
  reviewSubtitle: "निकाले गए डेटा की जांच करें। पीले रंग के फील्ड्स में कम सटीकता हो सकती है।",
  cancelButton: "← रद्द करें",
  confirmButton: "पुष्टि करें और मूल्यांकन करें",
  checkAccuracy: "⚠️ सटीकता जांचें",
  vitalsHeading: "महत्वपूर्ण माप और संकेत",
  symptomsHeading: "पुष्ट लक्षण",
  emptyPlaceholder: "खाली",

  // Field names (Labels)
  field_ageMonths: "आयु (महीने)",
  field_gestWeeks: "गर्भकाल (सप्ताह)",
  field_sys: "सिस्टोलिक बीपी (mmHg)",
  field_dia: "डायस्टोलिक बीपी (mmHg)",
  field_rr: "श्वसन दर (bpm)",
  field_feverDays: "बुखार के दिन",
  field_pregnant: "गर्भवती",
  field_headache: "सिरदर्द",
  field_blurredVision: "धुंधली दृष्टि",
  field_chestIndrawing: "छाती का धंसना",
  field_stridor: "स्ट्राइडोर (सांस में आवाज)",
  field_unableToFeed: "दूध/खाना न पी पाना",
  field_lethargic: "सुस्त / बेहोश",
  field_convulsions: "दौरे / झटके",
  field_vomitingEverything: "सब कुछ उल्टी कर देना",
  field_wheeze: "घरघराहट (सीटी जैसी आवाज)",
  field_bleeding: "रक्तस्राव (खून बहना)",

  // Screen 3: Result (Action & Handoff)
  tier_RED: "लाल / आपातकालीन (RED)",
  tier_YELLOW: "पीला / रेफरल (YELLOW)",
  tier_GREEN: "हरा / सामान्य (GREEN)",
  caseId: "केस आईडी",
  whyHeading: "इस परिणाम का कारण",
  missingSafetyTitle: "⚠️ आवश्यक डेटा मौजूद नहीं है",
  missingSafetyPrompt: "सटीक परिणाम सुनिश्चित करने के लिए कृपया छूटे हुए मान दर्ज करें।",
  emergencyCall108: "108 एम्बुलेंस को कॉल करें 📞",
  emergencySms108: "108 एम्बुलेंस संदेश भेजें (SMS)",
  emergencyGpsLocating: "जीपीएस लोकेशन प्राप्त कर रहे हैं...",
  doctorHandoffTitle: "डॉक्टर हैंड-ऑफ (QR)",
  doctorHandoffSubtitle: "ऑफलाइन सारांश के लिए स्कैन करें",
  newPatientButton: "नया मरीज",
  resetConfirmMessage: "नया मरीज शुरू करें? केस सेव हो चुका है।",
};

