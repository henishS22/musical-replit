const users = [...Array(24)].map((_, index) => ({
  id: index,
  status: 'active',
  name: 'Judith Walker',
  role: 'Content Writer',
  email: 'judithwalker@gmail.com',
  // actions: 'delete',
}));

export default users;