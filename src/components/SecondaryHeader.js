import React, { PropTypes } from 'react';

import Dropdown from 'components/Dropdown';

const SecondaryHeader = ({
  sort,
  onSortBest,
  onSortNewest,
  onSortOldest
}) => (
  <div className="nav nav-secondary">
    <ul>
      <li id="recommend-button" className="nav-tab nav-tab--secondary recommend dropdown">
        <div className="thread-likes">
          <a className="dropdown-toggle">
            <span className="icon-heart" />&nbsp;
            <span className="label label-default">Upvote</span>
          </a>
        </div>
      </li>
      <Dropdown
        title={`Sort by ${sort}`}
        className="nav-tab nav-tab--secondary dropdown sorting pull-right"
      >
        <li>
          <a onClick={onSortBest}>
            Best <i aria-hidden="true" className="icon-checkmark" />
          </a>
        </li>
        <li>
          <a onClick={onSortNewest}>
            Newest <i aria-hidden="true" className="icon-checkmark" />
          </a>
        </li>
        <li>
          <a onClick={onSortOldest}>
            Oldest <i aria-hidden="true" className="icon-checkmark" />
          </a>
        </li>
      </Dropdown>
    </ul>
  </div>
);

SecondaryHeader.propTypes = {
  sort: PropTypes.string.isRequired,
  onSortBest: PropTypes.func.isRequired,
  onSortNewest: PropTypes.func.isRequired,
  onSortOldest: PropTypes.func.isRequired
};

export default SecondaryHeader;
