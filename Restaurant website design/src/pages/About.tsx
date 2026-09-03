import interiorImg from "@/imports/gallery-cafe-interior.jpeg";
import heroImg from "@/imports/home-cafe-fausse.jpeg";

const founders = [
  {
    name: "Chef Antonio Rossi",
    role: "Co-Founder & Executive Chef",
    bio: "Born in Bologna and trained under Michelin-starred mentors across Florence and Rome, Chef Rossi arrived in Washington, DC with a singular vision: to bring the soul of Italian cucina to the American table. His philosophy is rooted in respect — for the ingredient, the technique, and the guest. Over two decades in professional kitchens have shaped his mastery of handmade pasta, wood-fired proteins, and the patient craft of Italian sauce-making.",
  },
  {
    name: "Maria Lopez",
    role: "Co-Founder & Restaurateur",
    bio: "With a background in hospitality management and a deep love for Italian culture cultivated through years of travel, Maria Lopez brings both operational excellence and genuine warmth to Café Fausse. She oversees the dining room experience, the wine program, and the restaurant's partnerships with local farms and artisan producers. Her belief that hospitality is an art form in itself shapes every element of the guest journey.",
  },
];

const values = [
  {
    title: "Locally Sourced Ingredients",
    text: "We partner with regional farms and artisan producers to ensure every ingredient on your plate reflects the season and the land.",
  },
  {
    title: "Culinary Innovation",
    text: "Classical Italian technique forms our foundation. Modern interpretation gives it new expression — always in service of flavor.",
  },
  {
    title: "Unforgettable Experiences",
    text: "We measure our success not in reviews, but in the moments our guests carry with them long after the meal is over.",
  },
];

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <img
          src={heroImg}
          alt="Café Fausse grand dining room"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(8,6,4,0.68)" }}
        />
        <div className="relative z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Our Heritage
          </p>
          <h1 className="font-serif text-5xl" style={{ color: "var(--foreground)" }}>
            About Us
          </h1>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </section>

      {/* Story section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img
            src={interiorImg}
            alt="Café Fausse interior with chandeliers and floral arrangements"
            className="w-full h-[480px] object-cover"
          />
          <div
            className="absolute -bottom-4 -right-4 w-2/3 h-full border pointer-events-none"
            style={{ borderColor: "var(--border)", zIndex: -1 }}
          />
        </div>
        <div>
          <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--primary)" }}>
            About Café Fausse
          </p>
          <h2 className="font-serif text-4xl mb-6 leading-snug" style={{ color: "var(--foreground)" }}>
            Tradition, Innovation,<br />and an Enduring Passion
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-sm leading-7 font-light mb-5" style={{ color: "var(--muted-foreground)" }}>
            Founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez,
            Café Fausse blends traditional Italian flavors with modern culinary
            innovation. Our mission is to provide an unforgettable dining
            experience that reflects both quality and creativity.
          </p>
          <p className="text-sm leading-7 font-light mb-5" style={{ color: "var(--muted-foreground)" }}>
            The name "Fausse" — French for "false" — is a nod to the playful
            deception at the heart of great cuisine: dishes that appear simple
            until the first bite reveals their depth. It is a reminder that
            in this dining room, nothing is quite as ordinary as it seems.
          </p>
          <p className="text-sm leading-7 font-light" style={{ color: "var(--muted-foreground)" }}>
            Every item on our menu begins at the source. We partner with
            local farmers, sustainable fisheries, and artisan producers to
            ensure that quality is woven into every ingredient before it
            reaches our kitchen.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6" style={{ background: "var(--secondary)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
              What Guides Us
            </p>
            <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
              Our Commitments
            </h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="border p-8"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="w-8 h-px mb-6" style={{ background: "var(--primary)" }} />
                <h3
                  className="font-serif text-xl mb-4"
                  style={{ color: "var(--foreground)" }}
                >
                  {v.title}
                </h3>
                <p className="text-sm font-light leading-6" style={{ color: "var(--muted-foreground)" }}>
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            The Visionaries
          </p>
          <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
            Our Founders
          </h2>
          <div className="gold-divider mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {founders.map((f) => (
            <div key={f.name} className="flex flex-col">
              <div
                className="w-12 h-12 flex items-center justify-center border mb-6 font-serif text-xl"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                {f.name.charAt(0)}
              </div>
              <h3 className="font-serif text-2xl mb-1" style={{ color: "var(--foreground)" }}>
                {f.name}
              </h3>
              <p
                className="text-[10px] tracking-widest uppercase mb-5"
                style={{ color: "var(--primary)" }}
              >
                {f.role}
              </p>
              <p className="text-sm font-light leading-7" style={{ color: "var(--muted-foreground)" }}>
                {f.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
