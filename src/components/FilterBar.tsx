import { useState } from 'react';
import type { CarrierType, CategoryType } from '../types';
import { PriceRangeSlider } from './PriceRangeSlider';

export { PRICE_MIN, PRICE_MAX } from './PriceRangeSlider';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCarrier: CarrierType;
  onCarrierChange: (carrier: CarrierType) => void;
  selectedCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const carriers: CarrierType[] = ['All', 'Viettel', 'Mobifone', 'Vinaphone'];
const categories: CategoryType[] = ['All', 'Phong Thủy', 'Lộc Phát', 'Thần Tài', 'Số Đẹp', 'Giá Rẻ'];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCarrier,
  onCarrierChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count active filters for the summary
  const activeFilters: string[] = [];
  if (searchQuery) activeFilters.push(`Số: "${searchQuery}"`);
  if (selectedCarrier !== 'All') activeFilters.push(selectedCarrier);
  if (selectedCategory !== 'All') activeFilters.push(selectedCategory);

  return (
    <div className="filter-bar">
      <button
        className="filter-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <span className="filter-toggle-left">
          <span className="filter-toggle-icon">🔍</span>
          <span className="filter-toggle-text">
            {isExpanded ? 'Ẩn bộ lọc' : 'Hiện bộ lọc tìm số'}
          </span>
        </span>
        {!isExpanded && activeFilters.length > 0 && (
          <span className="filter-active-summary">
            {activeFilters.join(' • ')}
          </span>
        )}
        <span className={`filter-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>

      <div
        id="filter-content"
        className={`filter-content ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="filter-section">
          <label htmlFor="search-input" className="filter-label">
            🔢 Tìm theo số
          </label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Nhập số cần tìm (VD: 888, 39, 68)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm kiếm số SIM"
          />
        </div>

        <div className="filter-section">
          <label className="filter-label">📡 Chọn nhà mạng</label>
          <div className="filter-chips" role="group" aria-label="Lọc theo nhà mạng">
            {carriers.map((carrier) => (
              <button
                key={carrier}
                className={`filter-chip ${selectedCarrier === carrier ? 'active' : ''}`}
                onClick={() => onCarrierChange(carrier)}
                aria-pressed={selectedCarrier === carrier}
              >
                {carrier === 'All' ? 'Tất cả' : carrier}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">✨ Chọn loại số</label>
          <div className="filter-chips" role="group" aria-label="Lọc theo loại số">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-chip ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => onCategoryChange(category)}
                aria-pressed={selectedCategory === category}
              >
                {category === 'All' ? 'Tất cả' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">💰 Khoảng giá</label>
          <PriceRangeSlider
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
          />
        </div>
      </div>
    </div>
  );
}
