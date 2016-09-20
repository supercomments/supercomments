import React, { Component, PropTypes } from 'react';

import * as Tabs from './constants/tabs';
import FramedTabpanel from './components/FramedTabpanel';
import Footer from './components/Footer';

export default class Supercomments extends Component {

  static propTypes = {
    url: PropTypes.string.isRequired,
    disqus: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: Tabs.Disqus,
      disqusComments: 0,
      redditComments: 0
    };

    this.boundOnChangeTab = this.onChangeTab.bind(this);
    this.boundOnDiscussCommentsChanged = this.onDiscussCommentsChanged.bind(this);
    this.boundOnDiscussCommentsIncremented = this.onDiscussCommentsIncremented.bind(this);
    this.boundOnRedditCommentsChanged = this.onRedditCommentsChanged.bind(this);
  }

  onChangeTab(tab) {
    this.setState({
      tab
    });
  }

  onDiscussCommentsChanged(disqusComments) {
    this.setState({
      disqusComments
    });
  }

  onDiscussCommentsIncremented() {
    this.setState({
      disqusComments: this.state.disqusComments + 1
    });
  }

  onRedditCommentsChanged(redditComments) {
    this.setState({
      redditComments
    });
  }

  render() {
    const {
      tab,
      disqusComments,
      redditComments
    } = this.state;

    const {
      url,
      disqus
    } = this.props;

    return (
      <div>
        <FramedTabpanel
          url={url}
          disqus={disqus}
          tab={tab}
          disqusComments={disqusComments}
          redditComments={redditComments}
          onChangeTab={this.boundOnChangeTab}
          onDiscussCommentsChanged={this.boundOnDiscussCommentsChanged}
          onDiscussCommentsIncremented={this.boundOnDiscussCommentsIncremented}
          onRedditCommentsChanged={this.boundOnRedditCommentsChanged}
        />
        <Footer />
      </div>
    );
  }
}
