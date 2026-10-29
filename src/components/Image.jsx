import manifest from "../data/images.json";

// Manifest paths are root-absolute ("/img/..."). Vite rewrites asset URLs in
// HTML/CSS, not these runtime JSON strings, so prefix them with BASE_URL here.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const withBase = (url) => `${BASE}${url}`;
// A srcset is "url 400w, url 800w, ..." — prefix each url, keep its descriptor.
const srcsetWithBase = (srcset) =>
  srcset
    .split(",")
    .map((entry) => {
      const [url, ...descriptor] = entry.trim().split(/\s+/);
      return [withBase(url), ...descriptor].join(" ");
    })
    .join(", ");

/**
 * Responsive WebP <img> backed by the build-time image manifest.
 *
 * @param {string} name  original filename key in images.json (e.g. "hero.jpg")
 */
export default function Image({ name, alt = "", sizes = "100vw", className, eager = false, style }) {
  const m = manifest[name];
  if (!m) {
    // graceful fallback if an asset is missing from the manifest
    return <img src={withBase(`/img/${name}`)} alt={alt} className={className} loading="lazy" style={style} />;
  }
  return (
    <img
      src={withBase(m.fallback)}
      srcSet={srcsetWithBase(m.srcset)}
      sizes={sizes}
      alt={alt}
      width={m.width}
      height={m.height}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={eager ? "high" : "auto"}
    />
  );
}
