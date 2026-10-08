import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getUserLocalStorage } from "../../auth/auth";

const serverUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/+$/, "");
const fallbackUrl = "http://localhost:5000/api";
const baseUrl = serverUrl ? `${serverUrl}/api` : fallbackUrl;

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getUserLocalStorage();

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "mylostItems",
    "myFoundItems",
    "users",
    "adminData",
    "testimonials",
    "services",
    "faqs",
    "recentActivity",
    "foundItems",
    "claims",
    "categories",
  ],

  endpoints: () => ({}),
});