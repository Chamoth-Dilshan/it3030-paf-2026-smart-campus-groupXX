import API, { createUser, loginUser, registerUser } from '../../../services/api';

const authService = {
  login: loginUser,
  register: registerUser,
  createUser,
  getUsers: () => API.get('/users'),
  getUserById: (id) => API.get(`/users/${id}`),
  updateUserRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  deactivateUser: (id) => API.put(`/users/${id}/deactivate`),
  deleteUser: (id) => API.delete(`/users/${id}`)
};

export default authService;
