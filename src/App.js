import React, { useState, useRef } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

firebase.initializeApp({
  apiKey: "AIzaSyAJRs9Qd6EY1FJN97C_NtEXQJkrgoeanvE",
  authDomain: "chat-app-73822.firebaseapp.com",
  projectId: "chat-app-73822",
  storageBucket: "chat-app-73822.appspot.com",
  messagingSenderId: "417246739192",
  appId: "1:417246739192:web:3048610a5fb97d93c2990d",
  measurementId: "G-9TSXC66NV9"
})

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {
  
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <section>
          {user ? <Dashboard /> : <SignIn />}
        </section>
      </header>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <Button variant="primary" id="SignIn" onClick={signInWithGoogle}> Sign in with Google </Button>
  )
}

function Signout() {
  return auth.currentUser && (
    <Button variant="primary" id="SignOut" onClick={() => auth.signOut()} > Sign Out </Button>
    )
}

function Dashboard() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    .then((msg) => {
      console.log("Document added with ID: ", msg.id);
    })
    .catch((error) => {
      console.log("Error adding document: ", error);
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
      <Container className="heading">
      <Row>
      <Col xs lg="4">
       <Signout />
      </Col>
      </Row>
      </Container>

      <div className="messages">
        {messages && messages.slice(0).reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy} ></div>
      </div>

      </main>

      <form onSubmit={sendMessage} className="form" >
        <Container>
          <Row>
          <Col xs lg="6">
            <InputGroup size="lg"  >
              <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-lg">Message</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl aria-label="Large" aria-describedby="inputGroup-sizing-sm" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </InputGroup>
          </Col>
          
            {/* <input value={formValue} onChange={(e) => setFormValue(e.target.value)} /> */}
          <Col xs lg="6">
            <Button variant="success" type="submit" disabled={!formValue} > Send </Button>
          </Col>
          </Row>
        </Container>
      </form>
  </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <Card className={`message ${messageClass}`}>
      <div id="pic"><img src={photoURL} className="userPhoto" /></div>
      <Card.Body>
        {text}
      </Card.Body>
    </Card>
  )
}

export default App;
