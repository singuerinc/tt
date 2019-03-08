import { Observable, Subscribable } from "rxjs";
import { interpret, Machine } from "xstate";
import { Interpreter } from "xstate/lib/interpreter";

export type Size = 1 | 2 | 3;

interface IRoom {
  size: Size;
  floor: number;
  amount: number;
}

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
  | { type: "CLEANING" }
  | { type: "SERVICE" }
  | { type: "SLEEP" }
  | { type: "EXIT" };

const machine = () =>
  Machine<{}, RoomStateSchema, RoomEvent>({
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
          CLEANING: "cleaning"
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

export class Room implements IRoom {
  public id: number;
  public amount: number = 0;
  public events: Subscribable<RoomEvent>;
  public money: Subscribable<{ total: number; cash: number }>;
  public size: Size;
  public floor: number = 0;

  constructor({ id }) {
    this.id = id;
    this.size = 1 + Math.floor(Math.random() * 3);

    const $$ = o => {
      o.next();
    };

    const h: Interpreter<{}, RoomStateSchema, RoomEvent> = interpret(
      machine()
    ).start();

    this.money = Observable.create(o => {
      h.onTransition(state => {
        if (state.value === "sleep") {
          const cash = 10 * this.size;
          this.amount += cash;
          o.next({ total: this.amount, cash });
        } else if (state.value === "service") {
          const cash = 3;
          this.amount += cash;
          o.next({ total: this.amount, cash });
        } else if (state.value === "cleaning") {
          const cash = -2;
          this.amount -= cash;
          o.next({ total: this.amount, cash });
        } else if (state.value === "manteinance") {
          const cash = -5;
          this.amount -= cash;
          o.next({ total: this.amount, cash });
        }

        // console.log(`Room #${this.id} / $${this.amount}`);
      });
    });

    this.events = Observable.create(o => {
      h.onTransition(state => {
        o.next(state.value);
      });
    });

    h.start();

    setInterval(() => {
      h.send(
        ["ISSUE", "CLEANING", "SERVICE", "SLEEP", "EXIT"][
          Math.floor(Math.random() * 5)
        ]
      );
    }, 10000 + Math.random() * 5000);
  }
}
