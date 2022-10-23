import { Accessor, JSX } from "solid-js";
import { VALID_LOADING_VALUES } from "./utils";

type SafeNumber = number | `${number}`

export type ImgElementWithDataProp = HTMLImageElement & {
  "data-loaded-src": string | undefined;
};

export const VALID_LOADERS = ["default", "imgix", "cloudinary", "akamai", "custom"] as const;
export type LoaderValue = typeof VALID_LOADERS[number];
export type RemotePattern = {
  /**
   * Must be `http` or `https`.
   */
  protocol?: "http" | "https";

  /**
   * Can be literal or wildcard.
   * Single `*` matches a single subdomain.
   * Double `**` matches any number of subdomains.
   */
  hostname: string;

  /**
   * Can be literal port such as `8080` or empty string
   * meaning no port.
   */
  port?: string;

  /**
   * Can be literal or wildcard.
   * Single `*` matches a single path segment.
   * Double `**` matches any number of path segments.
   */
  pathname?: string;
};
type ImageFormat = "image/avif" | "image/webp";
/**
 * Image configurations
 *
 * @see [Image configuration options](https://nextjs.org/docs/api-reference/next/image#configuration-options)
 */
export type ImageConfigComplete = {
  
  /** @see [Device sizes documentation](https://nextjs.org/docs/api-reference/next/image#device-sizes) */
  deviceSizes: number[];

  /** @see [Image sizing documentation](https://nextjs.org/docs/basic-features/image-optimization#image-sizing) */
  imageSizes: number[];

  /** @see [Image loaders configuration](https://nextjs.org/docs/basic-features/image-optimization#loaders) */
  loader: LoaderValue;

  /** @see [Image loader configuration](https://nextjs.org/docs/api-reference/next/image#loader-configuration) */
  path: string;

  /**
   * @see [Image domains configuration](https://nextjs.org/docs/api-reference/next/image#domains)
   */
  domains: string[];

  /** @see [Disable static image import configuration](https://nextjs.org/docs/api-reference/next/image#disable-static-imports) */
  disableStaticImages: boolean;

  /** @see [Cache behavior](https://nextjs.org/docs/api-reference/next/image#caching-behavior) */
  minimumCacheTTL: number;

  /** @see [Acceptable formats](https://nextjs.org/docs/api-reference/next/image#acceptable-formats) */
  formats: ImageFormat[];

  /** @see [Dangerously Allow SVG](https://nextjs.org/docs/api-reference/next/image#dangerously-allow-svg) */
  dangerouslyAllowSVG: boolean;

  /** @see [Content Security Policy](https://nextjs.org/docs/api-reference/next/image#dangerously-allow-svg) */
  contentSecurityPolicy: string;

  /** @see [Remote Patterns](https://nextjs.org/docs/api-reference/next/image#remote-patterns) */
  remotePatterns: RemotePattern[];

  /** @see [Unoptimized](https://nextjs.org/docs/api-reference/next/image#unoptimized) */
  unoptimized: boolean;

  imageLoader?: ImageLoader;
};
export type ImageConfig = Partial<ImageConfigComplete & { allSizes: number[] }>;
export type LoadingValue = typeof VALID_LOADING_VALUES[number];
export type PlaceholderValue = "blur" | "empty";
export type OnLoad = (img: Event & { nativeEvent: Event }) => void;
export type OnLoadingComplete = (img: HTMLImageElement) => void;
export type ImgElementStyle = NonNullable<JSX.IntrinsicElements["img"]["style"]>;
export type GenImgAttrsData = {
  config: ImageConfig;
  src: string;
  unoptimized: boolean;
  loader: ImageLoaderWithConfig;
  width?: number;
  quality?: number;
  sizes?: string;
};
export type GenImgAttrsResult = {
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
};
export interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}
export interface StaticRequire {
  default: StaticImageData;
}
export type StaticImport = StaticRequire | StaticImageData;
export type ImageProps = Omit<
  JSX.IntrinsicElements["img"],
  "src" | "srcSet" | "ref" | "alt" | "width" | "height" | "loading"
> & {
  /** @see [Device sizes documentation](https://nextjs.org/docs/api-reference/next/image#device-sizes) */
  deviceSizes?: number[];

  /** @see [Image sizing documentation](https://nextjs.org/docs/basic-features/image-optimization#image-sizing) */
  imageSizes?: number[];
  src: string | StaticImport | Accessor<string | StaticImport>;
  alt: string;
  width?: SafeNumber;
  height?: SafeNumber;
  fill?: boolean;
  quality?: SafeNumber;
  priority?: boolean;
  loading?: LoadingValue;
  placeholder?: PlaceholderValue;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: ImageLoader;
  onLoad?: (event) => void;
  onError?: (event) => void;
  onLoadingComplete?: OnLoadingComplete;
};
export type ImageElementProps = Omit<ImageProps, "src" | "alt" | "loader"> & {
  srcString: string;
  imgAttributes: GenImgAttrsResult;
  class: string;
  heightInt: number | undefined;
  widthInt: number | undefined;
  qualityInt: number | undefined;
  imgStyle: ImgElementStyle;
  blurStyle: ImgElementStyle;
  isLazy: boolean;
  fill?: boolean;
  loading: LoadingValue;
  config: ImageConfig;
  unoptimized: boolean;
  placeholder: PlaceholderValue;
  onLoad?: (event) => void;
  onError?: (event) => void;
  loader: ImageLoaderWithConfig;
  onLoadingComplete: OnLoadingComplete | undefined;
  setBlurComplete: (b: boolean) => void;
  setShowAltText: (b: boolean) => void;
};
export type ImageLoaderWithConfig = (p: ImageLoaderPropsWithConfig) => string;
export type ImageLoaderPropsWithConfig = ImageLoaderProps & {
  config: Readonly<ImageConfig>;
};
export type ImageLoader = (p: ImageLoaderProps) => string;
export type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};
