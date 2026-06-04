import type { SimCard } from '../types';

export const simCards: SimCard[] = [
  // Viettel numbers
  { id: '1', number: '0986 888 666', carrier: 'Viettel', category: 'Lộc Phát', price: 50000000, description: 'Số phát lộc, đại cát' },
  { id: '2', number: '0961 234 567', carrier: 'Viettel', category: 'Số Đẹp', price: 15000000, description: 'Số tiến đều đẹp' },
  { id: '3', number: '0979 68 68 68', carrier: 'Viettel', category: 'Lộc Phát', price: 80000000, description: 'Lộc phát lộc phát' },
  { id: '4', number: '0932 111 888', carrier: 'Viettel', category: 'Phong Thủy', price: 25000000, description: 'Nhất phát nhất' },
  { id: '5', number: '0965 39 39 39', carrier: 'Viettel', category: 'Thần Tài', price: 120000000, description: 'Thần tài gõ cửa' },
  { id: '6', number: '0988 456 789', carrier: 'Viettel', category: 'Số Đẹp', price: 12000000, description: 'Số tiến liên tục' },
  { id: '7', number: '0971 666 999', carrier: 'Viettel', category: 'Lộc Phát', price: 45000000, description: 'Thuận lộc thuận phát' },
  { id: '8', number: '0945 78 78 78', carrier: 'Viettel', category: 'Phong Thủy', price: 35000000, description: 'Thất phát liên hoàn' },
  { id: '9', number: '0912 345 678', carrier: 'Viettel', category: 'Số Đẹp', price: 20000000, description: 'Dãy số tiến hoàn hảo' },
  { id: '10', number: '0978 999 888', carrier: 'Viettel', category: 'Giá Rẻ', price: 5000000, description: 'Số cửu phát' },
  { id: '33', number: '0966 88 88 88', carrier: 'Viettel', category: 'Lộc Phát', price: 250000000, description: 'Ngũ bát đại phát' },
  { id: '34', number: '0983 39 39 39', carrier: 'Viettel', category: 'Thần Tài', price: 100000000, description: 'Tam cửu thần tài' },
  { id: '35', number: '0947 666 888', carrier: 'Viettel', category: 'Phong Thủy', price: 32000000, description: 'Lộc phát đại cát' },
  { id: '36', number: '0915 678 910', carrier: 'Viettel', category: 'Giá Rẻ', price: 3500000, description: 'Số tiến tự nhiên' },

  // Mobifone numbers
  { id: '11', number: '0909 888 999', carrier: 'Mobifone', category: 'Lộc Phát', price: 65000000, description: 'Phát cửu phát' },
  { id: '12', number: '0933 66 66 66', carrier: 'Mobifone', category: 'Lộc Phát', price: 200000000, description: 'Lục lộc đại phát' },
  { id: '13', number: '0908 39 39 39', carrier: 'Mobifone', category: 'Thần Tài', price: 95000000, description: 'Thần tài đắc lộc' },
  { id: '14', number: '0937 111 222', carrier: 'Mobifone', category: 'Số Đẹp', price: 8000000, description: 'Số đôi đẹp' },
  { id: '15', number: '0905 68 68 68', carrier: 'Mobifone', category: 'Lộc Phát', price: 150000000, description: 'Lộc phát vô tận' },
  { id: '16', number: '0918 777 888', carrier: 'Mobifone', category: 'Phong Thủy', price: 30000000, description: 'Thất tiến bát phát' },
  { id: '17', number: '0902 456 456', carrier: 'Mobifone', category: 'Giá Rẻ', price: 3000000, description: 'Số lặp đẹp' },
  { id: '18', number: '0939 86 86 86', carrier: 'Mobifone', category: 'Phong Thủy', price: 75000000, description: 'Phát lộc phát lộc' },
  { id: '37', number: '0906 99 99 99', carrier: 'Mobifone', category: 'Thần Tài', price: 180000000, description: 'Ngũ cửu thần tài' },
  { id: '38', number: '0931 234 567', carrier: 'Mobifone', category: 'Số Đẹp', price: 11000000, description: 'Tiến đều từ 1' },

  // Vinaphone numbers
  { id: '19', number: '0888 999 666', carrier: 'Vinaphone', category: 'Lộc Phát', price: 55000000, description: 'Tam cửu lục lộc' },
  { id: '20', number: '0815 39 39 39', carrier: 'Vinaphone', category: 'Thần Tài', price: 85000000, description: 'Thần tài phù hộ' },
  { id: '21', number: '0886 68 68 68', carrier: 'Vinaphone', category: 'Lộc Phát', price: 110000000, description: 'Lộc phát tam kỳ' },
  { id: '22', number: '0859 123 456', carrier: 'Vinaphone', category: 'Số Đẹp', price: 10000000, description: 'Số tiến 1-6' },
  { id: '23', number: '0891 888 000', carrier: 'Vinaphone', category: 'Giá Rẻ', price: 4000000, description: 'Tam phát' },
  { id: '24', number: '0833 777 999', carrier: 'Vinaphone', category: 'Phong Thủy', price: 40000000, description: 'Thất cửu đại cát' },
  { id: '25', number: '0862 66 88 99', carrier: 'Vinaphone', category: 'Phong Thủy', price: 28000000, description: 'Lộc phát cửu' },
  { id: '39', number: '0856 88 88 88', carrier: 'Vinaphone', category: 'Lộc Phát', price: 160000000, description: 'Ngũ bát vinh phát' },
  { id: '40', number: '0843 567 890', carrier: 'Vinaphone', category: 'Giá Rẻ', price: 2800000, description: 'Số tiến cuối' },
];
