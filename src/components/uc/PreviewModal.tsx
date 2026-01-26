import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  fileName: string;
}

export const PreviewModal = ({
  isOpen,
  onClose,
  filePath,
  fileName,
}: PreviewModalProps) => {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!filePath) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.storage
          .from("uc-files")
          .createSignedUrl(filePath, 3600);

        if (error || !data?.signedUrl) throw error;

        setPreviewUrl(data.signedUrl);
      } catch {
        setError("File preview failed.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) loadPreview();
    else {
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen, filePath]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 flex flex-col bg-gray-50">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-sm font-medium truncate">
              {fileName}
            </span>
          </div>

          <div className="flex gap-2">
            {previewUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const response = await fetch(previewUrl);
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = fileName;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  toast({
                    title: "Downloaded",
                    description: "File saved locally.",
                  });
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-hidden bg-gray-100">

          {loading && (
            <div className="h-full flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading preview...
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center text-red-600 font-medium">
              {error}
            </div>
          )}

          {previewUrl && !loading && !error && (
            <iframe
              src={previewUrl}
              title={`Preview of ${fileName}`}
              className="w-full h-full border-none bg-white"
            />
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
};
