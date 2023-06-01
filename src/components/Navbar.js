import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Image } from 'react-bootstrap';

const NavBar = () => {

    return (
      <Navbar bg="light" expand="sm">
        <Link className="navbar-brand" to="/">
          <Image className="navbar-brand" src="logo_app.png" alt="ExLibris" style={{paddingLeft:'10px', width: '100px', height: '100px', objectFit: 'scale-down' }}/>
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