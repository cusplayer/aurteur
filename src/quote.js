import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Quote = () =>  {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  useEffect(() => {
    axios.get('http://localhost:5000/api/quote')
      .then(response => {
        const data = response.data;
        setQuote(data.quote);
        setAuthor(data.author);
        setBookTitle(data.bookTitle);
      })
      .catch(error => console.error('Quote not found', error));
  }, []);
  
  return (
    <div className="quote">
      <b>Random quote from book I've read:</b> 
      <br/> 
      {quote} 
      <br/> <br/>
      <i>from {bookTitle} by {author}</i>
    </div>
  );
};

export default Quote;
