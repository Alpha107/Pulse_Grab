"use client";

// "Whole playlist or just this one?" dialog. Real version also surfaces
// AnalyzeResponse.warning (the extraction sanity-check) as a caution banner
// here, before the user commits to downloading a suspicious "playlist".
// Stubbed here.

import Modal from "./Modal";
import type { AnalyzeResponse } from "@/lib/api";

export default function PlaylistModal({
  info,
  onChoose,
  onCancel,
}: {
  info: AnalyzeResponse | null;
  onChoose: (choice: "single" | "all") => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={!!info} onClose={onCancel}>
      <p className="text-sm text-muted">[stubbed - see README]</p>
    </Modal>
  );
}
