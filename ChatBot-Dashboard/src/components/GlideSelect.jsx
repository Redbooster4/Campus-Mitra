import { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown, Check } from 'lucide-react';
import './GlideSelect.css';

export default function GlideSelect({
  options = [],
  value,
  onChange,
  ariaLabel = "Select language",
  disabled = false,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) =>
    (typeof opt === 'string' ? opt : opt.value) === value
  ) || (options[0] ? (typeof options[0] === 'string' ? { label: options[0], value: options[0] } : options[0]) : null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (optVal) => {
    if (onChange) onChange(optVal);
    setOpen(false);
  };

  return (
    <div className={`glide-select-container ${className}`} ref={containerRef}>
      <button
        type="button"
        className="glide-select-trigger"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <Languages size={15} className="glide-select-icon" />
        <span className="glide-select-label">
          {selectedOption ? selectedOption.label : "Select"}
        </span>
        <ChevronDown size={14} className={`glide-select-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <ul className="glide-select-dropdown" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const optTag = typeof opt === 'object' ? opt.tag : null;
            const isSelected = optVal === value;

            return (
              <li
                key={optVal}
                role="option"
                aria-selected={isSelected}
                className={`glide-select-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelect(optVal)}
              >
                <span className="glide-select-item-text">{optLabel}</span>
                {optTag && <span className="glide-select-item-tag">{optTag}</span>}
                {isSelected && <Check size={14} className="glide-select-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
