import React from 'react'


const ViewProfile = ({ picture, firstName, lastName }) => {
  return (
    <div>
      <img src={picture} alt="Profile" />
      <h2>{firstName} {lastName}</h2>
    </div>
  );
};

export default ViewProfile;