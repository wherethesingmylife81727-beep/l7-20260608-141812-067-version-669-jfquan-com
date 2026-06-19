(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  var hlsLoaderPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoaderPromise) {
      return hlsLoaderPromise;
    }
    hlsLoaderPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS library loaded without Hls export.'));
        }
      };
      script.onerror = function () {
        reject(new Error('Unable to load hls.js.'));
      };
      document.head.appendChild(script);
    });
    return hlsLoaderPromise;
  }

  function setMessage(shell, message) {
    var messageBox = shell.querySelector('[data-player-message]');
    if (messageBox) {
      messageBox.textContent = message;
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-src');
    if (!video || !source) {
      setMessage(shell, '播放源未配置');
      return;
    }

    setMessage(shell, '正在初始化播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        setMessage(shell, '播放器已载入，请再次点击播放');
      });
      shell.classList.add('is-playing');
      return;
    }

    loadHlsLibrary()
      .then(function (Hls) {
        if (!Hls.isSupported()) {
          video.src = source;
          setMessage(shell, '当前浏览器将尝试直接播放');
          return video.play();
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.add('is-playing');
          setMessage(shell, '播放源已就绪');
          video.play().catch(function () {
            setMessage(shell, '播放器已载入，请再次点击播放');
          });
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage(shell, '播放线路暂时不可用，请刷新重试');
          }
        });
      })
      .catch(function () {
        video.src = source;
        shell.classList.add('is-playing');
        setMessage(shell, '已切换为浏览器原生播放');
        video.play().catch(function () {
          setMessage(shell, '浏览器需要 HLS 支持，请更换浏览器或联网后重试');
        });
      });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var button = shell.querySelector('[data-play-button]');
      if (!button) {
        return;
      }
      button.addEventListener('click', function () {
        initPlayer(shell);
      }, { once: true });
    });
  });
})();
