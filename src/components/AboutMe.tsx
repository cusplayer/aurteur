import React from 'react';
import * as style from '../styles/aboutme.module.css';

export const AboutMe: React.FC = () => {
  return (
    <div className={style.contactInfo}>
      <div className={style.mainContactBox}>
        <h3>main contact box</h3>
        <p>e-mail: <a href="mailto:gcosplayer@gmail.com" target="_blank">gcosplayer@gmail.com</a></p>
        <p>telegram: <a href="https://t.me/cusplayer" target="_blank" title="my tg">@cusplayer</a></p>
      </div>
      <div className='contactsOutsideTheBox'>
        <h3>contacts outside the box </h3>
        <p> <a href="https://open.spotify.com/playlist/6oN93EVXY7icuomoAUkGfO?si=6b173521693f4f38" target="_blank" title="artchaos playlist"> spotify playlist </a> </p>
        <p> <a href="https://rateyourmusic.com/~cusplayer" target="_blank" title="music nerdism"> rateyourmusic </a> </p>
        <p> <a href="https://goodreads.com/cusplayer" target="_blank" title="book nerdism"> goodreads </a> </p>
        <p> <a href="https://steamcommunity.com/id/cusplayer/" target="_blank" title="videogames"> steam </a> </p>
        <p> <a href="https://www.behance.net/aurteur" target="_blank" title="my behance">behance</a> </p>
      </div>
    </div>
  );
};
