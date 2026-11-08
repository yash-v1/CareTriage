import { useState } from 'react';

// Reverse mappings based on docs/contract.md
const SYMPTOM_MAP: Record<string, string> = {
  HA: "Headache",
  BLUR: "Blurred Vision",
  CIND: "Chest Indrawing",
  STRI: "Stridor",
  NOFD: "Unable to Feed",
  BLD: "Bleeding",
  LETH: "Lethargic",
  CONV: "Convulsions",
  VOM: "Vomiting Everything",
  WHZ: "Wheeze",
};

export function DoctorView() {
  const [rawInput, setRawInput] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleDecode = () => {
    try {
      const data = JSON.parse(rawInput);
      if (data.v !== 1) throw new Error("Unsupported payload version");
      setParsedData(data);
      setError("");
    } catch (err) {
      setError("Invalid QR payload. Ensure you pasted the exact JSON.");
      setParsedData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Paste scanned QR payload to decode patient summary</p>
        </header>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
            placeholder='e.g., {"v":1,"id":"req-ma9hi72","t":1793682754,"tier":"YELLOW"...}'
          />
          <button
            onClick={handleDecode}
            disabled={!rawInput.trim()}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Decode Summary
          </button>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {parsedData && (
          <div className="bg-white p-6 rounded-xl shadow-sm border-t-4" style={{ 
            borderColor: parsedData.tier === 'RED' ? '#dc2626' : parsedData.tier === 'YELLOW' ? '#eab308' : '#22c55e' 
          }}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold uppercase">{parsedData.tier} PRIORITY</h2>
              <span className="text-sm text-gray-500 font-mono">ID: {parsedData.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
              {parsedData.am != null && <div><span className="font-semibold text-gray-500 block">Age</span> {parsedData.am} months</div>}
              {parsedData.gw != null && <div><span className="font-semibold text-gray-500 block">Gestation</span> {parsedData.gw} weeks</div>}
              {parsedData.bp && <div><span className="font-semibold text-gray-500 block">Blood Pressure</span> {parsedData.bp[0]}/{parsedData.bp[1]}</div>}
              {parsedData.rr != null && <div><span className="font-semibold text-gray-500 block">Resp. Rate</span> {parsedData.rr} bpm</div>}
              {parsedData.fd != null && <div><span className="font-semibold text-gray-500 block">Fever Duration</span> {parsedData.fd} days</div>}
            </div>

            {parsedData.sx && parsedData.sx.length > 0 && (
              <div className="mb-6">
                <span className="font-semibold text-gray-500 block mb-2">Confirmed Symptoms</span>
                <div className="flex flex-wrap gap-2">
                  {parsedData.sx.map((code: string) => (
                    <span key={code} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      {SYMPTOM_MAP[code] || code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedData.rules && parsedData.rules.length > 0 && (
              <div>
                <span className="font-semibold text-gray-500 block mb-2">Triggered Clinical Rules</span>
                <ul className="list-disc list-inside text-gray-800 text-sm">
                  {parsedData.rules.map((rule: string) => (
                    <li key={rule} className="font-mono text-xs">{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}