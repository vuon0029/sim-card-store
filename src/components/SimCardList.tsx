import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimCard, ViewType } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { SimCardItem } from './SimCardItem';
import { CarrierLogo } from './CarrierLogo';

const LIST_PAGE_SIZE = 12;
const CARD_BATCH_SIZE = 12;

interface SimCardListProps {
  simCards: SimCard[];
  viewType: ViewType;
  onInquiry: (simCard: SimCard) => void;
}

function CompactListItem({ simCard, onInquiry }: { simCard: SimCard; onInquiry: (simCard: SimCard) => void }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(simCard.id);

  const handleToggleCart = () => {
    if (inCart) {
      removeFromCart(simCard.id);
    } else {
      addToCart(simCard);
    }
  };

  return (
    <div className={`compact-item ${inCart ? 'in-cart' : ''}`}>
      <div className="compact-item-left">
        <CarrierLogo carrier={simCard.carrier} className="compact-item-logo" />
        <span className="compact-item-number">{simCard.number}</span>
      </div>
      <div className="compact-item-right">
        <span className="compact-item-price">{formatPrice(simCard.price)}</span>
        <div className="compact-item-actions">
          <button
            className={`compact-cart-btn ${inCart ? 'remove' : ''}`}
            onClick={handleToggleCart}
            aria-label={inCart ? `Xóa ${simCard.number} khỏi giỏ` : `Thêm ${simCard.number} vào giỏ`}
          >
            {inCart ? 'Đã thêm' : 'Thêm'}
          </button>
          <button
            className="compact-inquiry-btn"
            onClick={() => onInquiry(simCard)}
            aria-label={`Tư vấn ngay số ${simCard.number}`}
          >
            Tư vấn
          </button>
        </div>
      </div>
    </div>
  );
}

function PaginatedList({ simCards, onInquiry }: { simCards: SimCard[]; onInquiry: (simCard: SimCard) => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(simCards.length / LIST_PAGE_SIZE);
  const start = (currentPage - 1) * LIST_PAGE_SIZE;
  const pageItems = simCards.slice(start, start + LIST_PAGE_SIZE);

  // Reset page when simCards changes (e.g. filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [simCards.length]);

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(clamped);
    setPageInput('');
    if (listRef.current) {
      const top = listRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInput, 10);
    if (!isNaN(num)) {
      goToPage(num);
    }
  };

  return (
    <>
      <div className="compact-list" ref={listRef}>
        {pageItems.map((simCard) => (
          <CompactListItem key={simCard.id} simCard={simCard} onInquiry={onInquiry} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>
          <span className="pagination-info">
            Trang {currentPage} / {totalPages}
          </span>
          {totalPages > 5 && (
            <form className="pagination-jump" onSubmit={handlePageInputSubmit}>
              <input
                type="number"
                className="pagination-input"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Trang..."
                aria-label="Nhập số trang"
              />
              <button type="submit" className="pagination-btn pagination-go-btn">
                Đi
              </button>
            </form>
          )}
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
}

function InfiniteCardGrid({ simCards, onInquiry }: { simCards: SimCard[]; onInquiry: (simCard: SimCard) => void }) {
  const [visibleCount, setVisibleCount] = useState(CARD_BATCH_SIZE);
  const [loadFailed, setLoadFailed] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const prevSimCardsRef = useRef(simCards);

  // Reset visible count when the actual simCards array changes
  useEffect(() => {
    if (prevSimCardsRef.current !== simCards) {
      setVisibleCount(CARD_BATCH_SIZE);
      setLoadFailed(false);
      prevSimCardsRef.current = simCards;
    }
  }, [simCards]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + CARD_BATCH_SIZE;
      return Math.min(next, simCards.length);
    });
  }, [simCards.length]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || loadFailed) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const prevCount = visibleCount;
          loadMore();
          // If after a short delay the count hasn't changed, mark as failed
          timeoutId = setTimeout(() => {
            setVisibleCount((current) => {
              if (current === prevCount && current < simCards.length) {
                setLoadFailed(true);
              }
              return current;
            });
          }, 3000);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loader);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [loadMore, loadFailed, visibleCount, simCards.length]);

  const visibleCards = simCards.slice(0, visibleCount);
  const hasMore = visibleCount < simCards.length;

  const handleRetry = () => {
    setLoadFailed(false);
    loadMore();
  };

  return (
    <>
      <div className="sim-card-grid">
        {visibleCards.map((simCard) => (
          <SimCardItem key={simCard.id} simCard={simCard} onInquiry={onInquiry} />
        ))}
      </div>
      {hasMore && !loadFailed && (
        <div ref={loaderRef} className="infinite-loader">
          <span className="loader-spinner"></span>
          <span>Đang tải thêm...</span>
        </div>
      )}
      {loadFailed && hasMore && (
        <div className="infinite-loader infinite-loader-failed">
          <span>Không tải được thêm.</span>
          <button className="pagination-btn" onClick={handleRetry}>
            Thử lại
          </button>
        </div>
      )}
    </>
  );
}

export function SimCardList({ simCards, viewType, onInquiry }: SimCardListProps) {
  if (simCards.length === 0) {
    return (
      <div className="empty-state">
        <h3>Không tìm thấy số nào</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  if (viewType === 'list') {
    return (
      <div className="sim-card-list">
        <PaginatedList simCards={simCards} onInquiry={onInquiry} />
      </div>
    );
  }

  return (
    <div className="sim-card-list">
      <InfiniteCardGrid simCards={simCards} onInquiry={onInquiry} />
    </div>
  );
}
