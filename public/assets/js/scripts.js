"use strict";
const _navbar = "header-menu",
  _navbar_toggle = "menu-toggler",
  _navbar_active = "active",
  _navbar_fixed = "has-fixed",
  _navbar_mobile = "mobile-menu",
  _navbar_break = 1201,
  _menu_toggle = "menu-toggle",
  _menu_sub = "menu-sub",
  _menu_active = "active",
  navbar = document.querySelector("." + _navbar),
  navbar_toggle = document.querySelector(".menu-toggler"),
  menu_toggle = document.querySelectorAll(".menu-toggle");
function toggleDropdown(e, t, n) {
  e.classList.contains(n)
    ? (e.classList.remove(n), slideUp(t))
    : (e.classList.add(n), slideDown(t));
}
function closeDropdownSiblings(e, t, n, o) {
  Array.from(e).forEach((e) => {
    e.classList.contains(o) &&
      !t.classList.contains(o) &&
      (e.classList.remove(o),
      Array.from(e.children).forEach((e) => {
        e.classList.contains(n) && slideUp(e);
      }));
  });
}
function menuDropdown(e, t, n) {
  e.forEach((e) => {
    e.addEventListener("click", function (o) {
      o.preventDefault();
      let a = e.parentElement,
        l = e.nextElementSibling;
      closeDropdownSiblings(e.parentElement.parentElement.children, a, t, n),
        toggleDropdown(a, l, n);
    });
  });
}
function mobileNavInit() {
  window.innerWidth <= 1201 && navbar.classList.add("mobile-menu");
}
function mobileNavResize() {
  window.innerWidth <= 1201
    ? navbar.classList.add("mobile-menu")
    : (navbar.classList.remove("mobile-menu", "active"),
      navbar_toggle.classList.remove("active"));
}
function mobileNavToggle() {
  navbar_toggle.classList.toggle("active"), navbar.classList.toggle("active");
}
function navOutSideClick(e) {
  e.target !== navbar &&
    e.target !== navbar_toggle &&
    e.target !== userSidebar &&
    e.target !== sidebarMenuOpen &&
    null == e.target.closest("." + _navbar) &&
    null == e.target.closest(".menu-toggler") &&
    (navbar_toggle && navbar_toggle.classList.remove("active"),
    userSidebar && userSidebar.classList.remove("active"),
    navbar.classList.remove("active"));
}
function stickyMenu(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      let t = e.offsetTop;
      window.addEventListener("scroll", function () {
        window.scrollY > t
          ? e.classList.add("has-fixed")
          : e.classList.remove("has-fixed");
      });
    });
}
menuDropdown(menu_toggle, _menu_sub, "active"),
  mobileNavInit(),
  window.addEventListener("resize", function () {
    mobileNavResize();
  }),
  navbar_toggle &&
    navbar_toggle.addEventListener("click", function () {
      mobileNavToggle();
    }),
  document.addEventListener("click", function (e) {
    navOutSideClick(e);
  }),
  stickyMenu(".is-sticky");
var sidebarMenuOpen = document.querySelector(".menu-toggler-user-open"),
  userSidebar = document.querySelector(".sidebar-user-mobile");
