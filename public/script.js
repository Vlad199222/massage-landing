document.addEventListener("DOMContentLoaded", () => {
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
  if (!modal) return;

  const modalImg = modal.querySelector(".service-modal__img");
  const modalTitle = modal.querySelector(".service-modal__title");
  const modalText = modal.querySelector(".service-modal__text");
  const closeEls = modal.querySelectorAll("[data-modal-close]");

  let lastFocus = null;

  function openServiceModal(key) {
    const data = SERVICE_CONTENT[key];
    if (!data) return;

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

  function closeServiceModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    modalImg.src = "";
    modalImg.alt = "";

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      closeServiceModal();
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
