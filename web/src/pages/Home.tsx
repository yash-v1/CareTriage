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

export function Home() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [lang, setLang] = useState<"en" | "ta" | "hi">("en");
  const [pendingFields, setPendingFields] = useState<any>(null);
  const [pendingLowConfidence, setPendingLowConfidence] = useState<string[]>([]);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

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
    return <ResultScreen result={result} onReset={() => {
      setResult(null);
      setPendingFields(null);
      setPendingLowConfidence([]); // 👈 Added missing state reset
      setTranscript("");
    }} />;
  }

  // 2. If we extracted fields but haven't confirmed them, show the Form
  if (pendingFields) {
    return (
      // 👈 Added the main layout wrapper so the background color doesn't break
      <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => {
                setPendingFields(null);
                setPendingLowConfidence([]);
              }}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-medium"
            >
              ← Cancel
            </button>
          </div>
          
          <FieldsForm 
            fields={pendingFields}
            lowConfidence={pendingLowConfidence}
            onChange={(field, value) => setPendingFields({ ...pendingFields, [field]: value })}
            onSubmit={handleConfirm}
          />
        </div>
      </div>
    );
  }

  // 3. Main Microphone/Input Screen
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <header className="mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">CareTriage</h1>
            <p className="text-sm text-gray-500 mt-1">Prototype mode (Offline Extractor)</p>
          </div>
          
          <button 
            onClick={handleManualSync}
            disabled={isSyncing || unsyncedCount === 0}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center transition-colors shadow-sm ${
              isSyncing ? 'bg-blue-100 text-blue-700' :
              unsyncedCount > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              'bg-green-100 text-green-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${
              isSyncing ? 'bg-blue-500 animate-pulse' : 
              unsyncedCount > 0 ? 'bg-amber-500' : 'bg-green-500'
            }`}></span>
            {isSyncing ? 'Syncing...' : 
             unsyncedCount > 0 ? `${unsyncedCount} Pending Sync` : 
             'Cloud Synced'}
          </button>
        </header>

        <div className="flex space-x-2 mb-6">
          {(['en', 'ta', 'hi'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                lang === l ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Record Symptoms</h2>
          
          <SpeakButton 
            lang={lang} 
            onTranscriptUpdate={setTranscript} 
          />
          
          <div className="mt-6 mb-6 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">Transcript / Manual Input:</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Pregnant 30 weeks, BP 160 over 105, severe headache and blurry vision."
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={!transcript.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            Process Speech & Extract Fields
          </button>
        </div>

      </div>
    </div>
  );
}