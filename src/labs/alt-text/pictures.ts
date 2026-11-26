/**
 * Small drawn pictures for the 1.1.1 lab and live examples (#48): a product photo, a sales chart
 * and a decorative divider, as SVG data URIs, so a real `<img>` has something to show without a
 * file to fetch. They depict another product's images; their colours are the picture's own.
 */

const uri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** A rust wool overshirt, worn open, on a pale backdrop. */
export const PHOTO = uri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">' +
    '<rect width="160" height="120" fill="#efe6dc"/>' +
    '<path d="M58 22 L72 16 Q80 24 88 16 L102 22 L124 40 L114 54 L104 46 L104 108 L56 108 L56 46 L46 54 L36 40 Z" fill="#a4482a"/>' +
    '<path d="M72 16 Q80 24 88 16 L84 108 L76 108 Z" fill="#3b2a22"/>' +
    '<path d="M76 30 L80 108 M84 30 L80 108" stroke="#7d3520" stroke-width="2"/>' +
    '</svg>',
);

/** Quarterly sales: three bars rising, the fourth level with the third. */
export const CHART = uri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">' +
    '<rect width="160" height="120" fill="#f4f6f8"/>' +
    '<path d="M20 104 H146 M20 14 V104" stroke="#58606a" stroke-width="2"/>' +
    '<rect x="30" y="70" width="20" height="34" fill="#2f6f9f"/>' +
    '<rect x="60" y="56" width="20" height="48" fill="#2f6f9f"/>' +
    '<rect x="90" y="30" width="20" height="74" fill="#2f6f9f"/>' +
    '<rect x="120" y="30" width="20" height="74" fill="#2f6f9f"/>' +
    '</svg>',
);

/** A gold swirl, the kind of flourish that separates two sections of a page. */
export const DIVIDER = uri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">' +
    '<path d="M10 60 H58 M102 60 H150" stroke="#b08a2e" stroke-width="3"/>' +
    '<path d="M58 60 C58 40 80 40 80 60 C80 80 102 80 102 60 M80 60 C80 46 92 46 92 56" fill="none" stroke="#b08a2e" stroke-width="3"/>' +
    '</svg>',
);
