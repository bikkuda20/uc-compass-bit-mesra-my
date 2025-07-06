
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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, () => onPreview(entry.uc_file_path))}
        disabled={!entry.uc_file_path}
        title="Preview File"
        className="h-8 w-8 p-0 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, () => onDownload(entry.uc_file_path, entry.uc_file_name))}
        disabled={!entry.uc_file_path}
        title="Download File"
        className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
      >
        <Download className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, () => onEdit(entry.id))}
        title="Edit Entry"
        className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => handleClick(e, () => onPrint(entry.uc_file_path))}
        disabled={!entry.uc_file_path}
        title="Print File"
        className="h-8 w-8 p-0 border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
      >
        <Printer className="h-4 w-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300" 
            title="Delete Entry"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white border shadow-2xl max-w-md">
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
