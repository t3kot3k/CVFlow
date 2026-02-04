"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
  });

  return (
    <>
      {/* Page Heading */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                AR
              </div>
              <Button variant="secondary" size="sm">
                Change Avatar
              </Button>
            </div>
            <Input
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan.
                </CardDescription>
              </div>
              <Badge variant="success">Pro Plan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">Premium Pro</p>
                <p className="text-sm text-gray-500">$19/month • Renews on March 15, 2026</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <p>
                <span className="font-medium text-gray-700 dark:text-gray-300">Features included:</span>
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Unlimited CV Analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  Unlimited Cover Letters
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  10 AI Photo Enhancements/month
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary">
              <span className="material-symbols-outlined text-sm">lock</span>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="font-semibold text-red-600">Delete Account</p>
                <p className="text-sm text-red-500">
                  Permanently delete your account and all data.
                </p>
              </div>
              <Button variant="danger" size="sm">
                Delete
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-semibold">Export Data</p>
                <p className="text-sm text-gray-500">
                  Download all your data (GDPR compliance).
                </p>
              </div>
              <Button variant="outline" size="sm">
                <span className="material-symbols-outlined text-sm">download</span>
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
