const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navigationLinks = navigation ? navigation.querySelectorAll("a") : [];
const faqQuestions = document.querySelectorAll(".faq-question");
const currentYear = document.querySelector("[data-current-year]");
const desktopBreakpoint = window.matchMedia("(min-width: 60rem)");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu({ returnFocus = false } = {}) {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu de navegação");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");

  if (returnFocus) menuToggle.focus();
}

function openMenu() {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu de navegação");
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");

  const firstLink = navigation.querySelector("a");
  if (firstLink) firstLink.focus();
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  desktopBreakpoint.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const isExpanded = question.getAttribute("aria-expanded") === "true";
    const answerId = question.getAttribute("aria-controls");
    const answer = document.getElementById(answerId);

    faqQuestions.forEach((otherQuestion) => {
      const otherAnswerId = otherQuestion.getAttribute("aria-controls");
      const otherAnswer = document.getElementById(otherAnswerId);
      otherQuestion.setAttribute("aria-expanded", "false");
      if (otherAnswer) otherAnswer.hidden = true;
    });

    if (!isExpanded && answer) {
      question.setAttribute("aria-expanded", "true");
      answer.hidden = false;
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    closeMenu({ returnFocus: true });
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
