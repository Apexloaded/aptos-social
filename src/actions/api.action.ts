"use server";

import axios from "axios";
import { API_URL } from "@/config/constants";

const API = API_URL;

export async function getApi(url: string) {
  const apiUrl = `${API}/${url}`;
  return axios.get(apiUrl).then((res) => res.data);
}

export const postApi = async (url: string, data: any) => {
  const apiUrl = `${API}/${url}`;
  const payload = data;
  return axios.post(apiUrl, payload).then((res) => res.data);
};
