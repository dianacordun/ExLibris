import React, { useState, useRef } from 'react';
import { Image, Form, Button } from 'react-bootstrap';
import { useSelector, } from 'react-redux';

const EditProfile = ({ picture, firstName, lastName, onSave, imageSize }) => {
  const [editedFirstName, setEditedFirstName] = useState(firstName);
  const [editedLastName, setEditedLastName] = useState(lastName);
  const [editedPicture, setEditedPicture] = useState(null);
  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.user.value);
  const userId = user?.id;

  const handleFirstNameChange = (e) => {
    setEditedFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setEditedLastName(e.target.value);
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    setEditedPicture(file);
  };

  const handleSaveClick = () => {
    onSave(userId, editedFirstName, editedLastName, editedPicture);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };


  return (
    <div>
      <Image src={picture} alt="Profile" roundedCircle onClick={handleImageClick} style={imageSize} className="mb-2"/>
      <Form>
        <Form.Control
          type="text"
          className="mb-2"
          value={editedFirstName}
          onChange={handleFirstNameChange}
        />
        <Form.Control
          type="text"
          className="mb-2"
          value={editedLastName}
          onChange={handleLastNameChange}
        />
       <Form.Control
          type="file"
          className="mb-2"
          accept="image/*"
          onChange={handlePictureChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <Button onClick={handleSaveClick}>Save</Button>
      </Form>
    </div>
    
  );
};

export default EditProfile;