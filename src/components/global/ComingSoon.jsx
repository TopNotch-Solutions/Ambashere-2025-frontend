import React, { useState, useEffect } from 'react';
import "../../assets/style/global/comingSoon.css"

const ComingSoon = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2024-09-08") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-75 w-100 coming-soon-bg">
      <div className="text-center p-4 rounded bg-dark bg-opacity-75 text-white">
        <h1 className="mb-4">Coming Soon</h1>
        <p className="mb-4">We're working hard to bring you something amazing. Stay tuned!</p>
        <div className="d-flex justify-content-center align-items-center">
          {timeLeft.days !== undefined ? (
            <>
              <div className="mx-2">
                <div className="bg-secondary p-3 rounded">
                  <span className="display-4">{String(timeLeft.days).padStart(2, '0')}</span>
                </div>
                <div className="mt-2">DAYS</div>
              </div>

              <span className="display-4 mx-1">:</span>
              <div className="mx-2">
                <div className="bg-secondary p-3 rounded">
                  <span className="display-4">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <div className="mt-2">HOURS</div>
              </div>

              <span className="display-4 mx-1">:</span>
              <div className="mx-2">
                <div className="bg-secondary p-3 rounded">
                  <span className="display-4">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <div className="mt-2">MINUTES</div>
              </div>
              <span className="display-4 mx-1">:</span>
              
              <div className="mx-2">
                <div className="bg-secondary p-3 rounded">
                  <span className="display-4">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
                <div className="mt-2">SECONDS</div>
              </div>
            </>
          ) : (
            <span>Time's up!</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
