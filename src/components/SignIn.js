import React, {useState} from 'react';
import { Button, Form, Container, Row, Col, Image  } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from 'react-router-dom';
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import { auth } from '../firebase';
import './Forms.css';


 
const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validated, setValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
       
    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();

        if (form.checkValidity() === false) {
            e.stopPropagation();
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                
                switch(errorCode) {
                    case 'auth/user-not-found':
                        setError("No user was found.");
                        break;
                    case 'auth/wrong-password':
                        setError("No user was found.");
                        break;
                    case 'auth/user-disabled':
                        setError("User account has been disabled");
                        break;
                    default:
                        setError("Invalid email.");
                    }
                return;
            });
          
        setValidated(true);

    }   
  return (
    <Container fluid className="p-0">
      <Row className=" align-items-center">
        <Col className="p-0 d-none d-md-block">
        <Image src="signin.jpg" style={{ width: '90vw', height: '100vh' }} fluid />
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <h2 className="text-center mb-4">Sign In</h2>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" onChange={(e)=>setEmail(e.target.value)} required 
                    isInvalid={validated && !email} />
                    <Form.Control.Feedback type="invalid">
                    Please enter a valid email address.
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                        <Form.Control type={showPassword ? "text" : "password"} placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required isInvalid={validated && !password} />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "Hide" : "Show"}
                        </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Please enter your password.
                    </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit">
                    Submit
                </Button>

                {error && <p className="text-danger">{error}</p>}

                <p className="text-right display-8">
                        No account yet? {' '}
                        <NavLink to="/join">
                            Join
                        </NavLink>
                </p>    
            </Form>
        </Col>
      </Row>
    </Container>

  );
}
 
export default SignIn