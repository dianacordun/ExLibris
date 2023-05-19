import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ private: isPrivate, component: Component }) => {
    const user = useSelector((state) => state.user.value);
    const isSignedIn = !!user ;

    if ((!isSignedIn && isPrivate) || (isSignedIn && !isPrivate)) {
        return <Navigate to="/" />;
      }
    
    return <Component />;
};

export default ProtectedRoute;
