
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileOperations = () => {
  const { toast } = useToast();

  const getCleanFilePath = (filePath: string) => {
    // The files are actually stored as uc-files/uc-files/filename.pdf
    // But the database stores them as uc-files/filename.pdf
    let cleanPath = filePath;
    
    console.log('Input file path:', filePath);
    
    // If the path doesn't start with uc-files/, add it
    if (!cleanPath.startsWith('uc-files/')) {
      cleanPath = `uc-files/${cleanPath}`;
    }
    
    // Since files are actually stored with doubled path, we need uc-files/uc-files/filename
    // But if it already has the doubled path, don't add another prefix
    if (!cleanPath.startsWith('uc-files/uc-files/')) {
      // Replace the first uc-files/ with uc-files/uc-files/
      cleanPath = cleanPath.replace('uc-files/', 'uc-files/uc-files/');
    }
    
    console.log('Final storage path:', cleanPath);
    return cleanPath;
  };

  const checkFileExists = async (filePath: string) => {
    try {
      console.log('Checking file existence for path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Checking for clean path:', cleanPath);
      
      // Try to get the file info directly instead of listing all files
      const { data, error } = await supabase.storage
        .from('uc-files')
        .list('uc-files', {
          limit: 100
        });
      
      console.log('Files in uc-files folder:', data);
      
      if (error) {
        console.error('Error listing files:', error);
        return false;
      }
      
      // Extract just the filename from the clean path
      const fileName = cleanPath.replace('uc-files/uc-files/', '');
      console.log('Looking for filename:', fileName);
      
      // Check if the file exists in the list
      const fileExists = data && data.some(file => {
        console.log('Comparing file:', file.name, 'with:', fileName);
        return file.name === fileName;
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
          description: `The file "${fileName}" does not exist in storage. Please check if the file was uploaded correctly.`,
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
          description: `The file does not exist in storage. Please check if the file was uploaded correctly.`,
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
          description: `The file does not exist in storage. Please check if the file was uploaded correctly.`,
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
