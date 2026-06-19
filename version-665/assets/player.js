(function () {
  function begin(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play-button]');
    var url = box.getAttribute('data-video');
    if (!video || !url) {
      return;
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    function play() {
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
    if (box.getAttribute('data-ready') === '1') {
      play();
      return;
    }
    box.setAttribute('data-ready', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', play, { once: true });
      play();
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, play);
      box.hlsInstance = hls;
    } else {
      video.src = url;
      video.addEventListener('loadedmetadata', play, { once: true });
      play();
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (box) {
    var cover = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');
    if (cover) {
      cover.addEventListener('click', function () {
        begin(box);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (box.getAttribute('data-ready') !== '1') {
          begin(box);
        }
      });
    }
  });
})();
