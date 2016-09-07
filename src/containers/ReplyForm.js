import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import { getReplyForm } from 'selectors/threadSelectors';
import alien from 'assets/alien.png';

const ReplyForm = ({ visible, text, onChange }) => {
  if (visible) {
    return (
      <div className="reply-form-container">
        <form className="reply expanded authenticated">
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
                  value={text}
                  onChange={ev => onChange(ev.target.value)}
                />
              </div>
              <div className="post-actions">
                <div
                  className="not-logged-in"
                  style={{
                    color: 'rgb(63, 69, 73)',
                    padding: '11px 0 0 10px',
                    fontFamily: 'Helvetica Neue, arial, sans-serif',
                    fontSize: '12px'
                  }}
                >
                  <a>Login to Reddit</a><span> to post a comment</span>
                </div>
                {false && <div className="logged-in">
                  <section>
                    <div className="temp-post" style={{ textAlign: 'right' }}>
                      <button className="btn post-action__button">
                        Post as <span>Tomas Weiss</span>
                      </button>
                    </div>
                  </section>
                </div>
               }
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
  visible: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  text: PropTypes.string
};

const mapStateToProps = (appState, { threadId }) => {
  const replyForm = getReplyForm(appState, threadId);

  if (replyForm) {
    return replyForm;
  } else {
    // The state slice for ReplyForm might not exist
    // it's basically the case when the ReplyForm has
    // not been activated yet
    return {
      visible: false
    };
  }
};

export default connect(
  mapStateToProps,
  buildActionCreators({
    onChange: Actions.ReplyFormChangeText
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    onChange: text => dispatchProps.onChange({
      text,
      threadId: ownProps.threadId
    })
  })
)(ReplyForm);
