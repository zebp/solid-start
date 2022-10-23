import { makeRe } from 'micromatch';
import { createContext } from "solid-js";
import { isServer } from "solid-js/web";
import type {
  GenImgAttrsData, GenImgAttrsResult, ImageConfig, ImageConfigComplete, ImgElementWithDataProp, OnLoadingComplete, PlaceholderValue, RemotePattern, StaticImageData, StaticImport,
  StaticRequire
} from './types';

let warnOnce = (_: string) => {}
if (import.meta.env.PROD) {
  const warnings = new Set<string>()
  warnOnce = (msg: string) => {
    if (!warnings.has(msg)) {
      console.warn(msg)
    }
    warnings.add(msg)
  }
}
export { warnOnce };

export const VALID_LOADING_VALUES = ["lazy", "eager", undefined] as const;
export function isStaticRequire(
  src: StaticRequire | StaticImageData
): src is StaticRequire {
  return (src as StaticRequire).default !== undefined;
}
export function isStaticImageData(
  src: StaticRequire | StaticImageData
): src is StaticImageData {
  return (src as StaticImageData).src !== undefined;
}
export function isStaticImport(src: string | StaticImport): src is StaticImport {
  return (
    typeof src === "object" &&
    (isStaticRequire(src as StaticImport) ||
      isStaticImageData(src as StaticImport))
  );
}
export function getWidths(
  { deviceSizes, allSizes }: ImageConfig,
  width: number | undefined,
  sizes: string | undefined
): { widths: number[]; kind: "w" | "x" } {
  if (sizes) {
    // Find all the "vw" percent sizes used in the sizes prop
    const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
    const percentSizes = [];
    for (let match; (match = viewportWidthRe.exec(sizes)); match) {
      percentSizes.push(parseInt(match[2]));
    }
    if (percentSizes.length) {
      const smallestRatio = Math.min(...percentSizes) * 0.01;
      return {
        widths: allSizes.filter((s) => s >= deviceSizes[0] * smallestRatio),
        kind: "w",
      };
    }
    return { widths: allSizes, kind: "w" };
  }
  if (typeof width !== "number") return { widths: deviceSizes, kind: "w" };
  const widths = [
    ...new Set(
      // > This means that most OLED screens that say they are 3x resolution,
      // > are actually 3x in the green color, but only 1.5x in the red and
      // > blue colors. Showing a 3x resolution image in the app vs a 2x
      // > resolution image will be visually the same, though the 3x image
      // > takes significantly more data. Even true 3x resolution screens are
      // > wasteful as the human eye cannot see that level of detail without
      // > something like a magnifying glass.
      // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
      [width, width * 2 /*, width * 3*/].map(
        (w) => allSizes.find((p) => p >= w) || allSizes[allSizes.length - 1]
      )
    ),
  ];
  return { widths, kind: "x" };
}
export function generateImgAttrs({
  config,
  src,
  unoptimized,
  width,
  quality,
  sizes,
  loader,
}: GenImgAttrsData): GenImgAttrsResult {
  if (unoptimized) {
    return { src, srcSet: undefined, sizes: undefined };
  }
  const { widths, kind } = getWidths(config, width, sizes);
  const last = widths.length - 1;
  return {
    sizes: !sizes && kind === "w" ? "100vw" : sizes,
    srcSet: widths
      .map(
        (w, i) =>
          `${loader({ config, src, quality, width: w })} ${
            kind === "w" ? w : i + 1
          }${kind}`
      )
      .join(", "),
    // It's intended to keep `src` the last attribute because React updates
    // attributes in order. If we keep `src` the first one, Safari will
    // immediately start to fetch `src`, before `sizes` and `srcSet` are even
    // updated by React. That causes multiple unnecessary requests if `srcSet`
    // and `sizes` are defined.
    // This bug cannot be reproduced in Chrome or Firefox.
    src: loader({ config, src, quality, width: widths[last] }),
  };
}
export function getInt(x: unknown): number | undefined {
  if (typeof x === "number" || typeof x === "undefined") {
    return x;
  }
  if (typeof x === "string" && /^[0-9]+$/.test(x)) {
    return parseInt(x, 10);
  }
  return NaN;
}
export const checkImage = ({ src, unoptimized, props, widthInt, heightInt, rest, loader, blurDataURL, perfObserver, defaultLoader, config, qualityInt, allImgs }) => {
  if (!src) {
    // React doesn't show the stack trace and there's
    // no `src` to help identify which image, so we
    // instead console.error(ref) during mount.
    unoptimized = true;
  } else {
    if (props.fill) {
      if (props.width) {
        throw new Error(
          `Image with src "${src}" has both "width" and "fill" properties. Only one should be used.`
        );
      }
      if (props.height) {
        throw new Error(
          `Image with src "${src}" has both "height" and "fill" properties. Only one should be used.`
        );
      }
      if (props.style instanceof Object) {
        if (props.style.position && props.style.position !== "absolute") {
          throw new Error(
            `Image with src "${src}" has both "fill" and "style.position" properties. Images with "fill" always use position absolute - it cannot be modified.`
          );
        }
        if (props.style.width && props.style.width !== "100%") {
          throw new Error(
            `Image with src "${src}" has both "fill" and "style.width" properties. Images with "fill" always use width 100% - it cannot be modified.`
          );
        }
        if (props.style.height && props.style.height !== "100%") {
          throw new Error(
            `Image with src "${src}" has both "fill" and "style.height" properties. Images with "fill" always use height 100% - it cannot be modified.`
          );
        }
      }
    } else {
      if (typeof widthInt === "undefined") {
        throw new Error(
          `Image with src "${src}" is missing required "width" property.`
        );
      } else if (isNaN(widthInt)) {
        throw new Error(
          `Image with src "${src}" has invalid "width" property. Expected a numeric value in pixels but received "${props.width}".`
        );
      }
      if (typeof heightInt === "undefined") {
        throw new Error(
          `Image with src "${src}" is missing required "height" property.`
        );
      } else if (isNaN(heightInt)) {
        throw new Error(
          `Image with src "${src}" has invalid "height" property. Expected a numeric value in pixels but received "${props.height}".`
        );
      }
    }
  }
  if (!VALID_LOADING_VALUES.includes(props.loading)) {
    throw new Error(
      `Image with src "${src}" has invalid "loading" property. Provided "${
        props.loading
      }" should be one of ${VALID_LOADING_VALUES.map(String).join(",")}.`
    );
  }
  if (props.priority && props.loading === "lazy") {
    throw new Error(
      `Image with src "${src}" has both "priority" and "loading='lazy'" properties. Only one should be used.`
    );
  }
  if (props.placeholder === "blur") {
    if (widthInt && heightInt && widthInt * heightInt < 1600) {
      warnOnce(
        `Image with src "${src}" is smaller than 40x40. Consider removing the "placeholder='blur'" property to improve performance.`
      );
    }
    if (!blurDataURL) {
      const VALID_BLUR_EXT = ["jpeg", "png", "webp", "avif"]; // should match next-image-loader
      throw new Error(
        `Image with src "${src}" has "placeholder='blur'" property but is missing the "blurDataURL" property.
        Possible solutions:
          - Add a "blurDataURL" property, the contents should be a small Data URL to represent the image
          - Change the "src" property to a static import with one of the supported file types: ${VALID_BLUR_EXT.join(
            ","
          )}
          - Remove the "placeholder" property, effectively no blur effect
        Read more: https://nextjs.org/docs/messages/placeholder-blur-data-url`
      );
    }
  }
  if ("ref" in rest) {
    warnOnce(
      `Image with src "${src}" is using unsupported "ref" property. Consider using the "onLoadingComplete" property instead.`
    );
  }
  if (!unoptimized && loader !== defaultLoader) {
    const urlStr = loader({
      config: config(),
      src,
      width: widthInt || 400,
      quality: qualityInt || 75,
    });
    let url: URL | undefined;
    try {
      url = new URL(urlStr);
    } catch (err) {}
    if (urlStr === src || (url && url.pathname === src && !url.search)) {
      warnOnce(
        `Image with src "${src}" has a "loader" property that does not implement width. Please implement it or use the "unoptimized" property instead.` +
          `\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader-width`
      );
    }
  }
  // Run performance validation for FCP and warn user
  if (!isServer) {
    perfObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // @ts-ignore - missing "LargestContentfulPaint" class with "element" prop
        const imgSrc = entry?.element?.src || "";
        const lcpImage = allImgs.get(imgSrc);
        if (
          lcpImage &&
          !lcpImage.priority &&
          lcpImage.placeholder !== "blur" &&
          !lcpImage.src.startsWith("data:") &&
          !lcpImage.src.startsWith("blob:")
        ) {
          // https://web.dev/lcp/#measure-lcp-in-javascript
          warnOnce(
            `Image with src "${lcpImage.src}" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.` +
              `\nRead more: https://nextjs.org/docs/api-reference/next/image#priority`
          );
        }
      }
    });
    try {
      perfObserver.observe({
        type: "largest-contentful-paint",
        buffered: true,
      });
    } catch (err) {
      // Log error but don't crash the app
      console.error(err);
    }
  }
};


