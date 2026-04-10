(function () {
  if (window.ResponsiveVideoLoader) return;

  const DEFAULT_BREAKPOINT = 770;
  const loaders = new WeakMap();

  class ResponsiveVideoLoader {
    constructor(root) {
      this.root = root;
      this.mount = root.querySelector('[data-responsive-video-mount]');
      this.breakpoint = Number.parseInt(root.dataset.responsiveVideoBreakpoint || DEFAULT_BREAKPOINT, 10);
      this.mediaQuery = window.matchMedia(`(min-width: ${this.breakpoint}px)`);
      this.currentBreakpoint = null;

      this.handleMediaChange = this.handleMediaChange.bind(this);

      if (!this.mount) return;

      this.bindMediaQuery();
      this.renderActiveVideo();
    }

    bindMediaQuery() {
      if (typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.addEventListener('change', this.handleMediaChange);
        return;
      }

      this.mediaQuery.addListener(this.handleMediaChange);
    }

    handleMediaChange() {
      this.renderActiveVideo();
    }

    getActiveBreakpoint() {
      return this.mediaQuery.matches ? 'desktop' : 'mobile';
    }

    getTemplate(breakpoint) {
      return this.root.querySelector(`template[data-video-breakpoint="${breakpoint}"]`);
    }

    markReady(video) {
      const onReady = () => {
        this.root.classList.add('is-video-ready');
      };

      if (video.readyState >= 2) {
        onReady();
      }

      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('canplay', onReady, { once: true });
      video.addEventListener('playing', onReady, { once: true });
    }

    renderActiveVideo() {
      const breakpoint = this.getActiveBreakpoint();
      if (breakpoint === this.currentBreakpoint) return;

      this.currentBreakpoint = breakpoint;
      this.root.classList.remove('is-video-ready');
      this.mount.replaceChildren();

      const template = this.getTemplate(breakpoint);
      if (!template || !template.content.firstElementChild) return;

      const video = template.content.firstElementChild.cloneNode(true);
      this.mount.appendChild(video);
      this.markReady(video);

      if (typeof video.play === 'function') {
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {});
        }
      }
    }
  }

  function initAll(scope) {
    const root = scope || document;
    root.querySelectorAll('[data-responsive-video-loader]').forEach((element) => {
      if (loaders.has(element)) return;
      loaders.set(element, new ResponsiveVideoLoader(element));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAll(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });

  window.ResponsiveVideoLoader = {
    initAll: initAll
  };
})();
