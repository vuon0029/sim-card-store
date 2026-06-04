import { renderToString } from 'react-dom/server';
import App from './App';

export async function prerender() {
  const html = renderToString(<App />);

  return {
    html,
    head: {
      lang: 'vi',
      title: 'SIM Số Đẹp Vietnam (+84) | Viettel, Mobifone, Vinaphone — Tư Vấn Miễn Phí',
      elements: new Set([
        {
          type: 'meta',
          props: {
            name: 'description',
            content: 'Kho SIM số đẹp Viettel, Mobifone, Vinaphone. Số phong thủy, lộc phát, thần tài. Xem số đẹp, lọc theo nhà mạng và giá. Tư vấn miễn phí qua Zalo.',
          },
        },
        {
          type: 'meta',
          props: {
            property: 'og:title',
            content: 'SIM Số Đẹp Vietnam — Viettel, Mobifone, Vinaphone',
          },
        },
        {
          type: 'meta',
          props: {
            property: 'og:description',
            content: 'Kho SIM số đẹp phong thủy, lộc phát, thần tài. Xem và tư vấn miễn phí. Liên hệ qua Zalo.',
          },
        },
      ]),
    },
  };
}
