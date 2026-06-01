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
  return (
    <div className="sort-bar">
      <p className="results-count">
        Tìm thấy <strong>{resultCount}</strong> số
      </p>
      <div className="sort-options" role="group" aria-label="Sắp xếp">
        <span className="sort-label">Sắp xếp:</span>
        {sortOptions.map((option) => (
          <button
            key={option.value}
            className={`sort-chip ${sortType === option.value ? 'active' : ''}`}
            onClick={() => onSortChange(option.value)}
            aria-pressed={sortType === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
