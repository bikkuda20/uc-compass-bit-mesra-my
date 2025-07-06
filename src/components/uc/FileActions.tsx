
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

interface FileActionsProps {
  entry: any;
  onPreview: (filePath: string) => void;
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
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex justify-center gap-3 w-full py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleClick(e, () => onPreview(entry.uc_file_path))}
        disabled={!entry.uc_file_path}
        title="Preview File"
        className="hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 p-3 min-w-10 h-10 shadow-sm hover:shadow-md border border-blue-200/50"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleClick(e, () => onDownload(entry.uc_file_path, entry.uc_file_name))}
        disabled={!entry.uc_file_path}
        title="Download File"
        className="hover:bg-green-100 hover:text-green-700 transition-all duration-200 p-3 min-w-10 h-10 shadow-sm hover:shadow-md border border-green-200/50"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleClick(e, () => onEdit(entry.id))}
        title="Edit Entry"
        className="hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 p-3 min-w-10 h-10 shadow-sm hover:shadow-md border border-orange-200/50"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => handleClick(e, () => onPrint(entry.uc_file_path))}
        disabled={!entry.uc_file_path}
        title="Print File"
        className="hover:bg-purple-100 hover:text-purple-700 transition-all duration-200 p-3 min-w-10 h-10 shadow-sm hover:shadow-md border border-purple-200/50"
      >
        <Printer className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-100 transition-all duration-200 p-3 min-w-10 h-10 shadow-sm hover:shadow-md border border-red-200/50" 
            title="Delete Entry"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white border shadow-2xl z-[9999] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete UC File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the UC file for project "{entry.project_code}"? 
              This action cannot be undone and will permanently remove the file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(entry.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
