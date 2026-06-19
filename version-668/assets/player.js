document.addEventListener("DOMContentLoaded", function () {
  const player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  const video = player.querySelector("video");
  const playButton = player.querySelector("[data-play-button]");
  const videoUrl = player.getAttribute("data-video-src");
  let hasStarted = false;

  function startPlayback() {
    if (!video || !videoUrl) {
      return;
    }

    if (!hasStarted) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }

      hasStarted = true;
    }

    if (playButton) {
      playButton.classList.add("hidden");
    }

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.setAttribute("controls", "controls");
      });
    }
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (!hasStarted) {
      startPlayback();
    }
  });
});
