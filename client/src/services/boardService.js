import api from './api';

const boardService = {
  getBoards: async () => {
    const response = await api.get('/boards');
    return response.data;
  },

  getBoardById: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  createBoard: async (boardData) => {
    const response = await api.post('/boards', boardData);
    return response.data;
  },

  updateBoard: async (id, boardData) => {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data;
  },

  deleteBoard: async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
  },
};

export default boardService;
