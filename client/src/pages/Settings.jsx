import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Mail, LogOut, Settings as SettingsIcon } from "lucide-react";

function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row">
      <Navbar />
      
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-xl w-full max-w-max-width mx-auto">
          <header className="mb-xl mt-4 md:mt-0 flex items-center gap-sm">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h2 className="font-display-lg text-display-lg text-on-surface">Account Settings</h2>
          </header>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-lg mb-xl pb-xl border-b border-outline-variant">
              <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display-md text-3xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xs">{user?.name}</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center justify-center sm:justify-start gap-xs">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                <div className="mt-sm inline-block px-3 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-on-surface-variant">
                  Free Tier
                </div>
              </div>
            </div>

            <div className="space-y-lg">
              <div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Preferences</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Detailed profile and preference settings will be available in a future update.
                </p>
              </div>

              <div className="pt-lg">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-xs font-label-md text-label-md text-error hover:bg-error/10 px-4 py-2 rounded-lg transition-colors border border-error/20"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default Settings;
