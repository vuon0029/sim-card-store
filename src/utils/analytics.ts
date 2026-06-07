import { logEvent } from 'firebase/analytics';
import { getFirebaseAnalytics } from '../firebase/config';

/**
 * Track a custom analytics event. Fails silently if analytics is unavailable.
 */
async function trackEvent(eventName: string, params?: Record<string, string | number>) {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

/** Tracks when a customer opens the inquiry modal for a specific SIM */
export function trackInquiryOpened(simNumber: string, carrier: string, price: number) {
  trackEvent('inquiry_opened', { sim_number: simNumber, carrier, price });
}

/** Tracks when a customer submits an inquiry */
export function trackInquirySubmitted(simNumber: string, carrier: string) {
  trackEvent('inquiry_submitted', { sim_number: simNumber, carrier });
}

/** Tracks when a customer adds a SIM to cart */
export function trackAddToCart(simNumber: string, carrier: string, price: number) {
  trackEvent('add_to_cart', { sim_number: simNumber, carrier, price });
}

/** Tracks when a customer removes a SIM from cart */
export function trackRemoveFromCart(simNumber: string) {
  trackEvent('remove_from_cart', { sim_number: simNumber });
}

/** Tracks when a filter is applied */
export function trackFilterUsed(filterType: string, filterValue: string) {
  trackEvent('filter_used', { filter_type: filterType, filter_value: filterValue });
}

/** Tracks when a search is performed */
export function trackSearch(query: string, resultCount: number) {
  trackEvent('search_performed', { query, result_count: resultCount });
}
