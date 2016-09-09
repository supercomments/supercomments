import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import * as Sort from 'constants/sort';
import { ROOT_THREAD_ID, getPost, getSort } from 'selectors/threadSelectors';
import { getCommentsCount } from 'selectors/entityRepositorySelectors';

import LayoutWrapper from 'components/LayoutWrapper';
import PrimaryHeader from 'components/PrimaryHeader';
import SecondaryHeader from 'components/SecondaryHeader';

import Thread from 'containers/Thread';

const RedditSupercomments = ({
  post,
  commentsCount,
  selectedSort,
  sortBest,
  sortNewest,
  sortOldest
}) => (
  <LayoutWrapper>
    <PrimaryHeader
      subreddit={post.subreddit}
      commentsCount={commentsCount}
    />
    <section id="conversation">
      <SecondaryHeader
        sort={selectedSort}
        onSortBest={sortBest}
        onSortNewest={sortNewest}
        onSortOldest={sortOldest}
      />
      <div id="posts">
        <Thread threadId={ROOT_THREAD_ID} />
      </div>
    </section>
  </LayoutWrapper>
);

RedditSupercomments.propTypes = {
  commentsCount: PropTypes.number.isRequired,
  selectedSort: PropTypes.string.isRequired,
  post: PropTypes.object.isRequired,
  sortBest: PropTypes.func.isRequired,
  sortNewest: PropTypes.func.isRequired,
  sortOldest: PropTypes.func.isRequired
};

const mapStateToProps = appState => ({
  selectedSort: getSort(appState),
  commentsCount: getCommentsCount(appState),
  post: getPost(appState)
});

export default connect(
  mapStateToProps,
  buildActionCreators({
    sort: Actions.Sort
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    sortBest: () => dispatchProps.sort(Sort.Best),
    sortNewest: () => dispatchProps.sort(Sort.Newest),
    sortOldest: () => dispatchProps.sort(Sort.Oldest)
  })
)(RedditSupercomments);
