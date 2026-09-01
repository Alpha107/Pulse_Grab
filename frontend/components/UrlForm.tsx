"use client";

// URL input + Check button. Real version: controlled input, Enter-to-submit,
// a loading state while /api/analyze is in flight. Stubbed for the public repo.

export default function UrlForm({
  onCheck,
  checking,
}: {
  onCheck: (url: string) => void;
  checking: boolean;
}) {
  return (
    <div className="flex gap-2 opacity-60">
      <div className="flex-1 rounded-xl border border-edge bg-surface px-3 py-3 text-sm text-muted">
        [stubbed - see README]
      </div>
      <button className="rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-muted" disabled>
        Check
      </button>
    </div>
  );
}
