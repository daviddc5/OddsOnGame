import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

//Type definitions for our game
interface Player {
  id: string;
  name: string;
  // socketId is the id of the socket that the player is connected to
  socketId: string;
}

interface Proposal {
  id: string;
  proposerId: string;
  dare: string;
  maxRange: number;
  status: "pending" | "accepted" | "rejected" | "countered";
  timestamp: Date;
}

interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  gameState: "waiting" | "negotiating" | "playing" | "revealing" | "finished";
  dare: string;
  maxRange: number;
  playerChoices: Record<string, number>;
  currentProposal: Proposal | null;
  proposalHistory: Proposal[];
  currentNegotiator: string | null; // socketId of player whose turn it is to respond
}

interface JoinGameData {
  playerName: string;
  roomId?: string;
}
interface GameChoiceData {
  roomId: string;
  choice: number;
}

interface GameSettingsData {
  roomId: string;
  dare: string;
  maxRange: number;
}

interface ProposalData {
  roomId: string;
  dare: string;
  maxRange: number;
}

interface ProposalResponseData {
  roomId: string;
  proposalId: string;
  action: "accept" | "reject" | "counter";
  counterProposal?: {
    dare: string;
    maxRange: number;
  };
}

// server setup
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// In memmory storage for game rooms

const gamesRooms: Map<string, GameRoom> = new Map();

// Middleware
app.use(cors());
app.use(express.json());

//Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Odds On Game Server Running properly!",
    activeRooms: gamesRooms.size,
    timeStamp: new Date().toISOString(),
  });
});

