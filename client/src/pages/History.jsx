import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Search, ChevronDown, FileText, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [highScoreOnly, setHighScoreOnly] = useState(false);
  const [techRolesOnly, setTechRolesOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get('/analysis');
        if (!cancelled) setAnalyses(data.analyses || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchHistory();
    return () => { cancelled = true; };
  }, []);

  // Derived state: filter analyses based on UI controls
  const filteredAnalyses = analyses.filter(analysis => {
    // 1. Search Query
    if (searchQuery.trim() !== "") {
      if (!analysis.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // 2. High Score Filter
    if (highScoreOnly && analysis.match_score < 80) {
      return false;
    }

    // 3. Tech Roles Filter (simple keyword check on filename)
    if (techRolesOnly) {
      const techKeywords = ['engineer', 'developer', 'dev', 'software', 'frontend', 'backend', 'fullstack', 'data', 'it', 'tech'];
      const filenameLower = analysis.filename.toLowerCase();
      if (!techKeywords.some(kw => filenameLower.includes(kw))) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-background text-on-background flex flex-col md:flex-row h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Top App Bar */}
        <header className="hidden md:flex justify-between items-center px-lg py-4 bg-surface border-b border-outline-variant sticky top-0 z-30">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Your Analyses</h1>
          <div className="flex items-center gap-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                className="pl-10 pr-4 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm bg-surface-container-lowest" 
                placeholder="Search history..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden cursor-pointer font-label-md">
              U
            </div>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-lg lg:p-xl scroll-smooth">
          <div className="max-w-max-width mx-auto">
            <div className="md:hidden mb-lg mt-4">
              <h1 className="font-display-sm text-display-sm text-on-surface">Your Analyses</h1>
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap gap-sm mb-lg">
              <button 
                onClick={() => { setHighScoreOnly(false); setTechRolesOnly(false); }}
                className={`px-4 py-2 rounded-full font-label-md text-label-md border transition-colors flex items-center gap-2 ${
                  !highScoreOnly && !techRolesOnly 
                    ? 'bg-secondary-container text-on-secondary-container border-transparent' 
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                All Time
                <ChevronDown className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setHighScoreOnly(!highScoreOnly)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md border transition-colors ${
                  highScoreOnly
                    ? 'bg-secondary-container text-on-secondary-container border-transparent'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                High Score (&gt;80)
              </button>
              <button 
                onClick={() => setTechRolesOnly(!techRolesOnly)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md border transition-colors ${
                  techRolesOnly
                    ? 'bg-secondary-container text-on-secondary-container border-transparent'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                }`}
              >
                Tech Roles
              </button>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="flex items-center justify-center py-xl gap-md">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="font-body-lg text-body-lg text-on-surface-variant">Loading history…</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-sm bg-error-container text-on-error-container rounded-lg p-md border border-error/50 max-w-lg mx-auto mt-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-label-md text-label-md font-bold mb-xs">Failed to load history</p>
                  <p className="font-body-sm text-body-sm opacity-90">{error}</p>
                </div>
              </div>
            ) : analyses.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
                <FileText className="w-16 h-16 text-outline mb-md" />
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">No analysis history found</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-[448px]">
                  You haven't uploaded any resumes for analysis yet.
                </p>
                <button 
                  onClick={() => navigate('/analyze')}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Analyze a Resume
                </button>
              </div>
            ) : filteredAnalyses.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
                <FileText className="w-16 h-16 text-outline mb-md" />
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">No matches found</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-[448px]">
                  Your search didn't match any past results. Try adjusting your filters.
                </p>
                <button 
                  onClick={() => { setSearchQuery(""); setHighScoreOnly(false); setTechRolesOnly(false); }}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {filteredAnalyses.map(analysis => (
                  <div key={analysis.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-start justify-between mb-sm">
                        <FileText className="w-8 h-8 text-primary opacity-80" />
                        <div className={`px-2 py-1 rounded font-label-sm text-label-sm ${
                          analysis.match_score >= 80 ? "bg-tertiary/20 text-tertiary" : 
                          analysis.match_score >= 50 ? "bg-primary/20 text-primary" : "bg-error/20 text-error"
                        }`}>
                          Score: {analysis.match_score}
                        </div>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs truncate" title={analysis.filename}>
                        {analysis.filename}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/analysis/${analysis.id}`} className="mt-md flex items-center justify-between text-primary font-label-md hover:underline">
                      View Report
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default History;
