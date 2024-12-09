import React from 'react';
import * as style from '../styles/title.module.css';

export const Title: React.FC = () => {
  return (
    <div className={style.name}>
      <pre>
&nbsp;     _         _   _                  ____        _         _   _                <br></br>
&nbsp;    / \   _ __| |_| |__  _   _ _ __  |  _ \      / \  _   _| |_| |__   ___  _ __ <br></br>
&nbsp;   / _ \ | '__| __| '_ \| | | | '__| | | | |    / _ \| | | | __| '_ \ / _ \| '__|<br></br>
&nbsp;  / ___ \| |  | |_| | | | |_| | |    | |_| |   / ___ \ |_| | |_| | | | (_) | |   <br></br>
&nbsp; /_/   \_\_|   \__|_| |_|\__,_|_|    |____(_) /_/   \_\__,_|\__|_| |_|\___/|_|   <br></br>
    </pre>                          
  </div>
  );
};