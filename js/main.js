(function () {
  var T = window.TRANSLATIONS;
  var SUPPORTED = ["en", "de", "pt"];
  var STORAGE_KEY = "casa-lang";
  var currentLang = "en";

  function t(key) {
    return (T[currentLang] && T[currentLang][key]) || T.en[key] || key;
  }

  function detectLang() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var langs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < langs.length; i++) {
      var code = String(langs[i]).slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(code) !== -1) return code;
    }
    return "en";
  }

  function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
  });

  // Mobile menu
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Booking request form: validates, then opens the guest's email app.
  // Replace with a real backend or form service later.
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var today = new Date().toISOString().slice(0, 10);
  form.checkin.min = today;
  form.checkout.min = today;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status";
    var fields = [form.name, form.email, form.checkin, form.checkout];
    var valid = true;
    fields.forEach(function (f) {
      var ok = f.value.trim() !== "" && f.checkValidity();
      f.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      status.textContent = t("form.error");
      status.classList.add("err");
      return;
    }
    if (form.checkout.value <= form.checkin.value) {
      form.checkout.classList.add("invalid");
      status.textContent = t("form.dateError");
      status.classList.add("err");
      return;
    }
    var body = [
      t("form.name") + ": " + form.name.value,
      t("form.email") + ": " + form.email.value,
      t("form.checkin") + ": " + form.checkin.value,
      t("form.checkout") + ": " + form.checkout.value,
      t("form.guests") + ": " + form.guests.value,
      "",
      form.message.value
    ].join("\n");
    status.textContent = t("form.success");
    status.classList.add("ok");
    location.href = "mailto:hello@casa-hotel.example?subject=" +
      encodeURIComponent(t("form.mailSubject")) + "&body=" + encodeURIComponent(body);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
  setLang(detectLang());
})();
