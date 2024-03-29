import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, ListGroup } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { compareAsc } from 'date-fns';

const Sessions = ({ currentBookId }) => {
  const [sessions, setSessions] = useState([]);
  const [sortedSessions, setSortedSessions] = useState([]);
  const [currentBook, setCurrentBook] = useState({ pagesRead: 0 });

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
          setSortedSessions(sessions.sort((a, b) => compareAsc(new Date(a.date), new Date(b.date))));
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
    };

    const fetchBook = async () => {
      try {
        const bookRef = doc(db, 'book', currentBookId);
        const bookSnapshot = await getDoc(bookRef);
        if (bookSnapshot.exists()) {
          const bookData = bookSnapshot.data();
          setCurrentBook({
            ...bookData,
            pages: parseInt(bookData.pages),
            pagesRead: parseInt(bookData.pagesRead)
          });
        } else {
          console.log('Book not found');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };
  
    fetchSessions();
    fetchBook();

  }, [currentBookId]);

  const generateChartData = () => {
    return sortedSessions.map((session) => {
      const sessionTime = Number(session.sessionTime);
      const sessionPages = Number(session.sessionPages);
      if (sessionTime === 0) {
        return sessionPages;
      }
      return sessionPages / sessionTime;
    });
  };

  const sortedChartData = generateChartData();
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const formatHour = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const data = {
    datasets: [
      {
        label: 'Pages read per minute',
        data: sortedChartData,
        borderColor: 'purple',
        pointBorderColor: 'black',
        tension: 0.3,
        backgroundColor: 'rgba(135, 29, 125, 0.92)'
      }
    ]
  };
  
  const options = {
  scales: {
    x: {
      type: 'category',
      labels: sortedChartData.map((_, index) => index + 1), 
      title: {
        display: true,
        text: 'Session number', 
      },
    },
    y: {
      type: 'linear',
      position: 'left',
      labels: sortedChartData,
      ticks: {
        stepSize: 1,
        callback: function (value) {
          return value.toFixed(0);
        },
      },
      title: {
        display: true,
        text: 'Number of pages', 
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: 'Your reading progress',
    },
  },
};




  return (
    <div>
      <h3 className='form-title'>Reading History</h3>
      {sessions.length > 0 ? (
        <>
          <Line data={data} options={options}/>
          <div style={{ maxHeight: '250px', paddingTop: '20px', paddingLeft: "40px", display: 'flex' }}>
      <Container>
          <div style={{ paddingLeft: '30px', paddingTop:'30px'}}>
            <h2 style={{ color: 'purple', marginBottom: '5px' }}>{(currentBook.pagesRead / currentBook.timeRead).toFixed(1)}</h2>
            <p className="text-muted">pages per minute </p>
            <p style={{ margin: '0'}}>You'll finish this book</p>
            <p style={{ margin: '0', padding:'0'}}>in aproximately</p>
            <i className="bi bi-clock"> {((currentBook.pages - currentBook.pagesRead) / ((currentBook.pagesRead / currentBook.timeRead).toFixed(1))).toFixed(0)} minutes</i>
          </div>
        </Container>
        
        <ListGroup style={{ width: '70%', overflowY: 'scroll' }}>
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <ListGroup.Item key={session.date}>
                <h5 className='form-data' style={{textAlign:'center'}}>{index + 1}</h5>
                <p className='form-data' style={{paddingTop:'0'}}><strong>Date:</strong> {formatDate(session.date)}</p>
                <p className='form-data' style={{paddingTop:'0'}}><strong>Ended at:</strong> {formatHour(session.date)}</p>
                <p className='form-data' style={{paddingTop:'0'}}><strong>Duration:</strong> {session.sessionTime === 1 ? `${session.sessionTime} minute` : `${session.sessionTime} minutes`}</p>
                <p className='form-data' style={{paddingTop:'0'}}><strong>Pages:</strong> {session.sessionPages === 1 ? `${session.sessionPages} page` : `${session.sessionPages} pages`}</p>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>No history</ListGroup.Item>
          )}
        </ListGroup>
           </div>
        </>
      ) : (
        <p>No data to show</p>
      )}
    </div>
  );
};

export default Sessions;
