const users = [...Array(24)].map((_, index) => ({
  id: index,
  txnHash: '0x00514....6e2',
  status1: 'Completed',
  method: 'Transfer',
  age: '1 min ago',
  from: '@username',
  to: '@username',
  value: '5 ETH',
  txnFee: '0.000256',
  // actions: 'delete',
}));

export default users;
