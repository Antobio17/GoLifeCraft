export const MOBILE = { width: 390, height: 844 } as const;

export const TABLET = { width: 834, height: 1112 } as const;

export const DESKTOP = { width: 1440, height: 900 } as const;

export const RESPONSIVE_MATRIX = [
  { name: "mobile", viewport: MOBILE },
  { name: "tablet", viewport: TABLET },
  { name: "desktop", viewport: DESKTOP },
] as const;
