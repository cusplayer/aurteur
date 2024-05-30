import './App.css';
import Menu from './Menu.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import {
  initArrowNavigation,
  FocusableElement,
  FocusableGroup
} from '@arrow-navigation/react'

initArrowNavigation()

async function fetcher(url) {
  const response = await axios.get(url);
  return response.data;
}

function App() {
  const [trackInfo, setTrackInfo] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const { data, error, mutate } = useSWR('/api/long-polling', fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (data) {
      const { name, album, artist, is_playing } = data;
      setIsPlaying(is_playing);
      if (is_playing) {
        setTrackInfo({ name, album, artist });
      } else {
        setTrackInfo({});
      }
      mutate('/api/long-polling');
    }
  }, [data]);


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