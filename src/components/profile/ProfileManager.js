import React, { useState, useEffect} from 'react';
import EditProfile  from './EditProfile';
import ViewProfile from './ViewProfile';

const ProfileManager = ({ userId }) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [picture, setPicture] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');


    const handleEditClick = () => {
        setIsEditing(true);
      };
    
      const handleSave = (editedFirstName, editedLastName, editedPic) => {
        // Handle save logic here
        console.log('Saving profile', editedFirstName, editedLastName);
    
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
        />
      ) : (
        <ViewProfile
          picture={picture}
          firstName={firstName}
          lastName={lastName}
        />
      )}
      {!isEditing && <button onClick={handleEditClick}>Edit</button>}
    </>
    );
};

export default ProfileManager;