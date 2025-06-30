const collectibles = [...Array(24)].map((_, index) => ({
  id: index,
  owner: '@username',
  creator: '@hazardous',
  tokenId: '12.12.32...',
  collectibleName: 'Stephen Curry Chase Center',
  collection: 'NBA 2021',
  saleType: 'Auction',
  listedDate: '15/07/021',
  actions: 'view',
}));

export default collectibles;
