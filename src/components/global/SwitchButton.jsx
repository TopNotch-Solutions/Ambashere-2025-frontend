import React, { useState } from 'react';


function SwitchButton() {
  const [isChecked, setIsChecked] = useState(false);

  const handleSwitch = () => {
    setIsChecked((prevChecked) => !prevChecked);
  };

  return (
    <div className={`switch-container ${isChecked ? 'checked' : ''}`} onClick={handleSwitch}>
      <div className="switch-slider" />
    </div>
  );
}

export default SwitchButton;
