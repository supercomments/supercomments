import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';

export default enhanceWithClickOutside(class Dropdown extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.boundToggle = this.toggle.bind(this);
    this.boundClose = this.close.bind(this);
  }

  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  handleClickOutside() {
    this.close();
  }

  close() {
    this.setState({
      open: false
    });
  }

  render() {
    const {
      title,
      className,
      children
    } = this.props;

    const {
      open
    } = this.state;

    return (
      <li
        className={cx({
          [className]: true,
          open
        })}
      >
        <a className="dropdown-toggle" onClick={this.boundToggle}>
          {title} <span className="caret" />
        </a>
        <ul className="dropdown-menu pull-right" onClick={this.boundClose}>
          {children}
        </ul>
      </li>
    );
  }
});
