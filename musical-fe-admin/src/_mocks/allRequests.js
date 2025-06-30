const allRequests = [...Array(24)].map((_, index) => ({
  id: index,
  name: 'Dark Collection',
  totalItems: 4,
  creationDate: '15/07/021',
  collectionType: index % 2 === 0 ? 'Public' : 'Private',
  actions: 'delete',
}));

export default allRequests;
