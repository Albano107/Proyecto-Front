import axios from "./axios";

export const loginConEmail = async (email, password) => {
  const res = await axios.post("/auth/login", { email, password });
  return res.data;
};

export const loginConPin = async (pin) => {
  const res = await axios.post("/auth/login-pin", { pin });
  return res.data;
};