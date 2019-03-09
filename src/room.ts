import { Observable, Subscribable } from "rxjs";
import { interpret, Machine } from "xstate";
import { Interpreter } from "xstate/lib/interpreter";

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

export class Room {
  public id: number;
  public state: string = "free";
  public amount: number = 0;
  public events: Subscribable<RoomEvent>;
  public money: Subscribable<{ total: number; cash: number }>;
  public size: 1 | 2 | 3;
  public numPeople: 0 | 1 | 2 | 3 = 0;
  public floor: number = 0;
  private h: Interpreter<{}, RoomStateSchema, RoomEvent>;

  constructor({ id }) {
    this.id = id;
    this.size = [1, 2, 3][Math.floor(Math.random() * 3)];

    const $$ = o => {
      o.next();
    };

    this.h = interpret(machine()).start();

    this.money = Observable.create(o => {
      this.h.onTransition(state => {
        console.log(`Room #${this.id} / state:${state.value}`);
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
      });
    });

    this.events = Observable.create(o => {
      this.h.onTransition(state => {
        this.state = state.value;
        o.next(state.value);
      });
    });

    this.h.start();

    // setInterval(() => {
    //   this.h.send(
    //     ["ISSUE", "SERVICE", "SLEEP", "EXIT"][Math.floor(Math.random() * 5)]
    //   );
    // }, 10000 + Math.random() * 5000);
  }

  in(numPeople: 1 | 2 | 3) {
    this.numPeople = numPeople;
    this.h.send("SLEEP");

    setTimeout(() => {
      this.numPeople = 0;
      this.h.send("EXIT");
    }, 10000);
  }

  clean() {
    console.log("next", "clean");
    this.h.send("CLEAN");

    setTimeout(() => {
      this.h.send("EXIT");
    }, 5000);
  }
}
