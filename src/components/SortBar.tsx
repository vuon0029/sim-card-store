import { useState } from 'react';
import type { SortType } from '../types';

interface SortBarProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  resultCount: number;
}

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'random', label: 'Ngẫu nhiên' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
];

export function SortBar({ sortType, onSortChange, resultCount }: SortBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLabel = sortOptions.find((o) => o.value === sortType)?.label ?? 'Ngẫu nhiên';

  return (
    <div className="sort-bar">
      <div className="sort-bar-header">
        <p className="results-count">
          Tìm thấy <strong>{resultCount}</strong> số
        </p>
        <button
          className="sort-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="sort-content"
        >
          <span className="sort-toggle-text">
            📊 Sắp xếp: <strong>{currentLabel}</strong>
          </span>
          <span className={`sort-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      <div
        id="sort-content"
        className={`sort-content ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="sort-options" role="group" aria-label="Sắp xếp">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`sort-chip ${sortType === option.value ? 'active' : ''}`}
              onClick={() => {
                onSortChange(option.value);
                setIsExpanded(false);
              }}
              aria-pressed={sortType === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
