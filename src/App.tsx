import { useState, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { SimCardList } from './components/SimCardList';
import { Cart } from './components/Cart';
import { simCards } from './data/simCards';
import type { CarrierType, CategoryType } from './types';
import './App.css';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierType>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');

  const filteredSimCards = useMemo(() => {
    return simCards.filter((sim) => {
      // Filter by search query (match against number digits)
      if (searchQuery) {
        const digitsOnly = sim.number.replace(/\D/g, '');
        const searchDigits = searchQuery.replace(/\D/g, '');
        if (searchDigits && !digitsOnly.includes(searchDigits)) {
          return false;
        }
        // Also allow matching the formatted number
        if (!searchDigits && !sim.number.toLowerCase().includes(searchQuery.toLowerCase())) {
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

      return true;
    });
  }, [searchQuery, selectedCarrier, selectedCategory]);

  return (
    <div className="app">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="main-content">
        <div className="container">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCarrier={selectedCarrier}
            onCarrierChange={setSelectedCarrier}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <SimCardList simCards={filteredSimCards} />
        </div>
      </main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <footer className="footer">
        <p>© 2024 SIM Số Đẹp Vietnam. Chỉ hiển thị và tư vấn — không mua bán trực tuyến.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
