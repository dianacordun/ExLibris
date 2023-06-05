import React from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, ProgressBar } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import genreOptions from '../../config';

const Dashboard = ({ userId }) => {

    const [books, setBooks] = useState([]);
    const [statusFilter, setStatusFilter] = useState(''); 
    const [genreFilter, setGenreFilter] = useState(''); 
    const [sortBy, setSortBy] = useState('');
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        const fetchBooks = async () => {
            let bookQuery = query(collection(db, 'book'), where('userId', '==', userId));

            // Apply status and gener filters if selected
            if (statusFilter !== '') {
                bookQuery = query(bookQuery, where('status', '==', statusFilter));
            }
            if (genreFilter !== '') {
                bookQuery = query(bookQuery, where('genre', '==', genreFilter));
            }

            if (searchTerm !== '') {
                const searchLower = searchTerm.toLowerCase();
                bookQuery = query(bookQuery, where('searchKeywords', 'array-contains', searchLower));
              }

            // Sort books
            if (sortBy === 'pages_asc') {
                bookQuery = query(bookQuery, orderBy('pages'));
              } else if (sortBy === 'pages_desc') {
                bookQuery = query(bookQuery, orderBy('pages', 'desc'));
              } else if (sortBy === 'title_asc') {
                bookQuery = query(bookQuery, orderBy('title'));
              } else if (sortBy === 'title_desc') {
                bookQuery = query(bookQuery, orderBy('title', 'desc'));
            }

            const bookSnapshot = await getDocs(bookQuery);
            const bookData = bookSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    coverUrl: data.coverUrl,
                    percent: Math.round((data.pagesRead / data.pages) * 100),
                };
            });

            setBooks(bookData);
        
        };
      
        fetchBooks();
    }, [userId, statusFilter, genreFilter, sortBy, searchTerm]);


    const handleSearch = (e) => {
        e.preventDefault();
        const inputValue = e.target.previousElementSibling.value;
        setSearchTerm(inputValue);
      };
    
  return (
    <div>
        <Container>
        <Form>
            <Row className="mb-4 align-items-center">
                    <Form.Group as={Col} sm={2}>
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                        as="select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        >
                        <option value="">All</option>
                        <option value="Not Started">Not Started</option>
                        <option value="Currently Reading">Currently Reading</option>
                        <option value="Read">Read</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} sm={2}>
                        <Form.Label>
                            Genre
                        </Form.Label>
                        <Form.Control
                        as="select"
                        value={genreFilter}
                        onChange={(e) => setGenreFilter(e.target.value)}
                        >

                        <option value="">All</option>
                        {genreOptions.map((option) => (
                            <option key={option} value={option}>
                            {option}
                            </option>
                        ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} sm={3}>
                        <Form.Label>Sort By</Form.Label>
                        <Form.Control
                            as="select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="">None</option>
                            <option value="pages_asc">Number of Pages (Ascending)</option>
                            <option value="pages_desc">Number of Pages (Descending)</option>
                            <option value="title_asc">Title (A-Z)</option>
                            <option value="title_desc">Title (Z-A)</option>
                        </Form.Control>
                    </Form.Group>
                    <Form.Group as={Col} sm={5}>
                        <Form.Label>Search</Form.Label>
                        <InputGroup>
                            <Form.Control
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="primary" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Row>
            </Form>
            {books.length > 0 ? (
            <Row xs={1} md={2} lg={3} xl={4} xxl={5} className="g-4">
                {books.map((book) => (
                    <Col key={book.id}>
                        <Link to={`/books/${book.id}`} className="card-link">
                        <Card className="card">
                            {book.coverUrl ? (
                                <Card.Img variant="top" src={book.coverUrl} alt={book.title} className="card-image"/>
                                ) : (
                                    <Card.Img variant="top" src="/default_book.png" alt={book.title} className="card-image" />
                                    )}
                            <ProgressBar style={{ height: '5px', borderRadius: '0' }} variant="custom-pg-bar" now={book.percent} />
                        <Card.Body>                            
                            <Card.Title className='form-title'>{book.title}</Card.Title>
                        </Card.Body>
                        </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
            ) : (
                <div className="text-center mt-5">
                    <p>It looks like you don't have any books in your library</p>
                    <Link to="/add" className="btn btn-primary">
                    Add your first book
                    </Link>
                </div>
            )}
        </Container>
    </div>
  )
}

export default Dashboard