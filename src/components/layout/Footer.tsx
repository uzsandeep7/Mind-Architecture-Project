import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import mindArchitectureLogo from "@/assets/mind-architecture-logo.webp";

const footerLinks = {
  quickLinks: [
    { href: "/about", label: "About" },
    { href: "/events", label: "Programs" },
    { href: "/books", label: "Resources" },
    { href: "/blog", label: "Insights" },
    { href: "/contact", label: "Contact" },
  ],
  services: [
    { href: "/events", label: "Resilience Training" },
    { href: "/events", label: "Corporate Workshops" },
    { href: "/contact", label: "Consultations" },
    { href: "/membership", label: "Membership" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-dark text-cream">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="mb-6 inline-block">
              <img
                src={mindArchitectureLogo}
                alt="Mind Architecture"
                className="h-16 w-auto rounded-lg bg-white p-2"
              />
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-cream/70">
              Helping professionals navigate stress, burnout, and success with
              resilience and belonging. Building ecosystems of care inside
              organisations, families, and communities.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-heading font-semibold text-cream">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-heading font-semibold text-cream">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    to={link.href}
                    className="text-sm text-cream/70 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-lg font-heading font-semibold text-cream">
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-sm text-cream/70">
                  Melbourne, VIC
                  <br />
                  Australia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary" />
                <a
                  href="tel:+61412345678"
                  className="text-sm text-cream/70 transition-colors hover:text-primary"
                >
                  Contact Us
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-primary" />
                <a
                  href="mailto:hello@mindarchitecture.com.au"
                  className="text-sm text-cream/70 transition-colors hover:text-primary"
                >
                  hello@mindarchitecture.com.au
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-wide flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-sm text-cream/50">
            Copyright {new Date().getFullYear()} Mind Architecture. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <span className="text-cream/50">Privacy Policy available on request</span>
            <span className="text-cream/50">Terms available on request</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
