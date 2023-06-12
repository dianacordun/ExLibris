import React from 'react';
import { Image, Container } from 'react-bootstrap';

const ViewProfile = ({ picture, firstName, lastName, imageSize, totalPagesRead, totalTimeReading}) => {

  return (
    <Container>
      <h2>Hello, {firstName} {lastName}!</h2>
      <Container className='mb-5 mt-4'>
            {picture ? (
              <Image src={picture} alt="Profile" roundedCircle style={imageSize} />
            ) : (
              <Image src="/defaultProfilePic.png" alt="Profile" roundedCircle style={imageSize} />
            )}
            
      </Container>
      <div>
            <i className="bi bi-book" style={{ fontSize: '2em' }}> </i>
            <span className='secondary-font'>You've read {totalPagesRead} pages</span>
            <p>
              <i className="bi bi-hourglass-split" style={{ fontSize: '2em' }}> </i>
              <span className='secondary-font'>You spent {totalTimeReading} minutes reading</span>
              
            </p>
      </div>
    </Container>
  );
};

export default ViewProfile;