"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

export default function FilmGallery({
  preopImages,
  postopImages,
  title,
}: {
  preopImages: string[];
  postopImages: string[];
  title: string;
}) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  if (preopImages.length === 0 && postopImages.length === 0) return null;

  function openLightbox(src: string, alt: string) {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  }

  return (
    <>
      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}
      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: "612px" }}>
        {preopImages.map((img, i) => (
          <button
            key={`pre-${i}`}
            onClick={() => openLightbox(img, `${title} pre-op ${i + 1}`)}
            className="group relative rounded-lg overflow-hidden bg-card-bg border border-card-border cursor-zoom-in"
          >
            <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/60 text-[10px] font-medium text-white/80 rounded">
              Pre-op
            </div>
            <Image
              src={img}
              alt={`${title} pre-op ${i + 1}`}
              width={224}
              height={168}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
        {postopImages.map((img, i) => (
          <button
            key={`post-${i}`}
            onClick={() => openLightbox(img, `${title} post-op ${i + 1}`)}
            className="group relative rounded-lg overflow-hidden bg-card-bg border border-card-border cursor-zoom-in"
          >
            <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-black/60 text-[10px] font-medium text-white/80 rounded">
              Post-op
            </div>
            <Image
              src={img}
              alt={`${title} post-op ${i + 1}`}
              width={224}
              height={168}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>
    </>
  );
}
