import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">ResumeFit</h1>
      <p className="text-lg text-gray-600 mb-8">
        Know if your resume passes the ATS — and how to fix it if it doesn't.
      </p>
      <Link
        to="/signup"
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}

export default Landing;
