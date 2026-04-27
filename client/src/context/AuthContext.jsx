import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext — stores the decoded JWT payload and raw token string.
 *
 * Shape:
 *   user           — decoded JWT payload (or null)
 *   token          — raw JWT string (or null)
 *   isAuthenticated — boolean derived from user !== null
 *   login(token)   — persist token, decode payload, update state
 *   logout()       — clear localStorage and reset state
 */
export const AuthContext = createContext(null);

/**
 * Decode the JWT payload without a library.
 * Returns the parsed payload object, or null if decoding fails.
 */
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/**
 * AuthProvider wraps the application and manages authentication state.
 * On mount it restores a valid session from localStorage if one exists.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return;

    const payload = decodeToken(stored);

    if (payload && payload.exp > Date.now() / 1000) {
      // Token is still valid — restore state
      setUser(payload);
      setToken(stored);
    } else {
      // Token is expired or malformed — clear storage
      localStorage.removeItem('token');
    }
  }, []);

  /**
   * Store the token in localStorage, decode its payload, and update state.
   * @param {string} rawToken — the JWT string returned by the API
   */
  function login(rawToken) {
    const payload = decodeToken(rawToken);
    localStorage.setItem('token', rawToken);
    setToken(rawToken);
    setUser(payload);
  }

  /**
   * Clear the session from localStorage and reset state to unauthenticated.
   */
  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Throws if called outside of an AuthProvider tree.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
