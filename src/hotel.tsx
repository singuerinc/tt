import range from "ramda/es/range";
import * as React from "react";
import { useState } from "react";
import { Room } from "./room";
import { RoomUI } from "./ui/Room";

interface IGroup {
  kids: number;
  adults: number;
}

const sizes = {
  1: "w5",
  2: "w-20",
  3: "w-25"
};

const rooms = range(0, 10).map((x, i) => new Room({ id: i }));

export function Hotel() {
  const [queue, setQueue] = useState([
    { kids: 0, adults: 2 },
    { kids: 1, adults: 2 },
    { kids: 3, adults: 1 },
    { kids: 1, adults: 1 },
    { kids: 0, adults: 2 },
    { kids: 0, adults: 1 },
    { kids: 0, adults: 3 }
  ]);

  const handleBooking = (group: IGroup) => () => {
    const numPeople = group.adults + group.kids;
    const freeRoom = rooms.find(room => {
      return room.size >= numPeople && room.state === "free";
    });
    if (freeRoom) {
      freeRoom.in(numPeople);
      setQueue(queue => queue.filter(g => g !== group));
    }
  };

  console.log("render!!!!!");
  return (
    <>
      <ul className="list flex flex-wrap w-100 ma0 pa0">
        {rooms
          //   .sort((x, y) => (x.size < y.size ? 1 : -1))
          .map((room, i) => (
            <li className={`${sizes[room.size]}`} key={i}>
              <RoomUI id={room.id} size={room.size} source={room} />
            </li>
          ))}
      </ul>

      <ul className="list flex flex-column">
        {queue.map((group, y) => (
          <li key={y} className="flex flex-row">
            {range(0, group.adults).map((f, i) => (
              <i className="material-icons f2">face</i>
            ))}
            {range(0, group.kids).map((f, i) => (
              <i className="material-icons">face</i>
            ))}
            <a
              key={y + "-" + 100}
              onClick={handleBooking(group)}
              className="link pointer"
            >
              book
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
