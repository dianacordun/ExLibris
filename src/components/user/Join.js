import React, {useState, useEffect} from 'react';
import { Button, Form, Container, Row, Col, Image  } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink, useNavigate } from 'react-router-dom';
import {  createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/user/userSlice';
import { signInWithGoogle, signInWithFacebook } from '../services/thirdparty';
import '../Forms.css';
import { Helmet } from 'react-helmet';
 
const Join = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validated, setValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        // Check if the user is already signed in
        onAuthStateChanged(auth, (user) => {
          if (user) {
            navigate('/profile');
            dispatch(setUser({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
            localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
            
          }
        });
      }, [dispatch, navigate]);

    const handleSubmit = async (e) => {
        const form = e.currentTarget;
        e.preventDefault();

        if (form.checkValidity() === false) {
            setError('Please fill in all the required fields.');
            e.stopPropagation();
            return;
        }
        
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);

                sendEmailVerification(user)
                .then(() => {
                    // Verification email sent successfully
                    console.log('Verification email sent');
                })
                .catch((error) => {
                    // Error sending verification email
                    console.log('Error sending verification email', error);
                })

                navigate('/profile');
                dispatch(setUser({id: user.uid, email: user.email, emailVerified: user.emailVerified}));
                localStorage.setItem('user', JSON.stringify({id: user.uid, email: user.email, emailVerified: user.emailVerified}));
                

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode, errorMessage);
                
                switch(errorCode) {
                    case 'auth/email-already-in-use':
                        setError("Email address already exists.");
                        break;
                    case 'auth/weak-password':
                        setError("Password should be at least 6 characters.");  
                        break;
                    case 'auth/operation-not-allowed':
                        setError("Email/password accounts are not enabled.");
                        break;
                    default:
                        setError("Invalid email or password.");
                    }
                return;
            });
    
        setValidated(true);
    }   

    const handleGoogleSignIn = () => {
        signInWithGoogle()
            .then((user) => {
                if (user) {
                    navigate('/profile');
                    dispatch(setUser({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                }
            })
            .catch((error) => console.log(error));
    };
    
    const handleFacebookSignIn = () => {
        signInWithFacebook()
            .then((user) => {
                if (user) {
                    navigate('/profile');
                    dispatch(setUser({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                    localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, emailVerified: user.emailVerified }));
                }
            })
            .catch((error) => console.log(error));
    };

  return (
    <>
    <Helmet>
            <title>ExLibris | Join</title>
            <meta name = 'description' content='Join' />
    </Helmet>
    <Container fluid className="p-0 auth-form">
      <Row className=" align-items-center">
        <Col className="p-0 d-none d-md-block">
        <Image src="pagina_sign_in.png" style={{ width: '90vw', height: '100vh' }} fluid />
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
            <Form validated={validated} onSubmit={handleSubmit}>
            <h2 className="text-center mb-4 form-title">Join Us</h2>
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
                    <Form.Control.Feedback type="invalid">
                        Please enter your password.
                    </Form.Control.Feedback>
                </Form.Group>

                <Container className="d-flex flex-column align-items-center">
                    <Button variant="primary" type="submit">Join</Button>
                    <p className="text-muted" style={{paddingTop: '10px'}}>
                        OR
                    </p>
                    <Button variant="primary" className="mb-2" onClick={handleGoogleSignIn} >Continue with Google</Button>
                    <Button variant="primary" onClick={handleFacebookSignIn}>Continue with Facebook</Button>
                </Container>

                {error && <p className="text-danger">{error}</p>}

                <p className="text-right display-8">
                        Already have an account? {' '}
                        <NavLink to="/">
                            Sign In
                        </NavLink>
                </p>    
            </Form>
        </Col>
      </Row>
    </Container>
    </>
  );
}
 
export default Join