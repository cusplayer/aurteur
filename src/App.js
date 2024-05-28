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
    let isMounted = true;

    async function fetchTrackInfo() {
      try {
        const response = await axios.get('/api/long-polling');
        if (response.status === 200 && response.data) {
          const { name, album, artist, is_playing } = response.data;
          setIsPlaying(is_playing);
          if (is_playing) {
            setTrackInfo({ name, album, artist });
          } else {
            setTrackInfo({});
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 204) {
          // No content, no changes detected
          console.log('No changes in the current track');
        } else {
          console.error('Error fetching current track:', error.response?.data || error.message);
        }
      } finally {
        if (isMounted) {
          fetchTrackInfo(); // Continue long-polling
        }
      }
    }

    fetchTrackInfo();

    return () => {
      isMounted = false;
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