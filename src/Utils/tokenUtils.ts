/**
 * Check if a JWT token is expired
 * @param token JWT token
 * @returns Boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Get the expiration time
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if the token has an expiration time
    if (!payload.exp) {
      console.warn('Token does not have an expiration time');
      return false;
    }
    
    // Convert exp to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime > expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If there's an error parsing the token, consider it expired
    return true;
  }
};
