import React, { useEffect } from 'react'
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../features/user/userSlice';
import { useDispatch } from 'react-redux';
import { setExistingProfile } from '../features/user/profileSlice';


export const SignOut = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    useEffect(() => {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("Signed out successfully");
            
            // Set user state to null and delete from local storage
            dispatch(setUser(null));
            dispatch(setExistingProfile(null));
            localStorage.removeItem('user');
            localStorage.removeItem('profileExists');
            
        }).catch((error) => {
            // An error happened.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });
        navigate("/");
        
      }, [dispatch, navigate]); // Empty dependency array ensures the effect runs only once on component mount
    
    
    return (
        <></>
        )
}
