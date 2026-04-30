import API from '../../../services/api';

const notificationService = {
  getNotifications: () => API.get('/notifications'),
  getUnreadNotifications: () => API.get('/notifications/unread'),
  getUnreadCount: () => API.get('/notifications/count'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`)
};

export default notificationService;
