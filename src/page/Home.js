import React from 'react';
import { signOut } from "firebase/auth";
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import SignIn from '../components/SignIn';


const Home = () => {
    const navigate = useNavigate();
    const isSignedIn = true;

    // const handleLogout = () => {               
    //     signOut(auth).then(() => {
    //     // Sign-out successful.
    //         navigate("/");
    //         console.log("Signed out successfully")
    //     }).catch((error) => {
    //     // An error happened.
    //     });
    // }
   
    return(
        <div>
            {isSignedIn ? (
                <Layout title='ExLibris | Home' content='Home Page'>
                <p>Welcome, Diana!</p>
                </Layout>
                ) : (
                <SignIn/>
            )}
        </div>
    )
}
 
export default Home;