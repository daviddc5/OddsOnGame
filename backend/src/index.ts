import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

// Type definitions for our game
interface Player {
  id: string;
  name: string;
  socketId: string;
}

interface GameRoom {
  id: string;
  players: Player[];
  gameState: "waiting" | "playing" | "revealing" | "finished";
  dare: string;
  maxRange: number;
  playerChoices: Record<string, number>;
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

// Server setup
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"],
  },
});

// In-memory storage for game rooms
const gameRooms: Map<string, GameRoom> = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Odds On Game Server Running properly!",
    activeRooms: gameRooms.size,
    timestamp: new Date().toISOString(),
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
    for (const [roomId, room] of gameRooms.entries()) {
      const playerIndex = room.players.findIndex(
        (p) => p.socketId === socket.id
      );
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);

        // If room is empty, delete it
        if (room.players.length === 0) {
          gameRooms.delete(roomId);
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
        players: [],
        gameState: "waiting",
        dare: "",
        maxRange: 10,
        playerChoices: {},
      };
      gameRooms.set(roomId, room);
    } else {
      const existingRoom = gameRooms.get(roomId);
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

  // Set game settings (dare, max range)
  socket.on("set-game-settings", (data: GameSettingsData) => {
    const room = gameRooms.get(data.roomId);
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
    const room = gameRooms.get(data.roomId);
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
    const room = gameRooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    room.gameState = "waiting";
    room.playerChoices = {};

    // Notify all players in the room
    io.to(roomId).emit("game-reset");
  });
});

const PORT: number = parseInt(process.env.PORT || "3001", 10);

server.listen(PORT, () => {
  console.log(`🎲 Odds On Game Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for http://localhost:5173`);
});
