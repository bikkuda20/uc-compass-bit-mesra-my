import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Loader2 } from "lucide-react";
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
      } catch (err: any) {
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
      <div className="fixed inset-0 z-[1000] bg-white flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Preview: {fileName}</h2>
          <div className="flex gap-2">
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
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
                  toast({ title: "Downloaded", description: "File saved locally." });
                }}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
          {loading && (
            <div className="flex items-center text-gray-600 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading...
            </div>
          )}

          {error && (
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          )}

          {previewUrl && !loading && !error && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-none"
              title={`Preview of ${fileName}`}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};
