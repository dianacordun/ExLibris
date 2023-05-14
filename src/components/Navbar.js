import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {

  const authLinks = (
    <>
      <li className="nav-item active">  
        <NavLink className='nav-link' to='/join'>
          Join
        </NavLink>
      </li>
    </>
  );



    return (
      <nav className="navbar navbar-expand-sm navbar-light bg-light">
        <Link className='navbar-brand' to='/'> ExLibris </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <NavLink className='nav-link' to='/'>
                Home
              </NavLink>
            </li>
            {/* add links here  */}
          </ul>
        </div>
      </nav>
    );
  };
  
  export default Navbar;