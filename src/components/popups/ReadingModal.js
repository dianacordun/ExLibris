import React, { useState, useEffect } from 'react';
import { Modal, Image, Button, Form, Row, Col } from 'react-bootstrap';
import { formatTime } from '../../utils';  


const ReadingModal = ({ book, showModal, handleCloseModal, startPage}) => {
    const [timer, setTimer] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [finish, setFinish] = useState(false);
    const [timeSpentReading, setTimeSpentReading] = useState(0);
    const [isValid, setIsValid] = useState(true);
    const [currentPage, setCurrentPage] = useState(startPage); 

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
        const isValidNumber = /^(0|[1-9][0-9]*)$/.test(pages);
        const parsedPages = parseInt(pages, 10);
      
        setCurrentPage(pages);
        setIsValid(isValidNumber && parsedPages >= startPage && parsedPages <= book.pages);
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
          setTimer(0);
          setFinish(false);
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


        handleCloseModal(timeSpentReading, currentPage);
    }

    const handleFinishBook = () => {

        console.log(timeSpentReading);
        console.log(currentPage);

        setFinish(false);
        setIsPaused(false);
        setTimer(0);

        handleCloseModal(timeSpentReading, book.pages);
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
                <Row>
                <Col>
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

                        <Button variant="primary" className="mb-2" type="submit">
                            Finish Session
                        </Button>
                        <Button variant="secondary" className = "mb-2" onClick={() => setFinish(false)}>
                            Cancel
                        </Button>
                    
                    </Form>
                    </Col>
                
                <Col className="text-center">
                    <p>OR</p>
                    <Button className='btn btn-primary btn-space' onClick={handleFinishBook}>
                        I've finished this book
                    </Button>
                </Col>
                </Row>
                
            )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ReadingModal;