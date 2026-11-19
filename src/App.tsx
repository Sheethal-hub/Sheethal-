import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AiAssistant } from './components/AiAssistant';
import { AqiHeroPanel } from './components/AqiHeroPanel';
import { CityComparisonPanel } from './components/CityComparisonPanel';
import { CitySelector } from './components/CitySelector';
import { Header } from './components/Header';
import { HealthAdvisor } from './components/HealthAdvisor';
import { IndianMetroGrid } from './components/IndianMetroGrid';
import { TrendChartAndTips } from './components/TrendChartAndTips';
import { buildSimulatedAirQuality, INDIAN_METRO_NAMES } from './data/cities';
import type { AirQualityPayload, AqiStatus, UserProfile } from './types/airQuality';

const DYNAMIC_THEME: Record<
  AqiStatus,
  {
    topGlow: string;
    bottomGlow: string;
    accentBtn: string;
  }
> = {
  Good: {
    topGlow: 'rgba(16, 185, 129, 0.22)',
    bottomGlow: 'rgba(20, 184, 166, 0.14)',
    accentBtn: 'bg-emerald-700 hover:bg-emerald-800',
  },
  Moderate: {
    topGlow: 'rgba(245, 158, 11, 0.22)',
    bottomGlow: 'rgba(217, 119, 6, 0.13)',
    accentBtn: 'bg-amber-700 hover:bg-amber-800',
  },
  Poor: {
    topGlow: 'rgba(234, 88, 12, 0.22)',
    bottomGlow: 'rgba(245, 158, 11, 0.14)',
    accentBtn: 'bg-orange-700 hover:bg-orange-800',
  },
  Severe: {
    topGlow: 'rgba(225, 29, 72, 0.23)',
    bottomGlow: 'rgba(190, 18, 60, 0.14)',
    accentBtn: 'bg-rose-700 hover:bg-rose-800',
  },
};

