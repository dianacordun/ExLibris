import React from 'react';
import NavBar from '../components/Navbar';
import { Helmet } from 'react-helmet';

const AboutUs = () => {
  return (
    <>  
       <Helmet>
            <title>ExLibris | About Us</title>
            <meta name = 'description' content='About Us' />
        </Helmet>
        <NavBar/>
        <div className="background-image d-flex justify-content-center " style={{backgroundImage:`url('background_aboutus.png')`, height:'87.3vh'}}>
        <div className="about-us mt-5 " style={{width:'50%', height:'50%'}} >
          Welcome to ExLibris! With our user-friendly interface and intuitive features, you can easily track your
          reading journey and stay organized. Our application allows you to record the books you're currently
          reading, mark the pages or books you've completed. Whether you're a casual reader or a bookworm, our
          application provides a seamless way to monitor your progress, visualize your reading habits through
          insightful statistics, and celebrate your achievements. Start using our application today and embark on a
          rewarding reading adventure like never before!
        </div>
        </div>
    </>
  );
};

export default AboutUs;
