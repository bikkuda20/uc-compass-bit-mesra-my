
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileOperations = () => {
  const { toast } = useToast();

  const getStoragePath = (filePath: string) => {
    console.log('Input file path:', filePath);
    
    // Remove any leading 'uc-files/' prefix if it exists since bucket name is separate
    let cleanPath = filePath;
    if (cleanPath.startsWith('uc-files/')) {
      cleanPath = cleanPath.replace('uc-files/', '');
    }
    
    // Remove any additional uc-files prefix that might be doubled
    if (cleanPath.startsWith('uc-files/')) {
      cleanPath = cleanPath.replace('uc-files/', '');
    }
    
    console.log('Clean storage path:', cleanPath);
    return cleanPath;
  };

  const checkFileExists = async (filePath: string) => {
    try {
      console.log('Checking file existence for path:', filePath);
      
      const storagePath = getStoragePath(filePath);
      console.log('Checking storage path:', storagePath);
      
      // Try to get the file info directly
      const { data, error } = await supabase.storage
        .from('uc-files')
        .list('', {
          limit: 1000,
          search: storagePath
        });
      
      if (error) {
        console.error('Error checking file:', error);
        return false;
      }
      
      console.log('Search results:', data);
      
      // Check if the file exists in the results
      const fileExists = data && data.some(file => {
        const fullPath = file.name;
        console.log('Comparing:', fullPath, 'with:', storagePath);
        return fullPath === storagePath || fullPath.endsWith(storagePath);
      });
      
      console.log('File exists:', fileExists);
      return fileExists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      console.log('Downloading file with path:', filePath);
      
      const storagePath = getStoragePath(filePath);
      console.log('Storage download path:', storagePath);
      
      const { data, error } = await supabase.storage
        .from('uc-files')
        .download(storagePath);

      if (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: `File not found: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Download Failed",
          description: "No file data received",
          variant: "destructive",
        });
        return;
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
      
      const storagePath = getStoragePath(filePath);
      console.log('Storage preview path:', storagePath);
      
      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Preview error:', error);
        toast({
          title: "Preview Failed",
          description: `Unable to preview file: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast({
          title: "Success",
          description: "File opened for preview",
        });
      } else {
        toast({
          title: "Preview Failed",
          description: "Unable to generate preview URL",
          variant: "destructive",
        });
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
      
      const storagePath = getStoragePath(filePath);
      console.log('Storage print path:', storagePath);
      
      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Print error:', error);
        toast({
          title: "Print Failed",
          description: `Unable to print file: ${error.message}`,
          variant: "destructive",
        });
        return;
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
        toast({
          title: "Print Failed",
          description: "Unable to generate print URL",
          variant: "destructive",
        });
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
