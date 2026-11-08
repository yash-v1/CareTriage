import { useState, useEffect } from 'react';
import { getUnsyncedRecords } from '../storage/db';
import { runSyncQueue } from '../storage/syncQueue';
import { extract } from '../extractor/extract';
import { ResultScreen } from '../components/ResultScreen';
import { FieldsForm } from '../components/FieldsForm';
import type { TriageResponse } from '../engine/types';
import { SpeakButton } from '../components/SpeakButton';
import { savePatientRecord } from '../storage/db';
import { evaluate } from '../engine/evaluate';
import rulesData from '../../../shared/rules.json';
import { getTranslations, type SupportedLang } from '../i18n';

interface HomeProps {
  lang?: SupportedLang;
  onLangChange?: (l: SupportedLang) => void;
}

export function Home({ lang: propLang, onLangChange }: HomeProps = {}) {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [internalLang, setInternalLang] = useState<SupportedLang>("en");
  const [pendingFields, setPendingFields] = useState<any>(null);
  const [pendingLowConfidence, setPendingLowConfidence] = useState<string[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const lang = propLang ?? internalLang;
  const setLang = onLangChange ?? setInternalLang;

  const t = getTranslations(lang);

  // Synchronize document lang attribute with selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // 1. Check for unsynced records on load
  const checkPending = async () => {
    try {
      const records = await getUnsyncedRecords();
      setUnsyncedCount(records.length);
    } catch (e) {
      console.error("DB Check Failed", e);
    }
  };

  useEffect(() => {
    checkPending();

    // 2. The Auto-Sync trigger when Wi-Fi connects
    const handleOnline = async () => {
      setIsSyncing(true);
      await runSyncQueue();
      await checkPending();
      setIsSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // 3. Manual sync for the UI button
  const handleManualSync = async () => {
    setIsSyncing(true);
    await runSyncQueue();
    await checkPending();
    setIsSyncing(false);
  };

  const handleExtract = () => {
    const { fields: extracted, lowConfidence: lc } = extract(transcript, lang);
    setPendingFields(extracted);
    setPendingLowConfidence(lc);
  };

  const handleConfirm = () => {
    if (!pendingFields) return;
    
    const engineResult = evaluate(pendingFields, rulesData as any);
    
    const finalResult = {
      ...engineResult,
      fields: pendingFields,
      requestId: `req-${Math.random().toString(36).slice(2, 9)}`,
      lowConfidence: pendingLowConfidence,
      disclaimer: "This is a triage support tool. Final clinical judgement must be made by a medical professional."
    };

    setResult(finalResult as any);
    savePatientRecord(finalResult as any)
      .then(() => checkPending())
      .catch(err => console.error("DB Save Failed", err));
    
    setPendingFields(null);
    setPendingLowConfidence([]);
  };

  // 1. If we have a final result, show the QR/Handoff screen
  if (result) {
    return (
      <ResultScreen 
        result={result} 
        lang={lang} 
        onReset={() => {
          setResult(null);
          setPendingFields(null);
          setPendingLowConfidence([]);
          setTranscript("");
        }} 
      />
    );
  }

  // 2. If we extracted fields but haven't confirmed them, show the Form
  if (pendingFields) {
    return (
      <FieldsForm 
        fields={pendingFields}
        lowConfidence={pendingLowConfidence}
        onChange={(field, value) => setPendingFields({ ...pendingFields, [field]: value })}
        onSubmit={handleConfirm}
        onCancel={() => {
          setPendingFields(null);
          setPendingLowConfidence([]);
        }}
        lang={lang}
      />
    );
  }

  // 3. Main Microphone/Input Screen (Screen 1)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Header with App Title + Filled Sync Badge */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
              {t.appTitle}
            </h1>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
          
          {/* Sync Badge: Filled pill with icon and text (never colored text on white) */}
          <button 
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing || unsyncedCount === 0}
            className={`min-h-12 px-3 sm:px-4 py-2 rounded-full text-xs font-extrabold flex items-center space-x-1.5 sm:space-x-2 transition-colors shadow-xs shrink-0 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none ${
              isSyncing 
                ? 'bg-blue-100 border-2 border-blue-400 text-slate-900 cursor-wait' 
                : unsyncedCount > 0 
                ? 'bg-amber-100 border-2 border-amber-400 text-slate-900 hover:bg-amber-200 cursor-pointer' 
                : 'bg-teal-700 text-white cursor-default'
            }`}
            aria-label={
              isSyncing 
                ? t.syncing 
                : unsyncedCount > 0 
                ? `${unsyncedCount} ${t.syncPending}` 
                : t.syncSynced
            }
          >
            {isSyncing ? (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse motion-reduce:animate-none shrink-0" aria-hidden="true" />
            ) : unsyncedCount > 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
            ) : (
              <svg className="w-3.5 h-3.5 text-white shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            
            <span>
              {isSyncing 
                ? t.syncing 
                : unsyncedCount > 0 
                ? `${unsyncedCount} ${t.syncPending}` 
                : t.syncSynced}
            </span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-grow">
        
        {/* Language Toggle: Segmented control directly below header (each segment h-14) */}
        <section aria-label="Language selection" className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
          {(['en', 'ta', 'hi'] as const).map((l) => {
            const isSelected = lang === l;
            const label = l === 'en' ? t.langEn : l === 'ta' ? t.langTa : t.langHi;

            return (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={isSelected}
                className={`min-h-14 h-14 min-w-0 px-1 sm:px-2 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900 border border-slate-300'
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </section>

        {/* Main Stage: Card with Large Microphone Button and Text Fallback */}
        <section aria-label="Symptom Input" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 text-center">
            {t.recordTitle}
          </h2>
          
          {/* Large Circular Microphone Button (min 120px) */}
          <SpeakButton 
            lang={lang} 
            onTranscriptUpdate={setTranscript} 
          />
          
          {/* Text Fallback: High-contrast textarea below microphone */}
          <div className="space-y-2 pt-2 text-left">
            <label htmlFor="symptom-transcript" className="block text-base font-bold text-slate-900">
              {t.transcriptLabel}
            </label>
            <textarea
              id="symptom-transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={t.transcriptPlaceholder}
              className="w-full min-h-[120px] h-32 border-2 border-slate-400 focus:border-blue-600 rounded-xl p-4 text-base font-medium text-slate-900 placeholder:text-slate-500 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none transition-colors"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleExtract}
            disabled={!transcript.trim()}
            className="w-full min-h-14 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-base sm:text-lg rounded-xl shadow-md flex items-center justify-center text-center leading-tight transition-colors focus-visible:ring-4 focus-visible:ring-blue-300"
          >
            <span>{t.processButton}</span>
          </button>
        </section>

      </div>
    </div>
  );
}
