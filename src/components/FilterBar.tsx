import type { CarrierType, CategoryType } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCarrier: CarrierType;
  onCarrierChange: (carrier: CarrierType) => void;
  selectedCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const carriers: CarrierType[] = ['All', 'Viettel', 'Mobifone', 'Vinaphone', 'Vietnamobile'];
const categories: CategoryType[] = ['All', 'Phong Thủy', 'Lộc Phát', 'Thần Tài', 'Số Đẹp', 'Giá Rẻ'];

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCarrier,
  onCarrierChange,
  selectedCategory,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label htmlFor="search-input" className="filter-label">
          Tìm số
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
        <label className="filter-label">Nhà mạng</label>
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
        <label className="filter-label">Loại số</label>
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
    </div>
  );
}
