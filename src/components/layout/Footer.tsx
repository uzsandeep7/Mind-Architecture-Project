import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
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

const socialLinks = [
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
];

export const Footer = () => {
  return (
    <footer className="bg-dark text-cream">
      {/* Main Footer */}
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src={mindArchitectureLogo} 
                alt="Mind Architecture" 
                className="h-16 w-auto bg-white rounded-lg p-2"
              />
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              Helping professionals navigate stress, burnout, and success with resilience 
              and belonging. Building ecosystems of care inside organisations, families, 
              and communities.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-cream">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-cream/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-cream">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-cream/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-cream">
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span className="text-cream/70 text-sm">
                  Melbourne, VIC<br />
                  Australia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <a
                  href="tel:+61412345678"
                  className="text-cream/70 hover:text-primary transition-colors text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <a
                  href="mailto:hello@mindarchitecture.com.au"
                  className="text-cream/70 hover:text-primary transition-colors text-sm"
                >
                  hello@mindarchitecture.com.au
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Mind Architecture. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="#" className="text-cream/50 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-cream/50 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
