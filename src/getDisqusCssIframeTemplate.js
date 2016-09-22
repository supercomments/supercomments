export default version => `
<html>
  <script type="text/javascript" src=//a.disquscdn.com/next/embed/lounge.load.${version}.js></script>
  <script type="text/javascript">
      window.require(['lounge/paths'], function(paths) {
        window.parent.postMessage({ type: 'disqusCSS', cssPath: paths.STYLES }, '*');
      });
  </script>
<head>
<body>
  <div></div>
</body>
<html>
`;
