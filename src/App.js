import './App.css';
import React, { useState, useEffect } from 'react';
import Menu from './Menu';
import axios from 'axios';

function App() {
  const [age, setAge] = useState(null);
  // const [quote, setQuote] = useState('');
  // const [author, setAuthor] = useState('');
  // const [bookTitle, setBookTitle] = useState('');
  
  useEffect(() => {
    const birthday = new Date(2000, 8, 19);
    const today = new Date();
    const diffMilliseconds = today - birthday;
    const ageDate = new Date(diffMilliseconds);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    setAge(age);

    // axios.get('http://localhost:5000/api/quote')
    //   .then(response => {
    //     const data = response.data;
    //     setQuote(data.quote);
    //     setAuthor(data.author);
    //     setBookTitle(data.bookTitle);
    //   })
    //   .catch(error => console.error('Quote not found', error));
  }, []);

  return (
    <div className="main-page">
      <div className="top">
        <h1 className="name">Arthur Davtaev<span className="age">{age && `, ${age} y/o`}</span></h1>
        <div className="content"> <Menu /> </div>
      </div>
      {/* <div className="quote">
        <b>Random quote from book I've read:</b> 
        <br/> 
        {quote} 
        <br/> <br/>
        <i>from {bookTitle} by {author}</i>
      </div> */}
    </div>
  );
}

export default App;