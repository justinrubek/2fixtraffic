import React from "react";
import axios from "axios";
import fileDownload from "js-file-download";

import style from "./style.css";

export default class ReportGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { start, end } = this.state;

    return (
      <div className={style.container}>
        <div className={style.title}>Generate Traffic report</div>
        <div>
          <label className={style.label} htmlFor="start">
            Start date
          </label>
          <input
            type="date"
            id="start"
            onChange={e => this.setState({ start: e.target.value })}
          />
          <label className={style.label} htmlFor="end">
            End date
          </label>
          <input
            type="date"
            id="end"
            onChange={e => this.setState({ end: e.target.value })}
          />
        </div>
        <button
          onClick={async () => {
            const response = await axios.get("/report", {
              params: { start, end },
              responseType: "blob"
            });
            console.log(response);
            fileDownload(
              response.data,
              `2Fix Traffic Log - ${start}-${end}.xlsx`
            );
          }}
        >
          Generate
        </button>
      </div>
    );
  }
}
