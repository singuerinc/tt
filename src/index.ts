import { Train } from "./train";

const train = new Train(1).goTo("BCN");

train.engine.subscribe(vel => {
  console.log(vel);
});
