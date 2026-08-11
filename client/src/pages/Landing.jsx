import { Link } from "react-router-dom";
import { Zap, FileText, Key, BarChart, Menu, User, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useState } from "react";

function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <aside className={`bg-surface shadow-md h-screen fixed top-0 left-0 z-50 w-72 flex flex-col py-lg md:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-lg mb-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ResumeFit Logo" className="w-8 h-8 rounded-full" />
            <span className="font-headline-sm text-headline-sm font-bold text-primary">ResumeFit</span>
          </div>
          <button 
            className="text-on-surface-variant p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-sm">
          <a href="#" className="flex items-center gap-md bg-secondary-container text-on-secondary-container rounded-lg px-4 py-3 font-label-md text-label-md" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <Link to="/analyze" className="flex items-center gap-md text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg font-label-md text-label-md" onClick={() => setIsMobileMenuOpen(false)}>Analyze</Link>
          <a href="#" className="flex items-center gap-md text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-lg font-label-md text-label-md" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
        </nav>
        <div className="px-4 mt-auto">
          <Link to="/login" className="flex items-center justify-center gap-md bg-primary-container text-on-primary rounded-lg px-4 py-3 font-label-md text-label-md w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <User size={20} />
            Log In
          </Link>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="bg-surface dark:bg-on-background fixed top-0 left-0 w-full z-30 flex justify-between items-center px-4 md:px-margin-desktop max-w-max-width mx-auto h-16 border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <Menu className="text-primary dark:text-primary-fixed md:hidden w-6 h-6 cursor-pointer" onClick={() => setIsMobileMenuOpen(true)} />
          <div className="flex items-center gap-2">
            <img alt="ResumeFit Logo" className="h-8 w-8 object-contain rounded-DEFAULT" src={logo} />
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">ResumeFit</span>
          </div>
        </div>
        
        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-lg h-full">
          <a className="h-full flex items-center font-label-md text-label-md text-primary dark:text-primary-fixed font-bold border-b-2 border-primary" href="#">Home</a>
          <Link to="/analyze" className="h-full flex items-center font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container transition-colors px-2 rounded-DEFAULT">Analyze</Link>
          <a className="h-full flex items-center font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container transition-colors px-2 rounded-DEFAULT" href="#">Pricing</a>
        </nav>
        
        <div className="flex items-center gap-sm">
          <Link to="/login" className="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant hover:bg-surface-container-high transition-colors">
            <User className="text-on-surface-variant w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[80px] pb-xl px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full flex flex-col gap-xl">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center pt-xl pb-xl gap-lg">
          <div className="inline-flex items-center gap-xs bg-surface-container-low px-sm py-base rounded-full border border-outline-variant mb-4">
            <Zap className="text-primary w-4 h-4" />
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">New ATS Scoring Algorithm Live</span>
          </div>
          <h1 className="font-display-lg text-display-lg max-w-3xl">
            Know if your resume passes the ATS — <span className="text-primary-container">and how to fix it if it doesn't.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Upload your resume and the job description. Our advanced system analyzes keywords, formatting, and content density to ensure you beat the Applicant Tracking System.
          </p>
          <div className="flex gap-md mt-sm">
            <Link to="/signup" className="bg-primary-container text-on-primary font-label-md text-label-md px-lg py-sm rounded-DEFAULT hover:opacity-90 transition-opacity shadow-sm">
              Get Started
            </Link>
            <button className="bg-surface text-on-surface font-label-md text-label-md px-lg py-sm rounded-DEFAULT border border-outline-variant hover:bg-surface-container transition-colors">
              View Sample Report
            </button>
          </div>

          {/* Bento-style visual placeholder for hero image/UI mock */}
          <div className="w-full max-w-4xl mt-xl rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden flex flex-col md:flex-row h-96 relative">
            <div className="w-full md:w-1/3 bg-surface-container-lowest p-md border-r border-outline-variant flex flex-col gap-sm">
              <div className="h-4 w-24 bg-surface-container-high rounded-full mb-sm"></div>
              <div className="h-3 w-full bg-surface-container rounded-full"></div>
              <div className="h-3 w-5/6 bg-surface-container rounded-full"></div>
              <div className="h-3 w-4/6 bg-surface-container rounded-full"></div>
              <div className="mt-auto flex gap-xs">
                <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-1 rounded-md">React</span>
                <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-1 rounded-md">TypeScript</span>
              </div>
            </div>
            <div className="w-full md:w-2/3 bg-surface-container-low p-lg relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
              <div className="bg-surface rounded-lg border border-outline-variant p-md shadow-md z-10 w-64 text-center transform -rotate-2">
                <div className="w-16 h-16 rounded-full border-4 border-on-tertiary-container flex items-center justify-center mx-auto mb-sm">
                  <span className="font-headline-lg text-headline-lg text-tertiary-container">92</span>
                </div>
                <p className="font-headline-sm text-headline-sm">ATS Match</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Highly compatible with roles matching 'Frontend Developer'</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section (3 Columns) */}
        <section className="py-xl">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-headline-lg mb-sm">Precision tools for professional growth</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">We strip away the noise and focus on what the screening algorithms actually read.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Feature 1 */}
            <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-md group">
              <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm mb-xs">Format Validation</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Ensure your layout is machine-readable. We flag complex tables, hidden text, and unparseable columns.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-md group">
              <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm mb-xs">Keyword Optimization</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Compare your resume against the job description to identify missing hard skills and mandatory qualifications.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-md group">
              <div className="h-12 w-12 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm mb-xs">Actionable Insights</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Receive line-by-line feedback on phrasing, impact metrics, and structural improvements to boost your score.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low dark:bg-on-background full-width py-xl border-t border-outline-variant flat mt-auto">
        <div className="w-full flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto gap-md">
          <span className="font-label-md text-label-md font-bold text-on-surface">© 2024 ResumeFit. All rights reserved.</span>
          <div className="flex gap-lg">
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
