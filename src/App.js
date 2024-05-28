import './App.css';
import Menu from './Menu';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  initArrowNavigation,
  FocusableElement,
  FocusableGroup
} from '@arrow-navigation/react'

initArrowNavigation()


function App() {
  const [trackInfo, setTrackInfo] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const fetchCurrentTrack = async () => {
      try {
        const response = await axios.get('/api/long-polling');
        if (isSubscribed && response && response.data) {
          const { name, album, artist, is_playing } = response.data;
          setIsPlaying(is_playing);
          if (is_playing) {
            setTrackInfo({ name, album, artist });
          } else {
            setTrackInfo({});
          }
        } else {
          console.error('Response or response.data is undefined');
        }
        fetchCurrentTrack(); // Рекурсивный вызов для продолжения long-polling
      } catch (error) {
        console.error('Error fetching current track:', error.response ? error.response.data : error.message);
        setTimeout(fetchCurrentTrack, 5000); // Попробуйте снова через 5 секунд в случае ошибки
      }
    };

    fetchCurrentTrack();

    return () => {
      isSubscribed = false;
    };
  }, []);


  return (
    <div className="main-page">
      <div className="top">
        <div className="tittleInfo">
            <h1 className="name">Arthur Davtaev {isPlaying && trackInfo.name && trackInfo.artist && trackInfo.album && (<span className="trackInfo">listens to <b><i>{trackInfo.name}</i></b> by <b><i>{trackInfo.artist}</i></b> right now</span>)}</h1>
        </div>
        <div className="content"> <Menu /> </div>
      </div>
    </div>
  );
}

export default App;