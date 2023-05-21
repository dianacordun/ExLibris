import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditProfile  from './EditProfile';
import ViewProfile from './ViewProfile';
import { db, storage, auth } from '../../firebase';
import { collection, query, where, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject, getDownloadURL} from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileDetails } from '../../features/user/profileDetailsSlice';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { setExistingProfile } from '../../features/user/profileSlice';
import { setUser } from '../../features/user/userSlice';

const ProfileManager = ({ picture }) => {
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const firstName = useSelector(state => state.profileDetails.value.firstName);
    const lastName = useSelector(state => state.profileDetails.value.lastName);
    const user = useSelector((state) => state.user.value);
    const userId = user?.id; // eslint-disable-next-line no-unused-vars

    const [isEditing, setIsEditing] = useState(false);
    const imageSize = {
      width: '200px', // Specify the desired width
      height: '200px', // Specify the desired height
      objectFit: 'cover', // Adjust the image to cover the container
    };  

    const promptUserForCredentials = () => {
      const email = window.prompt('Please enter your email');
      const password = window.prompt('Please enter your password');
      // Create the credential object for reauthentication
      const credential = EmailAuthProvider.credential(email, password);
      return credential;
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

    const handleDelete = async (userId) => {
      try {
        // Reauthenticate the user before proceeding with the deletion
        const user = auth.currentUser;
        const credential = promptUserForCredentials(); // Implement your reauthentication prompt logic here

        await reauthenticateWithCredential(user, credential);
        // Delete the user from Firebase Authentication
        await deleteUser(auth.currentUser);

        // Delete the profile document
        const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
        const profileSnapshot = await getDocs(profileQuery);
    
        if (!profileSnapshot.empty) {
          const profileDoc = profileSnapshot.docs[0];
          const profileRef = doc(db, 'profile', profileDoc.id);
    
          // Delete the profile document from the profile collection
          await deleteDoc(profileRef);

          // Delete the profile picture from Firebase Storage if it exists
          const profilePictureRef = `profile_pictures/${profileRef.id}`;
          const storageRef = ref(storage, profilePictureRef);
          try {
            await getDownloadURL(storageRef);
            // File exists, so delete it
            await deleteObject(storageRef);
            console.log('Profile picture deleted successfully');
          } catch (error) {
            if (error.code === 'storage/object-not-found') {
              console.log('Profile picture does not exist');
            } else {
              throw error;
            }
          }
    
          console.log('Profile deleted successfully');
        } else {
          console.log('Profile not found');
        }
    
        // Delete all book entries associated with the userId
        const booksQuery = query(collection(db, 'book'), where('userId', '==', userId));
        const booksSnapshot = await getDocs(booksQuery);
    
        if (!booksSnapshot.empty) {
          // Delete each book document and its cover image
          const storageTasks = [];
    
          booksSnapshot.forEach((bookDoc) => {
            const bookRef = doc(db, 'book', bookDoc.id);
            const coverImageRef = ref(storage, `book_covers/${bookDoc.id}`);
    
            const deleteBook = deleteDoc(bookRef);
            storageTasks.push(deleteBook);
            
            // Delete the cover image if it exists
            const coverImageUrl = bookDoc.data().coverImageUrl;
            if (coverImageUrl) {
              const deleteCoverImage = deleteObject(coverImageRef);
              storageTasks.push(deleteCoverImage);
            }

        });
    
          // Wait for all storage tasks to complete
          await Promise.all(storageTasks);
    
          console.log('Books and cover images deleted successfully');
        } else {
          console.log('No books found');
        }
    
        dispatch(setProfileDetails({ firstName: '', lastName: '' }));
        // Set user state to null and delete from local storage
        dispatch(setUser(null));
        dispatch(setExistingProfile(null));
        localStorage.removeItem('user');
        localStorage.removeItem('profileExists');
    
        console.log('Profile and associated books deleted successfully');

        navigate('/');
      
      } catch (error) {
        console.error('Failed to delete profile and books:', error);
      }
    };

    return (
        <>
      {isEditing ? (
        <EditProfile
          picture={picture}
          firstName={firstName}
          lastName={lastName}
          onSave={handleSave}
          onDelete={handleDelete}
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