import React, { useState } from 'react';
import { truncateKey } from '@/utils/generalUtils';

const Copier = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const copyText = document.createElement('textarea');
    copyText.value = text;
    document.body.appendChild(copyText);
    copyText.select();
    document.execCommand('copy');
    document.body.removeChild(copyText);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="d-flex align-items-center">
      <div className="copy-container">
        <input
          type="text"
          className="copy-input text-white"
          value={text}
          readOnly
        />
        <div className="tooltip-s1">
          <button
            onClick={handleCopy}
            className={`copy-text text-white ms-2 ${isCopied ? 'disabled' : ''}`}
            type="button"
          >
            <span className="tooltip-s1-text tooltip-text">
              {isCopied ? 'Copied' : 'Copy'}
            </span>
            <em className="ni ni-copy"></em>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Copier;
