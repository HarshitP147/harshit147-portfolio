// Publish-time image metadata rides on the image url's fragment:
//   https://.../a.png#w=1920&h=1122&b=<encoded data:image/webp;base64,...>
// The fragment is never sent to the server, so the image url itself is intact.

export type ParsedMediaSrc = {
  src: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

export function parseMediaSrc(rawSrc: string): ParsedMediaSrc {
  const hashIndex = rawSrc.indexOf("#");
  if (hashIndex === -1) return { src: rawSrc };

  const src = rawSrc.slice(0, hashIndex);
  const params = new URLSearchParams(rawSrc.slice(hashIndex + 1));
  const width = Number(params.get("w"));
  const height = Number(params.get("h"));
  const blur = params.get("b");

  return {
    src,
    width: width > 0 ? width : undefined,
    height: height > 0 ? height : undefined,
    blurDataURL: blur?.startsWith("data:image/") ? blur : undefined,
  };
}
