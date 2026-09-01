"use client";

// Generic modal shell used by PlaylistModal and TransferModal - kept real,
// there's no app-specific logic here to withhold.

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="hud-frame w-full max-w-sm rounded-2xl border border-edge2 bg-surface p-6 shadow-2xl shadow-black/50 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
