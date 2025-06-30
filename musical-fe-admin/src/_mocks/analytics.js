const analytics = [...Array(24)].map((_, index) => ({
  id: index,
  tokenId: '5555555',
  editionNumber: '5555555',
  sender: 'User1',
  reciever: 'User2',
  date: '15/07/021',
  price: 500,
  gasFee: 100,
  actions: 'delete',
}));

export default analytics;
