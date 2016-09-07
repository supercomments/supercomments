import React, { PropTypes } from 'react';
import { momentObj } from 'react-moment-proptypes';

import alien from 'assets/alien.png';

import ReplyForm from 'containers/ReplyForm';
import Thread from 'containers/Thread';

const Comment = ({
  id,
  author,
  parentAuthor,
  created,
  body,
  score,
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
            <a className="time-ago" title={created.format()}>{created.fromNow()}</a>
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
              <a className={`vote-up count-${score}`} title="Vote up">
                <span className="updatable count">{score}</span>
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
              <a onClick={onClickReply}><span className="text">Reply</span></a>
            </li>
          </menu>
        </footer>
      </div>
      <ReplyForm threadId={id} />
    </div>
    <Thread threadId={id} />
  </li>
);

Comment.propTypes = {
  id: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  parentAuthor: PropTypes.string,
  created: momentObj,
  body: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  onClickReply: PropTypes.func.isRequired
};

export default Comment;
