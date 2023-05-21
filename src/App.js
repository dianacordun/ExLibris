import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import Home from './page/Home';
import Join from './components/user/Join';
import SignIn from './components/user/SignIn';
import SignOut from './components/user/SignOut';
import ForgotPassword from './components/user/ForgotPassword';
import AddBook from './page/AddBook';
import Profile from './page/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import './App.css';

function App() {
 
  return (
    <Router>
      <div>
        <section>                              
            <Routes>
              {/* Signed out users */}
               <Route path="/" element={<Home/>}/>
               <Route  path="/signin" element={<ProtectedRoute private={false} component={SignIn} />}/>
               <Route  path="/join" element={<ProtectedRoute private={false} component={Join} />}/>
               <Route  path="/forgot_password" element={<ProtectedRoute private={false} component={ForgotPassword} />}/>

              {/* Signed in users */}
               <Route  path="/signout" element={<ProtectedRoute private={true} component={SignOut} />}/>
               <Route  path="/profile" element={<ProtectedRoute private={true} component={Profile} />}/>
               <Route  path="/add" element={<ProtectedRoute private={true} component={AddBook} />}/>

               {/* 404 */}
               <Route path="*" element={<NotFound />} />
            </Routes>                    
        </section>
      </div>
    </Router>
  );
}
 
export default App;