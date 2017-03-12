!function() {
  if (window.COUB_EMBEDS) {
    return;
  } else {
    window.COUB_EMBEDS = true;
  }

  if (!window.postMessage)
    return;


  function onScroll() {
    var iframes = allCoubIframes(),
        entirelyVisible = [],
        partlyVisible = [],
        winner;

    for(var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i],
          vis = getRelativeVisibility(iframe);

      if (vis === 1) {
        entirelyVisible.push(iframe);
      } else if (vis >= 0.5) {
        partlyVisible.push(iframe);
      } else {
        stopFrame(iframe);
      }
    }

    if (entirelyVisible.length > 0) {
      winner = getMedian(entirelyVisible);
    } else if (partlyVisible.length > 0) {
      winner = getMedian(partlyVisible);
    } else {
      return;
    }

    var visible = entirelyVisible.concat(partlyVisible);

    for (var i = 0; i < visible.length; i++) {
      var iframe = visible[i];

      if (iframe === winner) {
        startFrame(iframe);
      } else {
        stopFrame(iframe);
      }
    }
  }


  function postMsg(iframe, msg) {
    iframe.contentWindow.postMessage(msg, '*');
  }


  function startFrame(iframe) {
    postMsg(iframe, 'play#runner');
  }


  function stopFrame(iframe) {
    postMsg(iframe, 'stop');
  }


  function getMedian(a) {
    return a[Math.ceil(a.length / 2) - 1];
  }


  function testOrigin(url) {
    return /(\/|\.)coub.(com|dev|\d+)/.test(url);
  }


  function allCoubIframes() {
    var out = [],
        iframes = document.getElementsByTagName('iframe');

    for(var i = 0; i < iframes.length; i++) {
      if (testOrigin(iframes[i].src)) {
        out.push(iframes[i]);
      }
    }

    return out;
  }


  function getRelativeVisibility(el) {
    var rect = el.getBoundingClientRect(),
        relativeVisibility = 0;

    if (rect.right < rect.width / 2 || rect.left > window.innerWidth - rect.width / 2)
      return 0;

    if (rect.top < 0 && rect.bottom > 0) {
      relativeVisibility = rect.bottom / rect.height;
    } else if (rect.top >= 0 && rect.bottom < window.innerHeight) {
      relativeVisibility = 1;
    } else if (rect.top < window.innerHeight && rect.bottom > window.innerHeight) {
      relativeVisibility = (window.innerHeight - rect.top) / rect.height;
    }

    return relativeVisibility;
  }


  function addListener(ev, el, fn) {
    if (el.addEventListener) {
      el.addEventListener(ev, fn, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + ev, fn);
    }
  }


  var isScroll = false,
      scrollTimeout;

  addListener('scroll', window, function() {
    isScroll = true;
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(function() {
      onScroll();
      isScroll = false;
    }, 100);
  });

  addListener('message', window, function(e) {
    if (e.data === 'ready' && testOrigin(e.origin)) {
      e.source.postMessage('hidefinger', '*');
    }
  });

  setTimeout(function() {
    if (!isScroll) {
      onScroll();
    }
  }, 3000);
}();
