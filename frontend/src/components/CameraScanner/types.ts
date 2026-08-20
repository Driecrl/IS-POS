export interface CameraScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}