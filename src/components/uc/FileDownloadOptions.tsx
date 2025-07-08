import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Download, FileText } from "lucide-react";

interface FileDownloadOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onDownload: (filePath: string, fileName: string) => void;
}

export const FileDownloadOptions = ({
  isOpen,
  onClose,
  entry,
  onDownload,
}: FileDownloadOptionsProps) => {
  const handleDownload = (filePath: string, fileName: string) => {
    onDownload(filePath, fileName);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border shadow-2xl max-w-md z-[100]">
        <AlertDialogHeader>
          <AlertDialogTitle>Choose File to Download</AlertDialogTitle>
          <AlertDialogDescription>
            Select which file you want to download for project "{entry?.project_code}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          {entry?.uc_file_path && entry?.uc_file_name && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDownload(entry.uc_file_path, entry.uc_file_name)}
            >
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              <span>UC File - {entry.uc_file_name}</span>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
          )}
          
          {entry?.sanction_letter_file_path && entry?.sanction_letter_file_name && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleDownload(entry.sanction_letter_file_path, entry.sanction_letter_file_name)}
            >
              <FileText className="h-4 w-4 mr-2 text-green-600" />
              <span>Sanction Letter - {entry.sanction_letter_file_name}</span>
              <Download className="h-4 w-4 ml-auto" />
            </Button>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};