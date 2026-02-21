import { QrCode } from "lucide-react";

interface PhonePreviewProps {
  previewUrl?: string;
  title?: string;
}

export function PhonePreview({
  previewUrl,
  title = "Live Preview",
}: PhonePreviewProps) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-medium text-muted-foreground mb-3">
        {title}
      </p>
      <div className="w-[280px] h-[560px] border-[8px] border-gray-800 rounded-[36px] overflow-hidden bg-white shadow-xl relative">
        {/* Notch */}
        <div className="h-6 w-24 bg-gray-800 rounded-b-xl mx-auto" />

        {/* Content */}
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title="Menu preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium text-foreground">
              No menu published yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a menu to see a live preview
            </p>
          </div>
        )}

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}
