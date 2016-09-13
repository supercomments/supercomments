import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import buildActionCreators from 'helpers/buildActionCreators';
import * as Actions from 'constants/actions';
import * as Sort from 'constants/sort';
import { getSort } from 'selectors/threadSelectors';
import { getCommentsCount, getPost } from 'selectors/entityRepositorySelectors';

import LayoutWrapper from 'components/LayoutWrapper';
import PrimaryHeader from 'components/PrimaryHeader';
import SecondaryHeader from 'components/SecondaryHeader';

import Thread from 'containers/Thread';
import ReplyForm from 'containers/ReplyForm';

const RedditSupercomments = ({
  post,
  commentsCount,
  selectedSort,
  sortBest,
  sortNewest,
  sortOldest,
  upvotePost
}) => {
  if (post) {
    return (
      <LayoutWrapper>
        <PrimaryHeader
          subreddit={post.subreddit}
          commentsCount={commentsCount}
        />
        <section id="conversation">
          <SecondaryHeader
            sort={selectedSort}
            votes={post.votes}
            upvoted={post.upvoted}
            onSortBest={sortBest}
            onSortNewest={sortNewest}
            onSortOldest={sortOldest}
            onUpvotePost={upvotePost}
          />
          <div id="posts">
            <ReplyForm threadId={post.id} />
            <Thread isRootThread threadId={post.id} />
          </div>
        </section>
      </LayoutWrapper>
    );
  } else {
    return null;
  }
};

RedditSupercomments.propTypes = {
  commentsCount: PropTypes.number.isRequired,
  selectedSort: PropTypes.string.isRequired,
  post: PropTypes.object,
  sortBest: PropTypes.func.isRequired,
  sortNewest: PropTypes.func.isRequired,
  sortOldest: PropTypes.func.isRequired,
  upvotePost: PropTypes.func.isRequired
};

const mapStateToProps = appState => ({
  selectedSort: getSort(appState),
  commentsCount: getCommentsCount(appState),
  post: getPost(appState)
});

export default connect(
  mapStateToProps,
  buildActionCreators({
    sort: Actions.Sort,
    upvotePost: Actions.UpvotePost
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
