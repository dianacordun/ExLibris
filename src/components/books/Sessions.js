import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { ListGroup } from 'react-bootstrap';

const Sessions = ({ currentBookId }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      // Fetch sessions associated with the current book
      try {
        const sessionsQuery = query(
            collection(db, 'sessions'),
            where('bookId', '==', currentBookId) 
          );
      
          // Fetch the sessions data
          const querySnapshot = await getDocs(sessionsQuery);
          // Convert the query snapshot to an array of session objects
          const sessions = querySnapshot.docs.map((doc) => doc.data());
      
          // Set the fetched sessions in state
          setSessions(sessions);
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
    };
  
    fetchSessions();
  }, [currentBookId]);


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <h3>Reading History</h3>
      <div style={{ maxHeight: '540px', overflowY: 'scroll' }}>
        <ListGroup>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <ListGroup.Item key={session.id}>
                <p>Date: {formatDate(session.date)}</p>
                <p>Duration: {session.sessionTime} minutes</p>
                <p>Pages: {session.sessionPages} pages</p>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>No history</ListGroup.Item>
          )}
        </ListGroup>
      </div>
    </div>
  );
};

export default Sessions;
