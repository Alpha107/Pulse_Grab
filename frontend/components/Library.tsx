"use client";

// Downloaded file list: fetches /api/library, lets you select mp3s (video
// rows show no checkbox - only mp3s are ever offered for phone transfer),
// delete files, save them locally, or send the selection to the phone.
// Stubbed here.

export default function Library({
  refreshKey,
  onSendToPhone,
}: {
  refreshKey: number;
  onSendToPhone: (filenames: string[]) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-edge2 py-10 text-center text-sm text-muted">
      [stubbed - see README]
    </div>
  );
}
