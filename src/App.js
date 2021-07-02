import React, { useState, useRef } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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
    <button onClick={signInWithGoogle}> Sign in with Google </button>
  )
}

function Signout() {
  return auth.currentUser && (
    <button id="SignOut" onClick={() => auth.signOut()} > Sign Out </button>
  )
}

function Dashboard() {
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

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
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <main>
        <div className="head" > <Signout /> </div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy} ></div>
      </main>
      <form onSubmit={sendMessage} className="form" >
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit"> Send </button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <div id="pic"><img src={photoURL} className="userPhoto" /></div>
      <div id="text">{text}</div>
    </div>
  )
}

export default App;
