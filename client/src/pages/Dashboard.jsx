import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FileText, Upload, TrendingUp, Briefcase, ArrowRight } from "lucide-react";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row">
      <Navbar />
      
      <main className="flex-1 flex flex-col min-h-screen relative">
        <div className="flex-1 overflow-y-auto p-margin-mobile md:p-xl w-full max-w-max-width mx-auto">
          <header className="mb-xl mt-4 md:mt-0">
            <h2 className="font-display-lg text-display-lg text-on-surface mb-sm">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Here is a summary of your recent resume analyses and next steps.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
            {/* CTA Card */}
            <div 
              onClick={() => navigate('/analyze')}
              className="lg:col-span-1 bg-primary text-on-primary rounded-xl p-lg flex flex-col justify-between shadow-sm relative overflow-hidden group hover:opacity-90 transition-opacity cursor-pointer"
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
                  <span className="font-display-lg text-display-lg text-on-surface">-</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">/100</span>
                </div>
                <div className="mt-md w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full w-0"></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-sm mb-sm">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  <span className="font-label-md text-label-md text-on-surface-variant">Target Roles</span>
                </div>
                <span className="font-headline-lg text-headline-lg text-on-surface mb-sm">-</span>
                <div className="flex flex-wrap gap-xs">
                  <span className="text-on-surface-variant font-body-sm text-body-sm italic">No roles analyzed yet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analyses Section */}
          <section>
            <div className="flex justify-between items-center mb-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface">Recent Analyses</h3>
              <Link to="/history" className="font-label-md text-label-md text-primary hover:underline flex items-center gap-xs">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-md">
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
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-surface-container-low border-t border-outline-variant w-full py-xl mt-auto">
          <div className="w-full flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto gap-lg">
            <span className="font-label-md text-label-md font-bold text-on-surface">© 2024 ResumeFit. All rights reserved.</span>
            <nav className="flex gap-lg">
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">Contact Support</a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
