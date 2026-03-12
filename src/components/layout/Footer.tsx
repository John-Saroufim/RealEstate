import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-max px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold text-foreground">
                IronForge<span className="text-primary"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered fitness coaching for serious athletes.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Platform</h4>
            <div className="space-y-2">
              {["Programs", "AI Coach", "Exercises", "Nutrition"].map((l) => (
                <Link key={l} to={`/${l.toLowerCase().replace(" ", "-")}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Company</h4>
            <div className="space-y-2">
              {["About", "Pricing", "Blog", "Careers"].map((l) => (
                <Link key={l} to={`/${l.toLowerCase()}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Legal</h4>
            <div className="space-y-2">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <span key={l} className="block text-sm text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} IronForge AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
