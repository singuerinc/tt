import * as React from "react";
import { HotelContext, IContext } from "../context";
import { useContext } from "react";

export function RoomList() {
  const { state, dispatch } = useContext<IContext>(HotelContext);

  return (
    <ul>
      {state.rooms.map(x => (
        <li key={x.id}>
          {x.id}, {x.size}, {x.state}
        </li>
      ))}
    </ul>
  );
}
