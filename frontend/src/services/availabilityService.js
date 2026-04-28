import API from './api';

const availabilityService = {
  getAvailability: async (resourceId, date) => {
    try {
      const response = await API.get('/bookings/availability', {
        params: { resourceId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }
};

export default availabilityService;
