const marketPlace = [...Array(24)].map((_, index) => ({
  id: index,
  owner: '@username',
  collectibleName: 'Steph Curry Chase Center 2021',
  saleType: 'Auction',
  actions: 'delete',
}));

export default marketPlace;
