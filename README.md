# SuperComments
*Extend Disqus with Reddit comments right on your site.*

It's great when your blog post gets traction on Reddit, but readers have no way to interact with the Reddit community without leaving your site. SuperComments lets you embed Reddit comment threads directly in your webpages. Users can post new comments, reply to existing comments, upvote, downvote and much more.

SuperComments is designed as an extension to the excellent [Disqus](http://www.disqus.com) commenting system. As such, visitors will be able to access both Disqus and Reddit comment threads in separate tabs using the same user interface.

## Installing

The simplest way to install SuperComments is to download the prebuilt bundle from the `dist` directory. There are currently two HTML files, two JS files and a source map:

* `reddit.html` the main entry point
* `redditAuth.html` a simple popup window used for OAuth
* `jquery.min.js` and `jquery.min.map` minified jQuery with source map
* `supercomments.js` the SuperComments application

Just place those files on your web server, preserving the directory structure, and serve up `reddit.html`.

## Usage

For the current test version, request `reddit.html` directly. You can specify the URL to use as the query string, e.g.:

```
http://localhost:3000/html/reddit/reddit.html?http://www.salsitasoft.com
```

## Building

If you want to build your own version of SuperComments, just pull the repository and run `gulp` (you must have Gulp installed globally). To run the tests, use `npm test`.

## Status and Next Steps

The current version is for testing purposes only. It makes it possible to view and interact with a Reddit comment thread using the Disqus user interface. For the final version we plan the following additional features:

* Better UX for asynchronous requests. Right now the interface seems laggy when making requests to the Reddit API (which is pretty slow). In some cases, such as the initial loading of the thread, a throbber should be displayed. In other cases, like posting a comment, we should do what Disqus does and display a grey version of the comment right away that turns black when it is posted successfully.
* Embeddable frame. Like Disqus, the SuperComments HTML should be loaded into a page via an `iframe` and use the URL of the containing page automatically.
* Display both Disqus and Reddit comment threads. The plan is for tabs to be displayed so that the user can switch between the two different views. In the longer term, the threads could potentially be merged, but this will require more development effort. It is also unclear to what extent it will interfere with Disqus's normal functioning if the HTML that its scripts are working on is modified.
* Support comment threads from other sites such as Hacker News and Twitter.