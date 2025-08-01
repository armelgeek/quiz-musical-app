export const API_ENDPOINTS = {
  endpoint: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
    version: "v1",
  },
  user: {
    rank: "/rank"
  },
  stats: {
    user: "/v1/stats/user"
  },
  quizzes: "/quizzes",
};
