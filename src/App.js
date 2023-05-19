import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import Home from './page/Home';
import Join from './components/Join';
import SignIn from './components/SignIn';
import AddBook from './page/AddBook';
import Profile from './page/Profile';
import SignOut from './components/SignOut';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

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