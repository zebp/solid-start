export const VALID_LOADERS = [
  'default',
  'imgix',
  'cloudinary',
  'akamai',
  'custom',
] as const
export type LoaderValue = typeof VALID_LOADERS[number]
export type RemotePattern = {
  /**
   * Must be `http` or `https`.
   */
  protocol?: 'http' | 'https'

  /**
   * Can be literal or wildcard.
   * Single `*` matches a single subdomain.
   * Double `**` matches any number of subdomains.
   */
  hostname: string

  /**
   * Can be literal port such as `8080` or empty string
   * meaning no port.
   */
  port?: string

  /**
   * Can be literal or wildcard.
   * Single `*` matches a single path segment.
   * Double `**` matches any number of path segments.
   */
  pathname?: string
}
type ImageFormat = 'image/avif' | 'image/webp'

/**
 * Image configurations
 *
 * @see [Image configuration options](https://nextjs.org/docs/api-reference/next/image#configuration-options)
 */
export type ImageConfigComplete = {
  deviceSizes: number[]
  imageSizes: number[]
  loader: LoaderValue
  path: string
  domains: string[]
  disableStaticImages: boolean
  minimumCacheTTL: number
  formats: ImageFormat[]
  dangerouslyAllowSVG: boolean
  contentSecurityPolicy: string
  remotePatterns: RemotePattern[]
  unoptimized: boolean
}
export type ImageConfig = Partial<ImageConfigComplete>
export const imageConfigDefault: ImageConfigComplete = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: '/_next/image',
  loader: 'default',
  domains: [],
  disableStaticImages: false,
  minimumCacheTTL: 60,
  formats: ['image/webp'],
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: `script-src 'none'; frame-src 'none'; sandbox;`,
  remotePatterns: [],
  unoptimized: false,
}