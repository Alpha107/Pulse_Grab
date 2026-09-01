"use client";

// QR code + live expiry countdown, shown after "Send to phone". Real
// version renders the base64 QR PNG returned by /api/transfer and ticks a
// countdown down from the 15-minute session TTL. Stubbed here.

import Modal from "./Modal";
import type { TransferResponse } from "@/lib/api";

export default function TransferModal({
  transfer,
  onClose,
}: {
  transfer: TransferResponse | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!transfer} onClose={onClose}>
      <p className="text-sm text-muted">[stubbed - see README]</p>
    </Modal>
  );
}
