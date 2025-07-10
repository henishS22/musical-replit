/**
 *  @file Utils file for functions definition to be used in project service
 *  @author Rafael Marques Siqueira
 *  @exports mimetypeToFileExtension
 */

//Return the file extension for the passed mimetype
export const mimetypeToFileExtension = (mimetype: string) => {
  switch (mimetype) {
    case 'image/bmp':
      return 'bmp';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
  }
};

export function getCollabArtworkFileName(
  userId: string,
  extension?: string,
): string {
  let name = `${userId}_collab_artwork`;

  // if (extension) {
  //   name = `${name}.${extension}`;
  // }

  return name;
}
