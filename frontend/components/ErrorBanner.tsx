"use client";

// Generic inline error display used across the app - kept real, no
// app-specific logic to withhold.

import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger/10 px-3.5 py-3 text-sm text-red-200 animate-fade-in-up">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
      <span>{message}</span>
    </div>
  );
}
