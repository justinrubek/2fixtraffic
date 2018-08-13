import React from "react";
import moment from "moment";
import axios from "axios";

import style from "./style.css";

export default class Entry extends React.Component {
  render() {
    return (
      <li key={this.props.id} className={style.cell}>
        {moment(this.props.time).format("hh:mm A")}
        <button
          className={`${style.remove_button} ${style.no_select}`}
          onClick={async () => {
            let del = await axios.delete(`/api/entries/${this.props.id}`);
            this.props.onChange();
          }}
        >
          x
        </button>
      </li>
    );
  }
}
