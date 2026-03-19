import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import { MontelibanoHouseLogo } from "@/components/crestline/MontelibanoHouseLogo";

export function CrestlineFooter() {
  return (
    <footer className="bg-crestline-surface border-t border-crestline-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <Link to="/crestline" className="flex items-center gap-2 mb-5">
              <MontelibanoHouseLogo className="h-6 w-6 text-crestline-gold" />
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                RealEstate
              </span>
            </Link>
            <p className="text-sm text-crestline-muted leading-relaxed">
              Curating exceptional properties for discerning buyers since 2009. Your trusted partner in luxury real estate.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4 text-sm tracking-wider uppercase">Quick Links</h4>
            <div className="space-y-3">
              {[
                { label: "Properties", to: "/crestline/properties" },
                { label: "Contact", to: "/crestline/contact" },
                { label: "About Us", to: "/crestline/about" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-crestline-muted hover:text-crestline-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4 text-sm tracking-wider uppercase">Services</h4>
            <div className="space-y-3">
              {["Residential Sales", "Investment Advisory", "Property Management", "Luxury Rentals"].map((s) => (
                <span key={s} className="block text-sm text-crestline-muted">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-white mb-4 text-sm tracking-wider uppercase">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-crestline-muted">
                <MapPin className="h-4 w-4 text-crestline-gold mt-0.5 shrink-0" />
                <span>200 Park Avenue, Suite 1500<br />New York, NY 10166</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-crestline-muted">
                <Phone className="h-4 w-4 text-crestline-gold shrink-0" />
                <span>+1 (212) 555-0190</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-crestline-muted">
                <Mail className="h-4 w-4 text-crestline-gold shrink-0" />
                <span>inquiries@crestlineestates.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-crestline-muted">
            © {new Date().getFullYear()} RealEstate. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((item) => (
              <span key={item} className="text-xs text-crestline-muted hover:text-crestline-gold cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
