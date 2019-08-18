import * as React from "react";
import { Room } from "./room/room";

export interface IRoom {
  id: number;
  state: string;
  size: number;
  numPeople: number;
}

export interface IContext {
  rooms: IRoom[];
}

export const HotelContext = React.createContext<IContext>({
  rooms: [
    new Room(1, "free", 1),
    new Room(2, "free", 4),
    new Room(3, "free", 2),
    new Room(4, "free", 3)
  ]
});
