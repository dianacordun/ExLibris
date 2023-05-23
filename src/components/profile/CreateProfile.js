import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MDBCard, MDBCardBody, MDBCol, MDBInput, MDBRow, MDBTypography } from 'mdb-react-ui-kit';
import { db, storage } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from 'firebase/storage';
import { setExistingProfile } from '../../features/user/profileSlice';
import { useDispatch } from 'react-redux';
import '../Forms.css';

const CreateProfile = ({ userId }) => {

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [profile_pic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    setShowPopup(true);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        const profileCollection = collection(db, 'profile');
        const newProfileDocRef = await addDoc(profileCollection, { userId, first_name, last_name });
        
        if (profile_pic) {
          const storageRef = ref(storage, `profile_pictures/${newProfileDocRef.id}`);
          const metadata = {
            contentType: profile_pic.type // Set the content type based on the file type
          };
          
          await uploadBytes(storageRef, profile_pic, metadata);
        }

        console.log("PROFILE written with ID: ", newProfileDocRef.id);

        dispatch(setExistingProfile(true));
        localStorage.setItem('profileExists', 'true');
        navigate('/');

    } catch (error) {
        setError('Failed to add profile. Please try again.');
        console.error(error);
    }
};

  return (
    <>
    {/* Popup Modal */}
    <Modal show={showPopup} onHide={handleClosePopup} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Complete your profile to proceed.</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Before you start building your library, you must complete your profile.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePopup}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Rest of the component */}
      <div className="mx-auto mt-5" style={{ maxWidth: '800px', height: '400px' }}>
        <MDBRow className="pt-5 mx-4 justify-content-center">
            <MDBCard className="card-custom pb-4 shadow">
              <MDBCardBody className="mt-0 mx-5">
                <div className="text-center mb-3 pb-2 mt-3">
                  <MDBTypography tag="h4" style={{ color: '#495057' }} >Complete your profile</MDBTypography>
                </div>

                <form className="mb-0" onSubmit={handleSubmit}>
                  {error && <p>{error}</p>}
                  <MDBRow className="mb-4">
                    <MDBCol>
                      <MDBInput label='First name' type='text' required  value={first_name}
                                onChange={(event) => setFirstName(event.target.value)} />
                    </MDBCol>
                    <MDBCol>
                      <MDBInput label='Last name' type='text' required value={last_name}
                                onChange={(event) => setLastName(event.target.value)}/>
                    </MDBCol>
                  </MDBRow>
                  <MDBRow className="mb-4">
                    <MDBCol>
                      <div className="form-outline">
                        <input type="file" 
                                className="form-control" 
                                id="profilePicture"  
                                accept="image/*" 
                                onChange={(event) => {
                                  const file = event.target.files[0]; // Access the selected file
                            
                                  if (file) {
                                    setProfilePic(file); // Set the File object to the state
                                  }
                                }}/>
                        <label className="form-label" htmlFor="profilePicture">
                          Profile Picture
                        </label>
                      </div>
                    </MDBCol>
                  </MDBRow>
                  <div className="float-end">
                      <Button variant="primary" type="submit">Done</Button>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
        </MDBRow>
      </div>
    </>
  );
};

export default CreateProfile;