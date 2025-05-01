import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

export const getCustomers = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/customers`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(`${BASE_URL}/customers`, customerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/customers/${id}`,
      customerData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
