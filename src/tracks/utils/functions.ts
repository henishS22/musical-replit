/**
 *  @file Utils file for functions definition to be used in library service
 *  @author Rafael Marques Siqueira
 *  @exports AudioFileType
 */

//Return the file extension for the passed mimetype
export function mimetypeToFileExtension(mimetype: string): string {
  switch (mimetype) {
    case 'audio/wave':
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/mpeg':
    case 'audio/mpeg3':
    case 'audio/x-mpeg-3':
      return 'mp3';
    case 'audio/mp4':
    case 'audio/m4a':
    case 'audio/x-m4a':
      return 'm4a';
    case 'video/mp4':
      return 'mp4';
    case 'video/x-msvideo':
      return 'avi';
    case 'application/zip':
      return 'zip';
    case 'application/octet-stream':
      return 'ptx';
    case 'image/bmp':
      return 'bmp';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    default:
      return mimetype.split('/')[1];
  }
};
