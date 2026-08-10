import { useParams } from "react-router-dom";

function AnalysisResult() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Result</h1>
      <p className="text-gray-600">
        Viewing analysis: <span className="font-mono text-indigo-600">{id}</span>
      </p>
      <p className="text-gray-500 mt-2">
        Results view will be implemented in Phase 4.
      </p>
    </div>
  );
}

export default AnalysisResult;
