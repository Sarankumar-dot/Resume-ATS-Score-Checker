// Google Login Button — uses @react-oauth/google

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

function GoogleLoginButton({ onError }) {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  );
}

export default GoogleLoginButton;
