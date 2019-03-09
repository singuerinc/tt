import * as React from "react";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { Room } from "../room";
import anime from "animejs";

const colors = {
  free: "green",
  service: "orange",
  sleep: "silver",
  dirty: "black",
  cleaning: "gray",
  manteinance: "red"
};

const icons = {
  free: "arrow_forward",
  service: "restaurant",
  sleep: "local_hotel",
  cleaning: "cached",
  manteinance: "build",
  dirty: "bug_report",
  help: "record_voice_over"
};

interface IProps {
  id: number;
  size: number;
  source: Room;
  className?: string;
}

const whenFree = state => state === "free";
const whenDirty = state => state === "dirty";
const whenIssue = state =>
  state === "dirty" || state === "manteinance" ? "pulse" : "";

export function RoomUI({ id, source, className = "" }: IProps) {
  const progress = useRef();
  const [state, setState] = useState("free");
  const [cashTotal, setCashTotal] = useState(0);
  const [cash, setCash] = useState(0);
  const [numPeople, setNumPeople] = useState(source.numPeople);

  useEffect(() => {
    const s = source.events.subscribe(value => {
      // console.log("new state -------------->", value);
      setState(value);
      setNumPeople(source.numPeople);

      if (value === "sleep") {
        requestAnimationFrame(() => {
          anime({
            targets: progress.current,
            width: ["0%", "100%"],
            duration: 10000,
            easing: "linear"
          });
        });
      } else if (value === "cleaning") {
        requestAnimationFrame(() => {
          anime({
            targets: progress.current,
            width: ["0%", "100%"],
            duration: 5000,
            easing: "linear"
          });
        });
      }
    });

    return () => {
      s.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const s = source.money.subscribe(({ total, cash }) => {
      setCashTotal(total);
      setCash(cash);
    });

    return () => {
      s.unsubscribe();
    };
  }, []);

  const View = styled.div`
    border-bottom-color: ${colors[state]};
    border-bottom-width: 3px;

    pre {
      background-color: yellow;
      color: black;
    }
  `;

  const handleClean = () => {
    if (state === "dirty") {
      source.clean();
    }
  };

  return (
    <View
      className={`flex flex-column ma2 pv3 ph3 ba b--black-10 br2 ${className} ${whenIssue(
        state
      )}`}
    >
      <div ref={progress} className="bg-pink h1" />
      <h2 className={`moon-gray f6 fw4 ma0`}>Room #{id}</h2>

      <div className="flex pv2">
        {Array(source.size)
          .fill(null)
          .map((x, i) => (
            <i
              key={i}
              className={`material-icons ${
                numPeople > i ? "black" : "light-gray"
              }`}
            >
              face
            </i>
          ))}
      </div>

      <div className="flex">
        <h3 className={`fw5 ttu ma0 pa0`}>{state} </h3>
        {whenDirty(state) && (
          <a onClick={handleClean} className="link dim hover-underline pointer">
            Clean
          </a>
        )}
      </div>

      <h3 className={`fw1 ttu ma0 pa0`}>
        ${cashTotal} /{" "}
        <small className={`${cash < 0 ? "red" : "green"}`}>${cash}</small>
      </h3>
      <i className={`self-end material-icons`}>{icons[state]}</i>
    </View>
  );
}
