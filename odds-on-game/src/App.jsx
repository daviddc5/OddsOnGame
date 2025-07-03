import React, { useState } from "react";

const darePlaceholders = [
  "Sing a song!",
  "Do 10 push-ups!",
  "Share a fun fact!",
  "Dance for 30 seconds!",
  "Tell a joke!",
];

function getRandomPlaceholder() {
  return darePlaceholders[Math.floor(Math.random() * darePlaceholders.length)];
}

const minOdds = 2;
const maxOdds = 10;

const App = () => {
  // Game state
  const [dare, setDare] = useState("");
  const [odds, setOdds] = useState(2);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [error, setError] = useState("");

  // Handlers
  const handleSetDare = (e) => {
    e.preventDefault();
    setError("");
    if (!dare.trim()) {
      setError("Please enter a dare.");
      return;
    }
    if (odds < minOdds || odds > maxOdds) {
      setError(`Odds must be between ${minOdds} and ${maxOdds}.`);
      return;
    }
    setRevealed(false);
    setOutcome(null);
  };

  const handleReveal = (e) => {
    e.preventDefault();
    setError("");
    if (!player1 || !player2) {
      setError("Both players must enter their numbers.");
      return;
    }
    if (
      isNaN(player1) ||
      isNaN(player2) ||
      player1 < 1 ||
      player2 < 1 ||
      player1 > odds ||
      player2 > odds
    ) {
      setError(`Numbers must be between 1 and ${odds}.`);
      return;
    }
    setRevealed(true);
    setOutcome(player1 === player2 ? "MATCH" : "DO NOT MATCH");
  };

  const handleReset = () => {
    setDare("");
    setOdds(2);
    setPlayer1("");
    setPlayer2("");
    setRevealed(false);
    setOutcome(null);
    setError("");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/Luigi.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div className="relative z-10 w-full max-w-md mx-4 my-8 bg-white bg-opacity-80 backdrop-blur-sm shadow-xl rounded-2xl border border-blue-200 p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-serif font-bold text-center text-gray-800 mb-2">
          Odds On Game
        </h1>
        <p className="text-center text-gray-700 font-sans mb-2">
          Set a dare, pick the odds, and see if you match!
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-center font-sans text-sm">
            {error}
          </div>
        )}

        {/* Dare & Odds Form */}
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSetDare}
          autoComplete="off"
        >
          <div>
            <label
              className="block text-gray-800 font-sans mb-1"
              htmlFor="dare"
            >
              Dare
            </label>
            <input
              id="dare"
              type="text"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder={getRandomPlaceholder()}
              value={dare}
              onChange={(e) => setDare(e.target.value)}
              disabled={revealed || outcome}
            />
          </div>
          <div>
            <label
              className="block text-gray-800 font-sans mb-1"
              htmlFor="odds"
            >
              Odds (2-10)
            </label>
            <input
              id="odds"
              type="number"
              min={minOdds}
              max={maxOdds}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              value={odds}
              onChange={(e) => setOdds(Number(e.target.value))}
              disabled={revealed || outcome}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold font-sans shadow-md hover:scale-105 transition"
            disabled={revealed || outcome}
          >
            Set Dare
          </button>
        </form>

        {/* Dare Card */}
        {dare && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <span className="text-gray-800 font-sans">
              <span className="font-semibold">Dare:</span> {dare}
            </span>
            <div className="text-blue-700 font-bold mt-1 font-sans">
              Odds: 1 in {odds}
            </div>
          </div>
        )}

        {/* Player Inputs */}
        {dare && !outcome && (
          <form
            className="flex flex-col gap-4"
            onSubmit={handleReveal}
            autoComplete="off"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  className="block text-gray-800 font-sans mb-1"
                  htmlFor="player1"
                >
                  Player 1 Number
                </label>
                <input
                  id="player1"
                  type="number"
                  min={1}
                  max={odds}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={`1-${odds}`}
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                  disabled={revealed}
                />
              </div>
              <div className="flex-1">
                <label
                  className="block text-gray-800 font-sans mb-1"
                  htmlFor="player2"
                >
                  Player 2 Number
                </label>
                <input
                  id="player2"
                  type="number"
                  min={1}
                  max={odds}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-sans focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder={`1-${odds}`}
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  disabled={revealed}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white font-bold font-sans shadow-md hover:scale-105 transition"
              disabled={revealed}
            >
              Reveal
            </button>
          </form>
        )}

        {/* Outcome Card */}
        {revealed && outcome && (
          <div
            className={`rounded-lg p-4 text-center font-sans border
              ${
                outcome === "MATCH"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }
            `}
          >
            <div
              className={`text-2xl font-bold mb-2
                ${outcome === "MATCH" ? "text-green-600" : "text-red-600"}
              `}
            >
              {outcome}
            </div>
            <div className="text-gray-800">
              Player 1: <span className="font-semibold">{player1}</span>
              <br />
              Player 2: <span className="font-semibold">{player2}</span>
            </div>
            {outcome === "MATCH" && (
              <div className="mt-2 text-green-700 font-semibold">
                You must do the dare!
              </div>
            )}
            {outcome === "DO NOT MATCH" && (
              <div className="mt-2 text-gray-700">
                You're safe... this time!
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        {(dare || outcome) && (
          <button
            className="w-full py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold font-sans shadow-md hover:scale-105 transition mt-2"
            onClick={handleReset}
          >
            Reset
          </button>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-2 font-sans">
          Odds On Game &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default App;
