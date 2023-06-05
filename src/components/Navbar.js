import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const NavBar = () => {

    return (
      <Navbar expand="sm" className='custom-navbar'>
        <Link className="navbar-brand" to="/">
          <img className="navbar-brand" src="/logo_app.png" alt="ExLibris" style={{paddingLeft:'10px', width: '90px', height: '70px', objectFit: 'scale-down' }}/>
        </Link>
        <Navbar.Toggle aria-controls="navbarNav" />

        <Navbar.Collapse id="navbarNav">
          <Nav className="mr-auto">
            <Nav.Item>
                <Nav.Link as={NavLink} to="/">
                  Home
                </Nav.Link>
              </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/profile">
                Profile
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={NavLink} to="/add">
                Add a book
              </Nav.Link>
            </Nav.Item>
            <NavDropdown title="More" id="navbarDropdownMenuLink">
              <NavDropdown.Item as={NavLink} to="/details">
                About Us
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/signout">
                Sign Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  };
  
  export default NavBar;