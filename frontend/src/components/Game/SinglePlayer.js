import React, { useEffect, useState, useMemo } from "react";
import Hint from "./Hint";
import TimerIcon from "./TimerIcon";

const SinglePlayer = ({ socket, playerUsername, setSignlePlayer }) => {
  const [gameState, setGameState] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);

  const [timer, setTimer] = useState(50);
  const [currentCountryIndex, setCurrentCountryIndex] = useState(0);
  const [previousCountry, setPreviousCountry] = useState(null);
  const [indexesToBeDisplayed, setindexesToBeDisplayed] = useState([]);
  const [countryVisible, setCountryVisible] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [timerAnimation, setTimerAnimation] = useState(false);
  const [correctAnimation, setCorrectAnimation] = useState(false);
  const [emoji, setEmoji] = useState("🧐");
  const [gameEnded, setGameEnded] = useState(false);

  const handleChange = () => {
    if (isIncorrect) setIsIncorrect(false);
  };

  const currentCountry = gameState
    ? gameState[currentCountryIndex].country
    : null;

  const currentHints = gameState ? gameState[currentCountryIndex].hints : null;

  const index = currentCountryIndex + 1 ?? 0;

  useEffect(() => {
    socket.emit("SinglePlayer");
    socket.on("SinglePlayer", (data) => {
      setGameState(data);
    });

    return () => {
      socket.off("gameState");
    };
  }, [socket, setGameState]);

  useEffect(() => {
    // Check if the country has changed
    if (currentCountry !== previousCountry) {
      setCountryVisible(false);
      setTimerAnimation(false);
      setTimer(50); // Update the timer when the country changes
      setindexesToBeDisplayed([]);
      setPreviousCountry(currentCountry); // Update the previous country

      const emojis = [
        "😊",
        "😄",
        "😃",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😇",
        "😉",
        "😌",
        "😜",
        "😝",
        "😛",
        "😋",
        "😎",
        "🤓",
        "🧐",
      ];
      const randomIndex = Math.floor(Math.random() * emojis.length);
      setEmoji(emojis[randomIndex]);
    }
  }, [currentCountry, previousCountry]);

  useEffect(() => {
    const countdown = setInterval(() => {
      // Decrease timer by 1 every second
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);
    // Clear the interval when the component unmounts or timer reaches 0
    return () => clearInterval(countdown);
  }, [timer]);

  useEffect(() => {
    // Check if the timer has reached 0
    if (timer === 9) {
      setTimerAnimation(true);
      setTimeout(() => {
        setTimerAnimation(false);
      }, 9000);
    }
    if (timer === 0) {
      setCountryVisible(true);
    }
    if (timer === -3) {
      if (gameState)
        if (currentCountryIndex < gameState.length - 1) {
          setCurrentCountryIndex((prevIndex) => prevIndex + 1);
        } else {
          const newMsg = {
            sender: "Server",
            message: `${playerUsername} scored ${playerScore} in single player mode 🎮`,
            time: new Date(),
          };
          socket.emit("GlobalChat", newMsg);
          setGameState(null);
          setGameEnded(true);
        }
    }
  }, [
    timer,
    socket,
    currentCountryIndex,
    gameState,
    playerScore,
    playerUsername,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.trim();
      if (inputValue === "" || countryVisible) {
        e.target.value = "";
        return;
      }

      // Clear the input field
      e.target.value = "";
      if (inputValue.toLowerCase() === currentCountry.toLowerCase()) {
        //score and index
        setPlayerScore((prevScore) => prevScore + 50 + timer);
        setCorrectAnimation(true);
        setTimeout(() => {
          setCorrectAnimation(false);
        }, 1000);
        if (gameState)
          if (currentCountryIndex < gameState.length - 1) {
            setCurrentCountryIndex((prevIndex) => prevIndex + 1);
          } else {
            setGameState(null);
            setGameEnded(true);
          }
      } else {
        setIsIncorrect(true);
        setTimeout(() => {
          setIsIncorrect(false);
        }, 500);
      }
    }
  };

  const handleExitButtonClick = () => {
    setSignlePlayer(false);
  };

  const displayWord = useMemo(() => {
    return (country) => {
      country = country.toUpperCase();
      return (
        <div className="flex w-full md:w-auto justify-center">
          {country.split("").map((char, index) => (
            <span key={index} className={`mr-3`}>
              {indexesToBeDisplayed.includes(index) || char === " "
                ? char
                : "_"}
            </span>
          ))}
          <span className="text-base">
            {currentCountry && (
              <span className="rounded bg-gray-700 px-2 py-1 text-lg">
                {currentCountry.length}
              </span>
            )}
          </span>
        </div>
      );
    };
  }, [indexesToBeDisplayed, currentCountry]);

  const displayVisibleWord = (country) => {
    country = country.toUpperCase();
    return (
      <div className="flex text-red-500 mx-auto">
        {country.split("").map((char, index) => (
          <span key={index} className={`mr-2`}>
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      {gameEnded && (
        <div className="bg-gray-500 m-auto font-mono flex flex-col p-6 text-xl overflow-hidden rounded items-center font-semibold">
          <p className="font-bold">Good Game! 😎🔥</p>
          <div className="mt-5">
            <ul>
              <li key={playerUsername} className="mb-2">
                <span className="font-semibold ">
                  <span className="italic"></span> {playerUsername}
                </span>
                <span className="ml-4 text-green-400 font-bold">
                  {playerScore}
                </span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={handleExitButtonClick}
            className="mt-2 text-base bg-sky-900 font-sans  hover:bg-sky-700 px-4 py-2 
        font-semibold leading-6 shadow rounded-md text-white transition
         ease-in-out duration-150  ring-1 ring-slate-900/10"
          >
            Back To Lobby ⬅
          </button>
        </div>
      )}
      {gameState && (
        <div className="min-w-full min-h-full justify-around text-white text-lg md:text-xl items-center flex flex-col font-mono">
          <span className="md:hidden text-lg md:text-2xl">
            {index}/{gameState.length}
          </span>
          <div className="text-2xl md:text-3xl w-full md:w-1/2 flex self-center mx-auto md:justify-between">
            <span className="hidden md:flex text-2xl">
              {index}/{gameState.length}
            </span>
            {!countryVisible && displayWord(currentCountry)}
            {countryVisible && displayVisibleWord(currentCountry)}
            <span className="hidden md:flex"></span>
          </div>
          {!countryVisible && (
            <div
              className={`flex justify-center w-full gap-1 ${
                timerAnimation ? "shake-timer text-red-400" : ""
              }`}
            >
              <TimerIcon /> <span>{timer}s</span>
            </div>
          )}
          <Hint
            currentHints={currentHints}
            setindexesToBeDisplayed={setindexesToBeDisplayed}
          />
          <div className="flex flex-col md:flex-row min-w-full justify-around items-center">
            <div className="flex items-center  md:flex-col justify-around order-3 w-1/2 m-2 md:m-0 md:w-36 md:h-32 bg-gray-700 border  rounded md:p-4 text-center shadow shadow-gray-500">
              <p className="mb-2">SCORE</p>
              <p className="mb-2">{playerScore}</p>
            </div>
            <input
              className={` ${isIncorrect ? " bg-red-900 shake" : ""} ${
                correctAnimation ? "bg-green-900" : ""
              } order-1 md:order-4 m-2 md:m-0  md:w-50 md:h-10 self-center rounded-lg p-4 md:p-6 placeholder:italic shadow shadow-gray-500 placeholder:capitalize text-center text-black font-semibold uppercase`}
              placeholder={
                isIncorrect
                  ? "Incorrect!!"
                  : correctAnimation
                  ? "Correct!!"
                  : "Guess Here"
              }
              onKeyDown={handleKeyDown}
              onChange={handleChange}
            />
            <div className="flex items-center md:flex-col order-5 w-1/2 justify-around  md:w-36 md:h-32 m-2 md:m-0 bg-gray-700 border rounded md:p-4 text-center shadow shadow-gray-500">
              <p className="mb-2 "> {emoji}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SinglePlayer;
