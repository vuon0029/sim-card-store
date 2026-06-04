import { useState } from 'react';
import type { SortType, ViewType } from '../types';

interface SortBarProps {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
  resultCount: number;
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
}

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'random', label: 'Ngẫu nhiên' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
];

export function SortBar({ sortType, onSortChange, resultCount, viewType, onViewChange }: SortBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLabel = sortOptions.find((o) => o.value === sortType)?.label ?? 'Ngẫu nhiên';

  return (
    <div className="sort-bar">
      <div className="sort-bar-header">
        <p className="results-count">
          Tìm thấy <strong>{resultCount}</strong> số
        </p>
        <div className="sort-bar-controls">
          <div className="view-toggle" role="group" aria-label="Chế độ hiển thị">
            <button
              className={`view-toggle-btn ${viewType === 'card' ? 'active' : ''}`}
              onClick={() => onViewChange('card')}
              aria-pressed={viewType === 'card'}
              title="Hiển thị dạng thẻ"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
            <button
              className={`view-toggle-btn ${viewType === 'list' ? 'active' : ''}`}
              onClick={() => onViewChange('list')}
              aria-pressed={viewType === 'list'}
              title="Hiển thị dạng danh sách"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="1" y="6.75" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="1" y="11.5" width="14" height="2.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </button>
          </div>
          <button
            className="sort-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="sort-content"
          >
            <span className="sort-toggle-text">
              Sắp xếp: <strong>{currentLabel}</strong>
            </span>
            <span className={`sort-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>
            </span>
          </button>
        </div>
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
