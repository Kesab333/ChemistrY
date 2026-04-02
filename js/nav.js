(function () {
  const TOKEN_KEY = "physicx_jwt";
  const EMAIL_KEY = "physicx_user_email";
  const APP_BASE = "/PhysicX";

  function route(path) {
    const normalized = String(path || "").replace(/^\/+/, "");
    return normalized ? `${APP_BASE}/${normalized}` : `${APP_BASE}/`;
  }

  function canonicalPath(pathname) {
    const trimmed = String(pathname || "").replace(/\/+$/, "");

    if (!trimmed || trimmed === APP_BASE) {
      return route("index.html");
    }

    if (trimmed === route("docs/documentation.html")) {
      return route("docs/index.html");
    }

    if (trimmed === `${APP_BASE}/docs`) {
      return route("docs/index.html");
    }

    return trimmed;
  }

  function createAnchor(className, href, label) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = label;
    return link;
  }

  function createMobileItem(node) {
    const item = document.createElement("li");
    item.className = "nav-mobile-auth";
    item.appendChild(node);
    return item;
  }

  function addAuthActions() {
    const navInner = document.querySelector(".nav-inner");
    const navLinks = document.getElementById("nav-links");
    if (!navInner || !navLinks) return;

    navInner.querySelectorAll(".nav-actions").forEach((node) => node.remove());
    navLinks.querySelectorAll(".nav-mobile-auth").forEach((node) => node.remove());

    const token = localStorage.getItem(TOKEN_KEY) || "";
    const storedEmail = localStorage.getItem(EMAIL_KEY) || "";
    const navActions = document.createElement("div");
    navActions.className = "nav-actions";

    if (token) {
      const chip = document.createElement("span");
      chip.className = "nav-auth-chip";
      chip.textContent = storedEmail || "Authenticated";

      const dashboardLink = createAnchor("nav-auth-link", route("dashboard.html"), "Dashboard");
      const logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.className = "nav-auth-button";
      logoutButton.textContent = "Logout";
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        window.location.href = route("login.html");
      });

      navActions.append(chip, dashboardLink, logoutButton);

      navLinks.append(
        createMobileItem(createAnchor("", route("dashboard.html"), "Dashboard")),
        createMobileItem((() => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = "Logout";
          button.addEventListener("click", () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
            window.location.href = route("login.html");
          });
          return button;
        })())
      );
    } else {
      navActions.append(
        createAnchor("nav-auth-link", route("login.html"), "Login"),
        createAnchor("nav-auth-button", route("register.html"), "Start Free Trial")
      );

      navLinks.append(
        createMobileItem(createAnchor("", route("login.html"), "Login")),
        createMobileItem(createAnchor("", route("register.html"), "Start Free Trial"))
      );
    }

    const hamburger = document.getElementById("nav-hamburger");
    navInner.insertBefore(navActions, hamburger || null);
  }

  function highlightActiveLink() {
    const currentPage = canonicalPath(location.pathname);
    document.querySelectorAll(".nav-links a").forEach((anchor) => {
      const href = (anchor.getAttribute("href") || "").split("#")[0];
      if (!href || href === "#") return;

      const targetPath = canonicalPath(new URL(anchor.href, window.location.origin).pathname);
      if (targetPath === currentPage) {
        anchor.classList.add("active");
      }
    });
  }

  function bindNavigation() {
    const nav = document.querySelector(".site-nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    const hamburger = document.getElementById("nav-hamburger");
    const navLinks = document.getElementById("nav-links");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));
      });

      navLinks.querySelectorAll("a, button").forEach((node) => {
        node.addEventListener("click", () => navLinks.classList.remove("open"));
      });

      document.addEventListener("click", (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
          navLinks.classList.remove("open");
        }
      });
    }
  }

  function bindReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    addAuthActions();
    highlightActiveLink();
    bindNavigation();
    bindReveal();
  });
})();
