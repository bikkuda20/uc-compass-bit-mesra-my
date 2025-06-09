import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileOperations = () => {
  const { toast } = useToast();

  const getCleanFilePath = (filePath: string) => {
    // Handle the doubled path issue: uc-files/uc-files/filename.pdf
    let cleanPath = filePath;
    
    // If the path starts with uc-files/, remove it
    if (cleanPath.startsWith('uc-files/')) {
      cleanPath = cleanPath.replace('uc-files/', '');
    }
    
    // If after cleaning, it still starts with uc-files/, it means we had a doubled path
    // In this case, keep the uc-files/ prefix for the actual storage path
    if (cleanPath.startsWith('uc-files/')) {
      // This is the correct format for storage access
      console.log('Original path:', filePath, 'Clean path for storage:', cleanPath);
      return cleanPath;
    }
    
    // If we don't have uc-files/ prefix after cleaning, add it back
    cleanPath = `uc-files/${cleanPath}`;
    console.log('Original path:', filePath, 'Clean path for storage:', cleanPath);
    return cleanPath;
  };

  const checkFileExists = async (filePath: string) => {
    try {
      console.log('Checking file existence for path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Checking for clean path:', cleanPath);
      
      // List all files in the bucket to debug
      const { data: allFiles, error: listError } = await supabase.storage
        .from('uc-files')
        .list('', {
          limit: 100
        });
      
      console.log('All files in bucket:', allFiles);
      
      if (listError) {
        console.error('Error listing files:', listError);
        return false;
      }
      
      // Check if the file exists in the list - compare against the full path including uc-files/
      const fileExists = allFiles && allFiles.some(file => {
        const fullPath = `uc-files/${file.name}`;
        console.log('Comparing:', fullPath, 'with:', cleanPath);
        return fullPath === cleanPath || file.name === cleanPath;
      });
      
      console.log('File exists check result:', fileExists);
      
      return fileExists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      console.log('Downloading file with path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean download path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: `The file "${cleanPath}" does not exist in storage. Please check if the file was uploaded correctly.`,
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .download(cleanPath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'uc-file.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: `Unable to download file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const previewFile = async (filePath: string) => {
    try {
      console.log('Previewing file with path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean preview path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: `The file "${cleanPath}" does not exist in storage. Please check if the file was uploaded correctly.`,
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(cleanPath, 300);

      if (error) {
        console.error('Preview error:', error);
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast({
          title: "Success",
          description: "File opened for preview",
        });
      } else {
        throw new Error('No signed URL returned');
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      toast({
        title: "Preview Failed",
        description: `Unable to preview file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const printFile = async (filePath: string) => {
    try {
      console.log('Printing file with path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean print path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: `The file "${cleanPath}" does not exist in storage. Please check if the file was uploaded correctly.`,
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(cleanPath, 300);

      if (error) {
        console.error('Print error:', error);
        throw error;
      }

      if (data?.signedUrl) {
        const printWindow = window.open(data.signedUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        toast({
          title: "Success",
          description: "File sent to printer",
        });
      } else {
        throw new Error('No signed URL returned');
      }
    } catch (error: any) {
      console.error('Print failed:', error);
      toast({
        title: "Print Failed",
        description: `Unable to print file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return {
    downloadFile,
    previewFile,
    printFile,
    checkFileExists,
  };
};
