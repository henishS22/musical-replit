const roles = [...Array(24)].map((_, index) => ({
  id: index,
  roleName: 'Judith Walker',
  createdBy: 'Adam Giral',
  creationDate: '15/07/2021',
  actions: ['delete', 'edit'],
}));

export default roles;
