import React from "react";
import moment from "moment";
import axios from "axios";

import DateSelector from "./DateSelector";
import EntryDisplay from "./EntryDisplay";

import style from "./style.css";

export default class DateView extends React.Component {
  constructor(props) {
    super(props);

    this.refresh = this.refresh.bind(this);
    this.selectDate = this.selectDate.bind(this);

    this.state = {
      date: moment().format("YYYY-MM-DD"),
      types: [],
      entries: {}
    };
  }

  render() {
    const { date, entries, types } = this.state;

    return (
      <div className={style.container}>
        <div className={style.title}>Traffic Viewer</div>
        <button onClick={this.refresh} className={style.button}>
          Refresh
        </button>
        <DateSelector value={date} onSelect={this.selectDate} />
        <EntryDisplay entries={entries} types={types} onChange={this.refresh} />
      </div>
    );
  }

  componentDidMount() {
    this.refresh();
  }

  async fetch(date) {
    const r = await axios.get("/api/entries", { params: { date } });
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

      entries[type].push(entry);
    }

    this.setState({ entries: entries, types: entry_types });
  }

  async refresh() {
    const { date } = this.state;
    this.fetch(date);
  }

  selectDate(date) {
    this.setState({ date });
    this.fetch(date);
  }
}
