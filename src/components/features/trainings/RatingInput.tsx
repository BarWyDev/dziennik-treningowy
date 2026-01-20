import { useState } from 'react';

interface RatingInputProps {
  value?: number;
  onChange: (rating: number | undefined) => void;
  error?: string;
}

export function RatingInput({ value, onChange, error }: RatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const displayRating = hoveredRating ?? value ?? 0;

  const handleClick = (rating: number) => {
    if (value === rating) {
      onChange(undefined);
    } else {
      onChange(rating);
    }
  };

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className="p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            onClick={() => handleClick(rating)}
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                rating <= displayRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </div>
      {value && (
        <p className="mt-1 text-sm text-gray-500">
          Ocena: {value}/5 (kliknij ponownie, aby usunąć)
        </p>
      )}
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
}
