import React from 'react';
import './contacts.css';

const ContactsModal = ({ closeModal }) => {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="contactInfo">
          <div className="mainContactBox">
            <h3>main contact box</h3>
            <p>e-mail: <a href="mailto:gcosplayer@gmail.com" target="_blank" rel="noopener noreferrer">gcosplayer@gmail.com</a></p>
            <p>telegram: <a href="https://t.me/cusplayer" target="_blank" rel="noopener noreferrer" title="my tg">@cusplayer</a></p>
          </div>
          <div className='contactsOutsideTheBox'>
            <h3>contacts outside the box </h3>
            <p> <a href="https://open.spotify.com/playlist/6oN93EVXY7icuomoAUkGfO?si=6b173521693f4f38" target="_blank" rel="noopener noreferrer" title="artchaos playlist"> spotify playlist </a> </p>
            <p> <a href="https://rateyourmusic.com/~cusplayer" target="_blank" rel="noopener noreferrer" title="music nerdism"> rateyourmusic </a> </p>
            <p> <a href="https://goodreads.com/cusplayer" target="_blank" rel="noopener noreferrer" title="book nerdism"> goodreads </a> </p>
            <p> <a href="https://steamcommunity.com/id/cusplayer/" target="_blank" rel="noopener noreferrer" title="videogames"> steam </a> </p>
            <p> <a href="https://www.behance.net/aurteur" target="_blank" rel="noopener noreferrer" title="my behance">behance</a> </p>
          </div>
        </div>
        <button className="close-modal-button" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default ContactsModal;
