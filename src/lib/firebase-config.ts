// Simple user management without complex authentication
import { SimpleUser, getCurrentUser } from './auth-checker';

// Define the User type to match our simple user interface
export type User = SimpleUser;

// Simple auth object
export const auth = {
  currentUser: null as User | null,

  // Get the current user
  getCurrentUser: () => {
    if (!auth.currentUser) {
      auth.currentUser = getCurrentUser();
    }
    return auth.currentUser;
  },

  // Sign out function (just resets to a new random user)
  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vice_notes_user');

      // Create a new random user
      const newUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 10),
        name: 'New User'
      };

      auth.currentUser = newUser;
      localStorage.setItem('vice_notes_user', JSON.stringify(newUser));

      // Trigger auth change listeners
      authChangeListeners.forEach(listener => listener(newUser));
    }
    return Promise.resolve();
  }
};

// Store for auth change listeners
const authChangeListeners: Array<(user: User | null) => void> = [];

// Function to mimic Firebase's onAuthStateChanged but with our simple user system
export function onAuthStateChanged(
  auth: typeof auth,
  callback: (user: User | null) => void
) {
  // Add the callback to our listeners
  authChangeListeners.push(callback);

  // Get the current user
  const user = getCurrentUser();
  auth.currentUser = user;

  // Call the callback with the current user
  setTimeout(() => {
    callback(user);
  }, 0);

  // Return an unsubscribe function
  return () => {
    const index = authChangeListeners.indexOf(callback);
    if (index > -1) {
      authChangeListeners.splice(index, 1);
    }
  };
}
