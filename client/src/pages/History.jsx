import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Search, ChevronDown, CheckCircle2, ArrowRight, Pen, AlertTriangle, Check, FileText } from "lucide-react";

function History() {
  const navigate = useNavigate();

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
            <div className="md:hidden mb-lg">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Your Analyses</h1>
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap gap-sm mb-lg">
              <button className="px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md border border-transparent hover:bg-surface-variant transition-colors flex items-center gap-2">
                All Time
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
                High Score (&gt;80)
              </button>
              <button className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md border border-outline-variant hover:bg-surface-container-low transition-colors">
                Tech Roles
              </button>
            </div>

            {/* Empty State */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center shadow-sm min-h-[400px]">
              <FileText className="w-16 h-16 text-outline mb-md" />
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">No analysis history found</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-[448px]">
                You haven't uploaded any resumes for analysis yet, or your search didn't match any past results.
              </p>
              <button 
                onClick={() => navigate('/analyze')}
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Analyze a Resume
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default History;
