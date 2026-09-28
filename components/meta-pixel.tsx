import Script from "next/script";

function pixelId(): string {
  const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
  return /^[A-Za-z0-9_]+$/.test(raw) ? raw : "";
}

export function MetaPixel({
  purchase,
}: {
  purchase?: { value: number; currency: string };
}) {
  const id = pixelId();
  if (!id) return null;

  const purchaseLine =
    purchase && Number.isFinite(purchase.value)
      ? `fbq('track', 'Purchase', {value: ${purchase.value}, currency: '${/^[A-Z]{3}$/.test(purchase.currency) ? purchase.currency : "USD"}'});`
      : "";

  return (
    <Script id={purchase ? "meta-pixel-purchase" : "meta-pixel"} strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${id}');
fbq('track', 'PageView');
${purchaseLine}`}
    </Script>
  );
}
