import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Col, Image, Row, Modal, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '../Layout';
import generateSearchKeywords from '../../utils';
import ReadingModal from '../popups/ReadingModal';
import Sessions from './Sessions';
import { useSelector } from 'react-redux';

const BookDetails = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [book, setBook] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const [authorFn, setAuthorFn] = useState('');
    const [authorLn, setAuthorLn] = useState('');
    const [pagesRead, setPagesRead] = useState(0);
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [deleteImage, setDeleteImage] = useState(false);
    const [startPage, setStartPage] = useState(0);
    const [isValid, setIsValid] = useState(true);

    const user = useSelector((state) => state.user.value);
    const userId = user?.id; 

    // Start reading logic 
    const [showModal, setShowModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const bookDoc = await getDoc(doc(db, 'book', bookId));
                if (bookDoc.exists()) {
                  const bookData = bookDoc.data();
                  console.log(bookData);
                   setBook(bookData);
                   setTitle(bookData.title);
                   setAuthorFn(bookData.author_fn);
                   setAuthorLn(bookData.author_ln);
                   setPagesRead(bookData.pagesRead);
                   setCoverImageUrl(bookData.coverUrl);
                } else {
                  console.log("Book was not found.");
                }
              } catch (error) {
                console.error("Failed catching book.", error);
                navigate('/');
            }
        };
    
        fetchBookDetails();
      }, [bookId, navigate]);
    
      const handleEdit = () => {
        setEditMode(true);
      };
      const handleCancelEdit = () => {
        setEditMode(false);
        // Reset the form fields to their original values
        setTitle(book.title);
        setAuthorFn(book.author_fn);
        setAuthorLn(book.author_ln);
        setPagesRead(book.pagesRead);
      };
      const handleImageClick = () => {
        fileInputRef.current.click();
      };
      const handlePictureChange = (e) => {
        const file = e.target.files[0];
        setCoverImage(file);
      };
      const handleDeleteImage = () => {
        setDeleteImage(true);
      };
      const handleUpdate = async (e) => {
        e.preventDefault();
        
        try {
            // Update the book entry with the new data
            const bookRef = doc(db, 'book', bookId);
            const updatedBook = {
            title,
            author_fn: authorFn,
            author_ln: authorLn,
            pagesRead: pagesRead,
            searchKeywords: generateSearchKeywords(title, authorFn, authorLn),
            coverUrl: coverImageUrl,
            };

            // Delete the previous cover image from Firebase Storage if deleteImage is true
            if (deleteImage && book.coverUrl) {
                const coverImageRef = ref(storage, book.coverUrl);
                await deleteObject(coverImageRef);
                updatedBook.coverUrl = ''; 
            }

            if (coverImage) {
    
                // Upload the new cover image to Firebase Storage
                const storageRef = ref(storage, `book_covers/${bookId}`);
                await uploadBytes(storageRef, coverImage);
                const downloadURL = await getDownloadURL(storageRef);
                updatedBook.coverUrl = downloadURL;
            }

            await updateDoc(bookRef, updatedBook);
        
            // Reset the form fields and exit edit mode
            setTitle('');
            setAuthorFn('');
            setAuthorLn('');
            setPagesRead(0);
            setDeleteImage(false);
            setEditMode(false);
            console.log('Book updated successfully');
            window.location.reload();
    } catch (error) {
        console.error('Failed to update book:', error);
      }
      };

    const handleReread = async () => {
        try {
            const bookRef = doc(db, 'book', bookId);
            const updatedFields = {
                pagesRead: 0,
                status: 'Currently Reading',
                timeRead: 0,
            }
            await updateDoc(bookRef, updatedFields);
            setStartPage(0);
            setShowModal(true);
        } catch (error) {
            console.error('Failed to update book for reread', error);
        }
    }  

    const handleSimpleRead = () => {
        setStartPage(book.pagesRead);
        setShowModal(true);
    }  

    const handleCloseModal = async (timeSpentReading, currentPage) => {
        
        try{
            if (!timeSpentReading && !currentPage){
            setShowModal(false);
            return;
            }
            // Updating book data
            const bookRef = doc(db, 'book', bookId);
            const oldPagesRead = book.pagesRead;
            
            const newStatus = (currentPage === book.pages) ? 'Read' : 'Currently Reading';
            const updatedFields = {
                pagesRead: currentPage,
                status: newStatus,
                timeRead: book.timeRead + timeSpentReading,
            }
            await updateDoc(bookRef, updatedFields);
            
            // Create new reading session
            const sessionData = {
                bookId: bookRef.id,
                sessionTime: timeSpentReading,
                sessionPages: currentPage - oldPagesRead,
                date: new Date().toISOString(),
            }
            const sessionsCollection = collection(db, 'sessions');
            await addDoc(sessionsCollection, sessionData); 
            const profileQuery = query(collection(db, 'profile'), where('userId', '==', userId));
            const profileSnapshot = await getDocs(profileQuery);

            if (!profileSnapshot.empty) {
                const profileDoc = profileSnapshot.docs[0];
                const profileRef = doc(db, 'profile', profileDoc.id);
                
                // Update the profile document in the profile collection
                await updateDoc(profileRef, {
                    totalTimeReading: profileDoc.data().totalTimeReading + timeSpentReading, 
                    totalPagesRead: profileDoc.data().totalPagesRead + (currentPage - oldPagesRead)
                });
            }


            // Hide the modal
            setShowModal(false);
            window.location.reload();
        }catch(error){
            console.error("Failed to update session data.");
        }
    };

    const handlePagesReadInput = (e) => {
        const pages = e.target.value;
    
        // Validate the number using a regular expression
        const isValidNumber = /^(0|[1-9][0-9]*)$/.test(pages);
    
        setPagesRead(pages);
        setIsValid(isValidNumber && parseInt(pages, 10) <= book.pages);
      };

    const handleDeleteBook = async () => {
        try {
            const bookRef = doc(db, 'book', bookId);
            const coverImageRef = ref(storage, `book_covers/${bookId}`);
            
            await deleteDoc(bookRef);
            
            // Delete the cover image if it exists
            const coverImageUrl = book.coverUrl;
            if (coverImageUrl) {
              await deleteObject(coverImageRef);
            }

            // Delete all sessions associated with this book
            const sessionsQuery = query(collection(db, 'sessions'), where('bookId', '==', bookId));
            const sessionsSnapshot = await getDocs(sessionsQuery);

            if (!sessionsSnapshot.empty) {
                const storageTasks = [];
            
                sessionsSnapshot.forEach((sessionDoc) => {
                    const sessionRef = doc(db, 'sessions', sessionDoc.id);
                    const deleteSession = deleteDoc(sessionRef);
                    storageTasks.push(deleteSession);
                });
        
                // Wait for all storage tasks to complete
                await Promise.all(storageTasks);
        
                console.log('Sessions deleted successfully');
            } else {
                console.log('No sessions found');
            }


        }catch(error){
            console.error("Failed to delete book: " + error);
        }


        // Close the modal after deleting the book
        setShowConfirmationModal(false);
        navigate('/');
    };  

          
    if (!book) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

  return (
    <Layout title='ExLibris | Books' content='Book Details'>
          {editMode ? (
            <Col >
              <Form onSubmit={handleUpdate} className="text-center" >
                <Row>
                  <Col md={6}>
                    <Form.Group as={Col} className="mb-3" controlId="coverImage">
                      {coverImageUrl ? (
                            <div className="d-flex flex-column align-items-end mb-3 mr-3">
                              <Image
                                src={coverImageUrl}
                                thumbnail   
                                alt="Cover"
                                onClick={handleImageClick}
                                className='book-cover mb-2 mt-4'
                                style={{ cursor: 'pointer', marginRight:'10%' }}
                              />
                              <Button variant="danger"  style={{marginRight:'20%' }} onClick={handleDeleteImage}>Delete Cover</Button>
                            </div>
                          ) : (
                            <Image
                              src="/default_book.png"
                              alt="Cover"
                              thumbnail   
                              className='book-cover mb-2 mt-4'
                              onClick={handleImageClick}
                              style={{ cursor: 'pointer' }}
                            />
                          )}
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                          />
                    </Form.Group>
                  </Col>
                  <Col md={5} className='mt-3' >
                    <Form.Group sm={9} as={Col} className="mb-3" controlId="title">
                      <Form.Label>Title</Form.Label>
                      <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </Form.Group>
                    <Form.Group sm={9} as={Col} className="mb-3" controlId="authorFn">
                      <Form.Label>Author's first name</Form.Label>
                      <Form.Control type="text" value={authorFn} onChange={(e) => setAuthorFn(e.target.value)} />
                    </Form.Group>
                    <Form.Group sm={9} as={Col} className="mb-3" controlId="authorLn">
                      <Form.Label>Author's last name</Form.Label>
                      <Form.Control type="text" value={authorLn} onChange={(e) => setAuthorLn(e.target.value)} />
                    </Form.Group>
                    <Form.Group sm={9} as={Col} className="mb-3" controlId="pagesRead">
                        <Form.Label>Number of pages read</Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Control
                            type="text"
                            value={pagesRead}
                            onChange={handlePagesReadInput}
                            isInvalid={!isValid}
                            style={{width: '90%'}}
                            />
                            <span className="ml-5"> / {book.pages}</span>
                        </div>
                        {!isValid && (
                        <Form.Control.Feedback type="invalid">
                            Please enter a valid number.
                        </Form.Control.Feedback>
                        )}
                    </Form.Group>
                    <div className="d-flex justify-content-between">
                        <div>
                        <Button variant="primary" type="submit" className='btn-space'>
                            Update
                        </Button>
                        <Button variant="secondary" onClick={handleCancelEdit} className="btn-space" >
                            Cancel
                        </Button>
                        </div>
                    </div>
                  </Col>
                </Row>
                <Button variant="danger" className='mt-5' onClick={() => setShowConfirmationModal(true)}>Delete Book</Button>
              <Modal show={showConfirmationModal} onHide={() => setShowConfirmationModal(false)} centered>
                  <Modal.Header closeButton>
                  <Modal.Title>Are you sure?</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>This action is not reversible and all the data regarding the book will be lost.</Modal.Body>
                  <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowConfirmationModal(false)}>
                      No
                  </Button>
                  <Button variant="danger" onClick={handleDeleteBook}>
                      Yes
                  </Button>
                  </Modal.Footer>
              </Modal>
            </Form>
          </Col>
          ) : (
            <>
                <Row>
                    <Col md={6} className='pb-3'>
                        {/* Left part of the page */}
                        <h2 className='form-title mb-4'>{book.title}</h2>
                        <Row>
                          <Col>
                            {coverImageUrl ? (
                            <Image
                                src={coverImageUrl}
                                thumbnail  
                                className='book-cover'
                                alt="Cover"
                            />
                            ) : (
                            <Image
                                src="/default_book.png"
                                thumbnail  
                                className='book-cover'
                                alt="Cover"
                            />
                            )}
                            <div className="mt-3" style={{ paddingLeft: '2%' }}>
                              <Button variant="primary" className='btn-space mt-1' onClick={handleEdit}>
                              Edit
                              </Button>
                              {book.status === 'Currently Reading' ? (
                              <Button className='mt-1' variant='primary' onClick={handleSimpleRead}>
                                  Continue Reading
                              </Button>
                              ) : (book.status === 'Read' ? (
                              <Button className='mt-1' variant='primary' onClick={handleReread}>Read Again</Button>
                              ) : (
                              <Button className='mt-1' variant='primary' onClick={(handleSimpleRead)}>Start Reading</Button>
                              ))}
                            </div>
                            </Col>
                            <Col>
                            <div >
                              <p style={{ paddingTop: '0' }}>
                                <strong>Author</strong>
                              </p>
                              <p style={{ paddingTop: '0' }}>{book.author_fn} {book.author_ln}</p>
                              <p style={{ paddingTop: '0' }}>
                                <strong>Genre</strong>
                              </p>
                              <p style={{ paddingTop: '0' }}>{book.genre}</p>
                              <p style={{ paddingTop: '0' }}>
                                <strong>Pages</strong>
                              </p>
                              <p style={{ paddingTop: '0' }}>{book.pages}</p>
                              <p style={{ paddingTop: '0' }}>
                                <strong>Pages Read</strong>
                              </p>
                              <p style={{ paddingTop: '0' }}>{book.pagesRead}</p>
                              <p style={{ paddingTop: '0' }}>
                                <strong>Status</strong>
                              </p>
                              <p style={{ paddingTop: '0' }}>{book.status}</p>
                            </div>
                            </Col>
                          </Row>
                    </Col>
                    <Col md={6}>
                        <Sessions currentBookId = {bookId}/>
                    </Col>
                </Row>

                <ReadingModal
                    book={book}
                    showModal={showModal}
                    handleCloseModal={handleCloseModal}
                    startPage={startPage}
                />
            </>
          )}
    </Layout>
  )
}

export default BookDetails;