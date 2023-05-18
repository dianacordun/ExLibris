import React from 'react';
import { Image, Container } from 'react-bootstrap';

const ViewProfile = ({ picture, firstName, lastName, imageSize}) => {

  return (
    <Container>
      { picture ? (
        <Image src={picture} alt="Profile" roundedCircle style={imageSize} />
      ):(
        <Image src="/defaultProfilePic.png" alt="Profile" roundedCircle  style={imageSize}/>
      )

      }
      <h2>{firstName} {lastName}</h2>
    </Container>
  );
};

export default ViewProfile;