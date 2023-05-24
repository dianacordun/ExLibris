import React from 'react';
import { Image, Container } from 'react-bootstrap';

const ViewProfile = ({ picture, firstName, lastName, imageSize, totalPagesRead, totalTimeReading}) => {

  return (
    <Container>
      { picture ? (
        <Image src={picture} alt="Profile" roundedCircle style={imageSize} />
      ):(
        <Image src="/defaultProfilePic.png" alt="Profile" roundedCircle style={imageSize}/>
      )
      }
      <h2>{firstName} {lastName}</h2>
      <h2> Pages: {totalPagesRead}</h2>
      <h2> Time: {totalTimeReading}</h2>
    </Container>
  );
};

export default ViewProfile;