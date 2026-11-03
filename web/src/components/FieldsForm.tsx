import React from 'react';
import type { Fields, BooleanField, NumberField } from '../engine/types';

interface Props {
  fields: Fields;
  lowConfidence: string[];
  onChange: (field: keyof Fields, value: any) => void;
  onSubmit: () => void;
}

const BOOLEAN_FIELDS: BooleanField[] = [
  "pregnant", "headache", "blurredVision", "chestIndrawing",
  "stridor", "unableToFeed", "lethargic", "convulsions",
  "vomitingEverything", "wheeze", "bleeding"
];

const NUMBER_FIELDS: NumberField[] = [
  "ageMonths", "gestWeeks", "sys", "dia", "rr", "feverDays"
];

export function FieldsForm({ fields, lowConfidence, onChange, onSubmit }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm text-black">
      <h2 className="text-xl font-bold mb-2">Confirm Clinical Fields</h2>
      <p className="text-sm text-gray-500 mb-6">Review extracted data. Amber fields indicate low AI confidence.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {NUMBER_FIELDS.map(field => (
          <div key={field} className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 capitalize mb-1">
              {field}
            </label>
            <input
              type="number"
              value={fields[field] ?? ''}
              onChange={(e) => onChange(field, e.target.value === '' ? null : Number(e.target.value))}
              className={`border p-2 rounded focus:ring-2 focus:outline-none ${
                lowConfidence.includes(field) ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
              }`}
              placeholder="Empty"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {BOOLEAN_FIELDS.map(field => (
          <label 
            key={field} 
            className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${
              lowConfidence.includes(field) ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={fields[field] || false}
              onChange={(e) => onChange(field, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-xs font-medium capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors shadow-sm"
      >
        Run Triage Rules
      </button>
    </div>
  );
}