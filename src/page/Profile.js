import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreateProfile from '../components/profile/CreateProfile';
import { useSelector, useDispatch } from 'react-redux';
import ProfileManager from '../components/profile/ProfileManager';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { setProfileDetails } from '../features/user/profileDetailsSlice';

const fetchProfileData = async (userId) => {
    try {
        const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
        const profileSnapshot = await getDocs(profileQuery);

        if (!profileSnapshot.empty) {
            const profileDoc = profileSnapshot.docs[0];
            const profileData = profileDoc.data();

            
            // Access the fields in the profile document
            const firstName = profileData.first_name;
            const lastName = profileData.last_name;

            // Picture might be null
            const storageRef = ref(storage, `profile_pictures/${profileDoc.id}`);
            let picture = '';
            try {
               picture = await getDownloadURL(storageRef);
            } catch (error) {
              if (error.code === 'storage/object-not-found') {
                console.log('Profile picture does not exist');
              } else {
                throw error;
              }
            }

            // Do something with the retrieved profile data
            return [ picture, firstName, lastName ];
        } 
    } catch (error) {
        console.log('Error fetching profile data:', error);
    }
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [picture, setPicture] = useState('');
  const user = useSelector((state) => state.user.value);
  const userId = user?.id;

  const dispatch = useDispatch()

  // Checking to see if profile exists to display the proper page
  const profile = useSelector((state) => state.profile.value);
  const existingProfile = !!profile;

  useEffect(() => {
    const fetchData = async () => {
      if (existingProfile) {
        // Fetch information about existing profile
        const profileData = await fetchProfileData(userId);
        if (profileData) {
          const [pictureFetched, firstNameFetched, lastNameFetched] = profileData;
          setPicture(pictureFetched);
          setFirstName(firstNameFetched);
          setLastName(lastNameFetched);
          dispatch(setProfileDetails({firstName: firstName, lastName: lastName}));
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [existingProfile, userId, dispatch, firstName, lastName]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Layout title='ExLibris | Profile' content='Profile Page'>
      {existingProfile ? (
      <ProfileManager picture={picture}/>
      ) : (
      <CreateProfile userId={userId} />
      )}
    </Layout>
  )
}

export default Profile