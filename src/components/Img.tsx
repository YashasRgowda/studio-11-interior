import { sized, srcSet } from "@/lib/img";

type Props = {
  src: string;
  alt: string;
  widths?: number[];
  sizes?: string;
  ratio?: number; // height / width, for a fixed crop
  // Full-screen photos on tall screens: send a tall crop instead of a wide photo
  // squeezed into a narrow frame, so it stays sharp on phones and iPads.
  tall?: boolean;
  className?: string;
  eager?: boolean;
  parallax?: number;
  style?: React.CSSProperties;
};

// A responsive photo: the browser picks the smallest file that looks sharp.
export function Img({ src, alt, widths = [480, 768, 1080, 1440, 1920], sizes = "100vw", ratio, tall, className, eager, parallax, style }: Props) {
  const largest = widths[widths.length - 1];
  const img = (
    <img
      src={sized(src, largest, ratio ? Math.round(largest * ratio) : undefined)}
      srcSet={srcSet(src, widths, ratio)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
      data-parallax={parallax}
      style={style}
    />
  );
  if (!tall) return img;
  return (
    <picture>
      <source media="(max-aspect-ratio: 3/5)" srcSet={srcSet(src, [500, 800, 1100, 1400], 2.2)} sizes="100vw" />
      <source media="(max-aspect-ratio: 1/1)" srcSet={srcSet(src, [800, 1200, 1600, 2000], 1.4)} sizes="100vw" />
      {img}
    </picture>
  );
}
