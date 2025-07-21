import React, { useState } from 'react';
import '../../Styles/components/_overlay.css';

const Overlay = ({ children, onButtonClick }) => {
  const [overlay, setOverlay] = useState(true);

  function handleClick(e) {
    onButtonClick({ currentTaget: e.currentTarget, target: e.target });

    if (e.target === e.currentTarget) {
      setOverlay(!overlay);
    }
  }

  return (
    <>
      {overlay && (
        <div onClick={handleClick} className="overlay" id="myOverlay">
          {children && children}
        </div>
      )}
    </>
  );
};

export default Overlay;
