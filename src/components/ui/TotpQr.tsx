import { useEffect, useState } from 'react';

/** Renders an authenticator QR as a data URL so CSP does not need a third-party image host. */
export function TotpQr({ otpauthUrl, size = 180 }: { otpauthUrl: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import('qrcode').then((qr) =>
      qr.toDataURL(otpauthUrl, { margin: 1, width: size, color: { dark: '#1b194d', light: '#ffffff' } }),
    ).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [otpauthUrl, size]);
  if (!src) return <div className="size-40 rounded-xl bg-surface-2" aria-hidden />;
  return <img src={src} alt="" className="size-40 rounded-xl bg-white p-2" />;
}
