import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

export default class Disqus extends Component {

  static propTypes = {
    shortName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    onCommentsChanged: PropTypes.func.isRequired,
    onNewComment: PropTypes.func.isRequired
  }

  componentDidMount() {
    const {
      shortName,
      url,
      identifier,
      onCommentsChanged,
      onNewComment
    } = this.props;

    window.disqus_config = function () {
      this.page.url = url;
      this.page.identifier = identifier;
      this.callbacks.onNewComment = [onNewComment];
    };

    const parent = document.head || document.body;

    const disqusScript = document.createElement('script');
    disqusScript.src = `//${shortName}.disqus.com/embed.js`;
    disqusScript.setAttribute('data-timestamp', +new Date());

    const disqusCountScript = document.createElement('script');
    disqusCountScript.id = 'dsq-count-scr';
    disqusCountScript.src = `//${shortName}.disqus.com/count.js`;

    parent.appendChild(disqusScript);
    parent.appendChild(disqusCountScript);

    new MutationObserver(() => {
      const match = this.commentCounterElement.textContent.match(/[0-9]+/);
      onCommentsChanged(parseInt(match[0], 10));
    })
    .observe(this.commentCounterElement, {
      childList: true
    });
  }

  render() {
    const {
      identifier,
      url
    } = this.props;

    return (
      <div>
        <span
          style={{ display: 'none' }}
          ref={(el) => {
            this.commentCounterElement = findDOMNode(el);
          }}
          className="disqus-comment-count"
          data-disqus-identifier={identifier}
          data-disqus-url={url}
        />
        <div id="disqus_thread" />
      </div>
    );
  }
}
