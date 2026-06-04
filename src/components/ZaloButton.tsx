import zaloIcon from '../assets/Zalo.svg';

const ZALO_PHONE = '0901234567'; // Placeholder — replace with your real number

export function ZaloButton() {
  const zaloUrl = `https://zalo.me/${ZALO_PHONE}`;

  return (
    <a
      href={zaloUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="zalo-fab"
      aria-label="Chat với chúng tôi qua Zalo"
      title="Chat Zalo"
    >
      <img src={zaloIcon} alt="Zalo" className="zalo-icon" />
    </a>
  );
}
