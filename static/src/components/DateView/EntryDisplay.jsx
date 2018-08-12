import React from "react";
import moment from "moment";
import axios from "axios";

import style from "./style.css";

class Entry extends React.Component {
  render() {
    return (
      <li key={this.props.id} className={style.cell}>
        {moment(this.props.time).format("hh:mm A")}
        <button
          onClick={async () => {
            let del = await axios.delete(`/api/entries/${this.props.id}`);
            this.props.onChange();
          }}
        >
          X
        </button>
      </li>
    );
  }
}

export default class EntryDisplay extends React.Component {
  render() {
    const { entries, types, onChange } = this.props;

    const rows = types.map(type => {
      const type_entries = entries[type].map(entry => {
        return <Entry time={entry.time} id={entry._id} onChange={onChange} />;
      });

      return (
        <div className={style.row_group}>
          <div className={style.row_title}>{type}</div>
          <ul className={style.row}>{type_entries}</ul>
        </div>
      );
    });

    return (
      <div>
        <div className={style.row_wrapper}>{rows}</div>
      </div>
    );
  }
}
