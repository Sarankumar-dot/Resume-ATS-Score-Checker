import { Link } from "react-router-dom";
import { Zap, FileText, Key, BarChart, Menu, User, X, ArrowRight, Globe, AtSign, ExternalLink } from "lucide-react";
import logo from "../assets/logo.png";
import { useState } from "react";
import Footer from "../components/Footer";

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
        </nav>
        <div className="px-4 mt-auto flex flex-col gap-sm">
          <Link to="/login" className="flex items-center justify-center gap-md border border-outline-variant text-on-surface rounded-lg px-4 py-3 font-label-md text-label-md w-full hover:bg-surface-container transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Log In
          </Link>
          <Link to="/signup" className="flex items-center justify-center gap-md bg-primary text-on-primary rounded-lg px-4 py-3 font-label-md text-label-md w-full hover:opacity-90 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
            Get Started Free
          </Link>
        </div>
      </aside>

      {/* TopAppBar */}
      <header className="bg-surface/90 backdrop-blur-md fixed top-0 left-0 w-full z-30 flex justify-between items-center px-4 md:px-margin-desktop max-w-max-width mx-auto h-16 border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <Menu className="text-primary dark:text-primary-fixed md:hidden w-6 h-6 cursor-pointer" onClick={() => setIsMobileMenuOpen(true)} />
          <div className="flex items-center gap-2">
            <img alt="ResumeFit Logo" className="h-8 w-8 object-contain rounded-DEFAULT" src={logo} />
            <span className="font-headline-md text-headline-md font-bold text-primary">ResumeFit</span>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-lg h-full">
          <a className="h-full flex items-center font-label-md text-label-md text-primary font-bold border-b-2 border-primary" href="#">Home</a>
          <Link to="/analyze" className="h-full flex items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors px-2">Analyze</Link>
        </nav>

        <div className="hidden md:flex items-center gap-sm">
          <Link to="/login" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">
            Log In
          </Link>
          <Link to="/signup" className="font-label-md text-label-md bg-primary text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            Get Started
          </Link>
        </div>

        {/* Mobile: just user icon */}
        <div className="md:hidden flex items-center">
          <Link to="/login" className="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant hover:bg-surface-container-high transition-colors">
            <User className="text-on-surface-variant w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[80px] pb-xl px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full flex flex-col gap-xl">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center pt-xl pb-xl gap-lg">
          {/* Badge */}
          <div className="inline-flex items-center gap-xs bg-primary/10 text-primary px-sm py-base rounded-full border border-primary/20 mb-2">
            <Zap className="w-4 h-4" />
            <span className="font-label-sm text-label-sm font-medium uppercase tracking-wider">100% Free · No account required to try</span>
          </div>

          {/* Headline */}
          <h1 className="font-display-lg text-display-lg max-w-3xl leading-tight">
            Beat the ATS before your resume{" "}
            <span className="relative inline-block">
              <span className="text-primary">ever gets read.</span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary/30 rounded-full" />
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Upload your resume and paste the job description. ResumeFit instantly surfaces keyword gaps, formatting issues, and actionable rewrites — for free, forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-md mt-sm">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-sm bg-primary text-on-primary font-label-md text-label-md px-xl py-[14px] rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center justify-center gap-sm bg-surface text-on-surface font-label-md text-label-md px-xl py-[14px] rounded-xl border border-outline-variant hover:bg-surface-container hover:border-outline transition-all"
            >
              Try Without Signing Up
            </Link>
          </div>

          {/* Social proof / trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-md mt-md text-on-surface-variant">
            <div className="flex items-center gap-xs">
              <span className="text-lg">✓</span>
              <span className="font-body-sm text-body-sm">No credit card</span>
            </div>
            <div className="w-px h-4 bg-outline-variant" />
            <div className="flex items-center gap-xs">
              <span className="text-lg">✓</span>
              <span className="font-body-sm text-body-sm">PDF & DOCX supported</span>
            </div>
            <div className="w-px h-4 bg-outline-variant" />
            <div className="flex items-center gap-xs">
              <span className="text-lg">✓</span>
              <span className="font-body-sm text-body-sm">Instant results</span>
            </div>
          </div>

          {/* Bento-style hero mock */}
          <div className="w-full max-w-4xl mt-xl rounded-2xl border border-outline-variant bg-surface shadow-xl overflow-hidden flex flex-col md:flex-row h-96 relative">
            <div className="w-full md:w-1/3 bg-surface-container-lowest p-md border-r border-outline-variant flex flex-col gap-sm">
              <div className="h-4 w-24 bg-surface-container-high rounded-full mb-sm"></div>
              <div className="h-3 w-full bg-surface-container rounded-full"></div>
              <div className="h-3 w-5/6 bg-surface-container rounded-full"></div>
              <div className="h-3 w-4/6 bg-surface-container rounded-full"></div>
              <div className="h-3 w-full bg-surface-container rounded-full mt-sm"></div>
              <div className="h-3 w-3/4 bg-surface-container rounded-full"></div>
              <div className="mt-auto flex flex-wrap gap-xs">
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">React</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium">TypeScript</span>
                <span className="bg-error-container text-on-error-container text-xs px-2 py-1 rounded-md font-medium">Docker ✗</span>
              </div>
            </div>
            <div className="w-full md:w-2/3 bg-surface-container-low p-lg relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#3525cd 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
              <div className="bg-surface rounded-xl border border-outline-variant p-lg shadow-xl z-10 w-64 text-center transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="w-20 h-20 rounded-full border-4 border-primary/30 bg-primary/5 flex items-center justify-center mx-auto mb-sm">
                  <span className="font-display-lg text-display-lg text-primary font-bold">92</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-bold">ATS Match</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Highly compatible with 'Frontend Developer' roles</p>
                <div className="mt-md flex gap-xs justify-center flex-wrap">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Keywords ✓</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Format ✓</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="py-xl">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-headline-lg mb-sm">Precision tools for professional growth</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">We strip away the noise and focus on what screening algorithms actually read.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {[
              {
                icon: FileText,
                title: "Format Validation",
                desc: "Ensure your layout is machine-readable. We flag complex tables, hidden text, and unparseable columns before an ATS rejects you silently.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Key,
                title: "Keyword Optimization",
                desc: "Compare your resume against the job description to surface missing hard skills and mandatory qualifications with TF-IDF scoring.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: BarChart,
                title: "Actionable Insights",
                desc: "Receive line-by-line before/after rewrites with measurable impact metrics, structural improvements, and power-verb suggestions.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-start gap-md group cursor-default">
                <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm mb-xs">{title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────── */}
        <section className="w-full rounded-2xl bg-primary px-8 py-14 flex flex-col items-center text-center gap-md mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-on-primary" style={{ maxWidth: '520px' }}>
            Ready to land your next role?
          </h2>
          <p className="font-body-md text-body-md text-on-primary/80" style={{ maxWidth: '480px' }}>
            Join thousands of job seekers who've already optimized their resumes with ResumeFit — completely free.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-sm bg-on-primary text-primary font-label-md text-label-md px-xl py-[14px] rounded-xl hover:opacity-90 transition-all shadow-lg mt-sm"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

export default Landing;
