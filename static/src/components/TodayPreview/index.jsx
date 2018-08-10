import React from "react";
import axios from "axios";
import moment from "moment";

import style from "./style.css";

export default class TodayPreview extends React.Component {
  constructor(props) {
    super(props);

    this.refresh = this.refresh.bind(this);

    this.state = {
      entries: {},
      types: []
    };
  }

  async refresh() {
    const r = await axios.get("/api/today");
    const all_entries = r.data;
    const entry_types = [];
    const entries = {};

    for (let entry of all_entries) {
      const type = entry.type;

      // We haven't seen this type before
      if (!entry_types.includes(type)) {
        entry_types.push(type);
        entries[type] = [];
      }

      entries[type].push(entry.time);
    }

    this.setState({ entries: entries, types: entry_types });
  }

  render() {
    const { entries, types } = this.state;

    const rows = types.map(type => {
      const type_entries = entries[type].map(entry => {
        return (
          <li className={style.cell}>{moment(entry).format("hh:mm A")}</li>
        );
      });

      return (
        <div className={style.row_group}>
          <div className={style.row_title}>{type}</div>
          <ul className={style.row}>{type_entries}</ul>
        </div>
      );
    });

    return (
      <div className={style.container}>
        <div className={style.title}>Today's entries</div>
        <button onClick={this.refresh}>Refresh</button>
        <div className={style.row_wrapper}>{rows}</div>
      </div>
    );
  }
}
