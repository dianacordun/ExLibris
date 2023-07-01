import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import EditProfile  from './EditProfile';
import ViewProfile from './ViewProfile';
import ErrorPopup from '../popups/ErrorPopup';
import { db, storage, auth } from '../../firebase';
import { collection, query, where, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject, getDownloadURL} from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileDetails } from '../../features/user/profileDetailsSlice';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { setExistingProfile } from '../../features/user/profileSlice';
import { setUser } from '../../features/user/userSlice';
import { Pie } from 'react-chartjs-2';

const ProfileManager = ({ picture }) => {
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const firstName = useSelector(state => state.profileDetails.value.firstName);
    const lastName = useSelector(state => state.profileDetails.value.lastName);
    const totalPagesRead = useSelector(state => state.profileDetails.value.totalPagesRead);
    const totalTimeReading = useSelector(state => state.profileDetails.value.totalTimeReading);
    const user = useSelector((state) => state.user.value);
    // eslint-disable-next-line
    const userId = user?.id; 

    const [isEditing, setIsEditing] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [hasBooks, setHasBooks] = useState(false);
    const [popupMessage, setPopupMessage] = useState('Something went wrong!'); 
    const imageSize = {
      width: '200px',
      height: '200px', 
      objectFit: 'cover', 
    };  
    const [bookData, setBookData] = useState([]);
    
    useEffect(() => {
      // Fetch books data for the user from Firebase
      const fetchBooks = async () => {
        try {
          const books = await getBooksByUserId(userId);
          const data = generateBookData(books);
          setBookData(data);
        } catch (error) {
          console.log(error);
        }
      };
  
      fetchBooks();
    }, [userId]);

    const generateBookData = (books) => {
      // Iterate through the books and count the number of books with each status
      const statusCount = books.reduce((count, book) => {
        const status = book.status;
        count[status] = (count[status] || 0) + 1;
        return count;
      }, {});
  
      // Convert the status count object into an array for the chart data
      const data = Object.keys(statusCount).map((status) => {
        return {
          label: status,
          data: statusCount[status],
        };
      });
  
      return data;
    };
    
    const getBooksByUserId = async (userId) => {
      const booksRef = collection(db, 'book');
      const booksQuery = query(booksRef, where('userId', '==', userId));
    
      const snapshot = await getDocs(booksQuery);
      const books = snapshot.docs.map((doc) => doc.data());
      console.log(books);
      if (books.length > 0) {
        setHasBooks(true);
      }
      console.log(books);
      return books;
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

        dispatch(setProfileDetails({firstName: firstName, lastName: lastName, totalPagesRead: totalPagesRead, totalTimeReading:totalTimeReading}));
  
        console.log('Profile updated successfully');
      } else {
        console.log('Profile not found');
      }

    
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    
      // Set isEditing back to false after saving
      setIsEditing(false);
      window.location.reload();
    };

    const handleDelete = async (userId) => {
      try {
        // Reauthenticate the user before proceeding with the deletion
        const user = auth.currentUser;
        const isGoogleUser = user && user.providerData.some((userInfo) => userInfo.providerId === 'google.com');
        const isFacebookUser = user && user.providerData.some((userInfo) => userInfo.providerId === 'facebook.com');
        
        if (!isGoogleUser && !isFacebookUser){           // Simple user
          const credential = promptUserForCredentials(); 
          try {
            await reauthenticateWithCredential(user, credential);
          } catch (error) {
              if (error.code === 'auth/user-mismatch') {
                console.error('User mismatch');
                setPopupMessage('User mismatch! Please make sure you are using the correct account.');
              }else if (error.code === 'auth/invalid-email') {
                console.error('Invalid email');
                setPopupMessage('Please provide a valid email address.');
              }else if (error.code === 'auth/wrong-password' || error.code === 'auth/missing-password') {
                console.error('Wrong Password');
                setPopupMessage('Please provide the correct password for your account.');
              }
              setShowPopup(true);
              return;
          }
        } else {
            const provider = isGoogleUser ? new GoogleAuthProvider() : new FacebookAuthProvider();
          
            try {
              await reauthenticateWithPopup(user, provider);
            } catch (error) {
              if (error.code === 'auth/user-mismatch') {
                console.error('User mismatch');
                setPopupMessage('User mismatch! Please make sure you are using the correct account.');
                setShowPopup(true);
                return;
              }
              console.error('Failed to reauthenticate with Google/Facebook', error);
            }
        }

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
    
          for (const bookDoc of booksSnapshot.docs) {
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

            // For each book, delete its sessions
            const sessionsQuery = query(collection(db, 'sessions'), where('bookId', '==', bookDoc.id));
            const sessionsSnapshot = await getDocs(sessionsQuery);

            if (!sessionsSnapshot.empty) {
                sessionsSnapshot.forEach((sessionDoc) => {
                    const sessionRef = doc(db, 'sessions', sessionDoc.id);
                    const deleteSession = deleteDoc(sessionRef);
                    storageTasks.push(deleteSession);
                });

                console.log('Sessions deleted successfully');
            } else {
                  console.log('No sessions found');
            }    
        };
    
          // Wait for all storage tasks to complete
          await Promise.all(storageTasks);
    
          console.log('Books and cover images deleted successfully');
        } else {
          console.log('No books found');
        }
    
        dispatch(setProfileDetails(null));
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
    
    const data = {
      labels: ['Not Started', 'Currently Reading', 'Read'],
      datasets: [
        {
          data: bookData.map((dataPoint) => dataPoint.data),
          backgroundColor: ['rgba(59, 93, 248, 0.57)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(155, 0, 237, 0.57)',
                           ],
        },
      ],
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
        <Container>
        <div className="row">
          <div className="col-md-6">
            <ViewProfile
              picture={picture}
              firstName={firstName}
              lastName={lastName}
              imageSize={imageSize}
              totalPagesRead={totalPagesRead}
              totalTimeReading={totalTimeReading}
            />
          </div>
          <div className="col-md-6 ">
              <div style={{ width: '80%', height: '80%', position: 'relative'  }}>
              {hasBooks &&  
                <>
                  <Pie data={data} />
                  <div className="arrow">
                    <i className="bi bi-arrow-90deg-up "></i>
                    <span className='arrow-text'>Your Books</span>
                  </div>
                </>
              }
              </div>
          </div>
          <div style={{ position: 'fixed', bottom: '0', left: '47%', padding: '10px' }}>
            <Button style={{ width: '130px' }} onClick={handleEditClick}>
              Edit Profile
            </Button>
          </div>

        </div>
      </Container>
        
      )}
      <ErrorPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        message={popupMessage}
      />
    </>
    );
};

export default ProfileManager;