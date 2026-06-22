import api from './api';

const cardService = {
  createCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },

  updateCard: async (id, cardData) => {
    const response = await api.put(`/cards/${id}`, cardData);
    return response.data;
  },

  deleteCard: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },
};

export default cardService;
