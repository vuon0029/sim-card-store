import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '../firebase/config';
import { formatPrice } from '../utils/formatPrice';
import './admin.css';

interface InquiryDoc {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  simCard: {
    number: string;
    carrier: string;
    price: number;
  };
  submittedAt: string;
  emailSent?: boolean;
}

interface AnalyticsData {
  totalInquiries: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  topSimNumbers: { number: string; carrier: string; price: number; count: number }[];
  carrierBreakdown: { carrier: string; count: number }[];
  recentInquiries: InquiryDoc[];
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const db = getFirestoreDb();
        const colRef = collection(db, 'inquiries');
        const snapshot = await getDocs(query(colRef, orderBy('submittedAt', 'desc')));

        const inquiries: InquiryDoc[] = snapshot.docs.map((doc) => doc.data() as InquiryDoc);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const todayCount = inquiries.filter((i) => i.submittedAt >= todayStart).length;
        const weekCount = inquiries.filter((i) => i.submittedAt >= weekStart).length;
        const monthCount = inquiries.filter((i) => i.submittedAt >= monthStart).length;

        // Top SIM numbers
        const simCountMap = new Map<string, { number: string; carrier: string; price: number; count: number }>();
        for (const inq of inquiries) {
          const key = inq.simCard.number;
          const existing = simCountMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            simCountMap.set(key, { ...inq.simCard, count: 1 });
          }
        }
        const topSimNumbers = [...simCountMap.values()]
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Carrier breakdown
        const carrierMap = new Map<string, number>();
        for (const inq of inquiries) {
          const c = inq.simCard.carrier;
          carrierMap.set(c, (carrierMap.get(c) || 0) + 1);
        }
        const carrierBreakdown = [...carrierMap.entries()]
          .map(([carrier, count]) => ({ carrier, count }))
          .sort((a, b) => b.count - a.count);

        setData({
          totalInquiries: inquiries.length,
          todayCount,
          weekCount,
          monthCount,
          topSimNumbers,
          carrierBreakdown,
          recentInquiries: inquiries.slice(0, 20),
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="admin-table-loading">Đang tải thống kê...</div>;
  }

  if (!data) {
    return <div className="admin-table-error"><p>Không thể tải dữ liệu thống kê.</p></div>;
  }

  return (
    <div className="analytics-page">
      <h2 className="analytics-page__title">Thống Kê</h2>

      {/* Summary cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <span className="analytics-card__value">{data.totalInquiries}</span>
          <span className="analytics-card__label">Tổng yêu cầu</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card__value">{data.todayCount}</span>
          <span className="analytics-card__label">Hôm nay</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card__value">{data.weekCount}</span>
          <span className="analytics-card__label">7 ngày qua</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-card__value">{data.monthCount}</span>
          <span className="analytics-card__label">Tháng này</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top SIM numbers */}
        <div className="analytics-section">
          <h3>Số được quan tâm nhiều nhất</h3>
          {data.topSimNumbers.length === 0 ? (
            <p className="analytics-empty">Chưa có dữ liệu</p>
          ) : (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Số</th>
                  <th>Nhà mạng</th>
                  <th>Giá</th>
                  <th>Lượt hỏi</th>
                </tr>
              </thead>
              <tbody>
                {data.topSimNumbers.map((sim, i) => (
                  <tr key={sim.number}>
                    <td>{i + 1}</td>
                    <td className="analytics-table__number">{sim.number}</td>
                    <td>{sim.carrier}</td>
                    <td>{formatPrice(sim.price)}</td>
                    <td className="analytics-table__count">{sim.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Carrier breakdown */}
        <div className="analytics-section">
          <h3>Yêu cầu theo nhà mạng</h3>
          {data.carrierBreakdown.length === 0 ? (
            <p className="analytics-empty">Chưa có dữ liệu</p>
          ) : (
            <div className="analytics-bars">
              {data.carrierBreakdown.map((item) => {
                const percentage = data.totalInquiries > 0
                  ? Math.round((item.count / data.totalInquiries) * 100)
                  : 0;
                return (
                  <div key={item.carrier} className="analytics-bar">
                    <div className="analytics-bar__label">
                      <span>{item.carrier}</span>
                      <span>{item.count} ({percentage}%)</span>
                    </div>
                    <div className="analytics-bar__track">
                      <div
                        className={`analytics-bar__fill analytics-bar__fill--${item.carrier.toLowerCase()}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent inquiries */}
      <div className="analytics-section analytics-section--full">
        <h3>Yêu cầu gần đây</h3>
        {data.recentInquiries.length === 0 ? (
          <p className="analytics-empty">Chưa có yêu cầu nào</p>
        ) : (
          <div className="analytics-table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Số SIM</th>
                  <th>Nhà mạng</th>
                  <th>Giá</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInquiries.map((inq, i) => (
                  <tr key={i}>
                    <td>{inq.customer.name}</td>
                    <td>{inq.customer.phone}</td>
                    <td className="analytics-table__number">{inq.simCard.number}</td>
                    <td>{inq.simCard.carrier}</td>
                    <td>{formatPrice(inq.simCard.price)}</td>
                    <td>{new Date(inq.submittedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Link to full Firebase Analytics */}
      <div className="analytics-footer">
        <a
          href="https://console.firebase.google.com/project/simdenhat-vn/analytics"
          target="_blank"
          rel="noopener noreferrer"
          className="analytics-footer__link"
        >
          Xem thống kê chi tiết trên Firebase Console ↗
        </a>
      </div>
    </div>
  );
}
