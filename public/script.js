document.addEventListener("DOMContentLoaded", () => {
  const MOBILE_NAV_MAX = 768;

  const siteHeader = document.querySelector(".top-bar");
  const burgerBtn = document.getElementById("burger-btn");
  const primaryNav = document.getElementById("primary-navigation");
  const navBackdrop = document.getElementById("nav-backdrop");

  function setNavMenuOpen(open) {
    if (!siteHeader || !burgerBtn) return;
    siteHeader.classList.toggle("nav-open", open);
    burgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    burgerBtn.setAttribute(
      "aria-label",
      open ? "Закрити меню навігації" : "Відкрити меню навігації"
    );
    if (navBackdrop) {
      navBackdrop.hidden = !open;
      navBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
    document.body.classList.toggle("nav-menu-open", open);
  }

  function closeNavMenu() {
    setNavMenuOpen(false);
  }

  if (burgerBtn && primaryNav && siteHeader) {
    burgerBtn.addEventListener("click", () => {
      setNavMenuOpen(!siteHeader.classList.contains("nav-open"));
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= MOBILE_NAV_MAX) closeNavMenu();
      });
    });

    navBackdrop?.addEventListener("click", closeNavMenu);

    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_NAV_MAX) closeNavMenu();
    });
  }

  const speechBubble = document.querySelector(".speech-bubble");

  if (speechBubble) {
    const bubbleMessages = [
      "Потрібен масаж?",
      "Болить спина?",
      "Стрес після роботи?",
      "Хочеш розслабитись?",
      "Тоді вам до мене 👇"
    ];

    let messageIndex = 0;
    speechBubble.textContent = bubbleMessages[messageIndex];

    setInterval(() => {
      messageIndex = (messageIndex + 1) % bubbleMessages.length;
      speechBubble.textContent = bubbleMessages[messageIndex];
    }, 2200);
  }

  const SERVICE_CONTENT = {
    general: {
      title: "Загальний масаж",
      img: "./images/services/service-1.png",
      text:
        "Загальний масаж допомагає розслабити м’язи, зняти напругу та покращити кровообіг. Ідеально підходить після важкого дня або для загального відновлення організму."
    },
    lymphatic: {
      title: "Лімфодренажний масаж",
      img: "./images/services/service-2.png",
      text:
        "Лімфодренажний масаж стимулює відтік рідини, зменшує набряки та покращує обмін речовин. Допомагає очистити організм і повернути легкість у тілі."
    },
    "anti-cellulite": {
      title: "Антицелюлітний масаж",
      img: "./images/services/service-3.png",
      text:
        "Антицелюлітний масаж спрямований на покращення мікроциркуляції та тонусу шкіри у проблемних зонах, підтримує контур тіла та допомагає зробити шкіру більш рівною. Рекомендується курсами для стійкого результату."
    },
    acupuncture: {
      title: "Голкотерапія",
      img: "./images/services/service-4.png",
      text:
        "Голкотерапія — ефективний метод для зняття болю, напруги та відновлення роботи організму. Впливає на активні точки, покращує самопочуття та запускає природні процеси відновлення."
    },
    "back-manual": {
      title: "Масаж спини з мануальною технікою",
      img: "./images/services/service-5.png",
      text:
        "Масаж спини з мануальною технікою допомагає зняти біль, затиски та напругу в м’язах. Глибокий вплив на проблемні зони дозволяє швидко відчути полегшення та відновити рухливість."
    }
  };

  const modal = document.getElementById("service-modal");

  /** Закриття модалки послуги; підміняється, коли #service-modal є в DOM */
  let closeServiceModal = () => {};

  const bookingModal = document.getElementById("booking-modal");
  const bookingForm = document.getElementById("booking-form");
  const nameInput = document.getElementById("booking-name");
  const phoneInput = document.getElementById("booking-phone");
  const nameErrorEl = document.getElementById("booking-name-error");
  const phoneErrorEl = document.getElementById("booking-phone-error");
  const bookingServerErrorEl = document.getElementById("booking-server-error");

  let bookingLastFocus = null;

  function isBookingOpen() {
    return Boolean(bookingModal && !bookingModal.hidden);
  }

  function clearBookingFieldErrors() {
    if (nameErrorEl) {
      nameErrorEl.hidden = true;
      nameErrorEl.textContent = "";
    }
    if (phoneErrorEl) {
      phoneErrorEl.hidden = true;
      phoneErrorEl.textContent = "";
    }
    if (bookingServerErrorEl) {
      bookingServerErrorEl.hidden = true;
      bookingServerErrorEl.textContent = "";
    }
    nameInput?.classList.remove("booking-form__input--invalid");
    phoneInput?.classList.remove("booking-form__input--invalid");
  }

  function closeBookingModal() {
    if (!bookingModal || !bookingForm) return;
    bookingModal.hidden = true;
    clearBookingFieldErrors();
    bookingForm.reset();
    if (!modal || modal.hidden) {
      document.body.classList.remove("modal-open");
    }
    if (bookingLastFocus && typeof bookingLastFocus.focus === "function") {
      bookingLastFocus.focus();
    }
    bookingLastFocus = null;
  }

  function openBookingModal() {
    if (!bookingModal || !bookingForm) return;
    closeNavMenu();
    closeServiceModal();
    bookingLastFocus = document.activeElement;
    clearBookingFieldErrors();
    bookingForm.reset();
    bookingModal.hidden = false;
    document.body.classList.add("modal-open");
    nameInput?.focus();
  }

  function countPhoneDigits(phone) {
    return (phone || "").replace(/\D/g, "").length;
  }

  function validateBookingForm() {
    clearBookingFieldErrors();
    let ok = true;
    const name = (nameInput?.value || "").trim();
    if (name.length < 2) {
      if (nameErrorEl) {
        nameErrorEl.textContent = "Введіть ім’я (щонайменше 2 літери).";
        nameErrorEl.hidden = false;
      }
      nameInput?.classList.add("booking-form__input--invalid");
      ok = false;
    }
    const phone = phoneInput?.value || "";
    if (countPhoneDigits(phone) < 10) {
      if (phoneErrorEl) {
        phoneErrorEl.textContent = "Введіть коректний номер (наприклад, +380 …).";
        phoneErrorEl.hidden = false;
      }
      phoneInput?.classList.add("booking-form__input--invalid");
      ok = false;
    }
    return ok;
  }

  document.querySelectorAll(".js-open-booking").forEach((btn) => {
    btn.addEventListener("click", () => openBookingModal());
  });

  bookingModal?.querySelectorAll("[data-booking-close]").forEach((el) => {
    el.addEventListener("click", closeBookingModal);
  });

  bookingForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!nameInput || !phoneInput || !bookingForm) return;
    if (!validateBookingForm()) return;

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const prevLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Надсилаємо…";
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ name, phone })
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok || !data.ok) {
        let msg =
          (data && data.error) ||
          (res.status === 503
            ? "Заявки тимчасово недоступні. Зателефонуйте або напишіть у месенджер."
            : "Не вдалося надіслати. Спробуйте ще раз.");
        if (data && data.hint) {
          msg += ` Деталь: ${data.hint}`;
        }
        if (bookingServerErrorEl) {
          bookingServerErrorEl.textContent = msg;
          bookingServerErrorEl.hidden = false;
        }
        return;
      }

      window.location.href = "./thank-you.html";
    } catch {
      if (bookingServerErrorEl) {
        bookingServerErrorEl.textContent =
          "Немає зв’язку з сервером. Перевірте інтернет або зателефонуйте.";
        bookingServerErrorEl.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel || "Надіслати";
      }
    }
  });

  if (modal) {
    const modalImg = modal.querySelector(".service-modal__img");
    const modalTitle = modal.querySelector(".service-modal__title");
    const modalText = modal.querySelector(".service-modal__text");
    const closeEls = modal.querySelectorAll("[data-modal-close]");

    let lastFocus = null;

    function openServiceModal(key) {
      const data = SERVICE_CONTENT[key];
      if (!data) return;

      closeBookingModal();
      closeNavMenu();

      lastFocus = document.activeElement;

      modalImg.src = data.img;
      modalImg.alt = data.title;
      modalTitle.textContent = data.title;
      modalText.textContent = data.text;

      modal.hidden = false;
      document.body.classList.add("modal-open");

      const closeBtn = modal.querySelector(".service-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    closeServiceModal = function closeServiceModalImpl() {
      modal.hidden = true;
      modalImg.src = "";
      modalImg.alt = "";
      if (!isBookingOpen()) {
        document.body.classList.remove("modal-open");
      }
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    };

    document.querySelectorAll(".service-card").forEach((card) => {
      const open = (e) => {
        if (e.target.closest(".service-btn")) {
          e.preventDefault();
        }
        const key = card.getAttribute("data-service");
        if (key) openServiceModal(key);
      };

      card.addEventListener("click", open);

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const key = card.getAttribute("data-service");
          if (key) openServiceModal(key);
        }
      });
    });

    closeEls.forEach((el) => {
      el.addEventListener("click", closeServiceModal);
    });
  }

  const galleryLightbox = document.getElementById("gallery-lightbox");
  const galleryLightboxImg = galleryLightbox?.querySelector(".gallery-lightbox__img");
  const galleryLightboxCaption = galleryLightbox?.querySelector(".gallery-lightbox__caption");
  let galleryLightboxLastFocus = null;

  function isGalleryLightboxOpen() {
    return Boolean(galleryLightbox && !galleryLightbox.hidden);
  }

  function openGalleryLightbox(src, alt) {
    if (!galleryLightbox || !galleryLightboxImg) return;
    galleryLightboxLastFocus = document.activeElement;
    galleryLightboxImg.src = src;
    galleryLightboxImg.alt = alt || "";
    if (galleryLightboxCaption) {
      galleryLightboxCaption.textContent = alt || "";
    }
    galleryLightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    galleryLightbox.querySelector(".gallery-lightbox__close")?.focus();
  }

  function closeGalleryLightbox() {
    if (!galleryLightbox || !galleryLightboxImg) return;
    galleryLightbox.hidden = true;
    galleryLightboxImg.removeAttribute("src");
    galleryLightboxImg.alt = "";
    if (galleryLightboxCaption) {
      galleryLightboxCaption.textContent = "";
    }
    document.body.classList.remove("lightbox-open");
    if (galleryLightboxLastFocus && typeof galleryLightboxLastFocus.focus === "function") {
      galleryLightboxLastFocus.focus();
    }
    galleryLightboxLastFocus = null;
  }

  document.querySelectorAll(".gallery-item--zoomable").forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;
    const open = () => openGalleryLightbox(img.currentSrc || img.src, img.alt || "");
    item.addEventListener("click", open);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

  galleryLightbox?.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      closeGalleryLightbox();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isBookingOpen()) {
      closeBookingModal();
      return;
    }
    if (modal && !modal.hidden) {
      closeServiceModal();
      return;
    }
    if (isGalleryLightboxOpen()) {
      closeGalleryLightbox();
      return;
    }
    if (siteHeader?.classList.contains("nav-open")) {
      closeNavMenu();
    }
  });

  const SOCIAL_RAIL_STORAGE = "massageSocialRailOpen";
  const rail = document.getElementById("social-rail");
  const railClose = document.getElementById("social-rail-close");
  const railReopen = document.getElementById("social-rail-reopen");

  function setSocialRailOpen(isOpen) {
    if (!rail || !railReopen) return;
    if (isOpen) {
      rail.classList.remove("is-hidden");
      railReopen.hidden = true;
    } else {
      rail.classList.add("is-hidden");
      railReopen.hidden = false;
    }
    localStorage.setItem(SOCIAL_RAIL_STORAGE, isOpen ? "1" : "0");
  }

  if (railClose) {
    railClose.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSocialRailOpen(false);
    });
  }

  if (railReopen) {
    railReopen.addEventListener("click", (e) => {
      e.preventDefault();
      setSocialRailOpen(true);
    });
  }

  if (rail && railReopen) {
    const saved = localStorage.getItem(SOCIAL_RAIL_STORAGE);
    if (saved === "0") {
      setSocialRailOpen(false);
    } else {
      setSocialRailOpen(true);
    }
  }
});
