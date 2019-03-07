import { Machine, interpret } from "xstate";
import { DefaultContext, State } from "xstate";
import { from, of, Observable, Subscribable } from "rxjs";
import { takeWhile } from "rxjs/operators";
import anime from "animejs";

export enum STATES {
  idle = "idle",
  accelerating = "accelerating",
  inTransit = "inTransit",
  decelerating = "decelerating",
  entering = "entering",
  exiting = "exiting"
}

export enum ACTIONS {
  GO_TO = "GO_TO",
  EXIT = "EXIT",
  IN_TRANSIT = "IN_TRANSIT",
  ENTER = "ENTER",
  STOP = "STOP",
  ACCELERATE = "ACCELERATE",
  DECELERATE = "DECELERATE"
}

export class Train {
  private machine;
  private service;
  private _engine;
  private observer;
  public engine: Subscribable<number>;

  constructor(public id: number, public at: unknown = null) {
    this.machine = Machine({
      initial: STATES.idle,
      states: {
        [STATES.idle]: {
          on: {
            [ACTIONS.GO_TO]: STATES.exiting
          }
        },
        [STATES.exiting]: {
          on: {
            [ACTIONS.ACCELERATE]: STATES.accelerating
          }
        },
        [STATES.accelerating]: {
          on: {
            [ACTIONS.IN_TRANSIT]: STATES.inTransit
          }
        },
        [STATES.inTransit]: {
          on: {
            [ACTIONS.DECELERATE]: STATES.decelerating
          }
        },
        [STATES.decelerating]: {
          on: {
            [ACTIONS.ENTER]: STATES.entering
          }
        },
        [STATES.entering]: {
          on: {
            [ACTIONS.STOP]: STATES.idle
          }
        }
      }
    });

    this._engine = {
      speed: 0
    };

    this.service = interpret(this.machine);
    this.service.onTransition(this.onTransition).start();

    const a = observer => {
      this.observer = observer;
    };

    this.engine = Observable.create(a);
    this.engine.subscribe();
  }

  onTransition = (state: State<DefaultContext>) => {
    console.log(`${this} ${state.value.toString()}`);

    switch (state.value) {
      case STATES.exiting:
        setTimeout(() => {
          this.service.send(ACTIONS.ACCELERATE);
        }, 2000);
        break;
      case STATES.accelerating:
        anime({
          targets: this._engine,
          speed: 100,
          duration: 3000,
          easing: "easeInQuad",
          update: () => this.observer.next(this._engine.speed),
          complete: () => this.service.send(ACTIONS.IN_TRANSIT)
        });
        break;
      case STATES.inTransit:
        anime({
          targets: this._engine,
          speed: 100,
          duration: 5000,
          easing: "linear",
          update: () => this.observer.next(this._engine.speed),
          complete: () => this.service.send(ACTIONS.DECELERATE)
        });
        break;
      case STATES.decelerating:
        anime({
          targets: this._engine,
          speed: 0,
          duration: 3000,
          easing: "easeOutQuad",
          update: () => this.observer.next(this._engine.speed),
          complete: () => this.service.send(ACTIONS.ENTER)
        });
        break;
      case STATES.entering:
        setTimeout(() => {
          this.service.send(ACTIONS.STOP);
        }, 2000);
        break;
    }
  };

  toString = () => `Train #${this.id}`;

  goTo(to: unknown) {
    this.service.send(ACTIONS.GO_TO);
    return this;
  }
}
