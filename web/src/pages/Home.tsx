import React, { useState } from 'react';
import { extract } from '../extractor/extract';
import { submitTriage } from '../api/client';
import { ResultScreen } from '../components/ResultScreen';
import { FieldsForm } from '../components/FieldsForm';
import type { Fields, TriageResponse } from '../engine/types';
import { SpeakButton } from '../components/SpeakButton';

export function Home() {
  const [transcript, setTranscript] = useState("");
  const [fields, setFields] = useState<Fields>({});
  const [lowConfidence, setLowConfidence] = useState<string[]>([]);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [lang, setLang] = useState<"en" | "ta" | "hi">("en");

  const handleExtract = () => {
    // Hardcoded to English for the initial prototype
    const { fields: extracted, lowConfidence: lc } = extract(transcript, lang);
    setFields(extracted);
    setLowConfidence(lc);
  };

  const handleFieldChange = (field: keyof Fields, value: any) => {
    setFields(prev => ({ ...prev, [field]: value }));
    // Remove from low confidence once the worker manually overrides/confirms it
    if (lowConfidence.includes(field)) {
      setLowConfidence(prev => prev.filter(f => f !== field));
    }
  };

  const handleSubmitTriage = async () => {
    const res = await submitTriage(fields, lowConfidence);
    setResult(res);
  };

  const handleReset = () => {
    setTranscript("");
    setFields({});
    setLowConfidence([]);
    setResult(null);
  };

  if (result) {
    return <ResultScreen result={result} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">CareTriage</h1>
          <p className="text-sm text-gray-500 mt-1">Prototype mode (Offline Extractor)</p>
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <h2 className="text-lg font-bold text-gray-800">Record Symptoms</h2>
            
            <SpeakButton 
              lang={lang} 
              onTranscriptUpdate={setTranscript} 
            />
            
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[5rem] text-left text-gray-700 italic">
              {transcript || "Speak to see transcript here..."}
            </div>

            <button
              onClick={handleExtract}
              disabled={!transcript.trim()}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Process Speech
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            placeholder="e.g., Pregnant 30 weeks, BP 160 over 105, severe headache and blurry vision."
          />
          <button
            onClick={handleExtract}
            disabled={!transcript.trim()}
            className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Extract Fields
          </button>
        </div>

        {(Object.keys(fields).length > 0 || transcript) && (
          <FieldsForm
            fields={fields}
            lowConfidence={lowConfidence}
            onChange={handleFieldChange}
            onSubmit={handleSubmitTriage}
          />
        )}
      </div>
    </div>
  );
}