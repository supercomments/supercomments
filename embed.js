(function() {
  var config_encoded = btoa(JSON.stringify(config));
  var div = document.getElementById('supercomments');
  if (div) {
    // Create the iframe
    var frame = '<iframe id="supercomments-frame" data-config="' + config_encoded  + '></iframe>';
    frame += '</iframe>';
    div.innerHTML = frame;
    var iframe = document.createElement('iframe');
    iframe.setAttribute('data-config', config_encoded);
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('tabindex', '0');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('horizontalscrolling', 'no');
    iframe.setAttribute('style', 'width: 100% !important; border: none !important;');
    div.appendChild(iframe);

    // Inject the HTML
    var doc = iframe.contentWindow.document;
    doc.open('text/html');
    doc.write(require('./app/html/reddit.html'));
    doc.close();

    // Inject the stylesheet(s)
    var head = doc.getElementsByTagName('head')[0];
    var style = doc.createElement('style');
    style.appendChild(doc.createTextNode(require('raw!./node_modules/react-simpletabs/dist/react-simpletabs.css')));
    head.appendChild(style);
    style = doc.createElement('style');
    style.appendChild(doc.createTextNode(require('raw!./app/css/simpletabs.css')));
    head.appendChild(style);

    // Inject the scripts
    var script = doc.createElement('script');
    script.appendChild(doc.createTextNode(require('raw!./node_modules/jquery/dist/jquery.min.js')));
    head.appendChild(script);
    script = doc.createElement('script');
    script.appendChild(doc.createTextNode(require('raw!./dist/js/supercomments.js')));
    head.appendChild(script);
  }
})();
