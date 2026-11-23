import { useEffect, useRef, useState } from "react";
import {
  geoapifyService,
  isGeoapifyConfigured,
  type GeoPlace,
} from "@/services/geoapifyService";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect: (place: GeoPlace) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address…",
  className = "",
}: Props) {
  const [suggestions, setSuggestions] = useState<GeoPlace[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced lookup
  useEffect(() => {
    if (!isGeoapifyConfigured) return;
    if (!value.trim() || value.length < 3) {
      setSuggestions([]);
      return;
    }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await geoapifyService.autocomplete(value, 5);
        setSuggestions(res);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [value]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">
          location_on
        </span>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
        />
        {loading && (
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 animate-spin">
            progress_activity
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.formatted);
                  onSelect(s);
                  setOpen(false);
                }}
                className="w-full text-left px-md py-sm hover:bg-surface-container-low transition-colors flex items-start gap-sm"
              >
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                  location_on
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md text-on-surface truncate">
                    {s.address_line1 || s.formatted}
                  </p>
                  {s.address_line2 && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      {s.address_line2}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isGeoapifyConfigured && (
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          Address autocomplete disabled — Geoapify key not configured.
        </p>
      )}
    </div>
  );
}
