import * as React from "react";
import { Room } from "./room";
import { RoomUI } from "./ui/Room";

export function Hotel() {
  const rooms = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(
    (x, i) => new Room({ id: i })
  );
  const sizes = {
    1: "w5",
    2: "w-20",
    3: "w-25"
  };

  return (
    <ul className="list flex flex-wrap w-100 ma0 pa0">
      {rooms
        .sort((x, y) => (x.size < y.size ? 1 : -1))
        .map((room, i) => (
          <li className={`${sizes[room.size]}`} key={i}>
            <RoomUI id={room.id} size={room.size} source={room} />
          </li>
        ))}
    </ul>
  );
}
