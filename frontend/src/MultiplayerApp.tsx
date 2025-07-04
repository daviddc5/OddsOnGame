import React, { useState, useEffect } from "react";
import socketService, {
  GameResults,
  Player,
  GameRoom,
  Proposal,
} from "./services/socket";
import LuigiImg from "./assets/Luigi.jpg";

const MultiplayerApp: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [dare, setDare] = useState<string>("");
  const [maxRange, setMaxRange] = useState<number>(10);
  const [myChoice, setMyChoice] = useState<string>("");
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [choicesMade, setChoicesMade] = useState<number>(0);

  // Proposal states
  const [proposalDare, setProposalDare] = useState<string>("");
  const [proposalMaxRange, setProposalMaxRange] = useState<number>(10);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [isMyTurnToRespond, setIsMyTurnToRespond] = useState<boolean>(false);
  const [proposalHistory, setProposalHistory] = useState<string[]>([]);
  const [showProposalForm, setShowProposalForm] = useState<boolean>(false);

  useEffect(() => {
    const socket = socketService.connect();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Game event listeners
    socketService.onGameJoined((data) => {
      console.log("Game joined:", data);
      setCurrentRoom(data.room);
      setCurrentPlayer(data.player);
      setRoomId(data.roomId);
    });

    socketService.onPlayerJoined((data) => {
      console.log("Player joined:", data);
      setCurrentRoom(data.room);
    });

    socketService.onPlayerLeft((data) => {
      console.log("Player left:", data);
      setCurrentRoom((prev) =>
        prev ? { ...prev, players: data.remainingPlayers } : null
      );
    });

    socketService.onGameSettingsUpdated((data) => {
      setDare(data.dare);
      setMaxRange(data.maxRange);
    });

    socketService.onChoiceMade((data) => {
      setChoicesMade(data.choicesMade);
    });

    socketService.onGameResults((data) => {
      setGameResults(data);
    });

    socketService.onGameReset(() => {
      setGameResults(null);
      setMyChoice("");
      setChoicesMade(0);
      setCurrentProposal(null);
      setIsMyTurnToRespond(false);
      setShowProposalForm(false);
      setProposalDare("");
      setProposalMaxRange(10);

      // Update room state to waiting
      setCurrentRoom((prev) =>
        prev ? { ...prev, gameState: "waiting" } : null
      );
    });

    socketService.onError((error) => {
      alert(`Error: ${error.message}`);
    });

    // Proposal event listeners
    socketService.onProposalCreated((data) => {
      console.log("Proposal created:", data);
      setCurrentProposal(data.proposal);
      setIsMyTurnToRespond(data.currentNegotiator === socket.id);
      setProposalHistory((prev) => [
        ...prev,
        `${data.proposerName} proposed: "${data.proposal.dare}" (Range: ${data.proposal.maxRange})`,
      ]);

      // Update room state to negotiating
      setCurrentRoom((prev) =>
        prev
          ? {
              ...prev,
              gameState: "negotiating",
              currentProposal: data.proposal,
              currentNegotiator: data.currentNegotiator,
            }
          : null
      );
    });

    socketService.onProposalAccepted((data) => {
      console.log("Proposal accepted:", data);
      setCurrentProposal(null);
      setIsMyTurnToRespond(false);
      setDare(data.finalSettings.dare);
      setMaxRange(data.finalSettings.maxRange);
      setProposalHistory((prev) => [
        ...prev,
        `${data.responderName} accepted the proposal!`,
      ]);

      // Update room state to playing
      setCurrentRoom((prev) =>
        prev
          ? {
              ...prev,
              gameState: "playing",
              dare: data.finalSettings.dare,
              maxRange: data.finalSettings.maxRange,
            }
          : null
      );
    });

    socketService.onProposalRejected((data) => {
      console.log("Proposal rejected:", data);
      setCurrentProposal(null);
      setIsMyTurnToRespond(false);
      setProposalHistory((prev) => [
        ...prev,
        `${data.responderName} rejected the proposal.`,
      ]);

      // Update room state back to waiting
      setCurrentRoom((prev) =>
        prev ? { ...prev, gameState: "waiting" } : null
      );
    });

    socketService.onProposalCountered((data) => {
      console.log("Proposal countered:", data);
      setCurrentProposal(data.counterProposal);
      setIsMyTurnToRespond(data.currentNegotiator === socket.id);
      setProposalHistory((prev) => [
        ...prev,
        `${data.responderName} countered with: "${data.counterProposal.dare}" (Range: ${data.counterProposal.maxRange})`,
      ]);

      // Update room state with new proposal
      setCurrentRoom((prev) =>
        prev
          ? {
              ...prev,
              currentProposal: data.counterProposal,
              currentNegotiator: data.currentNegotiator,
            }
          : null
      );
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    socketService.joinGame({
      playerName: playerName.trim(),
      roomId: roomId.trim() || undefined,
    });
  };

  const handleSetSettings = () => {
    if (!currentRoom) return;

    socketService.setGameSettings(currentRoom.id, dare, maxRange);
  };

  const handleMakeChoice = () => {
    if (!currentRoom || !myChoice) return;

    const choice = parseInt(myChoice);
    if (isNaN(choice) || choice < 0 || choice > maxRange) {
      alert(`Please enter a number between 0 and ${maxRange}`);
      return;
    }

    socketService.makeChoice(currentRoom.id, choice);
  };

  const handleResetGame = () => {
    if (!currentRoom) return;
    socketService.resetGame(currentRoom.id);
  };

  const handleCreateProposal = () => {
    if (!currentRoom || !proposalDare.trim()) {
      alert("Please enter a dare");
      return;
    }

    socketService.createProposal(
      currentRoom.id,
      proposalDare.trim(),
      proposalMaxRange
    );
    setShowProposalForm(false);
    setProposalDare("");
    setProposalMaxRange(10);
  };

  const handleAcceptProposal = () => {
    if (!currentRoom || !currentProposal) return;
    socketService.respondToProposal(
      currentRoom.id,
      currentProposal.id,
      "accept"
    );
  };

  const handleRejectProposal = () => {
    if (!currentRoom || !currentProposal) return;
    socketService.respondToProposal(
      currentRoom.id,
      currentProposal.id,
      "reject"
    );
  };

  const handleCounterProposal = () => {
    if (!currentRoom || !currentProposal || !proposalDare.trim()) {
      alert("Please enter a counter-proposal");
      return;
    }

    socketService.respondToProposal(
      currentRoom.id,
      currentProposal.id,
      "counter",
      {
        dare: proposalDare.trim(),
        maxRange: proposalMaxRange,
      }
    );

    setShowProposalForm(false);
    setProposalDare("");
    setProposalMaxRange(10);
  };

  // Connection screen
  if (!isConnected) {
    return (
      <div
        className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${LuigiImg})` }}
      >
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-semibold text-center mb-4">
            Connecting to server...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Join game screen
  if (!currentRoom) {
    return (
      <div
        className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${LuigiImg})` }}
      >
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-semibold text-center mb-6">
            Join Odds On Game
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded bg-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Room ID (optional)
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="w-full p-3 rounded bg-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Leave empty to create new room"
              />
            </div>

            <button
              onClick={handleJoinGame}
              className="w-full bg-green-500 text-white py-3 rounded font-semibold hover:bg-green-600 transition"
            >
              {roomId ? "Join Room" : "Create New Room"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{ backgroundImage: `url(${LuigiImg})` }}
    >
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Room Info */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4">
            <h1 className="text-3xl font-semibold text-center mb-4">Odds On</h1>
            <div className="text-center">
              <p className="text-lg font-medium">
                Room ID:{" "}
                <span className="text-green-600 font-semibold">
                  {currentRoom.id}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Share this ID with your friend!
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Game State: {currentRoom.gameState}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">
              Players ({currentRoom.players.length}/2)
            </h2>
            <div className="space-y-2">
              {currentRoom.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded"
                >
                  <span className="font-medium">{player.name}</span>
                  {player.id === currentPlayer?.id && (
                    <span className="text-green-600 font-semibold">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Proposal System */}
          {currentRoom.players.length === 2 &&
            currentRoom.gameState !== "playing" &&
            !gameResults && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">
                  💬 Proposal & Negotiation
                </h2>

                {/* Current Game Settings */}
                {(dare || maxRange !== 10) && (
                  <div className="mb-4 p-3 bg-green-100 rounded border-2 border-green-500">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ Agreed Settings:
                    </h3>
                    <p>
                      <strong>Dare:</strong> {dare || "Not set"}
                    </p>
                    <p>
                      <strong>Max Range:</strong> {maxRange}
                    </p>
                  </div>
                )}

                {/* Current Proposal */}
                {currentProposal && (
                  <div className="mb-4 p-4 bg-blue-100 rounded border-2 border-blue-500">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      📋 Current Proposal:
                    </h3>
                    <p>
                      <strong>Dare:</strong> "{currentProposal.dare}"
                    </p>
                    <p>
                      <strong>Max Range:</strong> {currentProposal.maxRange}
                    </p>

                    {isMyTurnToRespond ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-blue-700">
                          🔄 Your turn to respond:
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAcceptProposal}
                            className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={handleRejectProposal}
                            className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                          >
                            ❌ Reject
                          </button>
                          <button
                            onClick={() => setShowProposalForm(true)}
                            className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                          >
                            🔄 Counter
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-2">
                        ⏳ Waiting for other player to respond...
                      </p>
                    )}
                  </div>
                )}

                {/* Create New Proposal */}
                {!currentProposal && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full bg-purple-500 text-white py-3 rounded hover:bg-purple-600 transition font-semibold"
                    >
                      📝 Create New Proposal
                    </button>
                  </div>
                )}

                {/* Proposal Form */}
                {showProposalForm && (
                  <div className="mb-4 p-4 bg-gray-100 rounded border-2 border-gray-300">
                    <h3 className="font-semibold mb-3">
                      {currentProposal
                        ? "🔄 Counter Proposal:"
                        : "📝 New Proposal:"}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Dare
                        </label>
                        <input
                          type="text"
                          value={proposalDare}
                          onChange={(e) => setProposalDare(e.target.value)}
                          className="w-full p-3 rounded bg-white border border-gray-300"
                          placeholder="Enter dare"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Max Range
                        </label>
                        <input
                          type="number"
                          value={proposalMaxRange}
                          onChange={(e) =>
                            setProposalMaxRange(parseInt(e.target.value) || 10)
                          }
                          className="w-full p-3 rounded bg-white border border-gray-300"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={
                          currentProposal
                            ? handleCounterProposal
                            : handleCreateProposal
                        }
                        className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                      >
                        {currentProposal
                          ? "🔄 Send Counter"
                          : "📤 Send Proposal"}
                      </button>
                      <button
                        onClick={() => {
                          setShowProposalForm(false);
                          setProposalDare("");
                          setProposalMaxRange(10);
                        }}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Proposal History */}
                {proposalHistory.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded border">
                    <h3 className="font-semibold mb-2 text-sm">
                      📜 Negotiation History:
                    </h3>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {proposalHistory.map((entry, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          {entry}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Make Choice */}
          {currentRoom.players.length === 2 &&
            currentRoom.gameState === "playing" &&
            !gameResults && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Make Your Choice</h2>
                <p className="text-gray-600 mb-4">
                  Choose a number between 0 and {maxRange}
                </p>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={myChoice}
                    onChange={(e) => setMyChoice(e.target.value)}
                    className="flex-1 p-3 rounded bg-gray-100"
                    placeholder="Enter your number"
                    min="0"
                    max={maxRange}
                  />
                  <button
                    onClick={handleMakeChoice}
                    className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
                  >
                    Submit Choice
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Choices made: {choicesMade}/2
                </p>
              </div>
            )}

          {/* Game Results */}
          {gameResults && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="space-y-4">
                {gameResults.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded"
                  >
                    <span className="font-medium">{player.name}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {gameResults.choices[player.socketId]}
                    </span>
                  </div>
                ))}

                <div
                  className={`p-4 rounded text-center ${
                    gameResults.isMatch
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-red-100 border-2 border-red-500"
                  }`}
                >
                  {gameResults.isMatch ? (
                    <div>
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        🎉 MATCH! 🎉
                      </p>
                      <p className="text-lg text-green-700">
                        Time to do the dare:
                      </p>
                      <p className="text-xl font-semibold text-green-800">
                        {gameResults.dare || "No dare set!"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        ❌ No Match!
                      </p>
                      <p className="text-lg text-red-700">Try again!</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleResetGame}
                  className="w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 transition font-semibold"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Waiting for player */}
          {currentRoom.players.length === 1 && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">
                Waiting for another player...
              </h2>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerApp;
