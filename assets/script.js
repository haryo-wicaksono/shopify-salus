{
  var swiper = new Swiper(".image-slideShow", {
    slidesPerView: 3.8,
    spaceBetween: 60,
    loop: true,
    centeredSlides: true,
    centeredSlidesBounds: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    speed: 5000,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1.5,
        spaceBetween: 32,
      },
      400: {
        slidesPerView: 1.8,
        spaceBetween: 50,
      },
      620: {
        slidesPerView: 2.5,
        spaceBetween: 40,
      },
      768: {
        slidesPerView: 2.8,
        spaceBetween: 50,
      },
      1024: {
        slidesPerView: 3.2,
        spaceBetween: 50,
      },
      1200: {
        slidesPerView: 3.4,
        spaceBetween: 60,
      },
    },
  });
}

{
  var iconsSwiper = new Swiper(".iconsProducts-slideShow", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    // autoplay: {
    //   delay: 5000,
    //   disableOnInteraction: false,
    // },
    speed: 1000,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      575: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });
}

// Video Carousel
document.addEventListener("DOMContentLoaded", () => {
  var swiper = new Swiper(".videoCaro", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      320: {
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      },
      768: {
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      },
    },
  });
});

// Video play button

document.addEventListener("DOMContentLoaded", () => {
  const playbtn = document.querySelectorAll(".videoCarousel span.play-btn");
  const video = document.querySelectorAll(".videoCarousel video");

  playbtn.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      console.log("po");
      video.forEach((vid, vidIndex) => {
        if (vidIndex === index) {
          if (vid.paused) {
            vid.play();
            btn.classList.add("play");
          } else {
            vid.pause();
            btn.classList.remove("play");
          }
        } else {
          vid.pause();
          playbtn[vidIndex].classList.remove("play");
        }
      });
    });
  });
});

// slider cards

var swiper = new Swiper(".CardsSlider", {
  slidesPerView: 2.3,
  spaceBetween: 40,
  pagination: {
    el: ".swiper-pagination",
    type: "progressbar",
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    320: {
      slidesPerView: 1.3,
      spaceBetween: 20,
    },
    575: {
      slidesPerView: 1.3,
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 2.3,
      spaceBetween: 40,
    },
    1200: {
      slidesPerView: 2.3,
      spaceBetween: 40,
    },
  },
});

// Faq script

document.addEventListener("DOMContentLoaded", () => {
  const faqItem = document.querySelectorAll(
    "details.disclosure.disclosure--row"
  );
  faqItem.forEach((item) => {
    item.addEventListener("click", () => {
      faqItem.forEach((it) => {
        it.removeAttribute("open");
      });
      item.setAttribute("open", "");
    });
  });
});
// Attribute add

window.addEventListener("load", function () {
  var element = document.querySelector(
    ".footer-newsletter-row .footer-menu.disclosure"
  );
  element.setAttribute("open", "");
  element.classList.add("is-open");
});

// mobile only carousel

// window.addEventListener("load", function () {
//   mobileOnlySlider(".productMobileSlider", true, false, 575);

//   function mobileOnlySlider($slidername, $dots, $arrows, $breakpoint) {
//     var slider = $($slidername);
//     var settings = {
//       mobileFirst: true,
//       dots: $dots,
//       arrows: $arrows,
//       responsive: [
//         {
//           breakpoint: $breakpoint,
//           settings: "unslick",
//         },
//       ],
//     };

//     slider.slick(settings);

//     $(window).on("resize", function () {
//       if ($(window).width() > $breakpoint) {
//         return;
//       }
//       if (!slider.hasClass("slick-initialized")) {
//         return slider.slick(settings);
//       }
//     });
//   } // Mobile Only Slider
// });

window.addEventListener("load", function () {
  if (typeof window.jQuery !== "function" || typeof window.jQuery.fn.slick !== "function") {
    return;
  }

  mobileOnlySlider(".productMobileSlider", true, true, 575);

  function mobileOnlySlider($slidername, $dots, $arrows, $breakpoint) {
    var slider = $($slidername);
    var settings = {
      mobileFirst: true,
      infinite: false,
      // dots: $dots,
      arrows: $arrows,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        {
          breakpoint: $breakpoint,
          settings: "unslick",
        },
      ],
    };

    slider.on(
      "init reInit afterChange",
      function (event, slick, currentSlide, nextSlide) {
        var i = (currentSlide ? currentSlide : 0) + 1;
        $(".progress-bar").css("width", (i / slick.slideCount) * 100 + "%");
      }
    );

    slider.slick(settings);

    $(window).on("resize", function () {
      if ($(window).width() > $breakpoint) {
        return;
      }
      if (!slider.hasClass("slick-initialized")) {
        return slider.slick(settings);
      }
    });
  } // Mobile Only Slider
});

// document.addEventListener("DOMContentLoaded", () => {
// const html = document.querySelectorAll('.videoCarousel .swiper-slide');
// html.forEach((element) => {
//     // Remove all occurrences of &gt; and "
//     element.innerHTML = element.innerHTML.replace(/&gt;/g, '').replace(/"/g, '');
// });
// console.log(html[0].innerHTML);

// });

// const clicdrop = document.querySelectorAll(".jdgm-rev-widg__sort-wrapper");

// clicdrop.forEach((item) => {
//   item.addEventListener("click", function () {
//     // Remove active class from all other dropdowns
//     clicdrop.forEach(drop => drop.classList.remove("active"));

//     // Add active class to the specific div
//     item.classList.add("active");
//   });
// });
