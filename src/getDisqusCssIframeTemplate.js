export default version => `
<html>
<head>
<body>
  <div></div>
  <script type="text/javascript" src="//a.disquscdn.com/next/embed/lounge.load.${version}.js"></script>
  <script type="text/javascript">
    var polling = setInterval(function() {
      var links = document.getElementsByTagName('link');

      for (var i = 0; i < links.length; i++) {
        if (links[i].rel === 'stylesheet') {
          window.parent.postMessage({
            type: 'disqusCSS',
            cssPath: links[i].href
          }, '*');
          clearInterval(polling);
        }
      }
    }, 100);
  </script>
</body>
<html>
`;
