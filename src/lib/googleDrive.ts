import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive Integration Library
 * Untuk upload dan manage file PDF di Google Drive
 */

// Initialize Google Drive API
const getGoogleDriveClient = () => {
  // Menggunakan Service Account untuk authentication
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    : null;

  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured in environment variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

/**
 * Upload file ke Google Drive
 * @param fileBuffer - Buffer dari file yang akan diupload
 * @param fileName - Nama file
 * @param mimeType - MIME type file (default: application/pdf)
 * @param folderId - ID folder di Google Drive (optional)
 * @returns Object dengan fileId dan webViewLink
 */
export async function uploadToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = 'application/pdf',
  folderId?: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
  try {
    const drive = getGoogleDriveClient();

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const fileMetadata: any = {
      name: fileName,
      mimeType: mimeType,
    };

    // Jika ada folder ID, set sebagai parent
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    // Upload file
    // Tambahkan supportsAllDrives untuk Shared Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true, // Support untuk Shared Drive
    });

    const fileId = response.data.id!;
    
    // Set file permission to anyone with link can view
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true, // Support untuk Shared Drive
    });

    return {
      fileId: fileId,
      webViewLink: response.data.webViewLink || '',
      webContentLink: response.data.webContentLink || '',
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error(`Failed to upload to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download file dari Google Drive
 * @param fileId - ID file di Google Drive
 * @returns Buffer dari file
 */
export async function downloadFromGoogleDrive(fileId: string): Promise<Buffer> {
  try {
    const drive = getGoogleDriveClient();

    const response = await drive.files.get(
      { fileId: fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw new Error(`Failed to download from Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file dari Google Drive
 * @param fileId - ID file di Google Drive
 */
export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  try {
    const drive = getGoogleDriveClient();
    await drive.files.delete({ fileId: fileId, supportsAllDrives: true });
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    throw new Error(`Failed to delete from Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file metadata dari Google Drive
 * @param fileId - ID file di Google Drive
 */
export async function getFileMetadata(fileId: string) {
  try {
    const drive = getGoogleDriveClient();
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, createdTime, modifiedTime',
      supportsAllDrives: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create folder di Google Drive
 * @param folderName - Nama folder
 * @param parentFolderId - ID parent folder (optional)
 */
export async function createFolder(folderName: string, parentFolderId?: string): Promise<string> {
  try {
    const drive = getGoogleDriveClient();

    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
      supportsAllDrives: true,
    });

    return response.data.id!;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
