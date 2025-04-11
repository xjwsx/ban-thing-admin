import api from ".";

export const getExampleSentences = async (params) =>
  await api.get("/example-sentences", {
    params,
  });

export const createExampleSentence = async (payload) =>
  await api.post("/example-sentences", payload);

export const updateExampleSentence = async (id, payload) =>
  await api.patch(`/example-sentences/${id}`, payload);

export const deleteExampleSentence = async (id) =>
  await api.delete(`/example-sentences/${id}`);
