import React from "react";
import shortid from "shortid";

import style from "./style.css";

export default class TypeSelector extends React.Component {
  constructor(props) {
    super(props);

    this.select = this.select.bind(this);

    const options = this.props.options.map(option => {
      return {
        name: option,
        id: shortid.generate()
      };
    });

    const selected = null;

    this.state = {
      options,
      selected
    };
  }

  select(option) {
    this.setState({ selected: option.id });
    this.props.onSelect(option.name);
  }

  render() {
    const { options, selected } = this.state;

    const display = options.map(option => {
      return (
        <div>
          <input
            type="radio"
            value={option.id}
            checked={selected == option.id}
            onClick={() => this.select(option)}
            id={option.id}
          />
          <label className={style.label} htmlFor={option.id}>
            {option.name}
          </label>
        </div>
      );
    });

    return (
      <div className={style.container}>
        <div className={style.title}>Select traffic type</div>
        {display}
      </div>
    );
  }
}
