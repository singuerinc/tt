import { Machine } from "xstate";

export interface RoomStateSchema {
  states: {
    free: {};
    manteinance: {};
    cleaning: {};
    service: {};
    sleep: {};
    dirty: {};
  };
}

export type RoomEvent =
  | { type: "ISSUE" }
  | { type: "CLEAN" }
  | { type: "SERVICE" }
  | { type: "SLEEP" }
  | { type: "EXIT" };

export function machine() {
  return Machine<{}, RoomStateSchema, RoomEvent>({
    key: "room-1",
    initial: "free",
    states: {
      free: {
        on: {
          SLEEP: "sleep"
        }
      },
      manteinance: {
        on: {
          EXIT: "cleaning"
        }
      },
      dirty: {
        on: {
          CLEAN: "cleaning"
        }
      },
      cleaning: {
        on: {
          EXIT: "free"
        }
      },
      service: {
        on: {
          EXIT: "sleep"
        }
      },
      sleep: {
        on: {
          ISSUE: "manteinance",
          SERVICE: "service",
          EXIT: "dirty"
        }
      }
    }
  });
}
