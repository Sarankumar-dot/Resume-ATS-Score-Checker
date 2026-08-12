import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CheckCircle2, XCircle, Key, Lightbulb, Loader2, AlertCircle,
  ArrowLeft, AlertTriangle, Hash, ArrowRight, Sparkles,
  ChevronDown, ChevronUp, Activity, FileText, Check, X
} from "lucide-react";
import { api } from "../lib/api";

function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suggestions state (Phase 5)
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [totalBullets, setTotalBullets] = useState(0);

  // Full Report state (Phase 5/6 extension)
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // AI Rewrite state (Phase 6.5)
  const [rewriteStates, setRewriteStates] = useState({});

  const handleRewrite = async (bulletText, index) => {
    setRewriteStates(prev => ({ ...prev, [index]: { loading: true, result: null, error: null } }));
    try {
      const data = await api.post(`/analysis/${analysis.resume_id}/rewrite-bullet`, { bulletText });
      setRewriteStates(prev => ({ ...prev, [index]: { loading: false, result: data.rewritten, error: null } }));
    } catch (err) {
      setRewriteStates(prev => ({ ...prev, [index]: { loading: false, result: null, error: err.message || "Failed to generate rewrite." } }));
    }
  };

  // Holistic AI Review state (Phase 6.6)
  const [aiReviewState, setAiReviewState] = useState({ loading: false, result: null, error: null });

  const handleGenerateAiReview = async () => {
    setAiReviewState({ loading: true, result: null, error: null });
    try {
      const data = await api.post(`/analysis/${analysis.resume_id}/ai-review`);
      setAiReviewState({ loading: false, result: data.reviewPoints, error: null });
    } catch (err) {
      setAiReviewState({ loading: false, result: null, error: err.message || "Failed to generate AI review." });
    }
  };

  // Fetch analysis
  useEffect(() => {
    let cancelled = false;
    async function fetchAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/analysis/${id}`);
        if (!cancelled) setAnalysis(data.analysis);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load analysis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAnalysis();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch report once we have the analysis (need resume_id)
  useEffect(() => {
    if (!analysis?.resume_id) return;
    let cancelled = false;
    
    async function fetchReport() {
      setReportLoading(true);
      try {
        const data = await api.get(`/analysis/${analysis.resume_id}/report`);
        if (!cancelled) {
          setReport(data);
          
          // Populate suggestions from the report data
          if (data.suggestionsData) {
            setSuggestions(data.suggestionsData.suggestions);
            setTotalBullets(data.suggestionsData.totalBullets);
          } else {
            setSuggestions([]);
            setTotalBullets(0);
          }
        }
      } catch {
        // If report fails, we might just not have enough data
        if (!cancelled) {
          setReport(null);
          if (!suggestions) setSuggestions([]); // Fallback
        }
      } finally {
        if (!cancelled) setReportLoading(false);
      }
    }

    fetchReport();
    return () => { cancelled = true; };
  }, [analysis?.resume_id]);

  // Score color helpers
  function scoreColor(score) {
    if (score >= 75) return "text-tertiary";
    if (score >= 50) return "text-primary";
    return "text-error";
  }

  function scoreBg(score) {
    if (score >= 75) return "bg-tertiary";
    if (score >= 50) return "bg-primary";
    return "bg-error";
  }

  function scoreLabel(score) {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  }

  /**
   * Renders a bullet text with the weak phrase highlighted/struck through.
   */
  function renderBulletWithHighlight(bullet, weakVerb) {
    if (!weakVerb) return <span>{bullet}</span>;

    const idx = bullet.toLowerCase().indexOf(weakVerb.phrase.toLowerCase());
    if (idx < 0) return <span>{bullet}</span>;

    const before = bullet.substring(0, idx);
    const phrase = bullet.substring(idx, idx + weakVerb.phrase.length);
    const after = bullet.substring(idx + weakVerb.phrase.length);

    return (
      <span>
        {before}
        <span className="line-through text-error/70 bg-error/5 px-0.5 rounded">{phrase}</span>
        {after}
      </span>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-screen relative w-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-xl max-w-max-width mx-auto w-full">

          {/* Back link */}
          <Link to="/analyze" className="inline-flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-md mt-4 md:mt-0">
            <ArrowLeft className="w-4 h-4" />
            Back to Analyze
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-xl gap-md">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="font-body-lg text-body-lg text-on-surface-variant">Loading analysis…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-sm bg-error-container text-on-error-container rounded-lg p-md border border-error/50 max-w-lg mx-auto mt-xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-label-md text-label-md font-bold mb-xs">Failed to load analysis</p>
                <p className="font-body-sm text-body-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {analysis && !loading && (
            <>
              {/* Page Header */}
              <div className="mb-xl">
                <h1 className="font-display-lg text-display-lg mb-sm">Analysis Results</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Resume keyword match against the targeted job description.
                </p>
              </div>

              {/* Top Section: Score + Summary */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
                {/* Overall Match Score */}
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col items-center justify-center">
                  <h2 className="font-headline-sm text-headline-sm mb-lg">Overall Match</h2>

                  {/* Score ring */}
                  <div className="relative w-40 h-40 mb-md">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-variant" />
                      <circle
                        cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                        strokeLinecap="round"
                        className={scoreBg(analysis.match_score)}
                        strokeDasharray={`${(analysis.match_score / 100) * 327} 327`}
                        style={{ transition: "stroke-dasharray 0.8s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`font-display-lg text-display-lg ${scoreColor(analysis.match_score)}`}>
                        {analysis.match_score}<span className="font-body-md text-body-md">%</span>
                      </span>
                    </div>
                  </div>

                  <p className={`font-label-md text-label-md ${scoreColor(analysis.match_score)}`}>
                    {scoreLabel(analysis.match_score)}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-sm">
                    {analysis.matched_keywords.length} of {analysis.matched_keywords.length + analysis.missing_keywords.length} keywords matched
                  </p>
                </div>

                {/* Score Breakdown */}
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col justify-center">
                  <h2 className="font-headline-sm text-headline-sm mb-lg">Score Breakdown</h2>

                  {/* Progress bar */}
                  <div className="mb-md">
                    <div className="flex justify-between items-end mb-xs">
                      <span className="font-body-md text-body-md font-medium text-on-surface">Keyword Match</span>
                      <span className={`font-headline-md text-headline-md ${scoreColor(analysis.match_score)}`}>
                        {analysis.match_score}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2.5">
                      <div
                        className={`${scoreBg(analysis.match_score)} h-2.5 rounded-full transition-all duration-700`}
                        style={{ width: `${analysis.match_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-md mt-md">
                    <div className="bg-surface-container-low rounded-lg p-md text-center">
                      <p className="font-display-sm text-display-sm text-tertiary">{analysis.matched_keywords.length}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Keywords Found</p>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-md text-center">
                      <p className="font-display-sm text-display-sm text-error">{analysis.missing_keywords.length}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Keywords Missing</p>
                    </div>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-md">
                    Analyzed on {new Date(analysis.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </section>

              {/* ── Phase 6.6: Holistic AI Review ───────────────────────────── */}
              <section className="mb-xl bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-md">
                  <div className="flex items-center gap-sm">
                    <Sparkles className="text-tertiary w-7 h-7" />
                    <h2 className="font-display-sm text-display-sm">Holistic AI Review</h2>
                  </div>
                  
                  {!aiReviewState.result && (
                    <button
                      onClick={handleGenerateAiReview}
                      disabled={aiReviewState.loading}
                      className="inline-flex items-center gap-sm px-4 py-2 rounded-full bg-tertiary text-on-tertiary hover:bg-tertiary/90 transition-colors font-label-md disabled:opacity-50 self-start md:self-auto"
                    >
                      {aiReviewState.loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      Generate AI Review
                    </button>
                  )}
                </div>

                {/* Loading State */}
                {aiReviewState.loading && (
                  <div className="flex items-center gap-sm py-md">
                    <Loader2 className="w-5 h-5 text-tertiary animate-spin" />
                    <span className="font-body-md text-body-md text-on-surface-variant">Analyzing your resume...</span>
                  </div>
                )}

                {/* Error State */}
                {aiReviewState.error && (
                  <div className="flex items-center gap-sm py-md px-lg bg-error/5 rounded-lg border border-error/10 text-error">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-body-md text-body-md">{aiReviewState.error}</span>
                  </div>
                )}

                {/* Result State */}
                {aiReviewState.result && (
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md relative group">
                    <ul className="space-y-sm list-disc pl-md marker:text-tertiary">
                      {aiReviewState.result.map((point, index) => (
                        <li key={index} className="font-body-md text-body-md text-on-surface leading-relaxed pl-1 mb-2 whitespace-pre-wrap">
                          {point}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-md pt-sm border-t border-outline-variant flex items-center justify-between">
                      <div className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-tertiary" />
                        AI-generated suggestion — review before using
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Phase 5/6: Comprehensive Report ───────────────────────────── */}
              {report && (
                <section className="mb-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
                    <div className="flex items-center gap-sm">
                      <FileText className="text-primary w-7 h-7" />
                      <h2 className="font-display-sm text-display-sm">Comprehensive Report</h2>
                    </div>
                    <div className="flex items-center gap-md bg-primary/10 px-lg py-sm rounded-2xl border border-primary/20 self-start md:self-auto">
                      <span className="font-label-lg text-label-lg text-primary uppercase tracking-wider font-semibold">Total Score</span>
                      <span className="font-display-md text-display-md text-primary font-bold">
                        {report.totalScore}
                        <span className="text-primary/70 font-headline-md text-headline-md font-medium ml-1">/{report.maxTotalScore}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-md">
                    {report.categories.map((category, idx) => (
                      <CategoryCard key={idx} category={category} />
                    ))}
                  </div>
                </section>
              )}

              {/* Keyword Analysis + Suggestions */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
                {/* Keyword Chips */}
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg lg:col-span-2">
                  <div className="flex items-center gap-sm mb-md">
                    <Key className="text-primary w-5 h-5" />
                    <h2 className="font-headline-sm text-headline-sm">Keyword Analysis</h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                    Keywords extracted from the job description and compared against your resume.
                  </p>

                  {/* Matched */}
                  <div className="mb-lg">
                    <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wide">
                      Found ({analysis.matched_keywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-sm">
                      {analysis.matched_keywords.length > 0 ? (
                        analysis.matched_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm border border-tertiary/20"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic">No keywords matched</span>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div>
                    <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wide">
                      Missing ({analysis.missing_keywords.length})
                    </h3>
                    <div className="flex flex-wrap gap-sm">
                      {analysis.missing_keywords.length > 0 ? (
                        analysis.missing_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-error/10 text-error font-label-sm text-label-sm border border-error/20"
                          >
                            <XCircle className="w-3 h-3" />
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic">No keywords missing — great coverage!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Tips Sidebar */}
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg lg:col-span-1">
                  <div className="flex items-center gap-sm mb-md">
                    <Sparkles className="text-primary w-5 h-5" />
                    <h2 className="font-headline-sm text-headline-sm">Quick Tips</h2>
                  </div>

                  <div className="space-y-md">
                    {analysis.missing_keywords.length > 0 && (
                      <div className="bg-surface-container-low rounded-lg p-md">
                        <p className="font-label-sm text-label-sm text-on-surface mb-xs">Add missing keywords</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Consider naturally incorporating these terms:
                          {" "}<strong>{analysis.missing_keywords.slice(0, 5).join(", ")}</strong>
                          {analysis.missing_keywords.length > 5 && ` and ${analysis.missing_keywords.length - 5} more`}.
                        </p>
                      </div>
                    )}

                    {suggestions && suggestions.length > 0 && (
                      <div className="bg-surface-container-low rounded-lg p-md">
                        <p className="font-label-sm text-label-sm text-on-surface mb-xs">Strengthen your bullets</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {suggestions.filter(s => s.weakVerb).length > 0 && (
                            <>{suggestions.filter(s => s.weakVerb).length} bullet{suggestions.filter(s => s.weakVerb).length > 1 ? "s use" : " uses"} weak action verbs. </>
                          )}
                          {suggestions.filter(s => s.missingMetric).length > 0 && (
                            <>{suggestions.filter(s => s.missingMetric).length} bullet{suggestions.filter(s => s.missingMetric).length > 1 ? "s lack" : " lacks"} quantifiable metrics.</>
                          )}
                        </p>
                      </div>
                    )}

                    {suggestions && suggestions.length === 0 && (
                      <div className="bg-tertiary/5 rounded-lg p-md border border-tertiary/10">
                        <p className="font-label-sm text-label-sm text-tertiary mb-xs">Looking good!</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          No weak verbs or missing metrics found in your experience bullets.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Impact Suggestions (Phase 5) ───────────────────────── */}
              <section className="mb-xl">
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
                  <div className="flex items-center gap-sm mb-sm">
                    <Lightbulb className="text-primary w-5 h-5" />
                    <h2 className="font-headline-sm text-headline-sm">Impact Suggestions</h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
                    Bullet points from your Experience section flagged for improvement.
                    {totalBullets > 0 && (
                      <span className="text-on-surface-variant ml-1">
                        ({suggestions?.length || 0} of {totalBullets} bullets flagged)
                      </span>
                    )}
                  </p>

                  {/* Loading */}
                  {suggestionsLoading && (
                    <div className="flex items-center gap-sm py-md">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Analyzing bullet points…</span>
                    </div>
                  )}

                  {/* Empty state */}
                  {!suggestionsLoading && suggestions && suggestions.length === 0 && (
                    <div className="flex items-center gap-sm py-md px-lg bg-tertiary/5 rounded-lg border border-tertiary/10">
                      <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0" />
                      <p className="font-body-md text-body-md text-tertiary">
                        Nice — no weak verbs or missing metrics found! Your bullet points look strong.
                      </p>
                    </div>
                  )}

                  {/* Flagged bullets */}
                  {!suggestionsLoading && suggestions && suggestions.length > 0 && (
                    <div className="space-y-md">
                      {suggestions.map((item, i) => (
                        <div key={i} className="bg-surface-container-lowest rounded-lg border border-outline-variant p-md">
                          {/* Original bullet with highlight */}
                          <p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-sm">
                            <span className="text-on-surface-variant mr-1">•</span>
                            {renderBulletWithHighlight(item.bullet, item.weakVerb)}
                          </p>

                          {/* Flags */}
                          <div className="flex flex-wrap gap-sm mt-sm">
                            {/* Weak verb flag */}
                            {item.weakVerb && (
                              <div className="flex flex-col gap-xs">
                                <div className="inline-flex items-center gap-xs">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="font-label-sm text-label-sm text-amber-600">
                                    Weak verb: "{item.weakVerb.phrase}"
                                  </span>
                                </div>
                                <div className="flex items-center gap-xs ml-5">
                                  <ArrowRight className="w-3 h-3 text-tertiary" />
                                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                                    Try: {" "}
                                    {item.weakVerb.suggestions.map((s, j) => (
                                      <span key={j}>
                                        <span className="font-medium text-tertiary">{s}</span>
                                        {j < item.weakVerb.suggestions.length - 1 && ", "}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Missing metric flag */}
                            {item.missingMetric && (
                              <div className="inline-flex items-center gap-xs">
                                <Hash className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-label-sm text-label-sm text-blue-600">
                                  Consider adding a number, percentage, or metric
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* AI Rewrite Action */}
                          <div className="mt-md pt-md border-t border-outline-variant flex flex-col items-start">
                            <button
                              onClick={() => handleRewrite(item.bullet, i)}
                              disabled={rewriteStates[i]?.loading}
                              className="inline-flex items-center gap-xs px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container hover:bg-surface-variant transition-colors font-label-sm disabled:opacity-50"
                            >
                              {rewriteStates[i]?.loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                              Rewrite with AI
                            </button>
                            
                            {/* AI Rewrite Result / Error */}
                            {rewriteStates[i]?.error && (
                              <div className="mt-sm text-error font-body-sm text-body-sm flex items-center gap-xs">
                                <AlertCircle className="w-4 h-4" />
                                {rewriteStates[i].error}
                              </div>
                            )}
                            
                            {rewriteStates[i]?.result && (
                              <div className="mt-sm p-sm bg-surface-container rounded-md border border-outline-variant w-full relative group">
                                <p className="font-body-sm text-body-sm text-on-surface">
                                  {rewriteStates[i].result}
                                </p>
                                <div className="mt-xs text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI-generated suggestion — review before using
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* JD Preview */}
              <section className="mb-xl">
                <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
                  <h2 className="font-headline-sm text-headline-sm mb-md">Job Description Used</h2>
                  <div className="bg-surface-container-low rounded-lg p-md max-h-48 overflow-y-auto">
                    <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                      {analysis.jd_text}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}

function CategoryCard({ category }) {
  const [expanded, setExpanded] = useState(false);
  const scorePercent = Math.round((category.score / category.maxScore) * 100);
  
  let scoreColor = "text-error";
  let bgFill = "bg-error";
  if (scorePercent >= 80) { scoreColor = "text-tertiary"; bgFill = "bg-tertiary"; }
  else if (scorePercent >= 50) { scoreColor = "text-primary"; bgFill = "bg-primary"; }

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div 
        className="p-md flex items-center justify-between cursor-pointer hover:bg-surface-variant/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-variant/30" />
              <circle
                cx="20" cy="20" r="18" fill="none" strokeWidth="4"
                strokeLinecap="round"
                className={scoreColor}
                strokeDasharray={`${(scorePercent / 100) * 113} 113`}
              />
            </svg>
            <span className={`font-label-sm text-label-sm ${scoreColor}`}>{category.score}</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm">{category.name}</h3>
        </div>
        <div className="flex items-center gap-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">{category.score}/{category.maxScore} pts</span>
          <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-outline-variant p-md space-y-md bg-surface-container-lowest">
            {category.checks.map((check, i) => (
              <div key={i} className="flex gap-sm">
                <div className="mt-0.5 shrink-0">
                  {check.passed ? (
                    <Check className="w-5 h-5 text-tertiary" />
                  ) : (
                    <X className="w-5 h-5 text-error" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-label-md text-label-md">{check.label}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant ml-2 whitespace-nowrap">
                      {check.points}/{check.maxPoints} pts
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisResult;
