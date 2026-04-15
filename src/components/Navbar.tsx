"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Background", href: "#background" },
  { label: "Vessel Dynamics", href: "#vessel" },
  { label: "Methods", href: "#methods" },
  { label: "Evidence", href: "#evidence" },
  { label: "Interpretation", href: "#interpretation" },
  { label: "Conclusions", href: "#conclusions" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Detect active section
      const sections = navLinks.map((l) => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top < 200) {
          setActive(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e63946] to-[#c41e30] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-sm font-bold text-[rgba(232,232,240,0.9)] group-hover:text-white transition-colors">
            PWV Research
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                active === link.href.slice(1)
                  ? "text-white bg-[rgba(255,255,255,0.06)]"
                  : "text-[rgba(232,232,240,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block w-5 h-0.5 bg-[rgba(232,232,240,0.7)] transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[rgba(232,232,240,0.7)] transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-[rgba(232,232,240,0.7)] transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden nav-blur mt-2 mx-4 rounded-xl p-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 rounded-lg text-sm text-[rgba(232,232,240,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
