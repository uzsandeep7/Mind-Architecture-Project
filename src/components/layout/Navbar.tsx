import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  ShoppingCart,
  LayoutDashboard,
  Settings,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Programs" },
  { href: "/books", label: "Resources" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Insights" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user, signOut, isAdmin, displayName, membershipTier } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-black/40 backdrop-blur-sm"
        }`}
      >
        {/* ⭐ FIX: Extra right breathing room added */}
        <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center shrink-0">
              <div className="bg-white rounded-md px-2 py-1 shadow-sm">
                <img
                  src="/mind-architecture-logo.png"
                  alt="Mind Architecture Logo"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </Link>

            {/* NAV LINKS */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 ml-5 xl:ml-8 min-w-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium tracking-normal whitespace-nowrap transition-all duration-300 hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex items-center shrink-0 ml-3 xl:ml-4">

              {/* ICON GROUP — clean spacing */}
              <div className="flex items-center gap-1.5 xl:gap-2.5">
                {user ? (
                  <div className="hidden 2xl:flex flex-col items-end text-right mr-1 max-w-[140px]">
                    {membershipTier === "premium" ? (
                      <>
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/10">
                          <Crown className="h-3 w-3 fill-current" />
                          <span className="truncate">Hi, {displayName}</span>
                        </span>
                        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-amber-300">
                          Premium Member
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-white/60">Hi, {displayName}</span>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                          Free Member
                        </span>
                      </>
                    )}
                  </div>
                ) : null}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full text-white hover:text-primary hover:bg-white/5"
                >
                  <Search className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="icon" asChild>
                  <Link
                    to="/cart"
                    className="relative text-white hover:text-primary"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-xs rounded-full flex items-center justify-center text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white hover:text-primary hover:bg-white/5"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user ? (
                        <div className="space-y-1">
                          {membershipTier === "premium" ? (
                            <p className="inline-flex items-center gap-1 font-medium text-amber-500">
                              <Crown className="h-4 w-4 fill-current" />
                              Hi, {displayName}
                            </p>
                          ) : (
                            <p className="font-medium">Hi, {displayName}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      ) : (
                        "My Account"
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex gap-2">
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user ? (
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-500 flex gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/auth">Sign In</Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* ⭐ CTA — perfectly spaced from right */}
              <div className="ml-3 xl:ml-4">
                <Button
                  variant="gold"
                  className="h-10 px-4 xl:px-5 shrink-0 rounded-xl text-sm font-semibold shadow-md hover:shadow-yellow-500/20 transition"
                  asChild
                >
                  <Link to="/consultation">
                    Book Consultation
                  </Link>
                </Button>
              </div>

            </div>

            {/* MOBILE */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

          </div>
        </nav>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-2xl text-white ${
                    location.pathname === link.href ? "text-primary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
