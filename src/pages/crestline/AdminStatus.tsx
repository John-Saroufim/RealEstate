import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export default function AdminStatus() {
  const { user } = useAuth();
  const { loading, isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-12 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Admin Status</h1>
          <p className="text-crestline-muted">Helps verify which Supabase user is logged in.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-crestline-muted">Loading...</p>
          ) : !user ? (
            <div className="border border-white/10 p-6 text-center rounded-none">
              <p className="text-crestline-muted mb-4">You are not logged in.</p>
              <Link to="/login" className="text-crestline-gold hover:underline">
                Go to broker login
              </Link>
            </div>
          ) : (
            <div className="border border-white/10 p-6">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-crestline-muted">Signed in as:</span>{" "}
                  <span className="font-semibold">{user.email ?? "unknown email"}</span>
                </div>
                <div>
                  <span className="text-crestline-muted">User ID:</span>{" "}
                  <span className="font-mono">{user.id}</span>
                </div>
                <div>
                  <span className="text-crestline-muted">Admin role:</span>{" "}
                  <span className="font-semibold">
                    {isAdmin === null ? "Checking..." : isAdmin ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/crestline/admin/listings"
                  className="inline-block bg-crestline-gold text-crestline-bg px-6 py-3 hover:opacity-90 transition-opacity"
                >
                  Go to Listings Admin
                </Link>
                <span className="mx-3 text-crestline-muted">or</span>
                <Link to="/logout" className="text-crestline-gold hover:underline">
                  Log out
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}

