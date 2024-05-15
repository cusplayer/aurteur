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
    const intervalId = setInterval(fetchCurrentTrack, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  async function fetchCurrentTrack() {
    try {
      const response = await axios.get('/current-track');
      if (response && response.data) {
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
    } catch (error) {
      console.error('Error fetching current track:', error.response.data);
    }
  }

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