document.documentElement.classList.add("js-enabled");

/* ==========================================================================
   DOM references
   ========================================================================== */

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-navigation]");
const navigationLinks = navigation ? navigation.querySelectorAll("a") : [];
const faqQuestions = document.querySelectorAll(".faq-question");
const currentYear = document.querySelector("[data-current-year]");
const desktopBreakpoint = window.matchMedia("(min-width: 64rem)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ==========================================================================
   Header and mobile navigation
   ========================================================================== */

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

  navigation.querySelector("a")?.focus();
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  desktopBreakpoint.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

/* ==========================================================================
   Accessible FAQ accordion
   ========================================================================== */

function animateAnswer(answer, isOpening) {
  answer.getAnimations?.().forEach((animation) => animation.cancel());

  if (reducedMotion.matches || typeof answer.animate !== "function") {
    answer.hidden = !isOpening;
    return;
  }

  if (isOpening) {
    answer.hidden = false;
    answer.animate(
      [
        { opacity: 0, transform: "translateY(-8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
    return;
  }

  const closingAnimation = answer.animate(
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-8px)" },
    ],
    {
      duration: 280,
      easing: "ease",
    },
  );

  closingAnimation.finished.then(() => {
    const question = document.querySelector(`[aria-controls="${answer.id}"]`);
    if (question?.getAttribute("aria-expanded") === "false") {
      answer.hidden = true;
    }
  });
}

function setAccordionState(question, isExpanded) {
  const answerId = question.getAttribute("aria-controls");
  const answer = document.getElementById(answerId);
  const wasExpanded = question.getAttribute("aria-expanded") === "true";

  if (wasExpanded === isExpanded) return;

  question.setAttribute("aria-expanded", String(isExpanded));
  if (answer) animateAnswer(answer, isExpanded);
}

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const shouldOpen = question.getAttribute("aria-expanded") !== "true";

    faqQuestions.forEach((otherQuestion) => {
      setAccordionState(otherQuestion, shouldOpen && otherQuestion === question);
    });
  });
});

/* ==========================================================================
   Refined entrance motion
   ========================================================================== */

const revealTargets = document.querySelectorAll(
  [
    ".hero-content",
    ".section-heading",
    ".audience-card",
    ".service-card",
    ".process-step",
    ".differentials-intro",
    ".differentials-list li",
    ".about-visual",
    ".about-content",
    ".faq-heading",
    ".faq-item",
    ".cta-inner",
    ".footer-grid",
  ].join(","),
);

revealTargets.forEach((target, index) => {
  target.classList.add("reveal-item");
  target.style.setProperty("--reveal-delay", `${(index % 4) * 60}ms`);
});

if (reducedMotion.matches || typeof IntersectionObserver === "undefined") {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

/* ==========================================================================
   Global events and dynamic values
   ========================================================================== */

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
