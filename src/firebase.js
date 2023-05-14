// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASsOykv5S-cfCIPgYwE_1rv5LSmi1SBl0",
  authDomain: "licenta-953e1.firebaseapp.com",
  projectId: "licenta-953e1",
  storageBucket: "licenta-953e1.appspot.com",
  messagingSenderId: "187204895892",
  appId: "1:187204895892:web:d272f8f0585ec3a5686081"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
