import { Observable, Subscribable } from "rxjs";
import { interpret, State, StateValue } from "xstate";
import { Interpreter } from "xstate/lib/interpreter";
import { machine, RoomEvent, RoomStateSchema } from "./machine";

const addAmount = (a, c) => a + c;

export class Room {
  public id: number;
  public state: StateValue = "free";
  public amount: number;
  public events: Subscribable<RoomEvent>;
  public money: Subscribable<{ total: number; cash: number }>;
  public size: number;
  public numPeople: number;
  public floor: number;
  private h: Interpreter<{}, RoomStateSchema, RoomEvent>;

  constructor({ id }) {
    this.id = id;
    this.amount = 0;
    this.floor = 0;
    this.numPeople = 0;
    this.size = [1, 2, 3][Math.floor(Math.random() * 3)];
    this.h = interpret(machine()).start();

    this.money = Observable.create(o => {
      this.h.onTransition((state: State<{}, RoomEvent>) => {
        console.log(`Room #${this.id} / state:${state.value}`);
        if (state.value === "sleep") {
          const cash = 10 * this.size;
          this.amount = cash;
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
