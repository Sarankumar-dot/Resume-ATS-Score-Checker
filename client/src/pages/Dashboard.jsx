import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FileText, Upload, TrendingUp, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../lib/api";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const data = await api.get('/analysis');
        if (!cancelled) setAnalyses(data.analyses || []);
      } catch (err) {
        if (!cancelled) setAnalyses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboardData();
    return () => { cancelled = true; };
  }, []);

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.match_score, 0) / analyses.length)
    : 0;

  const topAnalyses = analyses.slice(0, 3);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row">
      <Navbar />
      
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-xl w-full max-w-max-width mx-auto">
          <header className="mb-xl mt-4 md:mt-0">
            <h2 className="font-display-lg text-display-lg text-on-surface mb-sm">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Here is a summary of your recent resume analyses and next steps.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
            {/* CTA Card */}
            <div 
              onClick={() => navigate('/analyze')}
              className="lg:col-span-1 bg-primary text-on-primary rounded-xl p-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:opacity-90 transition-opacity cursor-pointer min-h-[220px]"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
              <div>
                <FileText className="w-10 h-10 mb-md" />
                <h3 className="font-headline-md text-headline-md font-bold mb-xs">Analyze New Resume</h3>
                <p className="font-body-md text-body-md opacity-90 mb-lg">Upload your latest PDF or Word document for an instant ATS compatibility score.</p>
              </div>
              <button className="bg-white text-primary font-label-md text-label-md py-3 px-6 rounded-lg w-full flex items-center justify-center gap-sm shadow-sm">
                <span>Upload File</span>
                <Upload className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Overview */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-lg">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-sm mb-sm">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <span className="font-label-md text-label-md text-on-surface-variant">Average Score</span>
                </div>
                <div className="flex items-baseline gap-sm">
                  <span className="font-display-lg text-display-lg text-on-surface">{analyses.length > 0 ? avgScore : '-'}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">/100</span>
                </div>
                <div className="mt-md w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${avgScore >= 80 ? 'bg-tertiary' : avgScore >= 50 ? 'bg-primary' : 'bg-error'}`} style={{ width: `${avgScore}%` }}></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-sm mb-sm">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  <span className="font-label-md text-label-md text-on-surface-variant">Analyses Completed</span>
                </div>
                <span className="font-display-lg text-display-lg text-on-surface mb-sm">{loading ? '-' : analyses.length}</span>
                <div className="flex flex-wrap gap-xs">
                  <span className="text-on-surface-variant font-body-sm text-body-sm italic">Keep up the good work!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analyses Section */}
          <section>
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Analyses</h3>
              {analyses.length > 0 && (
                <Link to="/history" className="font-label-md text-label-md text-primary hover:underline flex items-center gap-xs">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : topAnalyses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {topAnalyses.map(analysis => (
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
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/analysis/${analysis.id}`} className="mt-md flex items-center justify-between text-primary font-label-md hover:underline">
                      View Report
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center shadow-sm">
                <FileText className="w-12 h-12 text-outline mb-md" />
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-xs">No analyses yet</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg max-w-[448px]">
                  You haven't analyzed any resumes yet. Upload your first resume to see ATS compatibility scores and personalized suggestions.
                </p>
                <button 
                  onClick={() => navigate('/analyze')}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Analyze Resume
                </button>
              </div>
            )}
          </section>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default Dashboard;
