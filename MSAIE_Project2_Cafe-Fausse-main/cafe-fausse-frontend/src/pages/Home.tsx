import { Link } from "react-router";
import { useState } from "react";
import heroBg from "@/imports/home-cafe-fausse.jpeg";
import interiorImg from "@/imports/gallery-cafe-interior.jpeg";
import { subscribeNewsletter } from "@/lib/api";

export default function Home() {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error" | "network-error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMessage("Please enter a valid email address.");
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("loading");
    try {
      const result = await subscribeNewsletter({ email });
      if (result.status === "success") {
        setNewsletterMessage(result.message ?? "Thank you for subscribing.");
        setNewsletterStatus("success");
        setEmail("");
      } else {
        setNewsletterMessage(result.error ?? "Something went wrong. Please try again.");
        setNewsletterStatus("error");
        if (import.meta.env.DEV) console.error("Newsletter error:", result.error);
      }
    } catch (err) {
      setNewsletterMessage("Unable to reach the server. Please try again later.");
      setNewsletterStatus("network-error");
      if (import.meta.env.DEV) console.error("Network error:", err);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt="Café Fausse grand dining room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,6,4,0.55) 0%, rgba(8,6,4,0.3) 40%, rgba(8,6,4,0.75) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <p
            className="text-xs tracking-[0.4em] uppercase mb-6"
            style={{ color: "var(--primary)" }}
          >
            Washington, DC — Est. 2010
          </p>
          <h1
            className="font-serif text-5xl md:text-7xl leading-tight mb-6"
            style={{ color: "var(--foreground)" }}
          >
            Café Fausse
          </h1>
          <div className="gold-divider mx-auto mb-6" />
          <p
            className="text-base md:text-lg font-light leading-relaxed mb-10"
            style={{ color: "rgba(240,230,204,0.85)" }}
          >
            Where traditional Italian flavors meet modern culinary innovation.
            An unforgettable dining experience awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reservations"
              className="px-8 py-3.5 text-sm tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Reserve a Table
            </Link>
            <Link
              to="/menu"
              className="px-8 py-3.5 text-sm tracking-widest uppercase border transition-all hover:border-primary hover:text-primary"
              style={{
                border: "1px solid rgba(240,230,204,0.3)",
                color: "var(--foreground)",
              }}
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
            Discover
          </span>
          <div
            className="w-px h-10 animate-pulse"
            style={{ background: "linear-gradient(to bottom, var(--primary), transparent)" }}
          />
        </div>
      </section>

      {/* Hours & Contact bar */}
      <section
        className="border-y py-6 px-6"
        style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--primary)" }}>
              Address
            </p>
            <p className="text-sm font-light" style={{ color: "var(--foreground)" }}>
              1234 Culinary Ave, Suite 100, Washington, DC 20002
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--primary)" }}>
              Reservations
            </p>
            <p className="text-sm font-light" style={{ color: "var(--foreground)" }}>
              (202) 555-4567
            </p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--primary)" }}>
              Hours
            </p>
            <p className="text-sm font-light" style={{ color: "var(--foreground)" }}>
              Mon–Sat 5–11 PM &nbsp;·&nbsp; Sun 5–9 PM
            </p>
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--primary)" }}>
            Our Story
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-snug" style={{ color: "var(--foreground)" }}>
            A Culinary Legacy Born in Passion
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-sm leading-7 font-light mb-4" style={{ color: "var(--muted-foreground)" }}>
            Founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez,
            Café Fausse blends traditional Italian flavors with modern culinary
            innovation. Our mission is to provide an unforgettable dining
            experience that reflects both quality and creativity.
          </p>
          <p className="text-sm leading-7 font-light mb-8" style={{ color: "var(--muted-foreground)" }}>
            Every dish is crafted from locally sourced, seasonal ingredients —
            a commitment that runs through every corner of our kitchen.
          </p>
          <Link
            to="/about"
            className="text-xs tracking-widest uppercase border-b pb-0.5 transition-colors hover:text-primary hover:border-primary"
            style={{ color: "var(--foreground)", borderColor: "var(--border)" }}
          >
            Read Our Story
          </Link>
        </div>
        <div className="relative">
          <img
            src={interiorImg}
            alt="Café Fausse elegant interior dining room"
            className="w-full h-80 md:h-[480px] object-cover"
          />
          <div
            className="absolute -bottom-4 -left-4 w-2/3 h-full border pointer-events-none"
            style={{ borderColor: "var(--border)", zIndex: -1 }}
          />
        </div>
      </section>

      {/* Menu teaser categories */}
      <section
        className="py-20 px-6"
        style={{ background: "var(--secondary)" }}
      >
        <div className="max-w-5xl mx-auto text-center mb-12">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Curated for You
          </p>
          <h2 className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>
            The Menu
          </h2>
          <div className="gold-divider mx-auto mt-4" />
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Starters", "Main Courses", "Desserts", "Beverages"].map((cat) => (
            <Link
              key={cat}
              to="/menu"
              className="group border text-center py-10 px-4 transition-all duration-300 hover:border-primary/50"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="font-serif text-lg mb-1 group-hover:text-primary transition-colors"
                style={{ color: "var(--foreground)" }}
              >
                {cat}
              </p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                Explore →
              </p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/menu"
            className="inline-block px-8 py-3 text-xs tracking-widest uppercase border transition-all hover:border-primary hover:text-primary"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Full Menu
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Stay Connected
          </p>
          <h2 className="font-serif text-3xl mb-4" style={{ color: "var(--foreground)" }}>
            Join Our Inner Circle
          </h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-sm font-light mb-8" style={{ color: "var(--muted-foreground)" }}>
            Receive invitations to exclusive events, seasonal menu previews,
            and curated culinary stories.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-sm bg-transparent border outline-none focus:border-primary transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              type="submit"
              disabled={newsletterStatus === "loading"}
              className="px-6 py-3 text-xs tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {newsletterStatus === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {newsletterStatus === "success" && (
            <p className="text-xs mt-3" style={{ color: "var(--primary)" }}>
              {newsletterMessage}
            </p>
          )}
          {(newsletterStatus === "error" || newsletterStatus === "network-error") && (
            <p className="text-xs mt-3" style={{ color: "#e07070" }}>
              {newsletterMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
