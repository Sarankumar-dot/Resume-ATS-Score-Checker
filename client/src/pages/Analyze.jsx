import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { UploadCloud, ScanSearch } from "lucide-react";

function Analyze() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-screen w-full relative">
        {/* Canvas for Analyze Content */}
        <div className="flex-1 w-full max-w-max-width mx-auto px-4 md:px-lg pt-12 md:pt-16 pb-xl flex flex-col items-center justify-center">
          <div className="text-center mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Analyze Resume Fit</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Compare your resume against a specific job description to identify keyword gaps, formatting issues, and ATS optimization opportunities.
            </p>
          </div>

          {/* Bento-style Card Layout */}
          <div className="w-full max-w-5xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg md:p-xl flex flex-col gap-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg h-full">
              
              {/* Dropzone */}
              <div className="flex flex-col gap-sm h-full">
                <label className="font-label-md text-label-md text-on-surface">1. Upload Resume</label>
                <div className="flex-1 border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center p-xl hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer group min-h-[300px]">
                  <UploadCloud className="w-10 h-10 text-outline mb-sm group-hover:text-primary transition-colors" />
                  <span className="font-body-md text-body-md text-on-surface-variant text-center mb-base">Drag and drop your resume here</span>
                  <span className="font-body-sm text-body-sm text-outline text-center mb-md">Supports PDF, DOCX, TXT</span>
                  <button className="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded-md hover:bg-surface-variant transition-colors">
                    Browse Files
                  </button>
                </div>
              </div>

              {/* Job Description Input */}
              <div className="flex flex-col gap-sm h-full">
                <label className="font-label-md text-label-md text-on-surface">2. Job Description</label>
                <div className="flex-1 flex flex-col">
                  <textarea 
                    className="w-full h-full min-h-[300px] border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary resize-none p-md font-body-sm text-body-sm text-on-surface" 
                    placeholder="Paste the full job description here..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-md pt-lg border-t border-surface-variant">
              <button 
                onClick={() => navigate('/result')}
                className="bg-primary text-on-primary font-label-md text-label-md px-xl py-3 rounded-md hover:bg-[#3f38b8] transition-colors shadow-sm flex items-center gap-sm"
              >
                <ScanSearch className="w-5 h-5" />
                Analyze Fit
              </button>
            </div>
          </div>
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

export default Analyze;
