
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useFileOperations = () => {
  const { toast } = useToast();

  const getStoragePath = (filePath: string) => {
    console.log('Input file path:', filePath);
    
    if (!filePath) {
      console.error('No file path provided');
      return '';
    }
    
    // Remove any leading 'uc-files/' prefix if it exists since bucket name is separate
    let cleanPath = filePath;
    if (cleanPath.startsWith('uc-files/')) {
      cleanPath = cleanPath.replace('uc-files/', '');
    }
    
    // Handle paths that might start with '/'
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    console.log('Clean storage path:', cleanPath);
    return cleanPath;
  };

  const testStorageConnection = async () => {
    try {
      console.log('Testing storage connection...');
      const { data, error } = await supabase.storage.listBuckets();
      console.log('Available buckets:', data);
      if (error) {
        console.error('Storage connection error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Storage test failed:', error);
      return false;
    }
  };

  const listFilesInBucket = async () => {
    try {
      console.log('Listing files in uc-files bucket...');
      const { data, error } = await supabase.storage
        .from('uc-files')
        .list('', { limit: 100 });
      
      console.log('Files in bucket:', data);
      if (error) {
        console.error('Error listing files:', error);
      }
      return data;
    } catch (error) {
      console.error('Failed to list files:', error);
      return null;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      console.log('=== DOWNLOAD DEBUG START ===');
      console.log('Downloading file with path:', filePath);
      console.log('File name:', fileName);
      
      if (!filePath) {
        toast({
          title: "Download Failed",
          description: "No file path provided",
          variant: "destructive",
        });
        return;
      }

      // Test storage connection first
      const connectionOk = await testStorageConnection();
      if (!connectionOk) {
        toast({
          title: "Download Failed",
          description: "Storage connection failed",
          variant: "destructive",
        });
        return;
      }

      // List files to see what's available
      await listFilesInBucket();
      
      const storagePath = getStoragePath(filePath);
      console.log('Storage download path:', storagePath);
      
      if (!storagePath) {
        toast({
          title: "Download Failed",
          description: "Invalid file path",
          variant: "destructive",
        });
        return;
      }
      
      // Try downloading with the original path first, then with cleaned path
      let downloadResponse = await supabase.storage
        .from('uc-files')
        .download(filePath);

      console.log('First download attempt with original path:', downloadResponse);

      // If first attempt fails, try with cleaned path
      if (downloadResponse.error) {
        console.log('First attempt failed, trying with cleaned path:', storagePath);
        downloadResponse = await supabase.storage
          .from('uc-files')
          .download(storagePath);
        console.log('Second download attempt with cleaned path:', downloadResponse);
      }

      const { data, error } = downloadResponse;

      if (error) {
        console.error('Download error details:', error);
        toast({
          title: "Download Failed",
          description: `Error: ${error.message}. Tried paths: ${filePath} and ${storagePath}`,
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

      console.log('=== DOWNLOAD DEBUG END ===');
      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      console.error('Download failed with exception:', error);
      toast({
        title: "Download Failed",
        description: `Exception: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const previewFile = async (filePath: string) => {
    try {
      console.log('=== PREVIEW DEBUG START ===');
      console.log('Previewing file with path:', filePath);
      
      if (!filePath) {
        toast({
          title: "Preview Failed",
          description: "No file path provided",
          variant: "destructive",
        });
        return;
      }

      // Test storage connection first
      const connectionOk = await testStorageConnection();
      if (!connectionOk) {
        toast({
          title: "Preview Failed",
          description: "Storage connection failed",
          variant: "destructive",
        });
        return;
      }

      // List files to see what's available
      await listFilesInBucket();
      
      const storagePath = getStoragePath(filePath);
      console.log('Storage preview path:', storagePath);
      
      // Try creating signed URL with original path first, then with cleaned path
      let signedUrlResponse = await supabase.storage
        .from('uc-files')
        .createSignedUrl(filePath, 3600);

      console.log('First signed URL attempt with original path:', signedUrlResponse);

      // If first attempt fails, try with cleaned path
      if (signedUrlResponse.error) {
        console.log('First attempt failed, trying with cleaned path:', storagePath);
        signedUrlResponse = await supabase.storage
          .from('uc-files')
          .createSignedUrl(storagePath, 3600);
        console.log('Second signed URL attempt with cleaned path:', signedUrlResponse);
      }

      const { data, error } = signedUrlResponse;

      if (error) {
        console.error('Preview error details:', error);
        toast({
          title: "Preview Failed",
          description: `Error: ${error.message}. Tried paths: ${filePath} and ${storagePath}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.signedUrl) {
        console.log('Opening signed URL:', data.signedUrl);
        window.open(data.signedUrl, '_blank');
        toast({
          title: "Success",
          description: "File opened for preview",
        });
      } else {
        console.error('No signed URL received');
        toast({
          title: "Preview Failed",
          description: "Unable to generate preview URL",
          variant: "destructive",
        });
      }
      console.log('=== PREVIEW DEBUG END ===');
    } catch (error: any) {
      console.error('Preview failed with exception:', error);
      toast({
        title: "Preview Failed",
        description: `Exception: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const printFile = async (filePath: string) => {
    try {
      console.log('=== PRINT DEBUG START ===');
      console.log('Printing file with path:', filePath);
      
      if (!filePath) {
        toast({
          title: "Print Failed",
          description: "No file path provided",
          variant: "destructive",
        });
        return;
      }

      // Try creating signed URL with original path first, then with cleaned path
      let signedUrlResponse = await supabase.storage
        .from('uc-files')
        .createSignedUrl(filePath, 3600);

      // If first attempt fails, try with cleaned path
      if (signedUrlResponse.error) {
        const storagePath = getStoragePath(filePath);
        signedUrlResponse = await supabase.storage
          .from('uc-files')
          .createSignedUrl(storagePath, 3600);
      }

      const { data, error } = signedUrlResponse;

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
      console.log('=== PRINT DEBUG END ===');
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
  };
};
