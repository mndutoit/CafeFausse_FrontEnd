import { useState } from "react";
import interiorImg from "@/imports/gallery-cafe-interior.jpeg";
import steakImg from "@/imports/gallery-ribeye-steak.jpeg";
import eventImg from "@/imports/gallery-special-event.jpeg";
import heroImg from "@/imports/home-cafe-fausse.jpeg";

const images = [
  {
    src: heroImg,
    alt: "Café Fausse grand dining room with ornate gilded ceiling and marble floors",
    label: "The Grand Room",
    category: "Interior",
  },
  {
    src: interiorImg,
    alt: "Café Fausse chandelier dining room with floral arrangements and candlelight",
    label: "The Chandelier Room",
    category: "Interior",
  },
  {
    src: steakImg,
    alt: "Signature ribeye steak plated with roasted vegetables and herb garnish",
    label: "Signature Ribeye",
    category: "Cuisine",
  },
  {
    src: eventImg,
    alt: "Exclusive private dining event with candlelit tables and floral centrepieces",
    label: "Private Event Evening",
    category: "Events",
  },
];

const awards = [
  { title: "Culinary Excellence Award", year: "2022", icon: "✦" },
  { title: "Restaurant of the Year", year: "2023", icon: "✦" },
  { title: "Best Fine Dining Experience", year: "2023", source: "Foodie Magazine", icon: "✦" },
];

const reviews = [
  {
    quote: "Exceptional ambiance and unforgettable flavors.",
    source: "Gourmet Review",
  },
  {
    quote: "A must-visit restaurant for food enthusiasts.",
    source: "The Daily Bite",
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox((i) => (i! - 1 + images.length) % images.length);
  const next = () => setLightbox((i) => (i! + 1) % images.length);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-56 flex items-center justify-center overflow-hidden">
        <img
          src={eventImg}
          alt="Private event evening at Café Fausse"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(8,6,4,0.65)" }}
        />
        <div className="relative z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Café Fausse
          </p>
          <h1 className="font-serif text-5xl" style={{ color: "var(--foreground)" }}>
            Gallery
          </h1>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </section>

      {/* Image grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <p
          className="text-center text-sm font-light mb-12"
          style={{ color: "var(--muted-foreground)" }}
        >
          Step inside Café Fausse — the rooms, the plates, the evenings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {images.map((img, i) => (
            <button
              key={img.label}
              onClick={() => openLightbox(i)}
              className="relative group overflow-hidden text-left focus:outline-none"
              style={{ aspectRatio: i === 0 || i === 1 ? "16/9" : "4/3" }}
              aria-label={`View ${img.label}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6"
                style={{
                  background:
                    "linear-gradient(to top, rgba(8,6,4,0.85) 0%, transparent 60%)",
                }}
              >
                <span
                  className="text-[9px] tracking-widest uppercase mb-1"
                  style={{ color: "var(--primary)" }}
                >
                  {img.category}
                </span>
                <span className="font-serif text-lg" style={{ color: "var(--foreground)" }}>
                  {img.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 px-6" style={{ background: "var(--secondary)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
              Recognition
            </p>
            <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
              Awards & Accolades
            </h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {awards.map((a) => (
              <div
                key={a.title}
                className="border text-center py-10 px-6"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="text-xl" style={{ color: "var(--primary)" }}>{a.icon}</span>
                <p
                  className="font-serif text-lg mt-4 mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {a.title}
                </p>
                {a.source && (
                  <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
                    {a.source}
                  </p>
                )}
                <p
                  className="text-[10px] tracking-widest uppercase"
                  style={{ color: "var(--primary)" }}
                >
                  {a.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
              What Guests Say
            </p>
            <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
              Press & Reviews
            </h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((r) => (
              <div
                key={r.source}
                className="border p-8"
                style={{ borderColor: "var(--border)" }}
              >
                <p
                  className="font-serif text-2xl italic mb-6 leading-snug"
                  style={{ color: "var(--foreground)" }}
                >
                  "{r.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-px" style={{ background: "var(--primary)" }} />
                  <p
                    className="text-[10px] tracking-widest uppercase"
                    style={{ color: "var(--primary)" }}
                  >
                    {r.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(4,3,2,0.95)" }}
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 p-3 text-xl transition-colors hover:text-primary"
            style={{ color: "var(--foreground)" }}
            aria-label="Previous"
          >
            ←
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightbox].src}
              alt={images[lightbox].alt}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <div className="mt-4 text-center">
              <p className="font-serif text-lg" style={{ color: "var(--foreground)" }}>
                {images[lightbox].label}
              </p>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: "var(--primary)" }}>
                {images[lightbox].category}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 p-3 text-xl transition-colors hover:text-primary"
            style={{ color: "var(--foreground)" }}
            aria-label="Next"
          >
            →
          </button>

          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-3 text-xl transition-colors hover:text-primary"
            style={{ color: "var(--foreground)" }}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === lightbox ? "var(--primary)" : "var(--border)",
                }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
