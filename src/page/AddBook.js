import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import Layout from '../components/Layout';
import { db, storage } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from "firebase/firestore";
import { useSelector } from 'react-redux';

const AddBook = () => {
    const [title, setTitle] = useState('');
    const [author_fn, setAuthorFn] = useState('');
    const [author_ln, setAuthorLn] = useState('');
    const [cover, setCover] = useState('');
    const [pages, setPages] = useState(0);
    const [genre, setGenre] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(true);
    const navigate = useNavigate();

    const user = useSelector((state) => state.user.value);
    const userId = user?.id;

    const handlePagesInput = (e) => {
      const pages = e.target.value;
  
      // Validate the number using a regular expression
      const isValidNumber = /^(0|[1-9][0-9]*)$/.test(pages);
  
      setPages(pages);
      setIsValid(isValidNumber);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isValid) {
          return; // Don't submit the form if the number is not valid
        }

        try {
            const bookCollection = collection(db, 'book');
            const newBook = await addDoc(bookCollection, { userId, title, author_fn, author_ln, pages, genre, status });
            
            if (cover) {
              const storageRef = ref(storage, `book_covers/${newBook.id}`);
              const metadata = {
                contentType: cover.type // Set the content type based on the file type
              };
              
              await uploadBytes(storageRef, cover, metadata);
            }
            
            console.log("Book written with ID: ", newBook.id);
            navigate('/');

        } catch (error) {
            setError('Failed to add book. Please try again.');
            console.error(error);
        }
  };

  const genreOptions = [
      'Action and Adventure',
      'Biography',
      'Children',
      'Comics and Graphic Novels',
      'Fantasy',
      'Historical Fiction',
      'Horror',
      'Mystery',
      'Romance',
      'Science Fiction',
      'Thriller and Suspense',
      'Young Adult',
    ];

  return (
    <Layout title="ExLibris | Add Book" content="Add a new book to your collection">
      <div>
        <h1>Add Book</h1>
        <Form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              className="mb-1"
              placeholder="Enter title"
              value={title}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="author_fn">
            <Form.Label>Author's First Name</Form.Label>
            <Form.Control
              type="text"
              className="mb-1"
              required
              placeholder="Enter first name of author"
              value={author_fn}
              onChange={(event) => setAuthorFn(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="author_ln">
            <Form.Label>Author's Last Name</Form.Label>
            <Form.Control
              type="text"
              className="mb-1"
              required
              placeholder="Enter last name of author"
              value={author_ln}
              onChange={(event) => setAuthorLn(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="cover">
            <Form.Label>Cover (optional)</Form.Label>
            <Form.Control
              type="file"
              className="mb-1"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files[0];
                if (file) {
                  setCover(file);
                }
              }}
            />
          </Form.Group>
          <Form.Group controlId="pages">
            <Form.Label>Number of pages</Form.Label>
            <Form.Control
              type="number"
              className="mb-1"
              required
              placeholder=""
              value={pages}
              onChange={handlePagesInput}
              isInvalid={!isValid}
            />
            {!isValid && (
          <Form.Control.Feedback type="invalid">
            Please enter a valid number.
          </Form.Control.Feedback>
          )}
          </Form.Group>
          <Form.Group controlId="genre">
            <Form.Label>Genre</Form.Label>
            <Form.Control
              className="mb-1"
              as="select"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            >
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              className="mb-4"
              as="select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>Not Started</option>
              <option>Currently Reading</option>
              <option>Read</option>
            </Form.Control>
          </Form.Group>
          <Button variant="primary" type="submit">
            Add Book
          </Button>
        </Form>
      </div>
    </Layout>
  );
}

export default AddBook;