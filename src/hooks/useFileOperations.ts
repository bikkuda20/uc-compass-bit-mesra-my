
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileOperations = () => {
  const { toast } = useToast();

  const getCleanFilePath = (filePath: string) => {
    if (filePath.startsWith('uc-files/')) {
      return filePath.replace('uc-files/', '');
    }
    return filePath;
  };

  const checkFileExists = async (filePath: string) => {
    try {
      console.log('Checking file existence for path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean path:', cleanPath);
      
      const { data, error } = await supabase.storage
        .from('uc-files')
        .list('', {
          search: cleanPath
        });
      
      console.log('File existence check result:', { data, error, cleanPath });
      
      if (error) {
        console.error('Storage error during file check:', error);
        return false;
      }
      
      const fileExists = data && data.some(file => file.name === cleanPath);
      console.log('File exists:', fileExists);
      
      return fileExists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      console.log('Downloading file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean download path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
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
      console.log('Previewing file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean preview path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
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
      console.log('Printing file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
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
