"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const getFirebaseErrorMessage = (error: FirebaseError): string => {
    switch (error.code) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setError(getFirebaseErrorMessage(error));
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[480px] flex flex-col items-center">
        <div className="w-full bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 p-8 md:p-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">
                mark_email_read
              </span>
            </div>
            <h1 className="text-[#0e121b] dark:text-white tracking-tight text-3xl font-bold leading-tight mb-3">
              Check Your Email
            </h1>
            <p className="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-relaxed mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full h-14" size="lg">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] flex flex-col items-center">
      <div className="w-full bg-white dark:bg-[#1a2131] rounded-xl shadow-sm border border-[#e7ebf3] dark:border-gray-800 p-8 md:p-10">
        {/* Headline & Body Text */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">
              lock_reset
            </span>
          </div>
          <h1 className="text-[#0e121b] dark:text-white tracking-tight text-3xl font-bold leading-tight mb-3">
            Reset Password
          </h1>
          <p className="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-relaxed">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Email Field */}
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={
              <span className="material-symbols-outlined text-xl">mail</span>
            }
          />

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-14"
              size="lg"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </div>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
