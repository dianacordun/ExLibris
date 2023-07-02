import Layout from "../components/Layout";
import SignIn from '../components/user/SignIn';
import AdminInterface from './AdminInterface';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { setExistingProfile } from '../features/user/profileSlice';
import Dashboard from "../components/books/Dashboard";
import { setProfileDetails } from "../features/user/profileDetailsSlice";


const checkProfileExists = async (userId) => {
 
    const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
    const profileSnapshot = await getDocs(profileQuery);
    return profileSnapshot;
};

const Home = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.user.value);
    const userId = user?.id;
    const isSignedIn = !!user ;
    const isAdmin = localStorage.getItem('admin');

    useEffect(() => {
        if(isSignedIn){
            const checkIfExists = async () => {
                const pSnapshot = await checkProfileExists(userId);
                if (!pSnapshot.empty) {
                    // Set profile details
                    pSnapshot.forEach((doc) => {
                        dispatch(setProfileDetails({firstName: doc.data().first_name, lastName: doc.data().last_name, totalTimeReading: doc.data().totalTimeReading, totalPagesRead: doc.data().totalPagesRead}));
                      });
                    // Add to state & local storage
                    dispatch(setExistingProfile(true));
                    localStorage.setItem('profileExists', 'true');  
                    }
                }
            
            checkIfExists();
        }else{
            dispatch(setExistingProfile(false));
            dispatch(setProfileDetails(null));
            localStorage.removeItem('profileExists');
            localStorage.removeItem('admin');
        }
      }, [userId, dispatch, isSignedIn]);

   
    return(
        <div>
            {isSignedIn ? (
                    <>
                    {isAdmin ? (
                        <AdminInterface/>
                    ) : (
                        <Layout title='ExLibris | Home' content='Home Page'>
                            <Dashboard userId = {userId}/>
                        </Layout>
                        )}
                    </>
                ) : (
                <SignIn/>
            )}
        </div>
    )
}
 
export default Home;