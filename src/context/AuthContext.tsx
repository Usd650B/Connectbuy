"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  userData: UserProfile | null; // Alias for user for backward compatibility
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true, 
  reloadUser: async () => {} 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createUserProfile = async (firebaseUser: FirebaseUser) => {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return { ...userDocSnap.data() as UserProfile, uid: firebaseUser.uid };
      } else {
        // Create a new user profile if it doesn't exist
        const newUserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'New User',
          email: firebaseUser.email || '',
          role: 'buyer' as const,
          bio: 'New to ConnectBuy!',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=random`,
          stats: {
            following: 0,
            followers: 0,
            likes: 0
          },
          createdAt: new Date().toISOString()
        };
        
        await setDoc(userDocRef, newUserProfile);
        return newUserProfile;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userProfile = await createUserProfile(firebaseUser);
          setUser(userProfile);
        } catch (error) {
          console.error("Error creating/fetching user profile:", error);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const reloadUser = async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUser({ ...userDocSnap.data() as UserProfile, uid: auth.currentUser.uid });
      }
    } catch (error) {
      console.error("Error reloading user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData: user, // Alias for backward compatibility
      loading, 
      reloadUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
