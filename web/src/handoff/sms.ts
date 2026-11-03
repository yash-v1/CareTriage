import type { TriageResponse } from "../engine/types";

export async function generateSmsLink(result: TriageResponse): Promise<string> {
  const { tier, rulesFired, requestId } = result;
  
  let locationStr = "Loc: [GPS Unavailable]";
  
  try {
    // Attempt to grab device coordinates with a 5-second timeout
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    const { latitude, longitude } = pos.coords;
    locationStr = `Loc: https://maps.google.com/?q=${latitude},${longitude}`;
  } catch (e) {
    console.warn("GPS failed or denied", e);
  }

  const rules = rulesFired.map(r => r.flag).join(", ");
  
  // Format the emergency payload
  const message = `EMERGENCY (CareTriage)
ID: ${requestId.split('-')[1]}
Priority: ${tier}
Signs: ${rules}
${locationStr}

Send ambulance immediately.`;

  // Use the sms: URI scheme. Note: iOS uses `sms:108&body=`, Android uses `sms:108?body=`
  // We use `?` which is standard for Android (most common for ASHA workers)
  return `sms:108?body=${encodeURIComponent(message)}`;
}