// Helper function to generate room ID
const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Socket.io connection handling
io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up: remove player from any rooms they were in
    for (const [roomId, room] of gamesRooms.entries()) {
      const playerIndex = room.players.findIndex(
        (p) => p.socketId === socket.id
      );

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // If room is empty, delete it
        if (room.players.length === 0) {
          gamesRooms.delete(roomId);
        } else {
          // Notify remaining players
          socket.to(roomId).emit("player-left", {
            playerId: socket.id,
            remainingPlayers: room.players,
          });
        }
      }
    }
  });

  // Join or create a game room
  socket.on("join-game", (data: JoinGameData) => {
    console.log("User joined game:", data);

    let roomId = data.roomId;
    let room: GameRoom;

    // If no room ID provided, create a new room
    if (!roomId) {
      roomId = generateRoomId();
      room = {
        id: roomId,
        name: `Room ${roomId}`,
        players: [],
        gameState: "waiting",
        dare: "",
        maxRange: 10,
        playerChoices: {},
        currentProposal: null,
        proposalHistory: [],
        currentNegotiator: null,
      };
      gamesRooms.set(roomId, room);
    } else {
      const existingRoom = gamesRooms.get(roomId);
      if (!existingRoom) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      room = existingRoom;
    }

    // Check if room is full (max 2 players for this game)
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    // Add player to room
    const player: Player = {
      id: socket.id,
      name: data.playerName,
      socketId: socket.id,
    };

    room.players.push(player);
    socket.join(roomId);

    // Emit success response
    socket.emit("game-joined", {
      success: true,
      roomId: roomId,
      player: player,
      room: room,
    });

    // Notify other players in the room
    socket.to(roomId).emit("player-joined", {
      player: player,
      room: room,
    });

    console.log(`Player ${data.playerName} joined room ${roomId}`);
  });

  // Create a proposal
  socket.on("create-proposal", (data: ProposalData) => {
    const room = gamesRooms.get(data.roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Check if player is in the room
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) {
      socket.emit("error", { message: "You are not in this room" });
      return;
    }

    // Create new proposal
    const proposal: Proposal = {
      id: Math.random().toString(36).substring(2, 10),
      proposerId: socket.id,
      dare: data.dare,
      maxRange: data.maxRange,
      status: "pending",
      timestamp: new Date(),
    };

    room.currentProposal = proposal;
    room.proposalHistory.push(proposal);
    room.gameState = "negotiating";

    // Set the other player as the negotiator
    const otherPlayer = room.players.find((p) => p.socketId !== socket.id);
    room.currentNegotiator = otherPlayer?.socketId || null;

    // Notify all players in the room
    io.to(data.roomId).emit("proposal-created", {
      proposal: proposal,
      proposerName: player.name,
      currentNegotiator: room.currentNegotiator,
    });

    console.log(`Proposal created in room ${data.roomId} by ${player.name}`);
  });

  // Respond to a proposal
  socket.on("respond-to-proposal", (data: ProposalResponseData) => {
    const room = gamesRooms.get(data.roomId);
    if (!room || !room.currentProposal) {
      socket.emit("error", { message: "Room or proposal not found" });
      return;
    }

    // Check if it's the player's turn to respond
    if (room.currentNegotiator !== socket.id) {
      socket.emit("error", { message: "It is not your turn to respond" });
      return;
    }

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) {
      socket.emit("error", { message: "You are not in this room" });
      return;
    }

    const proposal = room.currentProposal;

    if (data.action === "accept") {
      // Accept the proposal
      proposal.status = "accepted";
      room.dare = proposal.dare;
      room.maxRange = proposal.maxRange;
      room.gameState = "playing";
      room.currentNegotiator = null;

      io.to(data.roomId).emit("proposal-accepted", {
        proposal: proposal,
        responderName: player.name,
        finalSettings: {
          dare: room.dare,
          maxRange: room.maxRange,
        },
      });

      console.log(`Proposal accepted in room ${data.roomId} by ${player.name}`);
    } else if (data.action === "reject") {
      // Reject the proposal
      proposal.status = "rejected";
      room.currentProposal = null;
      room.gameState = "waiting";
      room.currentNegotiator = null;

      io.to(data.roomId).emit("proposal-rejected", {
        proposal: proposal,
        responderName: player.name,
      });

      console.log(`Proposal rejected in room ${data.roomId} by ${player.name}`);
    } else if (data.action === "counter" && data.counterProposal) {
      // Counter with a new proposal
      proposal.status = "countered";

      const counterProposal: Proposal = {
        id: Math.random().toString(36).substring(2, 10),
        proposerId: socket.id,
        dare: data.counterProposal.dare,
        maxRange: data.counterProposal.maxRange,
        status: "pending",
        timestamp: new Date(),
      };

      room.currentProposal = counterProposal;
      room.proposalHistory.push(counterProposal);

      // Switch negotiator to the original proposer
      const originalProposer = room.players.find(
        (p) => p.socketId === proposal.proposerId
      );
      room.currentNegotiator = originalProposer?.socketId || null;

      io.to(data.roomId).emit("proposal-countered", {
        originalProposal: proposal,
        counterProposal: counterProposal,
        responderName: player.name,
        currentNegotiator: room.currentNegotiator,
      });

      console.log(
        `Proposal countered in room ${data.roomId} by ${player.name}`
      );
    }
  });

  // Set game settings (dare, max range) - Legacy support
  socket.on("set-game-settings", (data: GameSettingsData) => {
    const room = gamesRooms.get(data.roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    room.dare = data.dare;
    room.maxRange = data.maxRange;

    // Notify all players in the room
    io.to(data.roomId).emit("game-settings-updated", {
      dare: room.dare,
      maxRange: room.maxRange,
    });
  });

  // Player makes their choice
  socket.on("make-choice", (data: GameChoiceData) => {
    const room = gamesRooms.get(data.roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    room.playerChoices[socket.id] = data.choice;

    // Check if all players have made their choices
    const allChoicesMade = room.players.every(
      (player) => room.playerChoices[player.socketId] !== undefined
    );

    if (allChoicesMade && room.players.length === 2) {
      // Reveal the results
      const choices = Object.values(room.playerChoices);
      const isMatch = choices[0] === choices[1];

      const results = {
        isMatch,
        choices: room.playerChoices,
        dare: room.dare,
        players: room.players,
      };

      room.gameState = "finished";

      // Send results to all players in the room
      io.to(data.roomId).emit("game-results", results);

      console.log(`Game in room ${data.roomId} finished. Match: ${isMatch}`);
    } else {
      // Notify that a choice was made
      socket.to(data.roomId).emit("choice-made", {
        playerId: socket.id,
        choicesMade: Object.keys(room.playerChoices).length,
        totalPlayers: room.players.length,
      });
    }
  });

  // Reset game
  socket.on("reset-game", (roomId: string) => {
    const room = gamesRooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    room.gameState = "waiting";
    room.playerChoices = {};
    room.currentProposal = null;
    room.currentNegotiator = null;
    // Keep proposal history for reference

    // Notify all players in the room
    io.to(roomId).emit("game-reset");
  });
});

const PORT: number = parseInt(process.env.PORT || "3001", 10);

server.listen(PORT, () => {
  console.log(`🎲 Odds On Game Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for http://localhost:5173`);
});
