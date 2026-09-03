import steakImg from "@/imports/gallery-ribeye-steak.jpeg";

const menuData = [
  {
    category: "Starters",
    subtitle: "Begin the Journey",
    items: [
      {
        name: "Bruschetta",
        description: "Fresh tomatoes, basil, olive oil, and toasted baguette slices",
        price: 8.50,
      },
      {
        name: "Caesar Salad",
        description: "Crisp romaine with homemade Caesar dressing",
        price: 9.00,
      },
    ],
  },
  {
    category: "Main Courses",
    subtitle: "The Heart of the Table",
    items: [
      {
        name: "Grilled Salmon",
        description: "Served with lemon butter sauce and seasonal vegetables",
        price: 22.00,
      },
      {
        name: "Ribeye Steak",
        description: "12 oz prime cut with garlic mashed potatoes",
        price: 28.00,
        featured: true,
      },
      {
        name: "Vegetable Risotto",
        description: "Creamy Arborio rice with wild mushrooms",
        price: 18.00,
      },
    ],
  },
  {
    category: "Desserts",
    subtitle: "A Sweet Conclusion",
    items: [
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with mascarpone",
        price: 7.50,
      },
      {
        name: "Cheesecake",
        description: "Creamy cheesecake with berry compote",
        price: 7.00,
      },
    ],
  },
  {
    category: "Beverages",
    subtitle: "Curated Selections",
    items: [
      {
        name: "Red Wine (Glass)",
        description: "A selection of Italian reds",
        price: 10.00,
      },
      {
        name: "White Wine (Glass)",
        description: "Crisp and refreshing",
        price: 9.00,
      },
      {
        name: "Craft Beer",
        description: "Local artisan brews",
        price: 6.00,
      },
      {
        name: "Espresso",
        description: "Strong and aromatic",
        price: 3.00,
      },
    ],
  },
];

export default function Menu() {
  return (
    <div className="pt-20">
      {/* Hero banner */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <img
          src={steakImg}
          alt="Café Fausse signature ribeye steak"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(8,6,4,0.7)" }}
        />
        <div className="relative z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--primary)" }}>
            Café Fausse
          </p>
          <h1 className="font-serif text-5xl" style={{ color: "var(--foreground)" }}>
            The Menu
          </h1>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </section>

      {/* Menu content */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <p
          className="text-center text-lg font-light mb-16 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          All dishes are prepared with locally sourced, seasonal ingredients,
          honoring Italian tradition with modern culinary expression.
        </p>

        <div className="space-y-20">
          {menuData.map((section) => (
            <div key={section.category}>
              {/* Section header */}
              <div className="text-center mb-10">
                <p
                  className="text-[10px] tracking-widest uppercase mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  {section.subtitle}
                </p>
                <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
                  {section.category}
                </h2>
                <div className="gold-divider mx-auto mt-3" />
              </div>

              {/* Items */}
              <div className="space-y-0 divide-y" style={{ borderColor: "var(--border)" }}>
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-baseline justify-between py-6 gap-6 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="font-serif text-lg transition-colors group-hover:text-primary"
                          style={{ color: "var(--foreground)" }}
                        >
                          {item.name}
                        </span>
                        {"featured" in item && item.featured && (
                          <span
                            className="text-[9px] tracking-widest uppercase px-2 py-0.5"
                            style={{
                              background: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }}
                          >
                            Chef's Choice
                          </span>
                        )}
                      </div>
                      <p className="text-base font-light" style={{ color: "var(--muted-foreground)" }}>
                        {item.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className="font-serif text-lg"
                        style={{ color: "var(--primary)" }}
                      >
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          className="mt-16 pt-8 border-t text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-base font-light" style={{ color: "var(--muted-foreground)" }}>
            Please inform your server of any dietary restrictions or allergies.
            Menu is subject to seasonal availability.
          </p>
        </div>
      </section>
    </div>
  );
}
