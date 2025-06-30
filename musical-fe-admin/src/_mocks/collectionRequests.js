const collectionRequests = [...Array(24)].map((_, index) => ({
  id: index,
  userName: 'Andrew Quron',
  email: 'andrewquron@gmail.com',
  colectionName: 'Harry Potter',
  actions: 'delete',
}));

export default collectionRequests;
