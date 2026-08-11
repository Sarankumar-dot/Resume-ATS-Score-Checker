import { Link } from "react-router-dom";
import { Globe, AtSign, ExternalLink } from "lucide-react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant mt-auto">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-xl mb-xl">
          {/* Brand */}
          <div className="flex flex-col gap-sm" style={{ maxWidth: '280px' }}>
            <div className="flex items-center gap-2">
              <img src={logo} alt="ResumeFit" className="w-7 h-7 rounded-full" />
              <span className="font-headline-sm text-headline-sm font-bold text-primary">ResumeFit</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Free ATS resume checker — know your score, fix your gaps, get the interview.
            </p>
            <div className="flex gap-sm mt-sm">
              <a href="#" className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
                <AtSign className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-xl">
            <div className="flex flex-col gap-sm">
              <p className="font-label-md text-label-md text-on-surface font-semibold">Product</p>
              <Link to="/analyze" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Analyze Resume</Link>
              <Link to="/dashboard" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <Link to="/history" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">History</Link>
            </div>
            <div className="flex flex-col gap-sm">
              <p className="font-label-md text-label-md text-on-surface font-semibold">Account</p>
              <Link to="/signup" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Sign Up Free</Link>
              <Link to="/login" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Log In</Link>
            </div>
            <div className="flex flex-col gap-sm">
              <p className="font-label-md text-label-md text-on-surface font-semibold">Legal</p>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} ResumeFit. All rights reserved.</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Made with ❤️ for job seekers everywhere</span>
        </div>
      </div>
    </footer>
  );
}