// See https://stackoverflow.com/q/39777833/266535 for why we use this ref
// handler instead of the img's onLoad attribute.
export function handleLoading(
  img: ImgElementWithDataProp,
  src: string,
  placeholder: PlaceholderValue,
  onLoadingComplete: OnLoadingComplete | undefined,
  setBlurComplete: (b: boolean) => void
) {
  if (!img || img["data-loaded-src"] === src) {
    return;
  }
  img["data-loaded-src"] = src;
  const p = "decode" in img ? img.decode() : Promise.resolve();
  p.catch(() => {}).then(() => {
    if (!img.parentNode) {
      // Exit early in case of race condition:
      // - onload() is called
      // - decode() is called but incomplete
      // - unmount is called
      // - decode() completes
      return;
    }
    if (placeholder === "blur") {
      setBlurComplete(true);
    }
    if (onLoadingComplete) onLoadingComplete(img);
    if (import.meta.env.MODE !== "production") {
      if (img.getAttribute("data-nimg") === "future-fill") {
        if (
          !img.getAttribute("sizes") ||
          img.getAttribute("sizes") === "100vw"
        ) {
          let widthViewportRatio =
            img.getBoundingClientRect().width / window.innerWidth;
          if (widthViewportRatio < 0.6) {
            warnOnce(
              `Image with src "${src}" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/future/image#sizes`
            );
          }
        }
        if (img.parentElement) {
          const { position } = window.getComputedStyle(img.parentElement);
          const valid = ["absolute", "fixed", "relative"];
          if (!valid.includes(position)) {
            warnOnce(
              `Image with src "${src}" has "fill" and parent element with invalid "position". Provided "${position}" should be one of ${valid
                .map(String)
                .join(",")}.`
            );
          }
        }
        if (img.height === 0) {
          warnOnce(
            `Image with src "${src}" has "fill" and a height value of 0. This is likely because the parent element of the image has not been styled to have a set height.`
          );
        }
      }
      const heightModified = img.height.toString() !== img.getAttribute("height");
      const widthModified = img.width.toString() !== img.getAttribute("width");
      if (
        (heightModified && !widthModified) ||
        (!heightModified && widthModified)
      ) {
        warnOnce(
          `Image with src "${src}" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.`
        );
      }
    }
  });
}

