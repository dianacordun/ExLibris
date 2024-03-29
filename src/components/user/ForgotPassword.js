import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Image  } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from 'react-router-dom';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../Forms.css';


 
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [error, setError] = useState('');
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email, {url: 'http://localhost:3000'});
            setResetSent(true);
          } catch (error) {
            const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage)
                
                switch(errorCode) {
                    case 'auth/user-not-found':
                        setError("There is no account associated with this email address.");
                        break;
                    case 'auth/missing-email':
                        setError("Please provide an email address.");
                        break;
                    case 'auth/user-disabled':
                        setError("User account has been disabled");
                        break;
                    default:
                        setError("Invalid email.");
                    }
                return;
          }

    }

    return (
        <Container fluid className="p-0 auth-form">
        <Row className=" align-items-center">
            <Col className="p-0 d-none d-md-block">
            <Image src="pagina_sign_in.png" style={{ width: '100vw', height: '100vh'}} fluid />
            </Col>
            <Col className="d-flex justify-content-center align-items-center">
            {resetSent ? (
                <p>Password reset email sent. Check your inbox.</p>
            ) : (
                <Form noValidate onSubmit={handleSubmit}>
                <h2 className="text-center mb-4 form-title">Forgot your password?</h2>
                    <Form.Group className="mb-3 custom-input-border" controlId="formBasicEmail">
                        <Form.Label  className="text-muted">Enter your email below and we'll send you a recovery link.</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e)=>setEmail(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Container className="d-flex flex-column align-items-center">
                        <Button variant="primary" type="submit">Send</Button>
                        <p className="text-muted" style={{paddingTop: '10px', marginBottom: '10px'}}>OR</p>
                        <p className="text-right display-8" style={{paddingTop: '0px'}}>
                            {' '}
                            <NavLink to="/">
                                Go to Sign In page
                            </NavLink>
                        </p> 
                    </Container>

                    {error && <p className="text-danger">{error}</p>}    
                </Form>
                )}
            </Col> 
        </Row>
        </Container>

    );
}
 
export default ForgotPassword