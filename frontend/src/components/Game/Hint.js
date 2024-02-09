import React, { useEffect, useState, useRef } from "react";

function Hint({ currentHints, setindexesToBeDisplayed }) {
  const [maxHintIndex, setMaxHintIndex] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    setCurrentHintIndex(maxHintIndex);
  }, [maxHintIndex]);

  useEffect(() => {
    // Reset the hint index to 0 when currentHints changes
    setMaxHintIndex(0);
  }, [currentHints]);
  useEffect(() => {
    const delay = 10000;

    const updateIndex = () => {
      setMaxHintIndex((prevIndex) => {
        // Calculate the next index
        const nextIndex = prevIndex + 1;
        // Check if we have reached the end of the array
        if (nextIndex === currentHints.length) {
          // If so, stop the interval
          clearInterval(intervalRef.current);
        }
        // Return the next index, ensuring it does not exceed the array length
        return Math.min(nextIndex, currentHints.length - 1);
      });
    };

    intervalRef.current = setInterval(updateIndex, delay);

    return () => clearInterval(intervalRef.current); // Cleanup on component unmount
  }, [currentHints, maxHintIndex]);

  useEffect(() => {
    if (currentHints[maxHintIndex].type === "reveal letter") {
      setindexesToBeDisplayed((prevIndexes) => [
        ...prevIndexes,
        currentHints[maxHintIndex].revealedIndex,
      ]);
    }
  }, [maxHintIndex, currentHints, setindexesToBeDisplayed]);

  const showPreviousHint = () => {
    setCurrentHintIndex((prevIndex) => prevIndex - 1);
  };

  const showNextHint = () => {
    setCurrentHintIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <div
      className={` bg-gray-700 border shadow  shadow-gray-500 p-3  items-center text-center rounded w-72 h-44 flex flex-col `}
    >
      <div className="w-3/4 h-1/4 flex items-center justify-center">
        <button
          type="button"
          title="previous"
          onClick={showPreviousHint}
          disabled={currentHintIndex === 0}
          className={` ${currentHintIndex === 0 ? "text-gray-700" : ""} `}
        >
          <ChevronLeftIcon />
        </button>
        <span className="font-semibold p-4">Hint {currentHintIndex + 1}</span>
        <button
          type="button"
          title="next"
          onClick={showNextHint}
          disabled={currentHintIndex === maxHintIndex}
          className={` ${
            currentHintIndex === maxHintIndex ? "text-gray-700" : ""
          }`}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="min-w-0 min-h-0 w-3/4 h-3/4 flex items-center justify-center">
        {currentHints[currentHintIndex].type === "text" && (
          <span className="text-xl overflow-auto">
            {currentHints[currentHintIndex].text}
          </span>
        )}
        {currentHints[currentHintIndex].type === "reveal letter" && (
          <span>{currentHints[currentHintIndex].text}</span>
        )}
        {currentHints[currentHintIndex].type === "show flag" && (
          <img
            src={currentHints[currentHintIndex].svg}
            alt="Flag"
            className="max-w-[120px] md:max-w-[140px] max-h-[100px] rounded shadow-lg"
          />
        )}
      </div>
    </div>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default Hint;
