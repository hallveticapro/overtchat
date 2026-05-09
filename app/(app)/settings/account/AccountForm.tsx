"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

export function AccountForm({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      setStatus("idle");
      setError(error.message ?? "Failed to change password");
      return;
    }
    setStatus("ok");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="max-w-xl space-y-8">
      <header>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="text-foreground">{email}</span>.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Change password</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Signs you out of all other sessions.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Hidden username anchor so password managers associate this
              credential with the signed-in account. */}
          <input
            type="email"
            name="email"
            autoComplete="username"
            defaultValue={email}
            readOnly
            hidden
          />
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">New password</Label>
            <Input
              id="new"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Saving…" : "Change password"}
            </Button>
            {status === "ok" && (
              <span className="text-sm text-ring">Password updated</span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
