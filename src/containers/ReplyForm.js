import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import * as Entities from 'constants/entities';
import { getReplyForm } from 'selectors/threadSelectors';
import { isAuthenticated, getAuthenticatedUser } from 'selectors/authenticationSelectors';
import alien from 'assets/alien.png';

const ReplyForm = ({
  root,
  visible,
  authenticated,
  user,
  text,
  error,
  onChange,
  onSubmit,
  onRetry,
  onLogIn
}) => {
  if (visible || root) {
    return (
      <div className={root ? 'textarea-wrapper--top-level' : 'reply-form-container'}>
        <form className="reply expanded authenticated" onSubmit={error ? onRetry : onSubmit}>
          <div className="postbox">
            <div className="avatar">
              <a className="user">
                <img
                  src={alien}
                  alt="Avatar"
                />
              </a>
            </div>
            <div className="textarea-wrapper" dir="auto">
              <div>
                <textarea
                  className="textarea"
                  placeholder="Join the discussion"
                  value={text}
                  onChange={ev => onChange(ev.target.value)}
                />
              </div>
              <div className="post-actions">
                {!authenticated && (
                  <div
                    className="not-logged-in"
                    style={{
                      color: 'rgb(63, 69, 73)',
                      padding: '11px 0 0 10px',
                      fontFamily: 'Helvetica Neue, arial, sans-serif',
                      fontSize: '12px'
                    }}
                  >
                    <a onClick={onLogIn}>Login to Reddit</a><span> to post a comment</span>
                  </div>
                )}
                {authenticated && visible && (
                  <div className="logged-in">
                    <section>
                      <div className="temp-post" style={{ textAlign: 'right' }}>
                        <button className="btn post-action__button">
                          {!error && <span>Post as <span>{user}</span></span>}
                          {error && <span>Retry</span>}
                        </button>
                      </div>
                    </section>
                  </div>
               )}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  } else {
    return null;
  }
};

ReplyForm.propTypes = {
  threadId: PropTypes.string.isRequired,
  root: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  user: PropTypes.string,
  text: PropTypes.string,
  error: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onLogIn: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired
};

const mapStateToProps = (appState, { threadId }) => {
  const authenticated = isAuthenticated(appState);
  const replyForm = getReplyForm(appState, threadId);
  const user = getAuthenticatedUser(appState);

  if (replyForm) {
    return {
      ...replyForm,
      authenticated,
      user
    };
  } else {
    // The state slice for ReplyForm might not exist
    // it's basically the case when the ReplyForm has
    // not been activated yet
    return {
      root: false,
      visible: false,
      authenticated,
      user
    };
  }
};

export default connect(
  mapStateToProps,
  buildActionCreators({
    onChange: Actions.ReplyFormChangeText,
    onLogIn: Actions.LogIn,
    onSubmit: Actions.SubmitReply,
    onRetry: Actions.Retry
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onChange: text => dispatchProps.onChange({
      text,
      threadId: ownProps.threadId
    }),
    onSubmit: ev => {
      ev.preventDefault();
      dispatchProps.onSubmit(ownProps.threadId);
    },
    onRetry: ev => {
      ev.preventDefault();

      dispatchProps.onRetry({
        entityType: Entities.Comment,
        id: ownProps.threadId
      });
    }
  })
)(ReplyForm);
