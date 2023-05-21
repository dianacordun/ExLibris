import Layout from "../components/Layout";
import SignIn from '../components/user/SignIn';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { setExistingProfile } from '../features/user/profileSlice';
import Dashboard from "../components/books/Dashboard";


const checkProfileExists = async (userId) => {
 
    const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
    const profileSnapshot = await getDocs(profileQuery);
    
    return !profileSnapshot.empty;
};

const Home = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.value);
    const userId = user?.id;
    const isSignedIn = !!user ;
    console.log(user);

    useEffect(() => {
        if(isSignedIn){
            const checkIfExists = async () => {
                const exists = await checkProfileExists(userId);
                if (exists){
                    // Add to state & local storage
                    dispatch(setExistingProfile(true));
                    localStorage.setItem('profileExists', 'true');
                    };
                }
            
                checkIfExists();
        }else{
            dispatch(setExistingProfile(false));
            localStorage.removeItem('profileExists');
        }
      }, [userId, dispatch, isSignedIn]);

   
    return(
        <div>
            {isSignedIn ? (
                <Layout title='ExLibris | Home' content='Home Page'>
                    <Dashboard userId = {userId}/>
                </Layout>
                ) : (
                <SignIn/>
            )}
        </div>
    )
}
 
export default Home;