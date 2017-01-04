export default version => `
<html>
<head>
<body>
  <div></div>
  <script type="text/javascript" src="//a.disquscdn.com/next/embed/lounge.load.${version}.js"></script>
  <script type="text/javascript">
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        for (var j = 0; j < mutations[i].addedNodes.length; j++) {
          if (mutations[i].addedNodes[j].rel === 'stylesheet') {
            window.parent.postMessage({
              type: 'disqusCSS',
              cssPath: mutations[i].addedNodes[j].href
            }, '*');
            observer.disconnect();
          }
        }
      }
    });

    observer.observe(document.head, {
      attributes: false,
      childList: true,
      characterData: false
    });
  </script>
</body>
<html>
`;
