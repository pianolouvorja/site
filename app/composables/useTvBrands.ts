export interface TvBrand {
  id: string
  logo: string
  alt: string
}

const tvBrands: TvBrand[] = [
  { id: 'lg', logo: '/brand/lg-logo.svg', alt: 'LG Smart TV' },
  { id: 'appleTv', logo: '/brand/apple-tv-logo.svg', alt: 'Apple TV' },
  { id: 'samsung', logo: '/brand/samsung-logo.svg', alt: 'Samsung Smart TV' },
  { id: 'roku', logo: '/brand/roku-logo.svg', alt: 'Roku TV' },
  { id: 'androidTv', logo: '/brand/android-tv-logo.svg', alt: 'Android TV' },
  { id: 'chromecast', logo: '/brand/chromecast-logo.svg', alt: 'Chromecast' },
]

export function useTvBrands(): TvBrand[] {
  return tvBrands
}
