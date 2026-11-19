import { useState, type FormEvent } from 'react';
import {
  ArrowLeftRight,
  Bookmark,
  Compass,
  LocateFixed,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { CITY_PRESETS } from '../data/cities';
import type { PinnedLocation } from '../types/airQuality';

interface CitySelectorProps {
  selectedCity: string;
  selectedNeighborhood: string;
  onSelectLocation: (city: string, neighborhood?: string) => void;
  onUseMyLocation: () => void;
  isLocating: boolean;
  locationNotice: string | null;
  pinnedLocations: PinnedLocation[];
  onRemovePin: (id: string) => void;
  isLoading: boolean;
  compareMode: boolean;
  onToggleCompareMode: () => void;
  indianMetroMode: boolean;
  onToggleIndianMetros: () => void;
}

export function CitySelector({
  selectedCity,
  selectedNeighborhood,
  onSelectLocation,
  onUseMyLocation,
  isLocating,
  locationNotice,
  pinnedLocations,
  onRemovePin,
  isLoading,
  compareMode,
  onToggleCompareMode,
  indianMetroMode,
  onToggleIndianMetros,
}: CitySelectorProps) {
  const [searchInput, setSearchInput] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('');

  const activePreset = CITY_PRESETS.find(
    (c) => c.name.toLowerCase() === selectedCity.trim().toLowerCase()
  );

  const handleCitySubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) return;
    onSelectLocation(trimmed, undefined);
    setSearchInput('');
    setCustomNeighborhood('');
  };

  const handleNeighborhoodSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = customNeighborhood.trim();
    if (!trimmed) return;
    onSelectLocation(selectedCity, trimmed);
    setCustomNeighborhood('');
  };

  const quickNeighborhoods = activePreset
    ? activePreset.neighborhoods.slice(0, 5)
    : [];
  const activeInQuick = quickNeighborhoods.some(
    (n) => n.name.toLowerCase() === selectedNeighborhood.trim().toLowerCase()
  );
  const displayedChips =
    activePreset && !activeInQuick
      ? [
          ...quickNeighborhoods.slice(0, 4),
          activePreset.neighborhoods.find(
            (n) => n.name.toLowerCase() === selectedNeighborhood.trim().toLowerCase()
          ) ?? {
            id: 'custom',
            name: selectedNeighborhood,
            zoneType: 'Local Ward',
            pm25Factor: 1,
            pm10Factor: 1,
            no2Factor: 1,
          },
        ]
      : quickNeighborhoods;

  return (
    <section
      aria-label="City and neighborhood selector"
      className="glass-panel rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Global City / Area Search + Near Me */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-1">
          <form
            onSubmit={handleCitySubmit}
            className="flex flex-1 items-center gap-2 sm:max-w-md"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any city or area (e.g. Bandra, Jaipur, Tokyo)..."
                aria-label="Search any city or neighborhood"
                className="w-full rounded-lg border border-slate-200 bg-white/90 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 min-h-[40px]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Check Air
            </button>
          </form>

          <button
            type="button"
            disabled={isLoading || isLocating}
            onClick={onUseMyLocation}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-white hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <LocateFixed
              className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-slate-900' : 'text-slate-500'}`}
              aria-hidden="true"
            />
            <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
          </button>
        </div>

        {/* Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleIndianMetros}
            aria-pressed={indianMetroMode}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              indianMetroMode
                ? 'border-amber-600/30 bg-amber-500/15 text-amber-950 shadow-xs'
                : 'border-slate-200 bg-white/85 text-slate-800 hover:bg-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Indian Metros</span>
          </button>

          <button
            type="button"
            onClick={onToggleCompareMode}
            aria-pressed={compareMode}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              compareMode
                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                : 'border-slate-200 bg-white/85 text-slate-800 hover:bg-white'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare Two Cities</span>
          </button>
        </div>
      </div>

      {/* Balanced Quick-Pick Cities Strip */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-900/8 pt-3.5">
        <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
          <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          Cities:
        </span>
        {CITY_PRESETS.map((city) => {
          const isActive =
            city.name.toLowerCase() === selectedCity.trim().toLowerCase();
          return (
            <button
              key={city.id}
              type="button"
              disabled={isLoading}
              onClick={() =>
                onSelectLocation(city.name, city.neighborhoods[0].name)
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 min-h-[36px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-900/5 text-slate-700 hover:bg-slate-900/10 hover:text-slate-950'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {locationNotice && (
        <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-50/85 px-3 py-2 text-xs font-medium text-amber-900">
          {locationNotice}
        </div>
      )}

      {/* Neighborhood Sub-Bar */}
      <div className="mt-3.5 flex flex-col gap-3 border-t border-slate-900/8 pt-3.5 lg:flex-row lg:items-center lg:justify-between">
        {activePreset ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
              Areas in {activePreset.name}:
            </span>
            {displayedChips.map((nb) => {
              const isNbActive =
                nb.name.toLowerCase() ===
                selectedNeighborhood.trim().toLowerCase();
              return (
                <button
                  key={nb.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => onSelectLocation(activePreset.name, nb.name)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                    isNbActive
                      ? 'bg-white text-slate-950 border border-slate-300 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 border border-transparent'
                  }`}
                >
                  {nb.name}
                </button>
              );
            })}

            {activePreset.neighborhoods.length > 5 && (
              <select
                aria-label={`All areas in ${activePreset.name}`}
                value={
                  activePreset.neighborhoods.some(
                    (n) =>
                      n.name.toLowerCase() ===
                      selectedNeighborhood.trim().toLowerCase()
                  )
                    ? selectedNeighborhood
                    : ''
                }
                disabled={isLoading}
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectLocation(activePreset.name, e.target.value);
                  }
                }}
                className="rounded-md border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-800 min-h-[34px] cursor-pointer focus:border-slate-900 focus:outline-none"
              >
                <option value="" disabled>
                  All {activePreset.neighborhoods.length} Areas...
                </option>
                {activePreset.neighborhoods.map((nb) => (
                  <option key={nb.id} value={nb.name}>
                    {nb.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-600">
            Area in {selectedCity}:{' '}
            <span className="font-semibold text-slate-900">
              {selectedNeighborhood}
            </span>
          </div>
        )}

        <form
          onSubmit={handleNeighborhoodSubmit}
          className="flex items-center gap-2 sm:w-auto"
        >
          <input
            type="text"
            list="neighborhood-suggestions"
            value={customNeighborhood}
            onChange={(e) => setCustomNeighborhood(e.target.value)}
            placeholder="Type any area or ward..."
            aria-label="Enter neighborhood name"
            className="w-full sm:w-48 rounded-md border border-slate-200/90 bg-white/80 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none min-h-[34px]"
          />
          {activePreset && (
            <datalist id="neighborhood-suggestions">
              {activePreset.neighborhoods.map((nb) => (
                <option key={nb.id} value={nb.name} />
              ))}
            </datalist>
          )}
          <button
            type="submit"
            disabled={!customNeighborhood.trim() || isLoading}
            className="rounded-md bg-slate-900/8 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-900/15 transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer disabled:opacity-40"
          >
            Set Area
          </button>
        </form>
      </div>

      {/* Pinned Places Watchlist (Shown cleanly whenever user saves 1+ places) */}
      {pinnedLocations.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-900/8 pt-3.5">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
            <Bookmark className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Saved Places
          </span>
          {pinnedLocations.map((pin) => {
            const active =
              pin.city.toLowerCase() === selectedCity.trim().toLowerCase() &&
              pin.neighborhood.toLowerCase() ===
                selectedNeighborhood.trim().toLowerCase();
            return (
              <div
                key={pin.id}
                className={`inline-flex items-center rounded-lg border text-xs transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200/90 bg-white/80 text-slate-800 hover:bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectLocation(pin.city, pin.neighborhood)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 font-medium whitespace-nowrap cursor-pointer min-h-[32px]"
                >
                  <span>
                    {pin.neighborhood}, {pin.city}
                  </span>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      active ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    AQI {pin.aqi}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemovePin(pin.id)}
                  aria-label={`Remove saved place ${pin.neighborhood}, ${pin.city}`}
                  className={`pr-2 pl-1 py-1.5 transition-colors cursor-pointer min-h-[32px] ${
                    active
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
