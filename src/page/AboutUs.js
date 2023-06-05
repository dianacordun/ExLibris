import React from 'react'
import Layout from '../components/Layout';
import { Image } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <Layout title='ExLibris | About Us' content='About Us'>

    <div>
    Welcome to our reading progress tracking application! With our user-friendly interface and intuitive features, you can easily track your reading journey and stay organized. Our application allows you to record the books you're currently reading, mark the pages or chapters you've completed, and set reading goals to keep yourself motivated. You can also add notes or comments to specific sections of the book, making it a personalized reading experience. Whether you're a casual reader or a bookworm, our application provides a seamless way to monitor your progress, visualize your reading habits through insightful statistics, and celebrate your achievements. Start using our application today and embark on a rewarding reading adventure like never before!
    </div>
    <Image src="not_found.png" style={{ width: '20vw', height: '20vh'}} fluid />
    </Layout>
  )
}

export default AboutUs