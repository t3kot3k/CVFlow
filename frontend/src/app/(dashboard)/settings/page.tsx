"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useCredits } from "@/contexts/credits-context";
import {
  userApi,
  creditsApi,
  subscriptionApi,
  type CreditTransaction,
  type CreditPackId,
} from "@/lib/api/client";

const CREDIT_PACKS: {
  id: CreditPackId;
  credits: number;
  price: string;
  perCredit: string;
}[] = [
  { id: "pack_5", credits: 5, price: "$4.99", perCredit: "$1.00" },
  { id: "pack_15", credits: 15, price: "$12.99", perCredit: "$0.87" },
  { id: "pack_40", credits: 40, price: "$29.99", perCredit: "$0.75" },
];

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const { credits, isPremium, refreshBalance } = useCredits();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    setDisplayName(profile?.displayName || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    creditsApi.getHistory(20, 0).then((res) => {
      setTransactions(res.transactions);
    }).catch(() => {});
  }, [user, credits]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ display_name: displayName });
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handlePurchaseCredits = async (packId: CreditPackId) => {
    setPurchasing(true);
    try {
      const response = await creditsApi.purchase(
        packId,
        `${window.location.origin}/dashboard/settings?credits=success`,
        window.location.href
      );
      window.location.href = response.checkout_url;
    } catch {
      setPurchasing(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const response = await subscriptionApi.createCheckout(
        `${window.location.origin}/dashboard/settings?subscription=success`,
        window.location.href
      );
      window.location.href = response.checkout_url;
    } catch {
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingPortal(true);
    try {
      const response = await subscriptionApi.createPortal(window.location.href);
      window.location.href = response.portal_url;
    } catch {
      setManagingPortal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await userApi.deleteAccount();
      await signOut();
    } catch {
      setDeleting(false);
    }
  };

  const getInitials = () => {
    if (profile?.displayName) {
      return profile.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                  {getInitials()}
                </div>
              )}
              <div>
                <p className="font-semibold">{profile?.displayName || "User"}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Button onClick={handleSaveProfile} disabled={saving} isLoading={saving}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card id="subscription">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription plan.</CardDescription>
              </div>
              <Badge variant={isPremium ? "success" : "secondary"}>
                {isPremium ? "Pro Plan" : "Free Plan"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-semibold">Recruit AI Pro</p>
                    <p className="text-sm text-gray-500">$19/month</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    disabled={managingPortal}
                    isLoading={managingPortal}
                  >
                    Manage
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Included with Pro:
                  </p>
                  <ul className="space-y-1">
                    {[
                      "Unlimited CV optimization & downloads",
                      "Unlimited cover letter generation",
                      "Unlimited CV email sending",
                      "AI headshots still use credits (2 per generation)",
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm">
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="border-2 border-primary rounded-xl p-6 text-center space-y-3">
                <h4 className="font-bold text-lg">Upgrade to Recruit AI Pro</h4>
                <p className="text-3xl font-black">
                  $19<span className="text-base font-normal text-gray-400">/month</span>
                </p>
                <p className="text-sm text-gray-500">
                  Unlimited CV generation, cover letters, downloads, and email sending.
                </p>
                <Button
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  isLoading={subscribing}
                >
                  Subscribe to Pro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Packs */}
        <Card id="credits">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Credits</CardTitle>
                <CardDescription>
                  Buy credits for AI-powered actions. Credits never expire.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  token
                </span>
                <span className="text-xl font-black">{credits}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {CREDIT_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handlePurchaseCredits(pack.id)}
                  disabled={purchasing}
                  className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-colors text-center space-y-1.5 disabled:opacity-50"
                >
                  <p className="text-3xl font-black">{pack.credits}</p>
                  <p className="text-xs text-gray-500">credits</p>
                  <p className="text-sm font-bold text-primary">{pack.price}</p>
                  <p className="text-[10px] text-gray-400">{pack.perCredit}/credit</p>
                </button>
              ))}
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-3">Transaction History</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Credits</th>
                        <th className="px-4 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-2.5 font-medium">{tx.description}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={
                                tx.credits_delta > 0
                                  ? "text-green-600 font-semibold"
                                  : tx.credits_delta < 0
                                  ? "text-red-500 font-semibold"
                                  : "text-gray-400"
                              }
                            >
                              {tx.credits_delta > 0 ? "+" : ""}
                              {tx.credits_delta}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400">
                            {formatDate(tx.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleting}
                isLoading={deleting}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
