/**
 * Auth Service Integration
 * 
 * This file provides functions for interacting with the external auth service.
 */

// Base URL for the auth service API
const API_BASE_URL = 'https://vice-auth.vercel.app/api';

/**
 * Exchange an ID token for a custom token
 * @param {string} idToken - The Firebase ID token
 * @returns {Promise<string>} - The custom token
 */
export async function exchangeIdTokenForCustomToken(idToken: string): Promise<string> {
  try {
    console.log('Exchanging ID token for custom token...');
    
    const response = await fetch(`${API_BASE_URL}/create-custom-token.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.customToken;
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
}

/**
 * Logout a user by revoking their refresh tokens
 * @param {string} idToken - The Firebase ID token
 * @returns {Promise<Object>} - The response from the server
 */
export async function logoutUser(idToken: string): Promise<any> {
  try {
    console.log('Logging out user...');
    
    const response = await fetch(`${API_BASE_URL}/logout.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Logout failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/**
 * Delete a user account
 * @param {string} idToken - The Firebase ID token
 * @returns {Promise<Object>} - The response from the server
 */
export async function deleteUserAccount(idToken: string): Promise<any> {
  try {
    console.log('Deleting user account...');
    
    const response = await fetch(`${API_BASE_URL}/delete-account.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Account deletion failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}
