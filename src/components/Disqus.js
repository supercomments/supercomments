import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import getDisqusCssIframeTemplate from '../getDisqusCssIframeTemplate';

export default class Disqus extends Component {

  static propTypes = {
    shortName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    onCommentsChanged: PropTypes.func.isRequired,
    onNewComment: PropTypes.func.isRequired,
    onObtainedCssPath: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      disqusVersion: null
    };
  }

  componentDidMount() {
    const {
      shortName,
      url,
      identifier,
      onCommentsChanged,
      onNewComment,
      onObtainedCssPath
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

    window.addEventListener('message', (message) => {
      if (typeof message.data === 'object' && message.data.type === 'disqusCSS') {
        onObtainedCssPath(message.data.cssPath);
      }
    });

    const disqusMutationObserver = new MutationObserver(() => {
      if (this.disqusElement) {
        disqusMutationObserver.disconnect();

        const src = this.disqusElement.firstChild.src;
        const versionMatch = src.match(/&version=([^&]+)&/);

        if (versionMatch && versionMatch.length > 1) {
          const disqusVersion = versionMatch[1];

          this.setState({
            disqusVersion
          });
        }
      }
    });
    disqusMutationObserver.observe(this.disqusElement, { childList: true });
  }

  render() {
    const {
      disqusVersion
    } = this.state;

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
        <div
          ref={(el) => {
            this.disqusElement = findDOMNode(el);
          }}
          id="disqus_thread"
        />
        {disqusVersion && (
          <iframe
            style={{ display: 'none' }}
            srcDoc={getDisqusCssIframeTemplate(disqusVersion)}
          />
        )}
      </div>
    );
  }
}
