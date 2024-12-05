import React from 'react';
import * as style from '../styles/title.module.css';

export const Title: React.FC = () => {
  return (
    <div className={style.name}>
      <pre>
&nbsp;    _         _   _                <br></br>
&nbsp;   / \   _ __| |_| |__  _   _ _ __ <br></br>
&nbsp;  / _ \ | '__| __| '_ \| | | | '__|<br></br>
&nbsp; / ___ \| |  | |_| | | | |_| | |   <br></br>
&nbsp;/_/   \_\_|   \__|_| |_|\__,_|_|   <br></br>
    </pre>                          
  </div>
  );
};