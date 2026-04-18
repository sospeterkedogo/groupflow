import { createClient, LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Task } from "@/types/database";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Presence is used to track ephemeral state like cursors or dragging
type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

// Presence is used to track ephemeral state like cursors or dragging
type Presence = {
  draggingTaskId: string | null;
  userName?: string;
  isTyping?: boolean;
  isThinking?: boolean; // For the "Chill Out" game turn indicator
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type QuizScore = {
  userId: string;
  userName: string;
  points: number;
};

// Storage is the persistent, conflict-free state of the room
type Storage = {
  tasks: LiveList<Task>;
  messages: LiveList<ChatMessage>;
  // Chill Out Zone - Quiz State
  quizQuestions: LiveList<QuizQuestion>;
  quizScores: LiveList<QuizScore>;
  quizStatus: 'setup' | 'initializing' | 'playing' | 'results';
  currentQuestionIndex: number;
  activeTurnUserId: string | null;
  gameId: string | null;
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useStorage,
  useMutation,
  useOthersMapped,
} = createRoomContext<Presence, Storage>(client);
