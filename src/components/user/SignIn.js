import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Image  } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import '../Forms.css';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/user/userSlice';
import { signInWithGoogle, signInWithFacebook } from '../services/thirdparty';

 
const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validated, setValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

       
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
                dispatch(setUser({id: user.uid, email: user.email, emailVerified: user.emailVerified}));

                // Save user in local storage
                localStorage.setItem('user', JSON.stringify({id: user.uid, email: user.email, emailVerified: user.emailVerified}));
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
        navigate('/');
    }   

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then((user) => {
                if (user) {
                    dispatch(setUser({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    navigate("/");
                }
            })
            .catch((error) => console.log(error));
    };

    const handleFacebookSignIn = () => {
        signInWithFacebook()
            .then((user) => {
                if (user) {
                    dispatch(setUser({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    navigate("/");
                }
            })
            .catch((error) => console.log(error));
    };

  return (
    <Container fluid className="p-0 auth-form">
      <Row className=" align-items-center">
        <Col className="p-0 d-none d-md-block">
        <Image src="pagina_sign_in.png" style={{ width: '90vw', height: '100vh' }} fluid />
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
            <Form validated={validated} onSubmit={handleSubmit}>
            <h2 className="text-center mb-4 form-title">Sign In</h2>
                <Form.Group className="mb-3 custom-input-border" controlId="formBasicEmail">
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

                <Form.Group className="mb-3 custom-input-border" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                        <Form.Control type={showPassword ? "text" : "password"} placeholder="Password" onChange={(e)=>setPassword(e.target.value)} required isInvalid={validated && !password} />
                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? "Hide" : "Show"}
                        </Button>
                    </div>
                    <p className="text-right display-8">
                        {' '}
                        <NavLink to="/forgot_password">
                            Forgot your password?
                        </NavLink>
                    </p> 
                    <Form.Control.Feedback type="invalid">
                        Please enter your password.
                    </Form.Control.Feedback>
                </Form.Group>
                
                <Container className="d-flex flex-column align-items-center">
                    <Button variant="primary" type="submit">Sign In</Button>
                    <p className="text-muted" style={{paddingTop: '10px'}}>
                        OR
                    </p>
                    <Button variant="primary" className="mb-2" onClick={handleGoogleSignIn}>Sign in with Google</Button>
                    <Button variant="primary" onClick={handleFacebookSignIn}>Sign in with Facebook</Button>
                </Container>

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