import type { SimCard } from '../types';
import { SimCardItem } from './SimCardItem';

interface SimCardListProps {
  simCards: SimCard[];
}

export function SimCardList({ simCards }: SimCardListProps) {
  if (simCards.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🔍</span>
        <h3>Không tìm thấy số nào</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="sim-card-list">
      <div className="sim-card-grid">
        {simCards.map((simCard) => (
          <SimCardItem key={simCard.id} simCard={simCard} />
        ))}
      </div>
    </div>
  );
}
