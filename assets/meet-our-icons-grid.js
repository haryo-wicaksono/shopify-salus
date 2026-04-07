(function () {
  function initMeetOurIconsGrid(root) {
    if (!root || root.dataset.meetOurIconsGridInitialized === 'true') return;
    root.dataset.meetOurIconsGridInitialized = 'true';

    const playButtons = root.querySelectorAll('.meet-our-icons-grid__play-button');
    let currentPlayingVideo = null;

    playButtons.forEach((button) => {
      const mediaWrapper = button.closest('.meet-our-icons-grid__media-wrapper');
      const videoElement = mediaWrapper ? mediaWrapper.querySelector('.meet-our-icons-grid__inline-video') : null;

      if (!mediaWrapper || !videoElement) return;

      const resetState = () => {
        mediaWrapper.classList.remove('is-playing');
        if (currentPlayingVideo === videoElement) {
          currentPlayingVideo = null;
        }
      };

      videoElement.addEventListener('pause', resetState);
      videoElement.addEventListener('ended', resetState);

      button.addEventListener('click', () => {
        if (currentPlayingVideo && currentPlayingVideo !== videoElement && !currentPlayingVideo.paused) {
          currentPlayingVideo.pause();
          const currentWrapper = currentPlayingVideo.closest('.meet-our-icons-grid__media-wrapper');
          if (currentWrapper) currentWrapper.classList.remove('is-playing');
        }

        if (currentPlayingVideo === videoElement) {
          if (videoElement.paused) {
            videoElement.play();
            mediaWrapper.classList.add('is-playing');
          } else {
            videoElement.pause();
            mediaWrapper.classList.remove('is-playing');
          }
          return;
        }

        videoElement
          .play()
          .then(() => {
            mediaWrapper.classList.add('is-playing');
            currentPlayingVideo = videoElement;
          })
          .catch((error) => {
            console.error('Meet Our Icons video play failed:', error);
            mediaWrapper.classList.remove('is-playing');
            currentPlayingVideo = null;
          });
      });
    });
  }

  function initAllMeetOurIconsGrids(container) {
    const scope = container || document;
    if (scope.matches && scope.matches('.js-meet-our-icons-grid')) {
      initMeetOurIconsGrid(scope);
    }
    scope.querySelectorAll('.js-meet-our-icons-grid').forEach(initMeetOurIconsGrid);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAllMeetOurIconsGrids(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAllMeetOurIconsGrids(event.target);
  });
})();
