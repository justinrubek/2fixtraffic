import React from "react";
import axios from "axios";

import TimeSelector from "./TimeSelector";
import TypeSelector from "./TypeSelector";
import ReportGenerator from "./ReportGenerator";

function log(type, time) {
  console.log(`Sending: ${type} for time ${time}`);
  // Create log object
  const data = {
    type: type,
    time: time
  };
  // Post to server
  axios.post("/log", data);
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.sendLog = this.sendLog.bind(this);

    this.state = {
      time: null
    };
  }

  sendLog() {
    const { type, time } = this.state;
    log(type, time);
  }

  render() {
    return (
      <div>
        <h1>Traffic Logger</h1>
        <div>
          <div>
            <TypeSelector
              options={["call", "desk"]}
              onSelect={type => this.setState({ type })}
            />
          </div>
          <div>
            <TimeSelector
              onChange={(hours, minutes) => {
                this.setState({ time: `${hours}:${minutes}` });
              }}
            />
          </div>
          <button onClick={this.sendLog}>Log</button>
        </div>
        <ReportGenerator />
      </div>
    );
  }
}
