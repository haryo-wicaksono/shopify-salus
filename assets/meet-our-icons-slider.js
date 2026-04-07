(function () {
  function initMeetOurIconsSlider(root) {
    if (!root || root.dataset.meetOurIconsSliderInitialized === 'true') return;
    root.dataset.meetOurIconsSliderInitialized = 'true';

    const playButtons = root.querySelectorAll('.meet-our-icons-slider__play-button');
    let currentPlayingVideo = null;

    playButtons.forEach((button) => {
      const mediaWrapper = button.closest('.meet-our-icons-slider__media-wrapper');
      const videoElement = mediaWrapper ? mediaWrapper.querySelector('.meet-our-icons-slider__inline-video') : null;

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
          const currentWrapper = currentPlayingVideo.closest('.meet-our-icons-slider__media-wrapper');
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
            console.error('Meet Our Icons slider video play failed:', error);
            mediaWrapper.classList.remove('is-playing');
            currentPlayingVideo = null;
          });
      });
    });
  }

  function initAllMeetOurIconsSliders(container) {
    const scope = container || document;
    if (scope.matches && scope.matches('.js-meet-our-icons-slider')) {
      initMeetOurIconsSlider(scope);
    }
    scope.querySelectorAll('.js-meet-our-icons-slider').forEach(initMeetOurIconsSlider);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAllMeetOurIconsSliders(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAllMeetOurIconsSliders(event.target);
  });
})();
