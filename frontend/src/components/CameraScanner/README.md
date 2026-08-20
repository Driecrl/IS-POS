# Camera Scanner UI

## Information

Author:     Drie
Unique ID:  CMP-SCN-001
Scope:      scanner

## Description

Fullscreen camera overlay for scanning a QR/barcode. Calls onScan with
the decoded text, or onClose if the user cancels or camera access fails.

## How to Use

<CameraScanner onScan={(code) => ...} onClose={() => ...} />