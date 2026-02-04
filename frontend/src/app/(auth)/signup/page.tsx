"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getFirebaseErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact support.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/cancelled-popup-request":
        return "Only one sign-in window can be open at a time.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.fullName);
      router.push("/pricing");
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrors({ general: getFirebaseErrorMessage(error) });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof FirebaseError) {
        setErrors({ general: getFirebaseErrorMessage(error) });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center">
      {/* Signup Card */}
      <div className="w-full bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 p-8 md:p-10">
        {/* Headline & Body Text */}
        <div className="text-center mb-8">
          <h1 className="text-[#0e121b] dark:text-white tracking-tight text-3xl font-bold leading-tight mb-3">
            Create Your Account
          </h1>
          <p className="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-relaxed">
            Join Recruit AI and accelerate your career with AI-driven tools.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Name Field */}
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            error={errors.fullName}
            icon={
              <span className="material-symbols-outlined text-xl">person</span>
            }
          />

          {/* Email Field */}
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            icon={
              <span className="material-symbols-outlined text-xl">mail</span>
            }
          />

          {/* Password Field */}
          <div>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              icon={
                <span className="material-symbols-outlined text-xl">lock</span>
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              }
            />
            {!errors.password && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Must be at least 8 characters with one number
              </p>
            )}
          </div>

          {/* Signup Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-14"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#e7ebf3] dark:bg-gray-800" />
          <span className="text-xs text-[#4d6599] dark:text-gray-500">or</span>
          <div className="flex-1 h-px bg-[#e7ebf3] dark:bg-gray-800" />
        </div>

        {/* Google Sign In */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            className="w-full h-14"
            size="lg"
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Terms Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#4d6599] dark:text-gray-500 leading-normal">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Bottom Login Link (Mobile) */}
      <div className="mt-8 text-center sm:hidden">
        <p className="text-sm text-[#4d6599] dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
