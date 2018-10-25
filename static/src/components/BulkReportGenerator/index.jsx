import React from "react";
import axios from "axios";
import fileDownload from "js-file-download";

import getWeekRange from "./getWeekRange";

import style from "./style.css";

export default class BulkReportGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { start, count } = this.state;

    return (
      <div className={style.container}>
        <div className={style.title}>Generate Bulk Traffic report</div>
        <div>
          <label className={style.label} htmlFor="start">
            Start date
          </label>
          <input
            type="date"
            id="start"
            onChange={e => this.setState({ start: e.target.value })}
          />
          <label className={style.label} htmlFor="count">
            Weeks to generate report for
          </label>
          <input
            type="number"
            id="count"
            onChange={e => this.setState({ count: e.target.value })}
          />
        </div>
        <button
          onClick={async () => {
            if (start && count) {
              const weekRange = getWeekRange(start, count);
              for (let week of weekRange) {
                let start = week[0];
                let end = week[1];

                const response = await axios.get("/api/report", {
                  params: { start, end },
                  responseType: "blob"
                });

                console.log(response);
                fileDownload(
                  response.data,
                  `2Fix Traffic Log - ${start} to ${end}.xlsx`
                );
              }
            } else {
              alert("You must enter a start date and a week count");
            }
          }}
        >
          Generate
        </button>
      </div>
    );
  }
}
