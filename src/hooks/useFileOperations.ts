import { useToast } from "@/hooks/use-toast";

export const useFileOperations = () => {
  const { toast } = useToast();

  // This hook is now deprecated - file operations are handled directly in components
  // Keeping minimal structure for backward compatibility
  
  const downloadFile = async (filePath: string, fileName: string) => {
    toast({
      title: "Info",
      description: "File operations are now handled directly in the component",
    });
  };

  const previewFile = async (filePath: string) => {
    toast({
      title: "Info", 
      description: "File operations are now handled directly in the component",
    });
  };

  const printFile = async (filePath: string) => {
    toast({
      title: "Info",
      description: "File operations are now handled directly in the component", 
    });
  };

  return {
    downloadFile,
    previewFile,
    printFile,
  };
};
