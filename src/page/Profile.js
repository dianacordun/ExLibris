import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreateProfile from '../components/profile/CreateProfile';
import { useSelector, useDispatch } from 'react-redux';
import ProfileManager from '../components/profile/ProfileManager';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { setProfileDetails } from '../features/user/profileDetailsSlice';
import { Spinner, Modal, Button } from 'react-bootstrap';
import { onIdTokenChanged  } from 'firebase/auth';


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
            const totalTimeReading = profileData.totalTimeReading;
            const totalPagesRead = profileData.totalPagesRead;

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
            return [ picture, firstName, lastName, totalTimeReading, totalPagesRead];
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
  const [totalTimeReading, setTotalTimeReading] = useState(0);
  const [totalPagesRead, setTotalPagesRead] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const user = useSelector((state) => state.user.value);
  console.log(user);
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
          const [pictureFetched, firstNameFetched, lastNameFetched, timeFetched, pagesFetched] = profileData;
          setPicture(pictureFetched);
          setFirstName(firstNameFetched);
          setLastName(lastNameFetched);
          setTotalTimeReading(timeFetched);
          setTotalPagesRead(pagesFetched);

          dispatch(setProfileDetails({firstName: firstName, lastName: lastName, totalTimeReading: totalTimeReading, totalPagesRead: totalPagesRead}));
        }
      }
      setLoading(false);
    };

    try {
      onIdTokenChanged(auth, (user) => {
        if (user) {
          setEmailVerified(user.emailVerified);
        }
      });
    } catch (error) {
      console.log('Error fetching user:', error);
    }
    fetchData();
  }, [existingProfile, userId, dispatch, firstName, lastName, totalPagesRead, totalTimeReading, user.emailVerified]);


  const handleCloseModal = () => {
    setShowModal(false);
    window.location.reload();
  }

  // Check if email is verified, if not, display modal
  if (!emailVerified) {
    return (
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Email Verification Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please verify your email before configuring your profile. Check your inbox for the verification email.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
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