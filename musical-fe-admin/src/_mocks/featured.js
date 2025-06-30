const featured = [...Array(20)].map((_, index) => ({
  id: index,
  status: true,
  collectionName: `Collection ${index + 1}`,
  position: index + 1,
  // actions: 'delete',
}));

export default featured;
