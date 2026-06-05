import { useRef, useCallback, useMemo } from 'react';
import { formatPrice } from '../utils/formatPrice';
import type { SimCard } from '../types';

export const PRICE_MIN = 500000; // 500K VND
export const PRICE_MAX = 500000000; // 500M VND
const STEP = 100000; // 100K VND increments
const NUM_BUCKETS = 40;

interface PriceRangeSliderProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  simCards: SimCard[];
}

// Logarithmic scale helpers
function priceToPercent(price: number): number {
  const minLog = Math.log(PRICE_MIN);
  const maxLog = Math.log(PRICE_MAX);
  return ((Math.log(price) - minLog) / (maxLog - minLog)) * 100;
}

function percentToPrice(percent: number): number {
  const minLog = Math.log(PRICE_MIN);
  const maxLog = Math.log(PRICE_MAX);
  const raw = Math.exp(minLog + (percent / 100) * (maxLog - minLog));
  // Snap to nearest STEP
  return Math.round(raw / STEP) * STEP;
}

// Build histogram buckets from all SIM card prices
function buildHistogram(cards: SimCard[]): number[] {
  const buckets = new Array(NUM_BUCKETS).fill(0);
  const minLog = Math.log(PRICE_MIN);
  const maxLog = Math.log(PRICE_MAX);
  const bucketWidth = (maxLog - minLog) / NUM_BUCKETS;

  for (const sim of cards) {
    const logPrice = Math.log(Math.max(PRICE_MIN, Math.min(sim.price, PRICE_MAX)));
    const bucketIndex = Math.min(
      NUM_BUCKETS - 1,
      Math.floor((logPrice - minLog) / bucketWidth)
    );
    buckets[bucketIndex]++;
  }
  return buckets;
}

export function PriceRangeSlider({ priceRange, onPriceRangeChange, simCards }: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);
  const histogram = useMemo(() => buildHistogram(simCards), [simCards]);
  const maxBucket = Math.max(...histogram, 1);

  const getPercentFromEvent = useCallback((clientX: number): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, percent));
  }, []);

  const handlePointerDown = useCallback((thumb: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = thumb;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const percent = getPercentFromEvent(e.clientX);
    const price = percentToPrice(percent);

    if (draggingRef.current === 'min') {
      const clamped = Math.max(PRICE_MIN, Math.min(price, priceRange[1]));
      onPriceRangeChange([clamped, priceRange[1]]);
    } else {
      const clamped = Math.min(PRICE_MAX, Math.max(price, priceRange[0]));
      onPriceRangeChange([priceRange[0], clamped]);
    }
  }, [getPercentFromEvent, onPriceRangeChange, priceRange]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const minPercent = priceToPercent(priceRange[0]);
  const maxPercent = priceToPercent(priceRange[1]);

  return (
    <div className="price-range-slider">
      <div className="price-range-header">
        <span>{formatPrice(priceRange[0])}</span>
        <span>—</span>
        <span>{priceRange[1] >= PRICE_MAX ? `${formatPrice(PRICE_MAX)}+` : formatPrice(priceRange[1])}</span>
      </div>

      {/* Histogram + Slider */}
      <div className="price-slider-container">
        {/* Histogram bars */}
        <div className="price-histogram" aria-hidden="true">
          {histogram.map((count, i) => {
            const barLeft = (i / NUM_BUCKETS) * 100;
            const barRight = ((i + 1) / NUM_BUCKETS) * 100;
            const isInRange = barRight >= minPercent && barLeft <= maxPercent;
            const height = count > 0 ? Math.max(8, (count / maxBucket) * 100) : 0;
            return (
              <div
                key={i}
                className={`histogram-bar ${isInRange ? 'in-range' : ''}`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Slider track */}
        <div
          className="price-track"
          ref={trackRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Inactive track (full width) */}
          <div className="track-bg" />
          {/* Active track (between thumbs) */}
          <div
            className="track-active"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          {/* Min thumb */}
          <div
            className="slider-thumb"
            style={{ left: `${minPercent}%` }}
            onPointerDown={handlePointerDown('min')}
            role="slider"
            aria-label="Giá tối thiểu"
            aria-valuemin={PRICE_MIN}
            aria-valuemax={PRICE_MAX}
            aria-valuenow={priceRange[0]}
            tabIndex={0}
          />
          {/* Max thumb */}
          <div
            className="slider-thumb"
            style={{ left: `${maxPercent}%` }}
            onPointerDown={handlePointerDown('max')}
            role="slider"
            aria-label="Giá tối đa"
            aria-valuemin={PRICE_MIN}
            aria-valuemax={PRICE_MAX}
            aria-valuenow={priceRange[1]}
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
