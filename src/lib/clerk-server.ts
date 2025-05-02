// Mock Clerk implementation since we've removed authentication
export const clerk = {
  users: {
    getUser: async () => ({
      firstName: "Default",
      lastName: "User",
    }),
  },
};
