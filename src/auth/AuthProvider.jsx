import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider, firebaseReady } from '../firebase.js';
import { ensureUser } from '../data/users.js';

const AuthContext = createContext({ user: null, loading: true, signIn: () => {}, signOut: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try { await ensureUser(u); } catch (e) { console.error('ensureUser', e); }
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('signIn', e);
      throw e;
    }
  };

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
