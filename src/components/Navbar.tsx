import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSiteContent, useContactInfo } from "@/hooks/use-site-data";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Productos", href: "#productos" },
  { label: "Servicios", href: "#catalogo" },
  { label: "Contacto", href: "#contacto" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { data: content } = useSiteContent();
  const { data: contact } = useContactInfo();

  const logoUrl = content?.logo_url;
  const whatsappUrl = contact?.whatsapp_number ? `https://wa.me/${contact.whatsapp_number}` : "https://wa.me/18095515447";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16">
        <a href="#inicio" className="flex items-center gap-2">
          {logoUrl && <img src={logoUrl} alt="RM COMPUTER logo" className="h-10 w-10 rounded-md object-cover" />}
          <span className="font-bold text-lg text-foreground hidden sm:inline">RM COMPUTER</span>
        </a>

        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Contáctanos
        </a>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in-up">
          <ul className="flex flex-col p-4 gap-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Contáctanos
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
