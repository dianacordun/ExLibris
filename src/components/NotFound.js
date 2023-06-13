import React from 'react';
import Layout from "../components/Layout";

const NotFound = () => {
  return (
    <Layout title='ExLibris | 404 Error' content='404 Page'>
      <div style={{ textAlign: 'center', margin: 'auto' }}>
        <h1 style={{ fontSize: '4rem' }} className='form-title'>Error 404 - Page Not Found</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
        <img src="not_found.svg" alt="Not Found" style={{ paddingLeft:'10%', width: '50%', height: 'auto' }} />
      </div>
    </Layout>
  );
}

export default NotFound;
