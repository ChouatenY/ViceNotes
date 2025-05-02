"use client";

// Simple user management without complex authentication
export type SimpleUser = {
  id: string;
  name: string;
  email?: string;
};

// Get the current user from localStorage or create a default one
export function getCurrentUser(): SimpleUser {
  if (typeof window === 'undefined') {
    return { id: 'default-user', name: 'Default User' };
  }

  try {
    // Check if we have a user ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');

    if (userIdFromUrl) {
      console.log('Found user ID in URL:', userIdFromUrl);

      // Create a user object
      const user: SimpleUser = {
        id: userIdFromUrl,
        name: `User ${userIdFromUrl.substring(0, 5)}`,
        email: `user-${userIdFromUrl.substring(0, 5)}@example.com`
      };

      // Save to localStorage for future visits
      localStorage.setItem('vice_notes_user', JSON.stringify(user));

      // Remove the userId from the URL
      const newUrl = window.location.pathname +
                    (window.location.search ?
                      window.location.search.replace(/[?&]userId=[^&]+/, '') : '');
      window.history.replaceState({}, document.title, newUrl);

      return user;
    }

    // Check if we have a saved user
    const savedUser = localStorage.getItem('vice_notes_user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }

    // If no saved user, create a default one with a random ID
    const defaultUser: SimpleUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 10),
      name: 'Default User'
    };

    // Save to localStorage for future visits
    localStorage.setItem('vice_notes_user', JSON.stringify(defaultUser));

    return defaultUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return { id: 'default-user', name: 'Default User' };
  }
}

// Set the current user
export function setCurrentUser(user: SimpleUser): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('vice_notes_user', JSON.stringify(user));
    console.log('User set:', user);
  } catch (error) {
    console.error('Error setting user:', error);
  }
}
