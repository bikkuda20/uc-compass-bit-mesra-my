
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPreview = async () => {
    if (!filePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading preview for:', filePath);
      
      // Try different path variations to find the file
      const pathsToTry = [
        filePath, // Original path
        filePath.replace('uc-files/', ''), // Remove prefix
        `uc-files/${filePath}`, // Add prefix
        `uc-files/${filePath.replace('uc-files/', '')}` // Ensure single prefix
      ];
      
      let signedUrl = null;
      
      for (const path of pathsToTry) {
        console.log('Trying path:', path);
        const { data, error } = await supabase.storage
          .from('uc-files')
          .createSignedUrl(path, 3600);
        
        if (data?.signedUrl && !error) {
          signedUrl = data.signedUrl;
          console.log('Success with path:', path);
          break;
        }
      }
      
      if (signedUrl) {
        setPreviewUrl(signedUrl);
      } else {
        setError('File not found in storage');
      }
    } catch (err: any) {
      console.error('Preview load error:', err);
      setError(err.message || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'file.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download file",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen && filePath) {
      loadPreview();
    }
  }, [isOpen, filePath]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            Preview: {fileName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading preview...
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadPreview} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          
          {previewUrl && !loading && !error && (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0 rounded-lg"
              title={`Preview of ${fileName}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
