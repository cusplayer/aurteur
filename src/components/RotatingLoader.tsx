// RotatingLoader.tsx
import React, { useEffect, useState } from 'react';
import * as style from '../styles/rotatingLoader.module.css';

interface RotatingLoaderProps {
  rotations?: number;
  loading?: boolean;
  onFinish?: () => void;
}

export const Loader: React.FC<RotatingLoaderProps> = ({ rotations, loading, onFinish }) => {
  const symbols = ['/', '-', '\\', '|'];
  const [index, setIndex] = useState(0);
  const [completedRotations, setCompletedRotations] = useState(0);

  useEffect(() => {
    if ((rotations == null && !loading) || (rotations !== undefined && rotations <= 0)) return;

    const interval = setInterval(() => {
      setIndex(prev => {
        const nextIndex = (prev + 1) % symbols.length;
        if (rotations && nextIndex === 0) {
          setCompletedRotations(r => r + 1);
        }
        return nextIndex;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [rotations, loading]);

  useEffect(() => {
    if (rotations && completedRotations >= rotations) {
      onFinish?.();
    }
  }, [completedRotations, rotations, onFinish]);

  const isVisible = (rotations && completedRotations < rotations) || (rotations == null && loading === true);

  return isVisible ? (
    <div className={style.loaderContainer}>
      <span className={style.loaderSymbol}>{symbols[index]}</span>
    </div>
  ) : null;
};
