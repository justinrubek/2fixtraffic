import React from "react";
import style from "./style.css";

export default class TimeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.now = this.now.bind(this);
    this.setTime = this.setTime.bind(this);

    this.state = {
      hours: "00",
      minutes: "00"
    };
  }

  now() {
    const now = new Date();
    this.setTime(
      `${now.getHours()}`.padStart(2, "0"),
      `${now.getMinutes()}`.padStart(2, "0")
    );
  }

  setTime(hours, minutes) {
    this.setState({
      hours: `${hours}`.padStart(2, "0"),
      minutes: `${minutes}`.padStart(2, "0")
    });
    this.props.onChange(hours, minutes);
  }

  render() {
    const { hours, minutes } = this.state;

    const time = `${hours}:${minutes}`;

    return (
      <div className={style.container}>
        <div className={style.title}>Select a time</div>
        <button onClick={this.now}>Now</button>
        <input
          type="time"
          value={time}
          onChange={e => {
            const new_time = e.target.value.split(":");
            const hours = new_time[0];
            const minutes = new_time[1];

            this.setTime(hours, minutes);
          }}
        />
      </div>
    );
  }
}
