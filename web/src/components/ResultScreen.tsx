import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQrPayload } from '../handoff/qrPayload';
import { generateSmsLink } from '../handoff/sms';
import type { TriageResponse } from '../engine/types';
import { getTranslations, type SupportedLang } from '../i18n';

interface Props {
  result: TriageResponse;
  onReset: () => void;
  lang?: SupportedLang;
}

export function ResultScreen({ result, onReset, lang = "en" }: Props) {
  const t = getTranslations(lang);
  const { tier, rulesFired, defaultApplied, missingForSafety, disclaimer, requestId } = result;
  const qrData = generateQrPayload(result);
  
  const [isLocating, setIsLocating] = useState(false);

  // Determine the primary clinical directive from the engine
  const primaryDirective = rulesFired.length > 0
    ? (rulesFired.find(r => r.tier === tier)?.action || rulesFired[0].action)
    : (defaultApplied?.action || "Counsel on hydration and rest. Re-examine if danger signs appear.");

  const handleEmergencySMS = async () => {
    setIsLocating(true);
    try {
      const link = await generateSmsLink(result);
      window.location.href = link;
    } finally {
      setIsLocating(false);
    }
  };

  const handleResetWithConfirmation = () => {
    if (window.confirm(t.resetConfirmMessage)) {
      onReset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. STATUS BANNER (Edge-to-edge, high contrast, WCAG AA/AAA compliant) */}
      <section 
        aria-label="Triage Status"
        className={`w-full px-6 py-8 shadow-sm transition-colors ${
          tier === 'RED'
            ? 'bg-rose-600 text-white'
            : tier === 'YELLOW'
            ? 'bg-amber-400 text-slate-900'
            : 'bg-teal-700 text-white'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-mono font-bold opacity-90">
              {t.caseId}: {requestId.split('-')[1] || requestId}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Visual Icons paired with text (never color alone) */}
            {tier === 'RED' && (
              <svg className="w-12 h-12 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L1 21h22L12 2zm0 3.5L20.3 19H3.7L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
              </svg>
            )}
            {tier === 'YELLOW' && (
              <svg className="w-12 h-12 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            )}
            {tier === 'GREEN' && (
              <svg className="w-12 h-12 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight sm:tracking-wide uppercase leading-tight break-words">
                {t[`tier_${tier}` as keyof typeof t]}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Missing Safety Critical Data Alert */}
        {missingForSafety.length > 0 && (
          <div role="alert" className="bg-amber-50 border-2 border-amber-400 p-4 sm:p-5 rounded-2xl text-slate-900 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5 font-bold text-base mb-1">
              <span className="text-xl">⚠️</span>
              <span>{t.missingSafetyTitle}: {missingForSafety.join(", ")}</span>
            </div>
            <p className="text-sm text-slate-700 font-medium">
              {t.missingSafetyPrompt}
            </p>
          </div>
        )}

        {/* 2. PRIMARY MEDICAL DIRECTIVE (Verbatim from engine, readable at arm's length) */}
        <section aria-labelledby="directive-heading" className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 id="directive-heading" className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
            Recommended Action
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-words">
            {primaryDirective}
          </p>
        </section>

        {/* 3. WHY CARDS (Plain language flags from engine) */}
        <section aria-labelledby="why-heading" className="space-y-3">
          <h2 id="why-heading" className="text-lg font-bold text-slate-900">
            {t.whyHeading}
          </h2>
          
          <div className="space-y-3">
            {rulesFired.length > 0 ? (
              rulesFired.map((rule) => (
                <div 
                  key={rule.id} 
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1"
                >
                  <h3 className="text-lg font-bold text-slate-900 break-words">
                    {rule.flag}
                  </h3>
                  {rule.action !== primaryDirective && (
                    <p className="text-base text-slate-700 font-medium break-words">
                      {rule.action}
                    </p>
                  )}
                </div>
              ))
            ) : defaultApplied ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
                <h3 className="text-lg font-bold text-slate-900 break-words">
                  {defaultApplied.flag}
                </h3>
              </div>
            ) : null}
          </div>
        </section>

        {/* 4. EMERGENCY ACTION (RED tier only: static, high-contrast, min h-16) */}
        {tier === 'RED' && (
          <section aria-label="Emergency Actions" className="pt-2 space-y-3">
            {/* Primary Phone Call Button (tel:108) */}
            <a 
              href="tel:108"
              className="w-full min-h-16 bg-rose-700 hover:bg-rose-800 focus-visible:ring-4 focus-visible:ring-rose-300 text-white font-extrabold text-lg sm:text-xl py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl shadow-md flex items-center justify-center space-x-2 sm:space-x-3 transition-colors text-center leading-tight"
            >
              <span>{t.emergencyCall108}</span>
            </a>

            {/* Preserved GPS-enabled SMS Dispatch Button */}
            <button 
              onClick={handleEmergencySMS}
              disabled={isLocating}
              className="w-full min-h-14 bg-white border-2 border-rose-300 hover:bg-rose-50 focus-visible:ring-4 focus-visible:ring-rose-200 text-rose-800 font-bold text-sm sm:text-base py-3 px-4 sm:px-6 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-60 text-center leading-tight"
            >
              <span className="text-lg shrink-0">🚨</span>
              <span>{isLocating ? t.emergencyGpsLocating : t.emergencySms108}</span>
            </button>
          </section>
        )}

        {/* 5. DOCTOR HANDOFF (High contrast QR code, minimum 240px, quiet zone preserved) */}
        <section 
          aria-labelledby="handoff-heading"
          className="bg-white border border-slate-200 p-4 sm:p-8 rounded-2xl shadow-sm flex flex-col items-center text-center mt-6"
        >
          <h2 id="handoff-heading" className="text-xl font-bold text-slate-900 mb-1">
            {t.doctorHandoffTitle}
          </h2>
          <p className="text-sm font-medium text-slate-700 mb-6">
            {t.doctorHandoffSubtitle}
          </p>

          <div className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-sm inline-block max-w-full overflow-hidden">
            <QRCodeSVG 
              value={qrData} 
              size={240} 
              level="M" 
              includeMargin={true}
              aria-label="Offline Doctor QR Code"
              className="max-w-full h-auto"
            />
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs font-medium text-slate-700 text-center px-4 pt-4 leading-relaxed">
          {disclaimer}
        </p>

        {/* 7. RESET BUTTON (mt-12, neutral outline style, confirm dialog) */}
        <div className="pt-8">
          <button 
            onClick={handleResetWithConfirmation}
            className="w-full min-h-14 bg-white hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-slate-300 border-2 border-slate-400 text-slate-900 font-bold text-base sm:text-lg py-3.5 sm:py-4 px-4 rounded-xl shadow-sm transition-colors text-center leading-tight"
          >
            {t.newPatientButton}
          </button>
        </div>

      </div>
    </div>
  );
}
