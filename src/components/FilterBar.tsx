import { useState } from 'react';
import type { CarrierType, CategoryType } from '../types';
import { PriceRangeSlider } from './PriceRangeSlider';

export { PRICE_MIN, PRICE_MAX } from './PriceRangeSlider';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  prefixQuery: string;
  onPrefixChange: (query: string) => void;
  suffixQuery: string;
  onSuffixChange: (query: string) => void;
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
  prefixQuery,
  onPrefixChange,
  suffixQuery,
  onSuffixChange,
  selectedCarrier,
  onCarrierChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPrefix, setShowPrefix] = useState(false);
  const [showSuffix, setShowSuffix] = useState(false);

  // Count active filters for the summary
  const activeFilters: string[] = [];
  if (searchQuery) activeFilters.push(`Chứa: "${searchQuery}"`);
  if (prefixQuery) activeFilters.push(`Đầu: ${prefixQuery}`);
  if (suffixQuery) activeFilters.push(`Đuôi: ${suffixQuery}`);
  if (selectedCarrier !== 'All') activeFilters.push(selectedCarrier);
  if (selectedCategory !== 'All') activeFilters.push(selectedCategory);

  const handleClearPrefix = () => {
    onPrefixChange('');
    setShowPrefix(false);
  };

  const handleClearSuffix = () => {
    onSuffixChange('');
    setShowSuffix(false);
  };

  return (
    <div className="filter-bar">
      <button
        className="filter-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <span className="filter-toggle-left">
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
        </span>
      </button>

      <div
        id="filter-content"
        className={`filter-content ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="filter-section">
          <label htmlFor="search-input" className="filter-label">
            Tìm theo số
          </label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Nhập số cần tìm (VD: 888, 39, 68)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm số chứa"
          />

          {/* Prefix/Suffix - always in a row */}
          <div className="search-extras">
            {(showPrefix || prefixQuery) ? (
              <div className="search-extra-field">
                <label htmlFor="prefix-input" className="search-extra-label">Đầu số</label>
                <div className="search-extra-input-row">
                  <input
                    id="prefix-input"
                    type="text"
                    className="search-extra-input"
                    placeholder="VD: 090, 0914..."
                    value={prefixQuery}
                    onChange={(e) => onPrefixChange(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="search-extra-clear"
                    onClick={handleClearPrefix}
                    aria-label="Xóa đầu số"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="search-extra-pill"
                onClick={() => setShowPrefix(true)}
              >
                + Đầu số
              </button>
            )}

            {(showSuffix || suffixQuery) ? (
              <div className="search-extra-field">
                <label htmlFor="suffix-input" className="search-extra-label">Đuôi số</label>
                <div className="search-extra-input-row">
                  <input
                    id="suffix-input"
                    type="text"
                    className="search-extra-input"
                    placeholder="VD: 8888, 6789..."
                    value={suffixQuery}
                    onChange={(e) => onSuffixChange(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="search-extra-clear"
                    onClick={handleClearSuffix}
                    aria-label="Xóa đuôi số"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="search-extra-pill"
                onClick={() => setShowSuffix(true)}
              >
                + Đuôi số
              </button>
            )}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">Chọn nhà mạng</label>
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
          <label className="filter-label">Chọn loại số</label>
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
          <label className="filter-label">Khoảng giá</label>
          <PriceRangeSlider
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
          />
        </div>
      </div>
    </div>
  );
}
