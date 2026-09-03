import { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/about", label: "About Us" },
    { to: "/gallery", label: "Gallery" },
  ];

  const navBase =
    "text-sm tracking-widest uppercase font-light transition-colors duration-200";
  const activeClass = "text-primary";
  const inactiveClass = "hover:text-primary";
  const inactiveStyle = { color: "rgba(255,255,255,0.92)" };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled || !isHome
            ? "rgba(8,6,4,0.97)"
            : "transparent",
          borderBottom: scrolled || !isHome
            ? "1px solid var(--border)"
            : "none",
          backdropFilter: scrolled || !isHome ? "blur(8px)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span
              className="font-serif text-xl tracking-wide"
              style={{ color: "var(--primary)" }}
            >
              Café Fausse
            </span>
            <span
              className="text-[9px] tracking-[0.3em] uppercase mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Fine Italian Dining
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `${navBase} ${isActive ? activeClass : inactiveClass}`
                }
                style={({ isActive }) => isActive ? {} : inactiveStyle}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              to="/reservations"
              className="text-xs tracking-widest uppercase px-6 py-2.5 transition-all duration-200 hover:opacity-90"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-body)",
              }}
            >
              Reserve a Table
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: "var(--primary)",
                transform: menuOpen ? "rotate(45deg) translateY(3.5px)" : "none",
              }}
            />
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: "var(--primary)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-px transition-all duration-300"
              style={{
                background: "var(--primary)",
                transform: menuOpen ? "rotate(-45deg) translateY(-3.5px)" : "none",
              }}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-5 border-t"
            style={{
              background: "rgba(8,6,4,0.98)",
              borderColor: "var(--border)",
            }}
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `${navBase} pt-4 ${isActive ? activeClass : inactiveClass}`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/reservations"
              className="text-xs tracking-widest uppercase px-5 py-2.5 text-center mt-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Reserve a Table
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-serif text-xl mb-1" style={{ color: "var(--primary)" }}>
              Café Fausse
            </p>
            <p className="text-xs tracking-[0.3em] uppercase mb-5" style={{ color: "var(--muted-foreground)" }}>
              Fine Italian Dining
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Where tradition meets innovation, and every meal becomes a memory.
            </p>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "var(--primary)" }}>
              Hours
            </p>
            <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <p>Monday – Saturday</p>
              <p className="font-light">5:00 PM – 11:00 PM</p>
              <p className="mt-3">Sunday</p>
              <p className="font-light">5:00 PM – 9:00 PM</p>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "var(--primary)" }}>
              Contact
            </p>
            <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <p>1234 Culinary Ave, Suite 100</p>
              <p>Washington, DC 20002</p>
              <p className="mt-3">(202) 555-4567</p>
            </div>
          </div>
        </div>

        <div
          className="border-t px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            © 2024 Café Fausse. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs tracking-widest uppercase hover:opacity-80 transition-opacity"
                style={{ color: "var(--muted-foreground)" }}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="text-xs tracking-widest uppercase hover:opacity-80 transition-opacity ml-4 pl-4 border-l"
              style={{ color: "rgba(176,173,166,0.35)", borderColor: "var(--border)" }}
            >
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
