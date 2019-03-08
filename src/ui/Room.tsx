import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Room, Size } from "../room";

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
  size: Size;
  source: Room;
  className?: string;
}

const whenIssue = state =>
  state === "dirty" || state === "manteinance" ? "pulse" : "";

export function RoomUI({ id, size, source, className = "" }: IProps) {
  const [state, setState] = useState("free");
  const [cashTotal, setCashTotal] = useState(0);
  const [cash, setCash] = useState(0);

  useEffect(() => {
    const s = source.events.subscribe(value => {
      setState(value);
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
  `;

  return (
    <View
      className={`flex flex-column ma2 pa2 ba b--black-10 br2 ${className} ${whenIssue(
        state
      )}`}
    >
      <h2 className={`moon-gray f6 fw4 ma0 pb2`}>Room #{id}</h2>
      <h3 className={`fw5 ttu ma0 pa0`}>{state}</h3>
      <h3 className={`fw1 ttu ma0 pa0`}>
        ${cashTotal} /{" "}
        <small className={`${cash < 0 ? "red" : "green"}`}>${cash}</small>
      </h3>
      <i className={`self-end material-icons`}>{icons[state]}</i>
    </View>
  );
}
