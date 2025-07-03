import React, { useState } from "react";

export default function App() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [xValue, setXValue] = useState(10);
  const [dare, setDare] = useState("");
  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (number1 === "" || number2 === "") return;
    setRevealed(true);
  };

  const resetGame = () => {
    setNumber1("");
    setNumber2("");
    setRevealed(false);
  };

  const isMatch = parseInt(number1) === parseInt(number2);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)
        `,
      }}
    >
      {/* Casino-style background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute top-20 right-20 w-16 h-16 bg-yellow-400 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-12 h-12 bg-yellow-400 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="backdrop-blur-sm bg-white/95 border-8 border-green-600 shadow-2xl rounded-3xl p-8 w-full max-w-2xl relative z-10">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-3">
          <span className="w-10 h-10 bg-yellow-400 rounded-full border-4 border-green-600 shadow-lg flex items-center justify-center text-green-800 text-2xl font-black animate-bounce">
            🎰
          </span>
          <span
            className="w-10 h-10 bg-yellow-400 rounded-full border-4 border-green-600 shadow-lg flex items-center justify-center text-green-800 text-2xl font-black animate-bounce"
            style={{ animationDelay: "0.2s" }}
          >
            ♠️
          </span>
          <span
            className="w-10 h-10 bg-yellow-400 rounded-full border-4 border-green-600 shadow-lg flex items-center justify-center text-green-800 text-2xl font-black animate-bounce"
            style={{ animationDelay: "0.4s" }}
          >
            🎰
          </span>
        </div>

        {/* Casino Sign */}
        <div className="text-center mb-6">
          <h1
            className="text-6xl font-black text-green-800 mb-2 drop-shadow-lg tracking-widest"
            style={{
              textShadow: "3px 3px 0px #166534, 6px 6px 0px #15803d",
              fontFamily: "serif",
            }}
          >
            ODDS ON
          </h1>
          <h2
            className="text-4xl font-black text-yellow-500 mb-2 drop-shadow-lg tracking-wider"
            style={{
              textShadow: "2px 2px 0px #ca8a04, 4px 4px 0px #eab308",
              fontFamily: "serif",
            }}
          >
            Do you dare take the odds?
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 via-green-500 to-yellow-400 mx-auto rounded-full shadow-lg"></div>
        </div>

        <p className="text-center text-green-700 mb-8 font-semibold text-lg italic">
          🎲 A game of chance, dares, and fun! 🎲
        </p>

        {/* Player Names */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="🎮 Player 1 Name"
            value={player1}
            onChange={setPlayer1}
          />
          <Input
            label="🎮 Player 2 Name"
            value={player2}
            onChange={setPlayer2}
          />
        </div>

        {/* Settings */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="🎯 Set Max Range (X)"
            type="number"
            min={1}
            value={xValue}
            onChange={setXValue}
          />
          <Input label="💀 Enter Dare" value={dare} onChange={setDare} />
        </div>

        {/* Number Inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Input
            label={`🎴 ${player1 || "Player 1"}'s Number`}
            type="number"
            min={0}
            max={xValue}
            value={number1}
            onChange={setNumber1}
            disabled={revealed}
          />
          <Input
            label={`🎴 ${player2 || "Player 2"}'s Number`}
            type="number"
            min={0}
            max={xValue}
            value={number2}
            onChange={setNumber2}
            disabled={revealed}
          />
        </div>

        {/* Reveal Button */}
        <button
          onClick={handleReveal}
          disabled={revealed}
          className="w-full bg-gradient-to-r from-yellow-400 via-green-500 to-yellow-400 hover:from-yellow-500 hover:via-green-600 hover:to-yellow-500 text-green-900 font-extrabold py-4 rounded-xl transition disabled:opacity-50 shadow-xl border-4 border-green-600 tracking-wider text-xl transform hover:scale-105 active:scale-95"
          style={{
            textShadow: "1px 1px 0px #ca8a04",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          }}
        >
          🃏 REVEAL CARDS 🃏
        </button>

        {/* Result Display */}
        {revealed && (
          <div className="text-center mt-6">
            <div className="bg-gradient-to-r from-yellow-100 to-green-100 border-4 border-green-600 rounded-2xl p-6 shadow-xl">
              <p className="text-lg text-green-900 font-bold mb-2">
                {player1 || "Player 1"} drew:{" "}
                <span className="inline-block px-4 py-2 bg-white border-4 border-green-600 rounded-xl shadow-lg text-3xl mx-2 font-black text-green-800">
                  {number1}
                </span>
              </p>
              <p className="text-lg text-green-900 font-bold mb-4">
                {player2 || "Player 2"} drew:{" "}
                <span className="inline-block px-4 py-2 bg-white border-4 border-green-600 rounded-xl shadow-lg text-3xl mx-2 font-black text-green-800">
                  {number2}
                </span>
              </p>

              {isMatch ? (
                <div className="bg-gradient-to-r from-yellow-200 to-green-200 border-4 border-yellow-500 rounded-xl p-4">
                  <p className="text-3xl text-green-800 font-extrabold drop-shadow-lg mb-2">
                    🎉 MATCH! 🎉
                  </p>
                  <p className="text-xl text-green-900 font-bold italic">
                    Do the dare: <span className="text-yellow-700">{dare}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-500 rounded-xl p-4">
                  <p className="text-2xl text-red-800 font-extrabold drop-shadow-lg">
                    ❌ No match! ❌
                  </p>
                  <p className="text-lg text-red-700 font-semibold italic">
                    The house wins this round! 🏠
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={resetGame}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-400 via-green-500 to-yellow-400 text-green-900 font-bold border-4 border-green-600 hover:from-yellow-500 hover:via-green-600 hover:to-yellow-500 rounded-xl transition shadow-lg tracking-wider text-lg transform hover:scale-105 active:scale-95"
              style={{
                textShadow: "1px 1px 0px #ca8a04",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              🎮 PLAY AGAIN 🎮
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Input Component
function Input({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  min,
  max,
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        disabled={disabled}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full px-4 pt-6 pb-3 bg-white text-green-900 placeholder-transparent border-4 border-green-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-400 disabled:bg-gray-100 font-semibold shadow-lg transition-all duration-200"
        placeholder={label}
        style={{
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        }}
      />
      <label className="absolute left-4 top-2 text-sm text-green-800 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-green-400 transition-all duration-200 font-bold">
        {label}
      </label>
    </div>
  );
}
