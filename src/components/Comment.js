import React, { PropTypes } from 'react';
import { momentObj } from 'react-moment-proptypes';
import cx from 'classnames';

import alien from 'assets/alien.png';

import TimeAgo from 'components/TimeAgo';

import ReplyForm from 'containers/ReplyForm';
import Thread from 'containers/Thread';

const Comment = ({
  id,
  author,
  parentAuthor,
  created,
  body,
  votes,
  upvoted,
  transient,
  onClickReply
}) => (
  <li className="post">
    <div className="post-content">
      <div className="indicator" />
      <div className="avatar hovercard">
        <a className="user">
          <img
            src={alien}
            alt="Avatar"
          />
        </a>
      </div>
      <div className="post-body">
        <header className="comment__header">
          <span className="post-byline">
            <span className="author publisher-anchor-color">
              <a>{author}</a>
            </span>
            {parentAuthor && (
              <span>
                <a className="parent-link">
                  &nbsp;
                  <i aria-hidden="true" className="icon-forward" title="in reply to" />
                  &nbsp;{parentAuthor}
                </a>
              </span>
            )}
          </span>
          <span className="post-meta">
            <span className="bullet time-ago-bullet" aria-hidden="true">&nbsp;•&nbsp;</span>
            <a className="time-ago" title={created.format()}><TimeAgo>{created}</TimeAgo></a>
          </span>
        </header>
        <div className="post-body-inner">
          <div className="post-message-container">
            <div className="publisher-anchor-color">
              <div
                className="post-message"
                dir="auto"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </div>
          </div>
        </div>
        <footer className="comment__footer">
          <menu className="comment-footer__menu">
            <li className="voting">
              <a
                className={cx({
                  'vote-up': true,
                  [`count-${votes}`]: true,
                  upvoted
                })}
                title="Vote up"
              >
                <span className="updatable count">{votes}</span>
                <span className="control">
                  <i aria-hidden="true" className="icon icon-arrow-2" />
                </span>
              </a>
              <span role="button" className="vote-down count-0" title="Vote down">
                <span className="control">
                  <i aria-hidden="true" className="icon icon-arrow" />
                </span>
              </span>
            </li>
            <li className="bullet" aria-hidden="true">•</li>
            <li className="reply" >
              {!transient && <a onClick={onClickReply}><span className="text">Reply</span></a>}
            </li>
          </menu>
        </footer>
      </div>
      <ReplyForm threadId={id} />
    </div>
    <Thread isRootThread={false} threadId={id} />
  </li>
);

Comment.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  parentAuthor: PropTypes.string,
  transient: PropTypes.bool,
  created: momentObj,
  body: PropTypes.string.isRequired,
  votes: PropTypes.number.isRequired,
  onClickReply: PropTypes.func.isRequired
};

export default Comment;
