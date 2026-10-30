"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type Prediction = {
  description: string;
  place_id?: string;
  id?: string;
};

type Props = {
  value: string;
  locationId: string;
  onChange: (location: string, locationId: string) => void;
};

function truncateCoord(value: number, maxDigits = 15): number {
  const [intPart, decPart = ""] = String(value).split(".");
  const maxDigitsInt = intPart.replace("-", "").length;
  const allowedDecimals = Math.max(
    0,
    maxDigits - maxDigitsInt - (decPart.length > 0 ? 1 : 0),
  );
  return Number(value.toFixed(Math.min(allowedDecimals, 8)));
}

async function resolveLocationRecord(suggestion: Prediction): Promise<{ id: string } | null> {
  if (suggestion.id) {
    return { id: suggestion.id };
  }

  let latitude: number | null = null;
  let longitude: number | null = null;

  try {
    const geoQs = suggestion.place_id
      ? `place_id=${encodeURIComponent(suggestion.place_id)}`
      : `address=${encodeURIComponent(suggestion.description)}`;
    const geoRes = await fetch(`/api/locations/geocode?${geoQs}`);
    if (geoRes.ok) {
      const geo = (await geoRes.json()) as {
        results?: { geometry?: { location?: { lat?: number; lng?: number } } }[];
      };
      const loc = geo.results?.[0]?.geometry?.location;
      if (typeof loc?.lat === "number" && typeof loc?.lng === "number") {
        latitude = truncateCoord(loc.lat);
        longitude = truncateCoord(loc.lng);
      }
    }
  } catch {
    /* geocode optional */
  }

  const createRes = await fetch("/api/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: suggestion.description,
      description: suggestion.description,
      place_id: suggestion.place_id,
      latitude,
      longitude,
    }),
  });

  if (!createRes.ok) return null;
  const created = (await createRes.json()) as { id?: string };
  return created.id ? { id: String(created.id) } : null;
}

export function EventLocationAutocomplete({ value, locationId, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [hasSelected, setHasSelected] = useState(Boolean(value && locationId));
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (hasSelected || query.length < 3) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations/autocomplete?input=${encodeURIComponent(query)}`);
        const data = (await res.json()) as { predictions?: Prediction[] };
        setSuggestions(data.predictions ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, hasSelected]);

  async function pickSuggestion(suggestion: Prediction) {
    setQuery(suggestion.description);
    setHasSelected(true);
    setOpen(false);
    setResolving(true);
    onChange(suggestion.description, "");

    const record = await resolveLocationRecord(suggestion);
    setResolving(false);

    if (!record?.id) {
      toast.error("Could not save this address. Try selecting it again or type Online.");
      setHasSelected(false);
      onChange(suggestion.description, "");
      return;
    }

    onChange(suggestion.description, record.id);
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          name="location"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHasSelected(false);
            onChange(e.target.value, "");
          }}
          placeholder="Search address or type Online"
          className={cn(
            "h-11 w-full rounded-lg border border-input-border bg-page-secondary/50 py-2 pl-10 pr-3 text-sm",
            resolving && "pr-24",
          )}
          required
          autoComplete="off"
        />
        {resolving ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Saving…
          </span>
        ) : null}
      </div>
      <input type="hidden" name="locationId" value={locationId} />
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-card">
          {suggestions.map((s) => (
            <li key={s.place_id ?? s.id ?? s.description}>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-page-secondary"
                onClick={() => void pickSuggestion(s)}
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
