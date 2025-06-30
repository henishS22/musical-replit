const viewCollectible = [...Array(24)].map((_, index) => ({
  id: index,
  bidderName: '@username',
  bidAmount: '$2300',
  bidStatus: (index % 2 === 0) ? 'Highest Bidder' : 'Pending',
  paymentMethod: 'Credit Card',
  actions: 'delete',
}));

export default viewCollectible;
