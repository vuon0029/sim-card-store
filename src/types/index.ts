export interface SimCard {
  id: string;
  number: string; // Full number with +84 prefix
  carrier: string;
  category: string;
  price: number; // Price in VND
  description?: string;
}

export interface CartItem {
  simCard: SimCard;
  addedAt: Date;
}

export interface InquiryForm {
  name: string;
  phone: string;
  email: string;
  message?: string;
}

export type CarrierType = 'Viettel' | 'Mobifone' | 'Vinaphone' | 'Vietnamobile' | 'All';

export type CategoryType = 'Phong Thủy' | 'Lộc Phát' | 'Thần Tài' | 'Số Đẹp' | 'Giá Rẻ' | 'All';
