import Home from './page/Home';
import Join from './components/Join';
import SignIn from './components/SignIn';
import { BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from 'react-router-dom';
import PaginaTest from './page/PaginaTest';
 
function App() {
 
  return (
    <Router>
      <div>
        <section>                              
            <Routes>
               <Route path="/" element={<Home/>}/>
               <Route path="/signin" element={<SignIn/>}/>
               <Route path="/join" element={<Join/>}/>
               <Route path="/test" element={<PaginaTest/>}/>
            </Routes>                    
        </section>
      </div>
    </Router>
  );
}
 
export default App;