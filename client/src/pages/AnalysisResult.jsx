import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CheckCircle, AlertCircle, Key, Lightbulb } from "lucide-react";

function AnalysisResult() {
  const { id } = useParams();

  // Mock data for the UI
  const overallScore = null;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-screen relative w-full">
        {/* Main Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 md:p-gutter max-w-max-width mx-auto w-full">
          {/* Page Header */}
          <div className="mb-xl mt-4 md:mt-0">
            <h1 className="font-display-lg text-display-lg mb-sm">Analysis Results</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Review your resume's performance against the targeted job description.
            </p>
          </div>

          {/* Top Section: Scores */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
            {/* Overall Match Gauge */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col items-center justify-center">
              <h2 className="font-headline-sm text-headline-sm mb-lg">Overall Match</h2>
              <div className="gauge-container mb-sm">
                <div 
                  className="gauge-fill" 
                  style={{ transform: `rotate(${overallScore ? overallScore * 1.8 : 0}deg)` }} 
                ></div>
                <div className="gauge-cover">
                  <span className="font-display-lg text-display-lg text-primary">
                    {overallScore !== null ? overallScore : "-"}<span className="font-body-md text-body-md">%</span>
                  </span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-sm">
                Score will be calculated based on keyword density and formatting.
              </p>
            </div>

            {/* ATS Compatibility */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col justify-center">
              <h2 className="font-headline-sm text-headline-sm mb-lg">ATS Compatibility</h2>
              <div className="mb-sm flex justify-between items-end">
                <span className="font-body-md text-body-md font-medium text-on-surface">Formatting Score</span>
                <span className="font-headline-md text-headline-md text-primary">-</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2.5 mb-md">
                <div className="bg-primary-container h-2.5 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <ul className="space-y-2 mt-md">
                <li className="flex items-center gap-sm font-body-sm text-body-sm text-on-surface-variant italic">
                  Pending analysis
                </li>
              </ul>
            </div>
          </section>

          {/* Main Body: Bento Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
            {/* Keyword Match (Chips) */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg lg:col-span-1">
              <div className="flex items-center gap-sm mb-md">
                <Key className="text-primary w-5 h-5" />
                <h2 className="font-headline-sm text-headline-sm">Keyword Analysis</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Skills and terms found in job description.</p>
              
              <div className="mb-md">
                <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wide">Found (0)</h3>
                <div className="flex flex-wrap gap-sm">
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">No keywords found</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface mb-sm uppercase tracking-wide">Missing (0)</h3>
                <div className="flex flex-wrap gap-sm">
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">No keywords missing</span>
                </div>
              </div>
            </div>

            {/* Suggestions (Before/After) */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg lg:col-span-2">
              <div className="flex items-center gap-sm mb-md">
                <Lightbulb className="text-primary w-5 h-5" />
                <h2 className="font-headline-sm text-headline-sm">Impact Suggestions</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Enhance your bullet points with measurable results.</p>
              
              <div className="space-y-lg">
                <p className="font-body-sm text-body-sm text-on-surface-variant italic">No suggestions available for this resume yet.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AnalysisResult;
