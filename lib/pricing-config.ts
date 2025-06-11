// Custom pricing configuration
// Format: [provider_code]: { [product_code]: custom_price }
// Jika tidak ada custom price, akan menggunakan markup default

export interface CustomPricing {
  [providerCode: string]: {
    [productCode: string]: number
  }
}

export interface ProviderMarkup {
  [providerCode: string]: {
    markup: number // dalam decimal (0.15 = 15%)
    roundTo?: number // pembulatan (100 = ke ratusan terdekat)
  }
}

// Custom pricing untuk produk spesifik (diurutkan dari harga terendah ke tertinggi)
export const CUSTOM_PRICING: CustomPricing = {
  // Mobile Legends (diurutkan dari terendah ke tertinggi)
  "mobile-legends": {
    "ml-5-diamond": 2000,
    "ml-12-diamond": 4500,
    "ml-19-diamond": 6500,
    "ml-28-diamond": 9000,
    "ml-36-diamond": 11500,
    "ml-44-diamond": 14000,
    "ml-59-diamond": 18500,
    "ml-74-diamond": 23000,
    "ml-85-diamond": 26500,
    "ml-170-diamond": 52000,
    "ml-240-diamond": 72000,
    "ml-296-diamond": 88000,
    "ml-408-diamond": 120000,
    "ml-568-diamond": 165000,
    "ml-875-diamond": 250000,
    "ml-1159-diamond": 330000,
  },

  // Free Fire (diurutkan dari terendah ke tertinggi)
  "free-fire": {
    "ff-20-diamond": 3500,
    "ff-50-diamond": 8000,
    "ff-70-diamond": 11000,
    "ff-140-diamond": 21000,
    "ff-210-diamond": 31000,
    "ff-355-diamond": 52000,
    "ff-425-diamond": 62000,
    "ff-720-diamond": 104000,
    "ff-1450-diamond": 208000,
    "ff-2180-diamond": 312000,
  },

  // PUBG Mobile (diurutkan dari terendah ke tertinggi)
  "pubg-mobile": {
    "pubg-60-uc": 15000,
    "pubg-120-uc": 29000,
    "pubg-180-uc": 43000,
    "pubg-300-uc": 71000,
    "pubg-600-uc": 142000,
    "pubg-1500-uc": 355000,
    "pubg-3000-uc": 710000,
    "pubg-6000-uc": 1420000,
  },

  // Genshin Impact (diurutkan dari terendah ke tertinggi)
  "genshin-impact": {
    "gi-60-genesis": 15000,
    "gi-120-genesis": 29000,
    "gi-180-genesis": 43000,
    "gi-300-genesis": 71000,
    "gi-980-genesis": 230000,
    "gi-1980-genesis": 465000,
    "gi-3280-genesis": 770000,
    "gi-6480-genesis": 1540000,
  },

  // Honkai Star Rail (diurutkan dari terendah ke tertinggi)
  "honkai-star-rail": {
    "hsr-60-oneiric": 15000,
    "hsr-120-oneiric": 29000,
    "hsr-180-oneiric": 43000,
    "hsr-300-oneiric": 71000,
    "hsr-980-oneiric": 230000,
    "hsr-1980-oneiric": 465000,
    "hsr-3280-oneiric": 770000,
    "hsr-6480-oneiric": 1540000,
  },

  // Call of Duty Mobile (diurutkan dari terendah ke tertinggi)
  "cod-mobile": {
    "cod-80-cp": 15000,
    "cod-160-cp": 29000,
    "cod-240-cp": 43000,
    "cod-400-cp": 71000,
    "cod-800-cp": 142000,
    "cod-1600-cp": 284000,
    "cod-2400-cp": 426000,
    "cod-4000-cp": 710000,
  },

  // Arena of Valor (diurutkan dari terendah ke tertinggi)
  aov: {
    "aov-60-voucher": 15000,
    "aov-120-voucher": 29000,
    "aov-180-voucher": 43000,
    "aov-300-voucher": 71000,
    "aov-600-voucher": 142000,
    "aov-1200-voucher": 284000,
    "aov-1800-voucher": 426000,
    "aov-3000-voucher": 710000,
  },

  // Valorant (diurutkan dari terendah ke tertinggi)
  valorant: {
    "val-125-vp": 15000,
    "val-420-vp": 50000,
    "val-700-vp": 85000,
    "val-1375-vp": 165000,
    "val-2400-vp": 285000,
    "val-4000-vp": 475000,
    "val-8150-vp": 950000,
  },

  // Roblox (diurutkan dari terendah ke tertinggi)
  roblox: {
    "rbx-80-robux": 15000,
    "rbx-160-robux": 29000,
    "rbx-240-robux": 43000,
    "rbx-400-robux": 71000,
    "rbx-800-robux": 142000,
    "rbx-1700-robux": 300000,
    "rbx-4500-robux": 780000,
    "rbx-10000-robux": 1750000,
  },

  // Age of Empires Mobile Q2 (diurutkan dari terendah ke tertinggi)
  "age-of-empires-mobile-q2": {
    "aoe-apex-99-coin": 15013,
    "aoe-empire-400-coin": 15013,
    "aoe-apex-499-coin": 69274,
    "aoe-empire-2100-coin": 69274,
    "aoe-apex-999-coin": 141627,
    "aoe-empire-4400-coin": 141627,
    "aoe-apex-1999-coin": 286155,
    "aoe-empire-9200-coin": 286155,
    "aoe-apex-4999-coin": 723199,
    "aoe-empire-24000-coin": 723199,
    "aoe-empire-50000-coin": 1409542,
    "aoe-apex-9999-coin": 1409543,
  },
}

// PROVIDER_MARKUP tidak dipakai lagi - harga asli + 1 rupiah
// export const PROVIDER_MARKUP: ProviderMarkup = {
//   "mobile-legends": { markup: 0.2, roundTo: 500 },
//   "free-fire": { markup: 0.18, roundTo: 500 },
//   "pubg-mobile": { markup: 0.22, roundTo: 1000 },
//   "genshin-impact": { markup: 0.25, roundTo: 1000 },
//   "honkai-star-rail": { markup: 0.25, roundTo: 1000 },
//   "cod-mobile": { markup: 0.2, roundTo: 1000 },
//   aov: { markup: 0.18, roundTo: 500 },
//   valorant: { markup: 0.3, roundTo: 1000 },
//   roblox: { markup: 0.25, roundTo: 1000 },
//   "age-of-empires-mobile-q2": { markup: 0.2, roundTo: 1000 },
//   // Default untuk provider lain
//   default: { markup: 0.2, roundTo: 100 },
// }

// Fungsi untuk mendapatkan harga custom
export function getCustomPrice(providerCode: string, productCode: string, originalPrice: number): number {
  // Cek apakah ada custom pricing untuk produk ini
  const providerPricing = CUSTOM_PRICING[providerCode]
  if (providerPricing && providerPricing[productCode]) {
    return providerPricing[productCode]
  }

  // Jika tidak ada custom pricing, hanya tambah 1 rupiah dari harga asli
  return originalPrice + 1
}

// Fungsi untuk mendapatkan semua custom pricing (untuk admin)
export function getAllCustomPricing(): CustomPricing {
  return CUSTOM_PRICING
}

// Fungsi untuk update custom pricing (untuk admin)
export function updateCustomPrice(providerCode: string, productCode: string, newPrice: number): void {
  if (!CUSTOM_PRICING[providerCode]) {
    CUSTOM_PRICING[providerCode] = {}
  }
  CUSTOM_PRICING[providerCode][productCode] = newPrice
}
