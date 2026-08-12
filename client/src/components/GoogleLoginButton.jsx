// Google Login Button — uses @react-oauth/google

import { useState, useRef, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

function GoogleLoginButton({ onError }) {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth, 400);
        setButtonWidth(Math.max(width, 200)); // Google minimum is usually 200
      }
    };

    // Initial calculation and attach listener
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      onError?.(err.message || "Google sign-in failed");
      setIsLoading(false);
    }
  };

  const handleError = () => {
    onError?.("Google sign-in was cancelled or failed");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <button
          disabled
          className="flex w-full justify-center items-center gap-2 rounded-md bg-surface-container-lowest border border-outline-variant px-md font-label-md text-label-md text-on-surface shadow-sm opacity-70 cursor-not-allowed h-[40px]"
        >
          <Loader2 className="w-4 h-4 animate-spin text-outline" />
          Signing in with Google...
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center w-full">
      {/* Only render when we have calculated the width to prevent flickering/re-rendering issues with the iframe */}
      {buttonWidth > 0 && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          width={buttonWidth.toString()}
          text="continue_with"
        />
      )}
    </div>
  );
}

export default GoogleLoginButton;
