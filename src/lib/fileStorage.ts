
// File storage utilities for UC and Sanction Letter files
// Supports both local storage and cloud storage (Supabase)

export interface FileUploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export class FileStorage {
  private static isCloudMode = process.env.NODE_ENV === 'production';
  
  /**
   * Generate a unique filename for UC or Sanction Letter
   */
  static generateFileName(
    type: 'uc' | 'sanction',
    piName: string,
    projectCode: string,
    financialYear: string,
    originalFileName: string
  ): string {
    const cleanPiName = piName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const cleanProjectCode = projectCode.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const cleanYear = financialYear.replace('-', '_');
    const extension = originalFileName.split('.').pop();
    
    const timestamp = Date.now();
    
    return `${type}_${cleanPiName}_${cleanProjectCode}_${cleanYear}_${timestamp}.${extension}`;
  }
  
  /**
   * Upload file to storage (local or cloud)
   */
  static async uploadFile(
    file: File,
    fileName: string,
    directory: 'uc_files' | 'sanction_letters'
  ): Promise<FileUploadResult> {
    if (this.isCloudMode) {
      return this.uploadToCloud(file, fileName, directory);
    } else {
      return this.uploadToLocal(file, fileName, directory);
    }
  }
  
  /**
   * Upload to local storage (development)
   */
  private static async uploadToLocal(
    file: File,
    fileName: string,
    directory: string
  ): Promise<FileUploadResult> {
    // In a real implementation, this would save to a local directory
    // For now, we'll simulate the upload
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fileName,
          filePath: `/uploads/${directory}/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
        });
      }, 1000);
    });
  }
  
  /**
   * Upload to cloud storage (Supabase)
   */
  private static async uploadToCloud(
    file: File,
    fileName: string,
    directory: string
  ): Promise<FileUploadResult> {
    // Implementation would use Supabase storage client
    // Example:
    // const { data, error } = await supabase.storage
    //   .from('uc-files')
    //   .upload(`${directory}/${fileName}`, file);
    
    throw new Error("Cloud storage not implemented - requires Supabase configuration");
  }
  
  /**
   * Download file from storage
   */
  static async downloadFile(filePath: string): Promise<Blob> {
    if (this.isCloudMode) {
      return this.downloadFromCloud(filePath);
    } else {
      return this.downloadFromLocal(filePath);
    }
  }
  
  private static async downloadFromLocal(filePath: string): Promise<Blob> {
    // Implementation for local file download
    throw new Error("Local file download not implemented");
  }
  
  private static async downloadFromCloud(filePath: string): Promise<Blob> {
    // Implementation for cloud file download
    throw new Error("Cloud file download not implemented");
  }
  
  /**
   * Delete file from storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    if (this.isCloudMode) {
      return this.deleteFromCloud(filePath);
    } else {
      return this.deleteFromLocal(filePath);
    }
  }
  
  private static async deleteFromLocal(filePath: string): Promise<void> {
    // Implementation for local file deletion
    console.log(`Would delete local file: ${filePath}`);
  }
  
  private static async deleteFromCloud(filePath: string): Promise<void> {
    // Implementation for cloud file deletion
    throw new Error("Cloud file deletion not implemented");
  }
  
  /**
   * Get file URL for download
   */
  static getFileUrl(filePath: string): string {
    if (this.isCloudMode) {
      // Return Supabase public URL
      return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/uc-files/${filePath}`;
    } else {
      // Return local server URL
      return `http://localhost:3000${filePath}`;
    }
  }
}
