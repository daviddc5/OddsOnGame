import { io, Socket } from "socket.io-client";

// Types matching your backend
export interface Player {
  id: string;
  name: string;
  socketId: string;
}

export interface Proposal {
  id: string;
  proposerId: string;
  dare: string;
  maxRange: number;
  status: "pending" | "accepted" | "rejected" | "countered";
  timestamp: Date;
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameState: "waiting" | "negotiating" | "playing" | "revealing" | "finished";
  dare: string;
  maxRange: number;
  playerChoices: Record<string, number>;
  currentProposal: Proposal | null;
  proposalHistory: Proposal[];
  currentNegotiator: string | null;
}

export interface JoinGameData {
  playerName: string;
  roomId?: string;
}

export interface GameResults {
  isMatch: boolean;
  choices: Record<string, number>;
  dare: string;
  players: Player[];
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = "http://localhost:3001";

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl);

      this.socket.on("connect", () => {
        console.log("Connected to server:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      this.socket.on("error", (error: any) => {
        console.error("Socket error:", error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game methods
  joinGame(data: JoinGameData): void {
    this.socket?.emit("join-game", data);
  }

  setGameSettings(roomId: string, dare: string, maxRange: number): void {
    this.socket?.emit("set-game-settings", { roomId, dare, maxRange });
  }

  makeChoice(roomId: string, choice: number): void {
    this.socket?.emit("make-choice", { roomId, choice });
  }

  resetGame(roomId: string): void {
    this.socket?.emit("reset-game", roomId);
  }

  // Proposal methods
  createProposal(roomId: string, dare: string, maxRange: number): void {
    this.socket?.emit("create-proposal", { roomId, dare, maxRange });
  }

  respondToProposal(
    roomId: string,
    proposalId: string,
    action: "accept" | "reject" | "counter",
    counterProposal?: { dare: string; maxRange: number }
  ): void {
    this.socket?.emit("respond-to-proposal", {
      roomId,
      proposalId,
      action,
      counterProposal,
    });
  }

  // Event listeners
  onGameJoined(callback: (data: any) => void): void {
    this.socket?.on("game-joined", callback);
  }

  onPlayerJoined(callback: (data: any) => void): void {
    this.socket?.on("player-joined", callback);
  }

  onPlayerLeft(callback: (data: any) => void): void {
    this.socket?.on("player-left", callback);
  }

  onGameSettingsUpdated(callback: (data: any) => void): void {
    this.socket?.on("game-settings-updated", callback);
  }

  onChoiceMade(callback: (data: any) => void): void {
    this.socket?.on("choice-made", callback);
  }

  onGameResults(callback: (data: GameResults) => void): void {
    this.socket?.on("game-results", callback);
  }

  onGameReset(callback: () => void): void {
    this.socket?.on("game-reset", callback);
  }

  onError(callback: (error: any) => void): void {
    this.socket?.on("error", callback);
  }

  // Proposal event listeners
  onProposalCreated(callback: (data: any) => void): void {
    this.socket?.on("proposal-created", callback);
  }

  onProposalAccepted(callback: (data: any) => void): void {
    this.socket?.on("proposal-accepted", callback);
  }

  onProposalRejected(callback: (data: any) => void): void {
    this.socket?.on("proposal-rejected", callback);
  }

  onProposalCountered(callback: (data: any) => void): void {
    this.socket?.on("proposal-countered", callback);
  }

  // Remove listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

export default new SocketService();