export const imageConfigDefault: ImageConfigComplete = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: "./",
  loader: "default",
  domains: [],
  disableStaticImages: false,
  minimumCacheTTL: 60,
  formats: ["image/webp"],
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: `script-src 'none'; frame-src 'none'; sandbox;`,
  remotePatterns: [],
  unoptimized: false
};

export function getImageBlurSvg({
  widthInt,
  heightInt,
  blurWidth,
  blurHeight,
  blurDataURL,
}: {
  widthInt?: number
  heightInt?: number
  blurWidth?: number
  blurHeight?: number
  blurDataURL: string
}): string {
  const std = blurWidth && blurHeight ? '1' : '20'
  const svgWidth = blurWidth || widthInt
  const svgHeight = blurHeight || heightInt
  const feComponentTransfer = blurDataURL.startsWith('data:image/jpeg')
    ? `%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='1 1'/%3E%3C/feComponentTransfer%3E%`
    : ''
  return `%3Csvg xmlns='http%3A//www.w3.org/2000/svg' viewBox='0 0 ${svgWidth} ${svgHeight}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E${feComponentTransfer}%3C/filter%3E%3Cimage filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' href='${blurDataURL}'/%3E%3C/svg%3E`
}

export function matchRemotePattern(pattern: RemotePattern, url: URL): boolean {
  if (pattern.protocol !== undefined) {
    const actualProto = url.protocol.slice(0, -1)
    if (pattern.protocol !== actualProto) {
      return false
    }
  }
  if (pattern.port !== undefined) {
    if (pattern.port !== url.port) {
      return false
    }
  }
  if (pattern.hostname === undefined) {
    throw new Error(
      `Pattern should define hostname but found\n${JSON.stringify(pattern)}`
    )
  } else {
    if (!makeRe(pattern.hostname).test(url.hostname)) {
      return false
    }
  }
  if (!makeRe(pattern.pathname ?? '**').test(url.pathname)) {
    return false
  }
  return true
}

export function hasMatch(
  domains: string[],
  remotePatterns: RemotePattern[],
  url: URL
): boolean {
  return (
    domains.some((domain) => url.hostname === domain) ||
    remotePatterns.some((p) => matchRemotePattern(p, url))
  )
}

export const ImageConfigContext =
  createContext<ImageConfigComplete>(imageConfigDefault)
