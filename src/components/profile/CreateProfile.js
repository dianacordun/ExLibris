import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { MDBCard, MDBCardBody, MDBCol, MDBInput, MDBRow, MDBTypography } from 'mdb-react-ui-kit';
import { db } from '../../firebase';
import { collection, addDoc } from "firebase/firestore";
import '../Forms.css';
import { setExistingProfile } from '../../features/user/profileSlice';
import { useDispatch } from 'react-redux';

const CreateProfile = ({ userId }) => {

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [profile_pic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch()


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        const profileCollection = collection(db, 'profile');
        const newUserProfile = await addDoc(profileCollection, { userId, first_name, last_name, profile_pic });
        
        console.log("PROFILE written with ID: ", newUserProfile.id);

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
                        <input type="file" className="form-control" id="profilePicture"  accept="image/*" value={profile_pic}
                                onChange={(event) => setProfilePic(event.target.value)}/>
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