async function fetchAirQualityEndpoint(
  city: string,
  neighborhood?: string
): Promise<AirQualityPayload> {
  const params = new URLSearchParams({ city });
  if (neighborhood) {
    params.set('neighborhood', neighborhood);
  }
  const res = await fetch(`/api/air-quality?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Unable to load air quality data for this location.');
  }
  return (await res.json()) as AirQualityPayload;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Indiranagar');
  const [profile, setProfile] = useState<UserProfile>('general');
  const [airQuality, setAirQuality] = useState<AirQualityPayload>(() =>
    buildSimulatedAirQuality('Bengaluru', 'Indiranagar')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Comparison Mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareData, setCompareData] = useState<AirQualityPayload>(() =>
    buildSimulatedAirQuality('Delhi', 'Connaught Place')
  );
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  // Indian Metros Preset Mode state
  const [indianMetroMode, setIndianMetroMode] = useState(false);
  const [indianMetros, setIndianMetros] = useState<AirQualityPayload[]>(() =>
    INDIAN_METRO_NAMES.map((name) => buildSimulatedAirQuality(name))
  );
  const [isLoadingMetros, setIsLoadingMetros] = useState(false);

  const loadAirQuality = useCallback(
    async (city: string, neighborhood?: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const payload = await fetchAirQualityEndpoint(city, neighborhood);
        setAirQuality(payload);
        setSelectedCity(payload.city);
        setSelectedNeighborhood(payload.neighborhood);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Connection error while updating air quality.';
        setFetchError(message);
        const fallback = buildSimulatedAirQuality(city, neighborhood);
        setAirQuality(fallback);
        setSelectedCity(fallback.city);
        setSelectedNeighborhood(fallback.neighborhood);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadCompareCity = useCallback(
    async (city: string, neighborhood?: string) => {
      setIsLoadingCompare(true);
      try {
        const payload = await fetchAirQualityEndpoint(city, neighborhood);
        setCompareData(payload);
      } catch {
        setCompareData(buildSimulatedAirQuality(city, neighborhood));
      } finally {
        setIsLoadingCompare(false);
      }
    },
    []
  );

  const loadIndianMetros = useCallback(async () => {
    setIsLoadingMetros(true);
    try {
      const results = await Promise.all(
        INDIAN_METRO_NAMES.map((city) =>
          fetchAirQualityEndpoint(city).catch(() =>
            buildSimulatedAirQuality(city)
          )
        )
      );
      setIndianMetros(results);
    } finally {
      setIsLoadingMetros(false);
    }
  }, []);

  useEffect(() => {
    void loadAirQuality('Bengaluru', 'Indiranagar');
  }, [loadAirQuality]);

  const handleSelectLocation = (city: string, neighborhood?: string) => {
    void loadAirQuality(city, neighborhood);
  };

  const handleToggleCompareMode = () => {
    const next = !compareMode;
    setCompareMode(next);
    if (next) {
      const defaultCityB =
        selectedCity.toLowerCase() === 'delhi' ? 'Bengaluru' : 'Delhi';
      void loadCompareCity(defaultCityB);
    }
  };

  const handleSwapCities = () => {
    const prevA = airQuality;
    const prevB = compareData;
    setAirQuality(prevB);
    setSelectedCity(prevB.city);
    setSelectedNeighborhood(prevB.neighborhood);
    setCompareData(prevA);
  };

  const handleToggleIndianMetros = () => {
    const next = !indianMetroMode;
    setIndianMetroMode(next);
    if (next) {
      void loadIndianMetros();
    }
  };

  const handleCompareFromMetro = (city: string, neighborhood: string) => {
    setCompareMode(true);
    if (city.toLowerCase() === selectedCity.toLowerCase()) {
      const alt = city.toLowerCase() === 'delhi' ? 'Bengaluru' : 'Delhi';
      void loadCompareCity(alt);
    } else {
      void loadCompareCity(city, neighborhood);
    }
  };

  const handleRefresh = () => {
    void loadAirQuality(selectedCity, selectedNeighborhood);
    if (compareMode) {
      void loadCompareCity(compareData.city, compareData.neighborhood);
    }
    if (indianMetroMode) {
      void loadIndianMetros();
    }
  };

  const theme = DYNAMIC_THEME[airQuality.status];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f4f7fa] text-slate-900">
      {/* Dynamic Subtle Atmospheric Background Accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-0 transition-all duration-700"
        style={{
          backgroundImage: `
            radial-gradient(60% 45% at 14% 8%, ${theme.topGlow}, transparent 70%),
            radial-gradient(50% 45% at 88% 22%, ${theme.bottomGlow}, transparent 72%),
            radial-gradient(45% 40% at 50% 96%, ${theme.topGlow}, transparent 75%)
          `,
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header
          onRefresh={handleRefresh}
          isRefreshing={isLoading || isLoadingCompare || isLoadingMetros}
          accentButtonClass={theme.accentBtn}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <CitySelector
            selectedCity={selectedCity}
            selectedNeighborhood={selectedNeighborhood}
            onSelectLocation={handleSelectLocation}
            isLoading={isLoading}
            compareMode={compareMode}
            onToggleCompareMode={handleToggleCompareMode}
            indianMetroMode={indianMetroMode}
            onToggleIndianMetros={handleToggleIndianMetros}
          />

          {fetchError && (
            <div
              role="status"
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50/90 px-4 py-3 text-xs font-medium text-amber-900"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
              <span>{fetchError} Showing calibrated urban model data instead.</span>
            </div>
          )}

          {indianMetroMode && (
            <IndianMetroGrid
              metros={indianMetros}
              activeCity={selectedCity}
              profile={profile}
              isLoading={isLoadingMetros}
              onFocusMetro={(city, nb) => handleSelectLocation(city, nb)}
              onCompareMetro={handleCompareFromMetro}
              onClose={() => setIndianMetroMode(false)}
            />
          )}

          {compareMode && (
            <CityComparisonPanel
              cityA={airQuality}
              cityB={compareData}
              profile={profile}
              isLoadingB={isLoadingCompare}
              onSelectCityB={(city, nb) => void loadCompareCity(city, nb)}
              onSwapCities={handleSwapCities}
              onClose={() => setCompareMode(false)}
            />
          )}

          <AqiHeroPanel data={airQuality} isLoading={isLoading} />

          <HealthAdvisor
            data={airQuality}
            profile={profile}
            onProfileChange={setProfile}
          />

          <TrendChartAndTips data={airQuality} />

          <AiAssistant data={airQuality} profile={profile} />
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-4 sm:px-6">
          <div className="flex flex-col gap-2 border-t border-slate-900/8 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              AeroSense · Urban Air Quality Assistant
            </div>
            <div>
              Reference thresholds based on US EPA AQI &amp; WHO 24-hour guidelines
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
