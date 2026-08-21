export interface TvBrand {
  id: string
  logo: string
  alt: string
  status: 'available' | 'in-development' | 'planned'
}

const tvBrands: TvBrand[] = [
  { id: 'lg', logo: '/brand/lg-logo.svg', alt: 'LG Smart TV', status: 'available' },
  { id: 'androidTv', logo: '/brand/android-tv-logo.svg', alt: 'Android TV', status: 'available' },
  { id: 'samsung', logo: '/brand/samsung-logo.svg', alt: 'Samsung Smart TV', status: 'available' },
  { id: 'appleTv', logo: '/brand/apple-tv-logo.svg', alt: 'Apple TV', status: 'planned' },
  { id: 'roku', logo: '/brand/roku-logo.svg', alt: 'Roku TV', status: 'planned' },
  { id: 'chromecast', logo: '/brand/chromecast-logo.svg', alt: 'Chromecast', status: 'planned' },
]

export function useTvBrands(): TvBrand[] {
  return tvBrands
}
