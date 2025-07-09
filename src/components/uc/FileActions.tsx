
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, Eye, Edit, Printer } from "lucide-react";
import { FileDownloadOptions } from "./FileDownloadOptions";

interface FileActionsProps {
  entry: any;
  onPreview: (filePath: string, fileName: string) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onEdit: (ucId: string) => void;
  onPrint: (filePath: string) => void;
  onDelete: (ucId: string) => void;
}

export const FileActions = ({
  entry,
  onPreview,
  onDownload,
  onEdit,
  onPrint,
  onDelete,
}: FileActionsProps) => {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex items-center gap-1">
      {/* UC File Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleClick(e, () => onPreview(entry.uc_file_path, entry.uc_file_name))}
          disabled={!entry.uc_file_path}
          title="Preview UC File"
          className="h-8 w-8 p-0 border border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-all duration-200"
        >
          <Eye className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleClick(e, () => setShowDownloadOptions(true))}
          disabled={!entry.uc_file_path && !entry.sanction_letter_file_path}
          title="Download Files"
          className="h-8 w-8 p-0 border border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-400 transition-all duration-200"
        >
          <Download className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleClick(e, () => onPrint(entry.uc_file_path))}
          disabled={!entry.uc_file_path}
          title="Print UC File"
          className="h-8 w-8 p-0 border border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-400 transition-all duration-200"
        >
          <Printer className="h-3 w-3" />
        </Button>
      </div>

      {/* Sanction Letter Actions (if available) */}
      {entry.sanction_letter_file_path && (
        <div className="flex items-center gap-1 border-l pl-1 ml-1 border-gray-200">
          <div className="px-1 py-0.5 rounded bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50">
            <span className="text-xs font-bold text-emerald-700">SL</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleClick(e, () => onPreview(entry.sanction_letter_file_path, entry.sanction_letter_file_name))}
            title="Preview Sanction Letter"
            className="h-7 w-7 p-0 border border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-200"
          >
            <Eye className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleClick(e, () => onDownload(entry.sanction_letter_file_path, entry.sanction_letter_file_name))}
            title="Download Sanction Letter"
            className="h-7 w-7 p-0 border border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 transition-all duration-200"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Edit and Delete Actions */}
      <div className="flex items-center gap-1 border-l pl-1 ml-1 border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleClick(e, () => onEdit(entry.id))}
          title="Edit Entry"
          className="h-8 w-8 p-0 border border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-400 transition-all duration-200"
        >
          <Edit className="h-3 w-3" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200" 
              title="Delete Entry"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white border shadow-2xl max-w-md z-[100]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete UC Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the UC entry for project "{entry.project_code}"? 
                This action cannot be undone and will permanently remove all associated files from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  console.log('Delete confirmed for UC:', entry.id);
                  try {
                    onDelete(entry.id);
                    console.log('Delete function called successfully');
                  } catch (error) {
                    console.error('Error calling delete function:', error);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Download Options Modal */}
      <FileDownloadOptions
        isOpen={showDownloadOptions}
        onClose={() => setShowDownloadOptions(false)}
        entry={entry}
        onDownload={onDownload}
      />
    </div>
  );
};
