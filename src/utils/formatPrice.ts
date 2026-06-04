export function formatPrice(price: number): string {
  const thousands = price / 1000;
  return `${new Intl.NumberFormat('vi-VN').format(thousands)}K`;
}

export function formatPhoneDisplay(number: string): string {
  return number;
}
