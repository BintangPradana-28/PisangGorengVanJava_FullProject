// data/types.ts
// Strict TypeScript interfaces for Pisang Goreng Van Java

export interface MenuVariant {
  id: string
  flavorName: string
  prices: {
    kembung: number
    lumpia:  number
    krispy:  number
  }
  imageUrl?:    string | null
  description?: string | null
  isActive:     boolean
  isAvailable:  boolean
  sortOrder:    number
  createdAt?:   string
  updatedAt?:   string
}

export interface Topping {
  id:       string
  name:     string
  price:    number // Fixed at 2000
  emoji?:   string | null
  isActive: boolean
}

export type BaseType = 'kembung' | 'lumpia' | 'krispy'

export interface BaseTypeInfo {
  key:      BaseType
  label:    string
  subtitle: string // e.g. "Isi 15"
}

export const BASE_TYPES: BaseTypeInfo[] = [
  { key: 'kembung', label: 'Kembung', subtitle: 'Isi 15' },
  { key: 'lumpia',  label: 'Lumpia',  subtitle: 'Isi 6'  },
  { key: 'krispy',  label: 'Krispy',  subtitle: 'Isi 5'  },
]

export interface OrderSelection {
  variant:  MenuVariant | null
  baseType: BaseType | null
  topping:  Topping | null
  total:    number
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean
  data?:   T
  error?:  string
  message?: string
}

export interface PaginatedResponse<T> {
  items:   T[]
  total:   number
  page:    number
  perPage: number
}

// Admin session
export interface AdminSession {
  id:       string
  username: string
  name:     string
  isLoggedIn: boolean
}

// Form types for CRUD
export interface MenuVariantFormData {
  flavorName:   string
  priceKembung: number
  priceLumpia:  number
  priceKrispy:  number
  description?: string
  imageUrl?:    string
  isActive:     boolean
  isAvailable:  boolean
  sortOrder:    number
}
