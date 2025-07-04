import React, { useState } from "react";
import SinglePlayerApp from "./SinglePlayerApp";
import MultiplayerApp from "./MultiplayerApp";
import LuigiImg from "./assets/Luigi.jpg";

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<"menu" | "single" | "multiplayer">(
    "menu"
  );

  if (gameMode === "single") {
    return <SinglePlayerApp />;
  }

  if (gameMode === "multiplayer") {
    return <MultiplayerApp />;
  }

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${LuigiImg})` }}
    >
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-semibold mb-8">Odds On Game</h1>

        <div className="space-y-4">
          <button
            onClick={() => setGameMode("single")}
            className="w-full bg-green-500 text-white py-4 rounded font-semibold hover:bg-green-600 transition text-lg"
          >
            🎮 Single Player
          </button>

          <button
            onClick={() => setGameMode("multiplayer")}
            className="w-full bg-blue-500 text-white py-4 rounded font-semibold hover:bg-blue-600 transition text-lg"
          >
            🌐 Multiplayer
          </button>
        </div>

        <p className="text-gray-600 mt-6 text-sm">
          Choose your game mode to start playing!
        </p>
      </div>
    </div>
  );
};

export default App;
