import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSqnHIW8mt30p9clf2Zkl55opxCLw_kq4",
  authDomain: "hostelx-3415e.firebaseapp.com",
  projectId: "hostelx-3415e",
  storageBucket: "hostelx-3415e.firebasestorage.app",
  messagingSenderId: "994797763433",
  appId: "1:994797763433:web:f7bef5fa7a87f59df21bf8",
  measurementId: "G-GDPPGJWW0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
