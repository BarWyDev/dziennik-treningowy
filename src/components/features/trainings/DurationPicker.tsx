import { useState, useEffect } from 'react';

interface DurationPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  error?: string;
}

export function DurationPicker({ value, onChange, error }: DurationPickerProps) {
  const [hours, setHours] = useState(Math.floor(value / 60));
  const [minutes, setMinutes] = useState(value % 60);

  useEffect(() => {
    setHours(Math.floor(value / 60));
    setMinutes(value % 60);
  }, [value]);

  const handleHoursChange = (newHours: number) => {
    const clampedHours = Math.max(0, Math.min(10, newHours));
    setHours(clampedHours);
    onChange(clampedHours * 60 + minutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const clampedMinutes = Math.max(0, Math.min(59, newMinutes));
    setMinutes(clampedMinutes);
    onChange(hours * 60 + clampedMinutes);
  };

  const quickOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="10"
            value={hours}
            onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
            className="w-16 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
          <span className="text-sm text-gray-600">godz.</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
            className="w-16 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
          <span className="text-sm text-gray-600">min.</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickOptions.map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => onChange(mins)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              value === mins
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mins >= 60 ? `${mins / 60}h` : `${mins}min`}
          </button>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
}
