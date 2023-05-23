import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Col, Image, Row } from 'react-bootstrap';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '../Layout';
import generateSearchKeywords from '../../utils';
import ReadingModal from '../popups/ReadingModal';
import Sessions from './Sessions';

const BookDetails = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [book, setBook] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const [authorFn, setAuthorFn] = useState('');
    const [authorLn, setAuthorLn] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [deleteImage, setDeleteImage] = useState(false);
    const [ startPage, setStartPage ] = useState(0);


    // Start reading logic 
    const [showModal, setShowModal] = useState(false);

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
            searchKeywords: generateSearchKeywords(title, authorFn, authorLn),
            coverUrl: coverImageUrl,
            };
        
            await updateDoc(bookRef, updatedBook);

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
        
            // Reset the form fields and exit edit mode
            setTitle('');
            setAuthorFn('');
            setAuthorLn('');
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
            sessionPages: currentPage - oldPagesRead + 1,
            date: new Date().toISOString(),
        }
        const sessionsCollection = collection(db, 'sessions');
        await addDoc(sessionsCollection, sessionData);

        // Hide the modal
        setShowModal(false);
        window.location.reload();
    };
          
    if (!book) {
        return <div>Loading...</div>;
    }

  return (
    <Layout title='ExLibris | Books' content='Book Details'>
          {editMode ? (
            <Col className="d-flex justify-content-center align-items-center">
            <Form onSubmit={handleUpdate} className="text-center" style={{ width: '40%' }}>
            <Form.Group as={Col} className="mb-3" controlId="coverImage">
              {coverImageUrl ? (
                    <div className="d-flex flex-column align-items-center mb-3">
                      <Image
                        src={coverImageUrl}
                        thumbnail   
                        alt="Cover"
                        onClick={handleImageClick}
                        className='book-cover mb-2'
                        style={{ cursor: 'pointer' }}
                      />
                      <Button variant="danger" onClick={handleDeleteImage}>Delete Cover</Button>
                    </div>
                  ) : (
                    <Image
                      src="/default_book.png"
                      alt="Cover"
                      thumbnail   
                      className='book-cover mb-2'
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
            <Form.Group as={Col} className="mb-3" controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="authorFn">
              <Form.Label>Author First Name</Form.Label>
              <Form.Control type="text" value={authorFn} onChange={(e) => setAuthorFn(e.target.value)} />
            </Form.Group>
            <Form.Group as={Col} className="mb-3" controlId="authorLn">
              <Form.Label>Author Last Name</Form.Label>
              <Form.Control type="text" value={authorLn} onChange={(e) => setAuthorLn(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className='btn-space'>
              Update
            </Button>
            <Button variant="secondary" onClick={handleCancelEdit} className="mr-2">
              Cancel
            </Button>
          </Form>
          </Col>
          ) : (
            <>
                <Row>
                    <Col md={6}>
                        {/* Left part of the page */}
                        <h2>{book.title}</h2>
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
                        <p>Author: {book.author_fn} {book.author_ln}</p>
                        <p>Genre: {book.genre}</p>
                        <p>Pages: {book.pages}</p>
                        <p>Pages Read: {book.pagesRead}</p>
                        <p>Status: {book.status}</p>
                        <Button variant="primary" className='btn-space' onClick={handleEdit}>
                        Edit
                        </Button>
                        {book.status === 'Currently Reading' ? (
                        <Button variant='primary' onClick={handleSimpleRead}>
                            Continue Reading
                        </Button>
                        ) : (book.status === 'Read' ? (
                        <Button variant='primary' onClick={handleReread}>Read Again</Button>
                        ) : (
                        <Button variant='primary' onClick={handleSimpleRead}>Start Reading</Button>
                        ))}
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