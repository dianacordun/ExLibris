import React, { useEffect, useState } from 'react'
import NavBar from '../components/Navbar'
import { Helmet } from 'react-helmet';
import { Button } from 'react-bootstrap';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const AdminInterface = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fetch books from Firebase
    const fetchBooks = async () => {
      try {
        const bookCollection = collection(db, 'book');
        const bookSnapshot = await getDocs(bookCollection);
        const booksData = bookSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            title: doc.data().title,
            coverUrl: doc.data().coverUrl,
          };
        });
        setBooks(booksData);
      } catch (error) {
        console.log('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const deleteBook = async (bookId, bookCoverUrl) => {
    try {
      const bookRef = doc(db, 'book', bookId);
      const coverImageRef = ref(storage, `book_covers/${bookId}`);

      await deleteDoc(bookRef);

      // Delete the cover image if it exists
      const coverImageUrl = bookCoverUrl;
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


      // Book deleted successfully, update the books state
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    } catch (error) {
      console.log('Error deleting book:', error);
    }
  };

  return (
    <>
    <Helmet>
            <title>ExLibris | Admin</title>
            <meta name = 'description' content='Admin Homepage' />
    </Helmet>
    <NavBar/>

    <ul>
      {books.map((book) => (
            <li key={book.id} className='pt-2'>
              <span>{book.id} - </span>
              <span>{book.title} </span>
              <Button variant="danger" onClick={() => deleteBook(book.id, book.coverUrl)} className="btn-space" >
                Delete
              </Button>
            </li>
        ))}
      </ul>
    
    </>
    
  )
}

export default AdminInterface