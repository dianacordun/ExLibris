import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';
import { db, storage } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from 'firebase/storage';
import { setExistingProfile } from '../../features/user/profileSlice';
import { setProfileDetails } from '../../features/user/profileDetailsSlice';
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
        const newProfileDocRef = await addDoc(profileCollection, { userId, first_name, last_name, totalTimeReading: 0, totalPagesRead: 0 });
        
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
        dispatch(setProfileDetails({firstName: first_name, lastName: last_name, totalTimeReading: 0, totalPagesRead: 0}));
        navigate('/');

    } catch (error) {
        setError('Failed to add profile. Please try again.');
        console.error(error);
    }
};

  return (
    <>

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

      {/* <div className="mx-auto mt-5" style={{ maxWidth: '800px', height: '400px' }}>
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
      </div> */}

      <MDBContainer fluid>
      <MDBRow className='d-flex justify-content-center align-items-center'>
        <MDBCol lg='8' style={{paddingLeft:"10%"}}>

          <MDBCard className='my-5 rounded-3' style={{ maxWidth: '600px'}}>
            <MDBCardImage src='logo_app.svg' className='w-100 rounded-top'  alt="Sample photo"/>

            <MDBCardBody className='px-5'>

              <h3 className="mb-4 pb-2 pb-md-0 mb-md-5 px-md-2 form-title text-center">Complete your profile</h3>
              <form className="mb-0" onSubmit={handleSubmit}>
                  {error && <p>{error}</p>}

              <MDBRow>
                <MDBCol md='6'>
                  <MDBInput label='First name' type='text' required  value={first_name}
                                    onChange={(event) => setFirstName(event.target.value)} />
                </MDBCol>
                <MDBCol md='6'>
                  <MDBInput label='Last name' type='text' required value={last_name}
                            onChange={(event) => setLastName(event.target.value)}/>
                </MDBCol>
              </MDBRow>

              <MDBRow>
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
              </MDBRow>

              <div className="float-end">
                      <Button variant="primary" type="submit">Done</Button>
              </div>
              </form>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>

    </MDBContainer>
    </>
  );
};

export default CreateProfile;