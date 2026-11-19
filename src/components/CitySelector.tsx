import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, Compass, MapPin, Search } from 'lucide-react';
import { CITY_PRESETS } from '../data/cities';

interface CitySelectorProps {
  selectedCity: string;
  selectedNeighborhood: string;
  onSelectLocation: (city: string, neighborhood?: string) => void;
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

  return (
    <section
      aria-label="City and neighborhood selector"
      className="glass-panel rounded-2xl p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Preset City Quick Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">
            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Cities
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
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
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

        {/* Custom City Search + Mode Toggles */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
          <form
            onSubmit={handleCitySubmit}
            className="flex flex-1 items-center gap-2 xl:w-72 xl:flex-none"
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
                placeholder="Type any city (e.g. Tokyo, Paris)..."
                aria-label="Search any city"
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
      </div>

      {/* Neighborhood Sub-Bar */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-900/8 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
        {activePreset ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1.5 text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
              Neighborhoods in {activePreset.name}:
            </span>
            {activePreset.neighborhoods.map((nb) => {
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
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-600">
            Active station:{' '}
            <span className="font-semibold text-slate-900">
              {selectedCity} · {selectedNeighborhood}
            </span>
          </div>
        )}

        <form
          onSubmit={handleNeighborhoodSubmit}
          className="flex items-center gap-2 sm:w-auto"
        >
          <input
            type="text"
            value={customNeighborhood}
            onChange={(e) => setCustomNeighborhood(e.target.value)}
            placeholder="Custom neighborhood..."
            aria-label="Enter neighborhood name"
            className="w-full sm:w-44 rounded-md border border-slate-200/90 bg-white/80 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none min-h-[34px]"
          />
          <button
            type="submit"
            disabled={!customNeighborhood.trim() || isLoading}
            className="rounded-md bg-slate-900/8 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-900/15 transition-colors whitespace-nowrap shrink-0 min-h-[34px] cursor-pointer disabled:opacity-40"
          >
            Set Area
          </button>
        </form>
      </div>
    </section>
  );
}
