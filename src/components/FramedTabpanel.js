import React, { Component, PropTypes } from 'react';
import Frame from 'react-frame-component';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import RedditComments from 'reddit-comments';
import iframeResizer from 'iframe-resizer/js/iframeResizer';

import iframeTemplate from '../iframeTemplate';
import emptyFn from '../helpers/emptyFn';
import * as Tabs from '../constants/tabs';
import HideableComponent from './HideableComponent';
import Disqus from './Disqus';

export default class FramedTabpanel extends Component {

  static propTypes = {
    url: PropTypes.string.isRequired,
    disqus: PropTypes.object.isRequired,
    tab: PropTypes.string.isRequired,
    disqusComments: PropTypes.number.isRequired,
    redditComments: PropTypes.number.isRequired,
    onChangeTab: PropTypes.func.isRequired,
    onDiscussCommentsChanged: PropTypes.func.isRequired,
    onDiscussCommentsIncremented: PropTypes.func.isRequired,
    onRedditCommentsChanged: PropTypes.func.isRequired
  }

  componentDidMount() {
    iframeResizer({
      checkOrigin: false,
      scrolling: true
    }, this.frameElement);
  }

  render() {
    const {
      url,
      disqus: {
        shortName,
        identifier
      },
      tab,
      disqusComments,
      redditComments,
      onChangeTab,
      onDiscussCommentsChanged,
      onDiscussCommentsIncremented,
      onRedditCommentsChanged
    } = this.props;

    return (
      <div>
        <Frame
          ref={(el) => {
            this.frameElement = findDOMNode(el);
          }}
          style={{
            border: 'none',
            width: '100%'
          }}
          initialContent={iframeTemplate}
        >
          <div>
            <div className="tabs">
              <nav className="tabs-navigation">
                <ul className="tabs-menu">
                  <li
                    className={cx({
                      'tabs-menu-item': true,
                      'is-active': tab === Tabs.Disqus
                    })}
                    onClick={tab === Tabs.Disqus ? emptyFn : () => onChangeTab(Tabs.Disqus)}
                  >
                    <a>Disqus ({disqusComments})</a>
                  </li>
                  <li
                    className={cx({
                      'tabs-menu-item': true,
                      'is-active': tab === Tabs.Reddit
                    })}
                    onClick={tab === Tabs.Reddit ? emptyFn : () => onChangeTab(Tabs.Reddit)}
                  >
                    <a>Reddit ({redditComments})</a>
                  </li>
                </ul>
              </nav>
            </div>
            <article className="tab-panel">
              <HideableComponent visible={tab === Tabs.Reddit}>
                <RedditComments
                  url={url}
                  onChangeCommentCount={onRedditCommentsChanged}
                />
              </HideableComponent>
            </article>
          </div>
        </Frame>
        <HideableComponent visible={tab === Tabs.Disqus}>
          <Disqus
            shortName={shortName}
            identifier={identifier}
            url={url}
            onCommentsChanged={onDiscussCommentsChanged}
            onNewComment={onDiscussCommentsIncremented}
          />
        </HideableComponent>
      </div>
    );
  }
}
