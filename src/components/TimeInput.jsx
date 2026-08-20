import React, { useState, useEffect, useRef } from 'react';

/**
 * TimeInput — custom 24-hour time input that works on ALL devices and locales.
 *
 * Replaces <input type="time"> which renders AM/PM on 12-hour OS locales
 * (iOS Safari, Android Chrome, US Windows). This component uses type="text"
 * with inputMode="numeric" so the browser never shows an AM/PM picker.
 *
 * Features:
 *  - Auto-inserts colon after the 2nd digit (e.g. "14" → "14:")
 *  - Auto-pads single digits on blur ("9:5" → "09:05")
 *  - Accepts 4-digit entry without colon ("1430" → "14:30")
 *  - Validates 00:00 – 23:59
 *  - Calls onChange("HH:MM") on valid input, onChange("") on clear
 *
 * Props:
 *   id          {string}   - input element id
 *   value       {string}   - controlled "HH:MM" value or ""
 *   onChange    {function} - (value: string) => void
 *   ariaLabel   {string}   - accessible label text
 *   placeholder {string}   - defaults to "HH:MM"
 *   className   {string}   - additional CSS classes (e.g. "field-input")
 */
function TimeInput({
  id,
  value = '',
  onChange,
  ariaLabel,
  placeholder = 'HH:MM',
  className = '',
}) {
  const [raw, setRaw] = useState(value);
  const lastEmitted = useRef(value);

  // Sync external value changes (e.g. on clearAll or localStorage restore)
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setRaw(value);
      lastEmitted.current = value;
    }
  }, [value]);

  // Emit a validated value upstream without triggering the sync above
  const emit = (v) => {
    lastEmitted.current = v;
    onChange(v);
  };

  const handleChange = (e) => {
    let v = e.target.value;

    // Strip everything except digits and colon
    v = v.replace(/[^0-9:]/g, '');

    // Auto-insert colon after 2nd digit when no colon yet
    if (v.length >= 3 && !v.includes(':')) {
      v = v.slice(0, 2) + ':' + v.slice(2);
    }

    // Cap at "HH:MM" (5 chars)
    if (v.length > 5) v = v.slice(0, 5);

    setRaw(v);

    // Emit if value is a complete, valid HH:MM
    if (/^\d{2}:\d{2}$/.test(v)) {
      const [h, m] = v.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        emit(v);
        return;
      }
    }

    if (v === '') emit('');
  };

  const handleBlur = () => {
    let v = raw.replace(/[^0-9:]/g, '').trim();

    if (!v) { setRaw(''); emit(''); return; }

    // Accept "HHMM" (4 digits no colon)
    if (/^\d{4}$/.test(v)) {
      v = v.slice(0, 2) + ':' + v.slice(2);
    }

    // Accept "H:M" or "HH:M" or "H:MM" partial formats
    if (/^\d{1,2}:\d{1,2}$/.test(v)) {
      const [h, m] = v.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        setRaw(formatted);
        emit(formatted);
        return;
      }
    }

    // Accept bare hour "9" or "14" — assume :00 minutes
    if (/^\d{1,2}$/.test(v)) {
      const h = parseInt(v, 10);
      if (h >= 0 && h <= 23) {
        const formatted = `${String(h).padStart(2, '0')}:00`;
        setRaw(formatted);
        emit(formatted);
        return;
      }
    }

    // Invalid — revert to last valid value
    setRaw(value);
  };

  // Highlight all text on focus so user can easily replace
  const handleFocus = (e) => e.target.select();

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="\d{2}:\d{2}"
      placeholder={placeholder}
      value={raw}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={`time-text-input${className ? ' ' + className : ''}`}
      aria-label={ariaLabel}
      maxLength={5}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
    />
  );
}

export default TimeInput;
