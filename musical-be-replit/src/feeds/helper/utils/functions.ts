export const getArtworkImageName = ({
  id,
  extension,
}: {
  id: string;
  extension: string;
}) => {
  return `${id}.${extension}`;
};
