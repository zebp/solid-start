import type { ImageLoader, ImageLoaderPropsWithConfig } from "./types";


export const defaultLoader: ImageLoader = ({
  config,
  src,
  width,
  quality,
}: ImageLoaderPropsWithConfig): string => {
  if (import.meta.env.MODE !== "production") {
    const missingValues = [];
    // these should always be provided but make sure they are
    if (!src) missingValues.push("src");
    if (!width) missingValues.push("width");
    if (missingValues.length > 0) {
      throw new Error(
        `Next Image Optimization requires ${missingValues.join(
          ", "
        )} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify(
          { src, width, quality }
        )}`
      );
    }
    if (src.startsWith("//")) {
      throw new Error(
        `Failed to parse src "${src}" on \`next/image\`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)`
      );
    }
    if (!src.startsWith("/") && (config.domains || config.remotePatterns)) {
      let parsedSrc: URL;
      try {
        parsedSrc = new URL(src);
      } catch (err) {
        console.error(err);
        throw new Error(
          `Failed to parse src "${src}" on \`next/image\`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)`
        );
      }
    }
  }
  if (src.endsWith(".svg") && !config.dangerouslyAllowSVG) {
    // Special case to make svg serve as-is to avoid proxying
    // through the built-in Image Optimization API.
    return src;
  }
  return `${src}`;
}
