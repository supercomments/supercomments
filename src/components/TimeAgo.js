import moment from 'moment';
import React, { Component } from 'react';
import { momentObj } from 'react-moment-proptypes';

import { MsInSec } from 'constants/timing';

const RefreshTimeSec = 60;

export default class TimeAgo extends Component {

  static propTypes = {
    children: momentObj
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.children.fromNow()
    };

    this.boundUpdateTime = this.updateTime.bind(this);
  }

  componentDidMount() {
    const now = moment();
    const display = this.props.children;

    if (display.diff(now, 'hours') < 1) {
      this.interval = setInterval(this.boundUpdateTime, MsInSec * RefreshTimeSec);
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  updateTime() {
    this.setState({
      value: this.props.children.fromNow()
    });
  }

  render() {
    return <span>{this.state.value}</span>;
  }
}
