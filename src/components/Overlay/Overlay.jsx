import { useState } from 'react';

const Overlay = ({ children, onClose, onClickOut = () => null }) => {
  const [overlay, setOverlay] = useState(true);

  function handleClick(e) {
    if (e.target === e.currentTarget) {
      setOverlay(!overlay);
      document.body.classList.remove('overlay-body');
      onClickOut();
    }
  }

  if (overlay) {
    document.body.classList.add('overlay-body');
  } else {
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
