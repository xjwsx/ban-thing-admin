import api from ".";

export const createUser = async (payload) => await api.post("/users", payload);

export const getUsers = async (params) =>
  await api.get("/users", {
    params,
  });

export const deleteUser = async (id) => await api.delete(`/users/${id}`);
