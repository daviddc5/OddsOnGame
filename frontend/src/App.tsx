import React, { useState } from "react";
import LuigiImg from "./assets/Luigi.jpg";

export default function App() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [dare, setDare] = useState("");
  const [result, setResult] = useState("");

  const handleReveal = () => {
    const num1 = parseInt(player1, 10);
    const num2 = parseInt(player2, 10);

    if (isNaN(num1) || isNaN(num2)) {
      setResult("Please enter valid numbers for both players");
      return;
    }

    if (num1 === num2) {
      setResult(`Match! Dare time: ${dare || "No dare set!"}`);
    } else {
      setResult("No match! Try again.");
    }
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${LuigiImg})` }}
    >
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-2 gap-4 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="col-span-2 text-center text-2xl font-semibold">
            Odds On
          </div>

          <label className="flex flex-col">
            Player 1 Number:
            <input
              type="number"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-100"
            />
          </label>

          <label className="flex flex-col">
            Player 2 Number:
            <input
              type="number"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-100"
            />
          </label>

          <label className="col-span-2 flex flex-col">
            Dare:
            <input
              type="text"
              value={dare}
              onChange={(e) => setDare(e.target.value)}
              className="mt-1 p-2 rounded bg-gray-100"
            />
          </label>

          <button
            onClick={handleReveal}
            className="col-span-2 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            Reveal
          </button>

          {result && (
            <div className="col-span-2 text-center text-lg font-medium mt-2">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
