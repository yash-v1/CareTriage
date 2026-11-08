import type { Fields, BooleanField, NumberField } from '../engine/types';
import { getTranslations, type SupportedLang } from '../i18n';

interface Props {
  fields: Fields;
  lowConfidence: string[];
  onChange: (field: keyof Fields, value: any) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  lang?: SupportedLang;
}

const NUMBER_FIELDS: NumberField[] = [
  "ageMonths", "gestWeeks", "sys", "dia", "rr", "feverDays"
];

const BOOLEAN_FIELDS: BooleanField[] = [
  "pregnant", "headache", "blurredVision", "chestIndrawing",
  "stridor", "unableToFeed", "lethargic", "convulsions",
  "vomitingEverything", "wheeze", "bleeding"
];

export function FieldsForm({ 
  fields, 
  lowConfidence, 
  onChange, 
  onSubmit, 
  onCancel,
  lang = "en" 
}: Props) {
  const t = getTranslations(lang);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Scrollable Content Container (pb-36 ensures bottom padding for sticky footer) */}
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 pt-4 pb-36">
        
        {/* Header with accessible neutral Cancel button and titles */}
        <header className="mb-6">
          {onCancel && (
            <div className="flex items-center justify-between mb-4">
              <button 
                type="button"
                onClick={onCancel}
                className="min-h-14 h-14 px-4 -ml-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 font-bold text-base inline-flex items-center space-x-2 focus-visible:ring-4 focus-visible:ring-slate-300 transition-colors"
                aria-label={t.cancelButton}
              >
                <span>{t.cancelButton}</span>
              </button>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.reviewTitle}
          </h1>
          <p className="text-base font-medium text-slate-700 mt-1">
            {t.reviewSubtitle}
          </p>
        </header>

        {/* Form Sections */}
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
          
          {/* SECTION 1: Vital Signs & Numerical Measurements (Single-column list) */}
          <section aria-labelledby="vitals-heading" className="space-y-5">
            <h2 id="vitals-heading" className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
              {t.vitalsHeading}
            </h2>

            <div className="space-y-5">
              {NUMBER_FIELDS.map((field) => {
                const isLowConfidence = lowConfidence.includes(field);
                const fieldId = `field-${field}`;
                const labelText = t[`field_${field}` as keyof typeof t] || field;

                return (
                  <div key={field} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label 
                        htmlFor={fieldId} 
                        className="block text-base font-bold text-slate-900 cursor-pointer"
                      >
                        {labelText}
                      </label>

                      {isLowConfidence && (
                        <span 
                          role="alert"
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400 shrink-0"
                        >
                          {t.checkAccuracy}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        id={fieldId}
                        type="number"
                        inputMode="numeric"
                        value={fields[field] ?? ''}
                        onChange={(e) => onChange(field, e.target.value === '' ? null : Number(e.target.value))}
                        placeholder={t.emptyPlaceholder}
                        className={`w-full min-h-14 h-14 px-4 rounded-xl text-base font-bold text-slate-900 transition-colors focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none ${
                          isLowConfidence
                            ? 'bg-amber-50 border-2 border-amber-400 focus:border-amber-500'
                            : 'bg-white border-2 border-slate-300 focus:border-blue-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: Confirmed Symptoms (Single-column list of touch targets) */}
          <section aria-labelledby="symptoms-heading" className="space-y-5">
            <h2 id="symptoms-heading" className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
              {t.symptomsHeading}
            </h2>

            <div className="space-y-3">
              {BOOLEAN_FIELDS.map((field) => {
                const isLowConfidence = lowConfidence.includes(field);
                const isChecked = Boolean(fields[field]);
                const fieldId = `bool-${field}`;
                const labelText = t[`field_${field}` as keyof typeof t] || field;

                return (
                  <label 
                    key={field}
                    htmlFor={fieldId}
                    className={`min-h-14 flex flex-wrap items-center justify-between gap-2 p-3.5 sm:p-4 rounded-xl border-2 transition-colors cursor-pointer select-none ${
                      isLowConfidence 
                        ? 'bg-amber-50 border-amber-400 shadow-sm' 
                        : isChecked
                        ? 'bg-blue-50/60 border-blue-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 pr-1">
                      <input
                        type="checkbox"
                        id={fieldId}
                        checked={isChecked}
                        onChange={(e) => onChange(field, e.target.checked)}
                        className="w-6 h-6 text-blue-600 rounded-md focus:ring-4 focus:ring-blue-300 accent-blue-600 cursor-pointer shrink-0"
                      />
                      <span className="text-base font-bold text-slate-900 leading-snug break-words">
                        {labelText}
                      </span>
                    </div>

                    {isLowConfidence && (
                      <span 
                        role="alert"
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400 shrink-0"
                      >
                        {t.checkAccuracy}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </section>

        </form>
      </div>

      {/* STICKY FOOTER: Confirm & Evaluate (Safe area respected, high-contrast, min h-14) */}
      <footer 
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-4 sm:px-6 py-3 shadow-lg"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full min-h-14 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-base sm:text-lg rounded-xl shadow-md flex items-center justify-center space-x-2 text-center leading-tight focus-visible:ring-4 focus-visible:ring-blue-300 transition-colors"
          >
            <span>{t.confirmButton}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
