import api from "./api";

export const usersAPI = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  updateUser: async (userId, data) => {
    const response = await api.patch(`/users/${userId}`, data);
    return response.data;
  },
};

export default usersAPI;
