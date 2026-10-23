import { useState } from 'react';
import { Star } from 'lucide-react';
import './PeekRating.css';

export default function PeekRating({
  value = 0,
  onChange,
  count = 5,
  labels = ["Poor", "Fair", "Good", "Helpful", "Exceptional"],
  size = 22,
  ariaLabel = "Rating",
  disabled = false,
  className = ""
}) {
  const [hovered, setHovered] = useState(null);

  const displayValue = hovered !== null ? hovered : value;
  const currentLabel = displayValue > 0 && labels[displayValue - 1] ? labels[displayValue - 1] : "";

  return (
    <div
      className={`peek-rating-wrapper ${className}`}
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="peek-rating-stars">
        {Array.from({ length: count }, (_, idx) => {
          const starNum = idx + 1;
          const isFilled = starNum <= displayValue;

          return (
            <button
              key={starNum}
              type="button"
              role="radio"
              aria-checked={value === starNum}
              aria-label={labels[idx] || `Rate ${starNum} out of ${count}`}
              disabled={disabled}
              className={`peek-star-btn ${isFilled ? 'is-filled' : ''}`}
              onClick={() => onChange && onChange(starNum)}
              onMouseEnter={() => setHovered(starNum)}
              onFocus={() => setHovered(starNum)}
              onBlur={() => setHovered(null)}
            >
              <Star
                size={size}
                className="peek-star-icon"
                fill={isFilled ? "var(--primary, #f5b400)" : "transparent"}
                color={isFilled ? "var(--primary, #f5b400)" : "var(--muted-foreground, #9ca3af)"}
              />
            </button>
          );
        })}
      </div>

      {currentLabel && (
        <span className="peek-rating-label" aria-live="polite">
          {currentLabel}
        </span>
      )}
    </div>
  );
}
