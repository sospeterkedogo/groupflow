import { createClient, LiveList } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Task } from "@/types/database";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Presence is used to track ephemeral state like cursors or dragging
type Presence = {
  draggingTaskId: string | null;
  userName?: string;
};

// Storage is the persistent, conflict-free state of the room
type Storage = {
  tasks: LiveList<Task>;
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
