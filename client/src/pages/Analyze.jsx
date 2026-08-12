import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UploadCloud, ScanSearch, FileText, X, CheckCircle2, AlertCircle, Loader2, XCircle, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { api } from "../lib/api";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Analyze() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Structure analysis state ────────────────────────────────────────────────
  const [structureLoading, setStructureLoading] = useState(false);
  const [structureResult, setStructureResult] = useState(null);
  const [structureError, setStructureError] = useState(null);

  // ── JD matching state ───────────────────────────────────────────────────────
  const [jdText, setJdText] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState(null);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Client-side validation ──────────────────────────────────────────────────
  function validateFile(f) {
    if (!f) return "No file selected.";
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(f.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
      return "Only PDF and DOCX files are accepted.";
    }
    if (f.size > MAX_BYTES) return `File too large — maximum size is 5 MB (got ${formatBytes(f.size)}).`;
    return null;
  }

  // ── Upload to server ────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (f) => {
    const validationError = validateFile(f);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setFile(f);
    setUploading(true);
    setUploadError(null);
    setResumeId(null);
    setParsedPreview(null);
    setWordCount(null);
    setStructureResult(null);
    setStructureError(null);

    try {
      const formData = new FormData();
      formData.append("resume", f);

      const data = await api.postFormData("/resumes/upload", formData);
      const { resume } = data;

      setResumeId(resume.id);
      const words = resume.parsed_text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
      // First ~400 chars as a preview snippet
      setParsedPreview(
        resume.parsed_text.length > 400
          ? resume.parsed_text.slice(0, 400).trimEnd() + "…"
          : resume.parsed_text
      );
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  // ── Auto-trigger structure check after upload ───────────────────────────────
  useEffect(() => {
    if (!resumeId) return;

    let cancelled = false;
    async function runStructureCheck() {
      setStructureLoading(true);
      setStructureError(null);
      try {
        const result = await api.post(`/analysis/${resumeId}/structure`);
        if (!cancelled) setStructureResult(result);
      } catch (err) {
        if (!cancelled) setStructureError(err.message || "Structure analysis failed.");
      } finally {
        if (!cancelled) setStructureLoading(false);
      }
    }

    runStructureCheck();
    return () => { cancelled = true; };
  }, [resumeId]);

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) uploadFile(dropped);
    },
    [uploadFile]
  );

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  // ── File input change ───────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) uploadFile(selected);
    // Reset so the same file can be re-selected after an error
    e.target.value = "";
  };

  // ── Reset to re-upload ──────────────────────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setUploading(false);
    setUploadError(null);
    setResumeId(null);
    setParsedPreview(null);
    setWordCount(null);
    setStructureResult(null);
    setStructureError(null);
    setJdText("");
    setMatchError(null);
  };

  // ── Derived state ───────────────────────────────────────────────────────────
  const uploadSucceeded = !!resumeId;

  // ── Section checklist helpers ───────────────────────────────────────────────
  const sectionOrder = ["contact", "summary", "skills", "experience", "education", "projects"];

  function sectionFoundCount() {
    if (!structureResult?.sections) return 0;
    return Object.values(structureResult.sections).filter(s => s.found).length;
  }

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-screen w-full relative">
        <div className="flex-1 w-full max-w-max-width mx-auto px-4 md:px-lg pt-12 md:pt-16 pb-xl flex flex-col items-center justify-start">
          <div className="text-center mb-xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Analyze Resume Fit</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Compare your resume against a specific job description to identify keyword gaps, formatting issues, and ATS optimization opportunities.
            </p>
          </div>

          {/* Card */}
          <div className="w-full max-w-5xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg md:p-xl flex flex-col gap-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

              {/* ── Dropzone / Preview ─────────────────────────────────── */}
              <div className="flex flex-col gap-sm h-full">
                <label className="font-label-md text-label-md text-on-surface">1. Upload Resume</label>

                {/* Uploading skeleton */}
                {uploading && (
                  <div className="flex-1 border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center p-xl bg-surface-container-low min-h-[300px] gap-md">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="font-body-md text-body-md text-on-surface-variant">Parsing {file?.name}…</p>
                  </div>
                )}

                {/* Success preview */}
                {!uploading && uploadSucceeded && (
                  <div className="flex-1 border-2 border-tertiary rounded-lg flex flex-col p-lg bg-surface-container-low min-h-[300px] gap-md relative">
                    {/* Re-upload button */}
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-high"
                      title="Remove and re-upload"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* File info row */}
                    <div className="flex items-start gap-sm">
                      <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate">{file?.name}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {formatBytes(file?.size)} · {wordCount?.toLocaleString()} words extracted
                        </p>
                      </div>
                    </div>

                    {/* Text preview */}
                    <div className="flex-1 bg-surface rounded-lg border border-outline-variant p-md overflow-hidden">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide mb-xs">Text Preview</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed line-clamp-[10]">
                        {parsedPreview}
                      </p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {!uploading && uploadError && (
                  <div className="mb-2 flex items-start gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm border border-error">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-body-sm text-body-sm">{uploadError}</p>
                  </div>
                )}

                {/* Dropzone (shown when no file yet, or after error) */}
                {!uploading && !uploadSucceeded && (
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-xl transition-all cursor-pointer group min-h-[300px] ${
                      isDragOver
                        ? "border-primary bg-surface-container-low"
                        : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className={`w-10 h-10 mb-sm transition-colors ${isDragOver ? "text-primary" : "text-outline group-hover:text-primary"}`} />
                    <span className="font-body-md text-body-md text-on-surface-variant text-center mb-base">
                      Drag and drop your resume here
                    </span>
                    <span className="font-body-sm text-body-sm text-outline text-center mb-md">
                      PDF or DOCX · max 5 MB
                    </span>
                    <button
                      type="button"
                      className="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded-md hover:bg-surface-variant transition-colors"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Browse Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              {/* ── Job Description ─────────────────────────────────────── */}
              <div className="flex flex-col gap-sm h-full">
                <label className="font-label-md text-label-md text-on-surface">2. Job Description</label>
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full h-full min-h-[300px] border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary resize-none p-md font-body-sm text-body-sm text-on-surface"
                    placeholder="Paste the full job description here…"
                  />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {jdText.length < 50 && jdText.length > 0
                    ? `${50 - jdText.length} more characters needed (min 50)`
                    : "Paste a job description to analyze keyword match"}
                </p>
              </div>
            </div>

            {/* ── Structure Analysis Results (inline) ────────────────────── */}
            {(structureLoading || structureResult || structureError) && (
              <div className="border-t border-outline-variant pt-lg flex flex-col gap-lg">
                {/* Loading */}
                {structureLoading && (
                  <div className="flex items-center gap-md justify-center py-lg">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="font-body-md text-body-md text-on-surface-variant">Analyzing resume structure…</span>
                  </div>
                )}

                {/* Error */}
                {structureError && !structureLoading && (
                  <div className="flex items-start gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm border border-error">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-body-sm text-body-sm">{structureError}</p>
                  </div>
                )}

                {/* Results */}
                {structureResult && !structureLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">

                    {/* ── Section Checklist ───────────────────────────────── */}
                    <div className="bg-surface rounded-xl border border-outline-variant p-lg">
                      <div className="flex items-center gap-sm mb-md">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <h3 className="font-headline-sm text-headline-sm">Section Detection</h3>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
                        {sectionFoundCount()} of {sectionOrder.length} standard sections detected
                      </p>
                      <ul className="space-y-2">
                        {sectionOrder.map((key) => {
                          const section = structureResult.sections[key];
                          if (!section) return null;
                          return (
                            <li key={key} className="flex items-start gap-sm">
                              {section.found ? (
                                <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <span className={`font-label-md text-label-md ${section.found ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                  {section.label}
                                </span>
                                {section.found && section.snippet && (
                                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate" style={{ maxWidth: '320px' }}>
                                    {section.snippet}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* ── ATS Formatting Warnings ─────────────────────────── */}
                    <div className="bg-surface rounded-xl border border-outline-variant p-lg">
                      <div className="flex items-center gap-sm mb-md">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                        <h3 className="font-headline-sm text-headline-sm">ATS Compatibility</h3>
                      </div>

                      {structureResult.atsIssues.length === 0 ? (
                        <div className="flex items-center gap-sm py-md">
                          <CheckCircle2 className="w-5 h-5 text-tertiary" />
                          <p className="font-body-md text-body-md text-on-surface">
                            No formatting issues detected — looking good!
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {structureResult.atsIssues.map((issue, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-sm rounded-lg px-md py-sm border ${
                                issue.severity === 'warning'
                                  ? 'bg-error-container/30 border-error/30'
                                  : 'bg-secondary-container/30 border-outline-variant'
                              }`}
                            >
                              {issue.severity === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                              ) : (
                                <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                              )}
                              <div className="min-w-0">
                                <p className={`font-label-md text-label-md ${
                                  issue.severity === 'warning' ? 'text-error' : 'text-on-surface'
                                }`}>
                                  {issue.issue}
                                </p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                                  {issue.detail}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Action ──────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-sm mt-md pt-lg border-t border-surface-variant">
              {matchError && (
                <div className="flex items-start gap-sm bg-error-container text-on-error-container rounded-lg p-md border border-error/50 mb-sm max-w-md w-full">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-left w-full">
                    <p className="font-label-md text-label-md font-bold mb-xs">Analysis failed</p>
                    <p className="font-body-sm text-body-sm opacity-90">{matchError}</p>
                  </div>
                </div>
              )}
              <button
                disabled={!uploadSucceeded || jdText.trim().length < 50 || matching}
                onClick={async () => {
                  setMatching(true);
                  setMatchError(null);
                  try {
                    const data = await api.post(`/analysis/${resumeId}/match`, { jdText });
                    navigate(`/analysis/${data.analysis.id}`);
                  } catch (err) {
                    setMatchError(err.message || "Analysis failed. Please try again.");
                  } finally {
                    setMatching(false);
                  }
                }}
                className={`font-label-md text-label-md px-xl py-3 rounded-md shadow-sm flex items-center gap-sm transition-colors ${
                  uploadSucceeded && jdText.trim().length >= 50 && !matching
                    ? "bg-primary text-on-primary hover:bg-[#3f38b8] cursor-pointer"
                    : "bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60"
                }`}
                title={
                  !uploadSucceeded
                    ? "Upload a resume first"
                    : jdText.trim().length < 50
                    ? "Job description must be at least 50 characters"
                    : "Analyze keyword match"
                }
              >
                {matching ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing…</>
                ) : (
                  <><ScanSearch className="w-5 h-5" /> Analyze Fit</>
                )}
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default Analyze;
