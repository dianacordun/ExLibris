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
            setError(error.message);
          }

    }

    return (
        <Container fluid className="p-0">
        <Row className=" align-items-center">
            <Col className="p-0 d-none d-md-block">
            <Image src="signin.jpg" style={{ width: '90vw', height: '100vh' }} fluid />
            </Col>
            <Col className="d-flex justify-content-center align-items-center">
            {resetSent ? (
                <p>Password reset email sent. Check your inbox.</p>
            ) : (
                <Form onSubmit={handleSubmit}>
                <h2 className="text-center mb-4">Forgot your password?</h2>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label  className="text-muted">Enter your email below and we'll send you a recovery link.</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" onChange={(e)=>setEmail(e.target.value)} required />
                        <Form.Control.Feedback type="invalid">
                        Please enter a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Container className="d-flex flex-column align-items-center">
                        <Button variant="primary" type="submit">Send</Button>
                        <p className="text-muted">OR</p>
                        <p className="text-right display-8">
                            {' '}
                            <NavLink to="/">
                                Go to sign in page
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