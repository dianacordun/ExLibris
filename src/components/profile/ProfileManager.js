import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditProfile  from './EditProfile';
import ViewProfile from './ViewProfile';
import { db, storage } from '../../firebase';
import { collection, query, where, doc, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileDetails } from '../../features/user/profileDetailsSlice';

const ProfileManager = ({picture}) => {
    
    const dispatch = useDispatch()
    const firstName = useSelector(state => state.profileDetails.value.firstName);
    const lastName = useSelector(state => state.profileDetails.value.lastName);

    const [isEditing, setIsEditing] = useState(false);
    const imageSize = {
      width: '200px', // Specify the desired width
      height: '200px', // Specify the desired height
      objectFit: 'cover', // Adjust the image to cover the container
    };

    const handleEditClick = () => {
        setIsEditing(true);
      };
    
    const handleSave = async (userId, firstName, lastName, profilePicFile) => {
      try {

       const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
       const profileSnapshot = await getDocs(profileQuery);

       if (!profileSnapshot.empty) {
        const profileDoc = profileSnapshot.docs[0];
        const profileRef = doc(db, 'profile', profileDoc.id);
        
        // Update the profile document in the profile collection
        await updateDoc(profileRef, {
          first_name: firstName,
          last_name: lastName,
        });

        // Update the profile picture in Firebase Storage
        if (profilePicFile) {
          const storageRef = ref(storage, `profile_pictures/${profileRef.id}`);
          await uploadBytes(storageRef, profilePicFile);
        }

        dispatch(setProfileDetails({firstName: firstName, lastName: lastName}));
  
        console.log('Profile updated successfully');
      } else {
        console.log('Profile not found');
      }

    
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    
      // Set isEditing back to false after saving
      setIsEditing(false);
    };

    return (
        <>
      {isEditing ? (
        <EditProfile
          picture={picture}
          firstName={firstName}
          lastName={lastName}
          onSave={handleSave}
          imageSize={imageSize}
        />
      ) : (
        <ViewProfile
          picture={picture}
          firstName={firstName}
          lastName={lastName}
          imageSize={imageSize}
        />
      )}
      {!isEditing && <Button onClick={handleEditClick}>Edit</Button>}
    </>
    );
};

export default ProfileManager;