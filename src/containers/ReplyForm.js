import React from 'react';

import alien from 'assets/alien.png';

export default () => (
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
            <textarea className="textarea" />
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
