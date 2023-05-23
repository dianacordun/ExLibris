import React, { useState, useEffect } from 'react';
import { Modal, Image, Button, Form} from 'react-bootstrap';
import { formatTime } from '../../utils';  


const ReadingModal = ({ book, showModal, handleCloseModal}) => {
    const [timer, setTimer] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [finish, setFinish] = useState(false);
    const [timeSpentReading, setTimeSpentReading] = useState(0);
    const [isValid, setIsValid] = useState(true);
    const [currentPage, setCurrentPage] = useState(0); //sa inceapa de la book.pagesread

    useEffect(() => {
        let intervalId;
        if (showModal && !isPaused) {
          intervalId = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
          }, 1000);
        }
    
        return () => {
          clearInterval(intervalId);
        };
      }, [showModal, isPaused]);

    
    const handlePagesInput = (e) => {
        const pages = e.target.value;

        // Validate the number using a regular expression
        const isValidNumber = /^(0|[1-9][0-9]*)$/.test(pages);

        setCurrentPage(pages);
        setIsValid(isValidNumber);
        //TODO: sa nu fie mai mare decat nr de pagini sau mai mic decat pag de start
    };

    const handleModalClose = () => {
        if (showConfirmation) {
            setShowConfirmation(false);
            handleCloseModal();
        } else {
            setShowConfirmation(true);
        }
        setIsPaused(false); 
    };

    const handleConfirmation = (confirmed) => {
        if (confirmed) {
          setShowConfirmation(false);
          handleCloseModal();
        } else {
          setShowConfirmation(false);
        }
      };

    const handlePauseResume = () => {
        setIsPaused((prevIsPaused) => !prevIsPaused);
      };

    const handleFinish = () => {
        setTimeSpentReading(Math.floor(timer / 60)); // Save time spent reading in minutes
        setFinish(true); // Set the finish state to true
        setIsPaused(true);
    };  

    const handleSubmitReadingSession = (e) => {
        e.preventDefault();

        if (!isValid) {
          return; // Don't submit the form if the number is not valid
        }

        console.log(timeSpentReading);
        console.log(currentPage);

        setFinish(false);
        setIsPaused(false);
        setTimer(0);


        handleCloseModal();

        // TODO: Adaugat buton de "Finished Book"
        // Updatat status-ul cartii daca e cazul
        // Current page == books.pages sau pressed "finished book" => Read
        // If "Not started" pressed start reading => status = "Currently Reading"
        // book.pagesRead = currentPage
        // book.timeRead = book.timeRead + timeSpentReading
        // session.date = now
        // session.sessionPages = book.pages - currentPage
        // session.userId = book.userId
        // session.bookId = book.id
        // session.timeRead = timeSpentReading
    }


  return (
    <Modal show={showModal} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>{book.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {book.coverUrl && (
          <Image src={book.coverUrl} thumbnail className='book-cover-modal' alt='Cover' />
        )}
        <p>Time spent reading: {formatTime(timer)}</p>
      </Modal.Body>
      {showConfirmation ? (
        <Modal.Footer>
            <p> Are you sure you want to cancel this reading session? No data will be saved.</p>
          <Button className="btn btn-secondary" onClick={() => handleConfirmation(false)}>
            No, continue
          </Button>
          <Button className="btn btn-primary" onClick={() => handleConfirmation(true)}>
            Yes, cancel
          </Button>
        </Modal.Footer>
      ):(
        <Modal.Footer>
            {!finish ? (
                <>
                {isPaused ? (
                    <Button className='btn btn-secondary' onClick={() => setIsPaused(false)}>
                    Resume
                    </Button>
                ) : (
                    <Button className='btn btn-secondary' onClick={handlePauseResume}>
                    Pause
                    </Button>
                )}
                <Button className='btn btn-primary' onClick={handleFinish}>
                    Finish
                </Button>
                </>
                ) : (
                <Form onSubmit={handleSubmitReadingSession}>
                <Form.Group controlId="pages" className='mb-4'>
                    <Form.Label>At what page are you on?</Form.Label>
                    <Form.Control
                    type="number"
                    className="mb-1"
                    required
                    placeholder=""
                    value={currentPage}
                    onChange={handlePagesInput}
                    isInvalid={!isValid}
                    />
                    {!isValid && (
                    <Form.Control.Feedback type="invalid">
                        Please enter a valid number.
                    </Form.Control.Feedback>
                    )}
                </Form.Group>
                <Button variant="primary" type="submit">
                    Finish Session
                </Button>
                </Form>
            )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ReadingModal;