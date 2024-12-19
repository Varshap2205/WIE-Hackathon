import { initializeApp } from "firebase/app";
import { createContext, useContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, GithubAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZkY2s-793MtfdaZh4uQy4JGUjT_gKrTk",
    authDomain: "clone-war.firebaseapp.com",
    projectId: "clone-war",
    storageBucket: "clone-war.appspot.com",
    messagingSenderId: "262435848381",
    appId: "1:262435848381:web:db31642338f370067877d4",
    measurementId: "G-WQ8KBD5WRZ"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const isLoggedIn = !!user;

    // Create User Function
    const createUser = async (data, who) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userData = who === "user"
                ? {
                    uid: user.uid,
                    email: user.email,
                    name: data.name || "",
                    photoURL: user.photoURL || "",
                    createdAt: new Date(),
                    roll: false
                }
                : {
                    uid: user.uid,
                    name: data.name || `user${Math.random(0, 100)}`,
                    phone: data.phone,
                    email: user.email,
                    specialization: data.specialization,
                    photoURL: user.photoURL || "",
                    experience: data.experience,
                    barAssociation: data.barAssociation,
                    createdAt: new Date(),
                    roll: true,
                    approval: false
                };

            await setDoc(userDocRef, userData);
        } catch (error) {
            console.log(error);
        }
    };

    // Sign In with Email and Password
    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            return userCredential.user;
        } catch (error) {
            console.log(error);
        }
    };

    // Sign In with Google
    const signInWithGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDocs(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || `user${Math.random(0, 1)}`,
                    photoURL: user.photoURL || "",
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Sign In with GitHub
    const signInWithGitHub = async () => {
        try {
            const userCredential = await signInWithPopup(firebaseAuth, githubProvider);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDocs(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || `user${Math.random(0, 1)}`,
                    photoURL: user.photoURL || "",
                    createdAt: new Date()
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Update Profile
    const updateProfile = async (data, uid) => {
        try {
            const userDocRef = doc(db, "users", uid);
            await setDoc(userDocRef, {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state
            }, { merge: true }); // Only update specified fields
            console.log("Profile updated successfully");
        } catch (error) {
            console.log("Error updating profile:", error);
        }
    };

    // Delete Profile
    const deleteUserDoc = async (uid) => {
        try {
            const userDocRef = doc(db, "users", uid);
            await deleteDoc(userDocRef);
            console.log(`User document with UID ${uid} deleted`);
        } catch (error) {
            console.log("Error deleting user document:", error);
        }
    };

    // Log Out
    const logOut = async () => {
        try {
            await signOut(firebaseAuth);
            console.log("User logged out");
        } catch (error) {
            console.log("Error logging out:", error);
        }
    };

    return (
        <FirebaseContext.Provider value={{
            user,
            isLoggedIn,
            createUser,
            signIn,
            signInWithGoogle,
            signInWithGitHub,
            updateProfile,
            deleteUserDoc,
            logOut
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
};