function userSidebarMenu() {
  sidebarMenuOpen &&
    sidebarMenuOpen.addEventListener("click", function (e) {
      e.preventDefault(), userSidebar.classList.add("active");
    }),
    userSidebar &&
      userSidebar.addEventListener("click", function () {
        this.classList.remove("active");
      });
}
function countDownTimer(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      let t = e.id,
        n = e.dataset.expTime,
        o = e.dataset.expMessage ? e.dataset.expMessage : "Countdown Ended";
      new Date().getFullYear();
      const a = new Date(n).getTime();
      setInterval(function () {
        const e = new Date().getTime(),
          n = a - e;
        let l = Math.floor((n % 864e5) / 36e5),
          i = Math.floor((n % 36e5) / 6e4),
          c = Math.floor((n % 6e4) / 1e3);
        document.getElementById(t).innerHTML =
          a >= e
            ? `<div className="countdown-item"><span className="countdown-amount">${l}</span><span className="countdown-text"> Hours</span></div>\n            <div className="countdown-item"><span className="countdown-amount">${i}</span><span className="countdown-text"> Minutes</span></div>\n            <div className="countdown-item"><span className="countdown-amount">${c}</span><span className="countdown-text"> Seconds</span></div>`
            : `<div className="countdown-note">${o}</div>`;
      }, 1e3);
    });
}
function customTooltip(e, t) {
  let n = document.querySelectorAll(e);
  n.length > 0 &&
    n.forEach((e) => {
      const n = e.parentElement,
        o = e.nextElementSibling;
      Popper.createPopper(e, o),
        n.addEventListener("mouseenter", function (e) {
          n.classList.add(t);
        }),
        n.addEventListener("mouseleave", function (e) {
          n.classList.remove(t);
        });
    });
}
function swiperCarousel(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      let t = e.dataset.breakpoints ? JSON.parse(e.dataset.breakpoints) : null,
        n = !!e.dataset.autoplay && JSON.parse(e.dataset.autoplay),
        o = !!e.dataset.loop && JSON.parse(e.dataset.loop),
        a = !!e.dataset.centeredslides && JSON.parse(e.dataset.centeredslides),
        l = e.dataset.speed ? parseInt(e.dataset.speed) : 1e3,
        i = e.dataset.effect ? e.dataset.effect : "";
      new Swiper(e, {
        centeredSlides: a,
        loop: o,
        speed: l,
        autoplay: n,
        effect: i,
        pagination: {
          el: ".swiper-pagination",
          type: "bullets",
          clickable: !0,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
          clickable: !0,
        },
        breakpoints: t,
      });
    });
}
function bootstrapTooltip(e) {
  let t = document.querySelectorAll(e);
  [].slice.call(t).map(function (e) {
    return new bootstrap.Tooltip(e);
  });
}
function copyToClipboard(e) {
  var t = document.querySelectorAll(e);
  if (void 0 !== t && null != t) var n = new ClipboardJS(t);
  n.on("success", function (e) {
    let t = e.trigger.querySelector(".tooltip-text"),
      n = t.innerHTML;
    (t.innerHTML = "Copied"),
      setTimeout(function () {
        t.innerHTML = n;
      }, 1e3);
  });
}
function fileUpload(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      e.addEventListener("change", function () {
        var t = document.getElementById(e.dataset.target),
          n = this.value.split(".").pop(),
          o = this.value.lastIndexOf("."),
          a = this.value.substring(o + 1),
          l = (t.value = a);
        ["jpg", "png", "gif", "webp", "mp4", "mp3"].includes(n)
          ? (t.innerHTML = e.files[0].name)
          : (alert(
              l +
                " file type not allowed, Please upload jpg, png, gif, webp, mp4 or mp3 file"
            ),
            (t.innerHTML =
              "Please upload jpg, png, gif, webp, mp4 or mp3 file"));
      });
    });
}
function checkboxSwitcher(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      e.addEventListener("change", function () {
        let t = document.getElementById(e.dataset.target);
        this.checked
          ? t.classList.add("is-shown")
          : t.classList.remove("is-shown");
      });
    });
}
function showHidePassword(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      e.addEventListener("click", function (t) {
        t.preventDefault();
        let n = document.getElementById(e.getAttribute("href"));
        "password" == n.type
          ? ((n.type = "text"), e.classList.add("is-shown"))
          : ((n.type = "password"), e.classList.remove("is-shown"));
      });
    });
}
function internationalTeliphone(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      intlTelInput(e);
    });
}
function themeSwitcher(e) {
  let t = document.querySelectorAll(e);
  function n() {
    var e = localStorage.getItem("website_theme");
    null != e &&
      (document.body.classList.remove("default", "dark-mode"),
      document.body.classList.add(e));
  }
  t.length > 0 &&
    t.forEach((e) => {
      e.addEventListener("click", function (e) {
        e.preventDefault(),
          document.body.classList.toggle("dark-mode"),
          document.body.classList.contains("dark-mode")
            ? localStorage.setItem("website_theme", "dark-mode")
            : localStorage.setItem("website_theme", "default");
      });
    }),
    n(),
    window &&
      window.addEventListener(
        "storage",
        function () {
          n();
        },
        !1
      );
}
function uploadImage(e) {
  let t = document.querySelectorAll(e);
  t.length > 0 &&
    t.forEach((e) => {
      e.addEventListener("change", function () {
        if (e.files && e.files[0]) {
          let a = document.getElementById(e.dataset.target);
          (a.onload = function () {
            URL.revokeObjectURL(a.src);
          }),
            (a.src = URL.createObjectURL(e.files[0]));
          let l = ["jpg", "JPEG", "JPG", "png"],
            i = this.value.split(".").pop();
          var t = this.value.lastIndexOf("."),
            n = this.value.substring(t + 1),
            o = (a.value = n);
          l.includes(i) ||
            (alert(
              o +
                " file type not allowed, Please upload jpg, JPG, JPEG, or png file"
            ),
            (a.src = " "));
        }
      });
    });
}
function checkboxAllToggle(e, t) {
  let n = document.querySelectorAll(e),
    o = document.querySelectorAll(t);
  n.length > 0 &&
    n.forEach((e) => {
      e.addEventListener("click", function (e) {
        "Check All" == e.target.value
          ? (o.forEach(function (e) {
              e.checked = !0;
            }),
            (e.target.value = "Uncheck All"))
          : (o.forEach(function (e) {
              e.checked = !1;
            }),
            (e.target.value = "Check All"));
      });
    });
}
function hideDropdown(e, t, n) {
  let o = document.querySelectorAll(e),
    a = document.querySelector(t),
    l = document.querySelector(n);
  o.length > 0 &&
    o.forEach((e) => {
      e.addEventListener("mouseenter", function (e) {
        a && a.classList.remove("show");
      });
    }),
    l &&
      l.addEventListener("click", function () {
        a && a.classList.add("show");
      });
}
function filterItems(e, t) {
  var n,
    o = document.querySelector(e);
  if (void 0 !== o && null != o)
    var a = new Isotope(o, {
      itemSelector: t,
      layoutMode: "fitRows",
      filter: function (e) {
        return !n || e.textContent.match(n);
      },
    });
  var l = document.querySelector(".filter-button-group");
  l &&
    l.addEventListener("click", function (e) {
      if (matchesSelector(e.target, "button")) {
        var t = e.target.getAttribute("data-filter");
        a.arrange({ filter: t });
      }
    });
  var i = document.querySelector(".filter-select");
  i &&
    (i.onchange = function () {
      var e = this.value;
      a.arrange({ filter: e });
    });
  var c = document.querySelectorAll(".quicksearch");
  c.length > 0 &&
    c.forEach((e) => {
      e.addEventListener("keyup", function () {
        (n = new RegExp(e.value, "gi")), a.arrange();
      });
    });
  for (
    var r = document.querySelectorAll(".button-group"), s = 0, u = r.length;
    s < u;
    s++
  ) {
    d(r[s]);
  }
  function d(e) {
    e.addEventListener("click", function (t) {
      matchesSelector(t.target, "button") &&
        (e.querySelector(".is-checked").classList.remove("is-checked"),
        t.target.classList.add("is-checked"));
    });
  }
}
function choiceSelect(e) {
  let t = document.querySelector(e);
  if (void 0 !== t && null != t) {
    new Choices(t, { searchEnabled: !1, itemSelectText: "" });
  }
}
function setBg(e) {
  for (var t = document.querySelectorAll(e), n = 0; n < t.length; n++) {
    var o = t[n].getAttribute("data-set-bg");
    t[n].style.backgroundImage = "url('" + o + "')";
  }
}
userSidebarMenu(),
  countDownTimer(".countdown-timer"),
  customTooltip(".custom-tooltip", "active"),
  swiperCarousel(".swiper-carousel"),
  bootstrapTooltip('[data-bs-toggle="tooltip"]'),
  copyToClipboard(".copy-text"),
  fileUpload(".file-upload-input"),
  checkboxSwitcher(".checkbox-switcher"),
  showHidePassword(".password-toggle"),
  internationalTeliphone(".phone-number"),
  themeSwitcher(".theme-toggler"),
  uploadImage(".upload-image"),
  checkboxAllToggle(".check-all", ".check-all-input"),
  hideDropdown(".menu-link", ".hide-dropdown", ".dropdown-toggle-show"),
  filterItems(".filter-container", ".filter-item"),
  choiceSelect(".form-choice"),
  setBg(".set-bg");
