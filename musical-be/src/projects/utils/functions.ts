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

export const getArtworkImageName = ({
  id,
  extension,
}: {
  id: string;
  extension: string;
}) => {
  // return `${id}.${extension}`;
  return `${id}_artwork`;
};

export const getCoverImageName = ({
  id,
  extension,
}: {
  id: string;
  extension: string;
}) => {
  // return `${id}_cover_image.${extension}`;
  return `${id}_cover_image`;
};
