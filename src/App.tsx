import { useState, useMemo, useRef } from 'react';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { FilterBar, PRICE_MIN, PRICE_MAX } from './components/FilterBar';
import { SortBar } from './components/SortBar';
import { SimCardList } from './components/SimCardList';
import { Cart } from './components/Cart';
import { InquiryModal } from './components/InquiryModal';
import { ZaloButton } from './components/ZaloButton';
import { GoToTopButton } from './components/GoToTopButton';
import { simCards } from './data/simCards';
import type { CarrierType, CategoryType, SortType, ViewType, SimCard } from './types';
import './App.css';

// Seeded shuffle for consistent "random" order per session
function shuffleArray(arr: SimCard[], seed: number): SimCard[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefixQuery, setPrefixQuery] = useState('');
  const [suffixQuery, setSuffixQuery] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierType>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [sortType, setSortType] = useState<SortType>('random');
  const [viewType, setViewType] = useState<ViewType>('card');
  const [inquirySimCard, setInquirySimCard] = useState<SimCard | null>(null);
  const randomSeed = useRef(Date.now());

  const filteredAndSortedSimCards = useMemo(() => {
    const filtered = simCards.filter((sim) => {
      const digitsOnly = sim.number.replace(/\D/g, '');

      // Filter by search query (contains)
      if (searchQuery) {
        const searchDigits = searchQuery.replace(/\D/g, '');
        if (searchDigits && !digitsOnly.includes(searchDigits)) {
          return false;
        }
        if (!searchDigits && !sim.number.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Filter by prefix (starts with)
      if (prefixQuery) {
        const prefixDigits = prefixQuery.replace(/\D/g, '');
        if (prefixDigits && !digitsOnly.startsWith(prefixDigits)) {
          return false;
        }
      }

      // Filter by suffix (ends with)
      if (suffixQuery) {
        const suffixDigits = suffixQuery.replace(/\D/g, '');
        if (suffixDigits && !digitsOnly.endsWith(suffixDigits)) {
          return false;
        }
      }

      // Filter by carrier
      if (selectedCarrier !== 'All' && sim.carrier !== selectedCarrier) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'All' && sim.category !== selectedCategory) {
        return false;
      }

      // Filter by price range
      if (sim.price < priceRange[0] || sim.price > priceRange[1]) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sortType) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'newest':
        // Higher ID = newer (simulating creation order)
        return [...filtered].sort((a, b) => Number(b.id) - Number(a.id));
      case 'oldest':
        return [...filtered].sort((a, b) => Number(a.id) - Number(b.id));
      case 'random':
      default:
        return shuffleArray(filtered, randomSeed.current);
    }
  }, [searchQuery, prefixQuery, suffixQuery, selectedCarrier, selectedCategory, priceRange, sortType]);

  return (
    <div className="app">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="main-content">
        <div className="container">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            prefixQuery={prefixQuery}
            onPrefixChange={setPrefixQuery}
            suffixQuery={suffixQuery}
            onSuffixChange={setSuffixQuery}
            selectedCarrier={selectedCarrier}
            onCarrierChange={setSelectedCarrier}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
          <SortBar
            sortType={sortType}
            onSortChange={setSortType}
            resultCount={filteredAndSortedSimCards.length}
            viewType={viewType}
            onViewChange={setViewType}
          />
          <SimCardList
            simCards={filteredAndSortedSimCards}
            viewType={viewType}
            onInquiry={(sim) => setInquirySimCard(sim)}
          />
        </div>
      </main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {inquirySimCard && (
        <InquiryModal
          simCard={inquirySimCard}
          onClose={() => setInquirySimCard(null)}
        />
      )}

      {/* Zalo floating button */}
      <ZaloButton />
      <GoToTopButton />

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>SIM Số Đẹp Vietnam</h3>
            <p>Chuyên cung cấp SIM số đẹp các mạng Viettel, Mobifone, Vinaphone.</p>
            <p>Chỉ hiển thị và tư vấn — không mua bán trực tuyến.</p>
          </div>
          <div className="footer-contact">
            <h4>Liên hệ tư vấn</h4>
            <p>Hotline: <a href="tel:0901234567">0901 234 567</a></p>
            <p>Zalo: <a href="https://zalo.me/0901234567" target="_blank" rel="noopener noreferrer">0901 234 567</a></p>
            <p>Email: <a href="mailto:contact@simvietnam.vn">contact@simvietnam.vn</a></p>
            <p>Thời gian làm việc: 8:00 – 21:00 (T2 – CN)</p>
          </div>
          <div className="footer-address">
            <h4>Địa chỉ</h4>
            <p>123 Đường ABC, Quận 1</p>
            <p>TP. Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 SIM Số Đẹp Vietnam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
