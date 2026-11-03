import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQrPayload } from '../handoff/qrPayload';
import { generateSmsLink } from '../handoff/sms';
import type { TriageResponse, Tier } from '../engine/types';

interface Props {
  result: TriageResponse;
  onReset: () => void;
}

const bgColors: Record<Tier, string> = {
  RED: "bg-red-600 text-white",
  YELLOW: "bg-yellow-500 text-black",
  GREEN: "bg-green-500 text-white",
};

export function ResultScreen({ result, onReset }: Props) {
  const { tier, rulesFired, defaultApplied, missingForSafety, disclaimer, requestId } = result;
  const qrData = generateQrPayload(result);
  
  const [isLocating, setIsLocating] = useState(false);

  const handleEmergencySMS = async () => {
    setIsLocating(true);
    const link = await generateSmsLink(result);
    setIsLocating(false);
    // This triggers the phone's native SMS app
    window.location.href = link; 
  };

  return (
    <div className={`min-h-screen p-6 flex flex-col ${bgColors[tier]}`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-5xl font-bold uppercase tracking-wider">{tier}</h1>
          <span className="text-sm opacity-80 font-mono mt-2">ID: {requestId.split('-')[1]}</span>
        </div>

        {missingForSafety.length > 0 && (
          <div className="bg-black/20 p-4 rounded-lg mb-6 text-sm font-semibold">
            ⚠️ Missing critical data: {missingForSafety.join(", ")}. 
            Please confirm to ensure this result is accurate.
          </div>
        )}

        <div className="space-y-6 mb-8">
          {rulesFired.length > 0 ? (
            rulesFired.map((rule) => (
              <div key={rule.id} className="bg-black/10 p-5 rounded-xl">
                <h2 className="text-2xl font-bold mb-2">{rule.flag}</h2>
                <p className="text-lg opacity-90">{rule.action}</p>
              </div>
            ))
          ) : defaultApplied ? (
            <div className="bg-black/10 p-5 rounded-xl">
              <h2 className="text-2xl font-bold mb-2">{defaultApplied.flag}</h2>
              <p className="text-lg opacity-90">{defaultApplied.action}</p>
            </div>
          ) : null}
        </div>

        {/* 108 Emergency SMS Button (Only shows for RED) */}
        {tier === 'RED' && (
          <button 
            onClick={handleEmergencySMS}
            disabled={isLocating}
            className="w-full bg-white text-red-600 font-bold py-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 mb-6 hover:bg-gray-100 transition-colors"
          >
            <span className="text-xl">🚨</span>
            <span>{isLocating ? "Getting GPS..." : "Dispatch 108 Ambulance (SMS)"}</span>
          </button>
        )}

        {/* QR Hand-off Card */}
        <div className="bg-white text-black p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <h3 className="font-bold text-lg mb-1">Doctor Hand-off</h3>
          <p className="text-xs text-gray-500 mb-4">Scan for offline triage summary</p>
          <div className="p-2 bg-white rounded-lg border-2 border-gray-100">
            <QRCodeSVG value={qrData} size={180} level="M" includeMargin={true} />
          </div>
        </div>

      </div>

      <div className="mt-8 pt-4">
        <p className="text-xs opacity-75 mb-6 text-center">{disclaimer}</p>
        <button 
          onClick={onReset}
          className="w-full bg-black/20 hover:bg-black/30 text-current font-bold py-4 rounded-full transition-colors border border-current/20"
        >
          New Patient
        </button>
      </div>
    </div>
  );
}