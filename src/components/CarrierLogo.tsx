import viettelLogo from '../assets/Viettel_logo_2021.svg';
import mobifoneLogo from '../assets/MobiFone_logo.svg';
import vinaphoneLogo from '../assets/Logo_Vinaphone.svg';

interface CarrierLogoProps {
  carrier: string;
  className?: string;
}

const logoMap: Record<string, string> = {
  Viettel: viettelLogo,
  Mobifone: mobifoneLogo,
  Vinaphone: vinaphoneLogo,
};

export function CarrierLogo({ carrier, className = '' }: CarrierLogoProps) {
  const src = logoMap[carrier];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={`${carrier} logo`}
      className={`carrier-logo ${className}`.trim()}
    />
  );
}
