import { BrowserRouter as Router} from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './page/Home';
import Join from './components/user/Join';
import SignIn from './components/user/SignIn';
import SignOut from './components/user/SignOut';
import ForgotPassword from './components/user/ForgotPassword';
import BookDetails from './components/books/BookDetails';
import AddBook from './page/AddBook';
import Profile from './page/Profile';
import AboutUs from './page/AboutUs';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import './App.css';
import './custom-styles.scss';


function App() {
  
  const isAdmin = localStorage.getItem('admin');

  return (
    <Router>
      <div>
        <section>                              
            <Routes>
              {/* Signed out users */}
               <Route path="/" element={<Home/>}/>
               <Route path="/signin" element={<ProtectedRoute private={false} component={SignIn} />}/>
               <Route path="/join" element={<ProtectedRoute private={false} component={Join} />}/>
               <Route path="/forgot_password" element={<ProtectedRoute private={false} component={ForgotPassword} />}/>

              {/* Signed in users */}
               <Route path="/signout" element={<ProtectedRoute private={true} component={SignOut} />}/>
               <Route path="/profile" element={isAdmin ? <Navigate to="/" /> : <ProtectedRoute private={true} component={Profile}/>} />
               <Route path="/add" element={isAdmin ? <Navigate to="/" /> : <ProtectedRoute private={true} component={AddBook}/>} />
               <Route path="/details" element={isAdmin ? <Navigate to="/" /> : <ProtectedRoute private={true} component={AboutUs}/>} />
               <Route path="/books/:bookId" element={isAdmin ? <Navigate to="/" /> : <ProtectedRoute private={true} component={BookDetails}/>} />

              {/* 404 */}
               <Route path="*" element={<ProtectedRoute private={true} component={NotFound} />}/>

            </Routes>                    
        </section>
      </div>
    </Router>
  );
}
 
export default App;