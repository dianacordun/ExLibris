import {  signInWithPopup, GoogleAuthProvider, FacebookAuthProvider   } from 'firebase/auth';
import { auth } from '../../firebase';

export const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, new GoogleAuthProvider())
          .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            resolve(user);
          })
          .catch((error) => {
            console.log(error.message, error.code);
            reject(error);
          });
      });
}  

export const signInWithFacebook = () => {
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, new FacebookAuthProvider())
          .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            resolve(user);
          })
          .catch((error) => {
            console.log(error.message, error.code);
            reject(error);
          });
      });
  }  
