import "tachyons/css/tachyons.min.css";
import * as React from "react";
import { render } from "react-dom";
import { Hotel } from "./hotel";

render(<Hotel />, document.querySelector("#root"));
