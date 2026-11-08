import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { DoctorView } from './pages/DoctorView';
import { getTranslations, type SupportedLang } from './i18n';

export default function App() {
  const [view, setView] = useState<"worker" | "doctor">("worker");
  const [lang, setLang] = useState<SupportedLang>("en");

  const t = getTranslations(lang);

  // Synchronize document lang attribute with selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Global Navigation Bar */}
      <nav 
        aria-label="App Navigation"
        className="bg-slate-900 text-white px-2 sm:px-4 py-3 shadow-md flex flex-wrap justify-center items-center gap-2 sm:gap-3"
      >
        <button
          type="button"
          onClick={() => setView("worker")}
          aria-current={view === "worker" ? "page" : undefined}
          className={`min-h-12 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-colors focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none text-center leading-tight ${
            view === "worker" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          {t.workerTab}
        </button>
        <button
          type="button"
          onClick={() => setView("doctor")}
          aria-current={view === "doctor" ? "page" : undefined}
          className={`min-h-12 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-colors focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none text-center leading-tight ${
            view === "doctor" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          {t.doctorTab}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {view === "worker" ? <Home lang={lang} onLangChange={setLang} /> : <DoctorView />}
      </main>
    </div>
  );
}
