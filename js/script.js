const body = document.body;

const lightBtn = document.getElementById("lightModeBtn");
const darkBtn = document.getElementById("darkModeBtn");

// querySelectorAll always returns a list — even an empty one — so this is safe
// on any page, whether or not desktop icons exist
const desktopIcons = document.querySelectorAll(".desktop-icon");

function setTheme(mode) {

  const isDark = mode === "dark";

  body.classList.toggle("dark-mode", isDark);
  document.documentElement.classList.toggle("dark-mode", isDark);

  darkBtn.classList.toggle("active", isDark);
  lightBtn.classList.toggle("active", !isDark);

  lightBtn.src = isDark
    ? lightBtn.dataset.dark
    : lightBtn.dataset.light;

  darkBtn.src = isDark
    ? darkBtn.dataset.dark
    : darkBtn.dataset.light;

  // .forEach on an empty list does nothing — so this won't crash on subpages
  desktopIcons.forEach(icon => {
    icon.src = isDark ? icon.dataset.dark : icon.dataset.light;

    
  });

  // This finds ALL theme-aware icons on the page using the shared
  // data-light / data-dark pattern — so any new icon added to any page
  // will automatically theme-switch as long as it has those attributes
  document.querySelectorAll("[data-light][data-dark]").forEach(icon => {
    // Skip the theme buttons themselves — they're handled above
    if (icon === lightBtn || icon === darkBtn) return;
    icon.src = isDark ? icon.dataset.dark : icon.dataset.light;
  });

  localStorage.setItem("theme", mode);


// Re-apply o mnie active state after theme change
// so bubble text colour stays correct
if (typeof setOmnieActive === "function" && omniePanelBody) {
  const activeNav = document.querySelector(".omnie-nav-item--active");
  const activeChar = document.querySelector(".omnie-character--active");
  const activePanelId = activeChar
    ? "poznajmy"
    : activeNav
      ? activeNav.dataset.panel
      : "oferta";
  setOmnieActive(activePanelId);
}
}

// ===== Startup: load saved theme =====

const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme === "dark" ? "dark" : "light");

// ===== Theme button clicks =====

lightBtn.addEventListener("click", () => setTheme("light"));
darkBtn.addEventListener("click", () => setTheme("dark"));

// ===== Desktop icon hover swap =====

const desktopItems = document.querySelectorAll(".desktop-item");

desktopItems.forEach(item => {
  const icon = item.querySelector(".desktop-icon");
  if (!icon) return;

  const currentTheme = () => document.body.classList.contains("dark-mode") ? "dark" : "light";

  item.addEventListener("mouseenter", () => {
    icon.src = currentTheme() === "dark"
      ? icon.dataset.hoverDark
      : icon.dataset.hoverLight;
  });

  item.addEventListener("mouseleave", () => {
    icon.src = currentTheme() === "dark"
      ? icon.dataset.dark
      : icon.dataset.light;
  });
});



// ===== PHOTO LIGHTBOX =====

const lightbox = document.getElementById("lightbox");
const lightboxPhoto = document.getElementById("lightboxPhoto");
const lightboxFilename = document.getElementById("lightboxFilename");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxOverlay = document.getElementById("lightboxOverlay");

if (lightbox) {

  document.querySelectorAll(".photo").forEach(photo => {
    photo.addEventListener("click", () => {
      const src = photo.getAttribute("src");
      const filename = src.split("/").pop();

      lightboxPhoto.src = src;
      lightboxFilename.textContent = filename;
      lightbox.classList.add("open");
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxOverlay.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxPhoto.src = "";
  }

  const closeIcon = document.getElementById("lightboxCloseIcon");
  if (closeIcon) {
    const currentTheme = () => document.body.classList.contains("dark-mode") ? "dark" : "light";

    lightboxClose.addEventListener("mouseenter", () => {
      closeIcon.src = currentTheme() === "dark"
        ? closeIcon.dataset.hoverDark
        : closeIcon.dataset.hoverLight;
    });

    lightboxClose.addEventListener("mouseleave", () => {
      closeIcon.src = currentTheme() === "dark"
        ? closeIcon.dataset.dark
        : closeIcon.dataset.light;
    });
  }
}

// ===== LETTER HOVER ANIMATION =====

// Store original text content before any manipulation,
// so we can always restore it cleanly on resize.
document.querySelectorAll(".animated-text").forEach(el => {
  el.dataset.originalText = el.textContent;
});

function applyLetterAnimation() {
  document.querySelectorAll(".animated-text").forEach(el => {
    if (window.innerWidth > 1024) {
      // Desktop: wrap each character in a span for the hover lift effect
      el.innerHTML = el.dataset.originalText.split("").map(char =>
        char === " "
          ? " "
          : `<span class="letter">${char}</span>`
      ).join("");
    } else {
      // Mobile: restore plain text so words wrap naturally
      el.textContent = el.dataset.originalText;
    }
  });
}

applyLetterAnimation();
window.addEventListener("resize", applyLetterAnimation);

// ===== Kontakt icon hover swap =====

const kontaktItems = document.querySelectorAll(".kontakt-icon-item");

kontaktItems.forEach(item => {
  const icon = item.querySelector(".kontakt-icon");
  if (!icon) return;

  const currentTheme = () => document.body.classList.contains("dark-mode") ? "dark" : "light";

  item.addEventListener("mouseenter", () => {
    icon.src = currentTheme() === "dark"
      ? icon.dataset.hoverDark
      : icon.dataset.hoverLight;
  });

  item.addEventListener("mouseleave", () => {
    icon.src = currentTheme() === "dark"
      ? icon.dataset.dark
      : icon.dataset.light;
  });
});

// ===== BRANDING FOLDER LIST + LIGHTBOX =====

// ===== BRANDING FOLDER LIST + LIGHTBOX =====

const brandingLightbox = document.getElementById("brandingLightbox");
const brandingBody = document.getElementById("brandingBody");
const brandingTitle = document.getElementById("brandingTitle");
const brandingClose = document.getElementById("brandingClose");
const brandingOverlay = document.getElementById("brandingOverlay");
const brandingBack = document.getElementById("brandingBack");

if (brandingLightbox) {

  // Track what's currently showing so Escape knows what to do
  let brandingMode = "project"; // "project" or "brandbook"
  let currentProjectContent = null; // stores project HTML for returning from brandbook
  let currentProjectTitle = "";

  // ===== Open project lightbox =====
  document.querySelectorAll(".branding-item").forEach(item => {
    item.addEventListener("click", () => {
      const projectId = item.dataset.project;
      const projectTitle = item.dataset.title;

      const content = document.querySelector(
        `.branding-project-content[data-project="${projectId}"] .branding-project-inner`
      );

      if (content) {
        currentProjectContent = content;
        currentProjectTitle = projectTitle;
        showProjectView(content.cloneNode(true), projectTitle);
      }

      brandingLightbox.classList.add("open");

      // scroll window back to top when opening
      document.getElementById("brandingWindow").scrollTop = 0;
    });
  });

  // ===== Show project view =====
  function showProjectView(contentNode, title) {
    brandingBody.innerHTML = "";
    brandingBody.appendChild(contentNode);
    brandingTitle.textContent = title;
    brandingBack.style.display = "none";
    brandingMode = "project";

    // Attach open-brandbook button listener after content is injected
    const openBtn = brandingBody.querySelector(".branding-open-btn:not(.branding-exit-btn)");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        const booId = openBtn.dataset.brandbook;
        const bookTitle = openBtn.dataset.title;
        openBrandBook(booId, bookTitle);
      });
    }
  }

  // ===== Open brand book (content swap) =====
  function openBrandBook(brandBookId, title) {
    const bookContent = document.querySelector(
      `.branding-book-content[data-brandbook="${brandBookId}"] .branding-book-pages`
    );

    if (!bookContent) return;

    brandingBody.innerHTML = "";
    brandingBody.appendChild(bookContent.cloneNode(true));
    brandingTitle.textContent = title;
    brandingBack.style.display = "inline-flex";
    brandingMode = "brandbook";

    // scroll to top
    document.getElementById("brandingWindow").scrollTop = 0;

    // wyjdź button at bottom of brand book
    const exitBtn = brandingBody.querySelector(".branding-exit-btn");
    if (exitBtn) {
      exitBtn.addEventListener("click", returnToProject);
    }
  }

  // ===== Return to project from brand book =====
  function returnToProject() {
    if (currentProjectContent) {
      showProjectView(currentProjectContent.cloneNode(true), currentProjectTitle);
      document.getElementById("brandingWindow").scrollTop = 0;
    }
  }

  // Back button in title bar
  brandingBack.addEventListener("click", returnToProject);

  // ===== Close lightbox entirely =====
  brandingClose.addEventListener("click", closeBrandingLightbox);
  brandingOverlay.addEventListener("click", closeBrandingLightbox);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (brandingMode === "brandbook") {
        // Escape in brand book → go back to project view
        returnToProject();
      } else {
        // Escape in project view → close lightbox
        closeBrandingLightbox();
      }
    }
  });

  function closeBrandingLightbox() {
    brandingLightbox.classList.remove("open");
    brandingBody.innerHTML = "";
    brandingBack.style.display = "none";
    brandingMode = "project";
    currentProjectContent = null;
    currentProjectTitle = "";
  }

  // ===== Close icon hover swap =====
  const brandingCloseIcon = document.getElementById("brandingCloseIcon");
  if (brandingCloseIcon) {
    const currentTheme = () => document.body.classList.contains("dark-mode") ? "dark" : "light";

    brandingClose.addEventListener("mouseenter", () => {
      brandingCloseIcon.src = currentTheme() === "dark"
        ? brandingCloseIcon.dataset.hoverDark
        : brandingCloseIcon.dataset.hoverLight;
    });

    brandingClose.addEventListener("mouseleave", () => {
      brandingCloseIcon.src = currentTheme() === "dark"
        ? brandingCloseIcon.dataset.dark
        : brandingCloseIcon.dataset.light;
    });
  }

  // ===== Folder icon hover swap =====
  document.querySelectorAll(".branding-item").forEach(item => {
    const icon = item.querySelector(".branding-folder");
    if (!icon) return;

    const currentTheme = () => document.body.classList.contains("dark-mode") ? "dark" : "light";

    item.addEventListener("mouseenter", () => {
      icon.src = currentTheme() === "dark"
        ? icon.dataset.hoverDark
        : icon.dataset.hoverLight;
    });

    item.addEventListener("mouseleave", () => {
      icon.src = currentTheme() === "dark"
        ? icon.dataset.dark
        : icon.dataset.light;
    });
  });

}

// ===== O MNIE PAGE =====

const omniePanelBody = document.getElementById("omniePanelBody");
const omniePanelTitle = document.getElementById("omniePanelTitle");

if (omniePanelBody) {

  // Load content into the panel
  function loadOmniePanel(panelId) {
    const content = document.querySelector(
      `.omnie-content-block[data-panel="${panelId}"] .omnie-content-inner`
    );
    if (!content) return;

    omniePanelBody.innerHTML = "";
    omniePanelBody.appendChild(content.cloneNode(true));

    // Update title bar
    const titles = { oferta: "oferta", poznajmy: "poznajmy się" };
    omniePanelTitle.textContent = titles[panelId] || panelId;
  }

  // Set active state on nav items and character
  function setOmnieActive(panelId) {
    const currentTheme = () =>
      document.body.classList.contains("dark-mode") ? "dark" : "light";

    // Document nav item
    const navItem = document.querySelector(
      `.omnie-nav-item[data-panel="${panelId}"]`
    );
    document.querySelectorAll(".omnie-nav-item").forEach(item => {
      item.classList.remove("omnie-nav-item--active");
      // reset icon to normal state
      const icon = item.querySelector(".omnie-nav-icon");
      if (icon) {
        icon.src = currentTheme() === "dark"
          ? icon.dataset.dark
          : icon.dataset.light;
      }
    });
    if (navItem) {
      navItem.classList.add("omnie-nav-item--active");
      const icon = navItem.querySelector(".omnie-nav-icon");
      if (icon) {
        icon.src = currentTheme() === "dark"
          ? icon.dataset.hoverDark
          : icon.dataset.hoverLight;
      }
    }

    // Character (speech bubble)
    const character = document.querySelector(".omnie-character");
    if (character) {
      const bubble = character.querySelector(".omnie-bubble");
      const bubbleText = character.querySelector(".omnie-bubble-text");

      if (panelId === "poznajmy") {
        character.classList.add("omnie-character--active");
        if (bubble) {
          bubble.src = currentTheme() === "dark"
            ? bubble.dataset.hoverDark
            : bubble.dataset.hoverLight;
        }
        if (bubbleText) bubbleText.style.color = "var(--bg)";
      } else {
        character.classList.remove("omnie-character--active");
        if (bubble) {
          bubble.src = currentTheme() === "dark"
            ? bubble.dataset.dark
            : bubble.dataset.light;
        }
        if (bubbleText) bubbleText.style.color = "var(--text)";
      }
    }
  }

  // Click handlers for nav item
  document.querySelectorAll(".omnie-nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const panelId = item.dataset.panel;
      loadOmniePanel(panelId);
      setOmnieActive(panelId);
    });

    // Hover icon swap
    const icon = item.querySelector(".omnie-nav-icon");
    if (icon) {
      const currentTheme = () =>
        document.body.classList.contains("dark-mode") ? "dark" : "light";

      item.addEventListener("mouseenter", () => {
        // only swap if not already active
        if (!item.classList.contains("omnie-nav-item--active")) {
          icon.src = currentTheme() === "dark"
            ? icon.dataset.hoverDark
            : icon.dataset.hoverLight;
        }
      });

      item.addEventListener("mouseleave", () => {
        if (!item.classList.contains("omnie-nav-item--active")) {
          icon.src = currentTheme() === "dark"
            ? icon.dataset.dark
            : icon.dataset.light;
        }
      });
    }
  });

  // Click handler for character (person + bubble)
  const omnieCharacter = document.querySelector(".omnie-character");
  if (omnieCharacter) {
    omnieCharacter.addEventListener("click", () => {
      loadOmniePanel("poznajmy");
      setOmnieActive("poznajmy");
    });
  }

  // Load default panel (oferta) on page load
  loadOmniePanel("oferta");
  setOmnieActive("oferta");

}

// ===== PHOTO CANVAS SCALING =====

// Store each photo's original inline styles once on page load,
// before any JS manipulation. This gives scalePhotoCanvas a reliable
// source to restore from when resizing from mobile back to desktop.
(function storePhotoStyles() {
  const canvas = document.querySelector(".photo-canvas");
  if (!canvas) return;
  canvas.querySelectorAll(".photo").forEach(photo => {
    photo.dataset.origLeft   = photo.style.left;
    photo.dataset.origTop    = photo.style.top;
    photo.dataset.origWidth  = photo.style.width;
    photo.dataset.origHeight = photo.style.height;
  });
})();

function scalePhotoCanvas() {
  const canvas = document.querySelector(".photo-canvas");
  if (!canvas) return;

  const photos = canvas.querySelectorAll(".photo");

  if (window.innerWidth <= 1024) {
    canvas.style.transform = "";
    canvas.style.transformOrigin = "";
    canvas.style.marginBottom = "";
    canvas.style.marginLeft = "";

    // Remove ALL inline position and size styles so CSS takes over.
    // The photos have left/top/width/height baked into their HTML style
    // attribute — clearing just the ones we set isn't enough on first load.
    photos.forEach(photo => {
      photo.style.left     = "";
      photo.style.top      = "";
      photo.style.width    = "";
      photo.style.height   = "";
      photo.style.position = "";
    });

    return;
  }

  // ---- desktop scaling below ----

  // Restore inline styles on desktop in case we resized from mobile.
  // Read from data attributes stored on page load — reliable even if
  // the mobile branch already cleared the inline styles.
  photos.forEach(photo => {
    photo.style.left     = photo.dataset.origLeft;
    photo.style.top      = photo.dataset.origTop;
    photo.style.width    = photo.dataset.origWidth;
    photo.style.height   = photo.dataset.origHeight;
    photo.style.position = "absolute";
  });

  const scale = Math.min(1, window.innerWidth / 1440);

  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = "top left";
  canvas.style.marginLeft = `${(window.innerWidth - 1440 * scale) / 2}px`;

  // compensate for the height gap caused by scaling
  const originalHeight = 4617.1;
  const scaledHeight = originalHeight * scale;
  canvas.style.marginBottom = `${scaledHeight - originalHeight}px`;
}

scalePhotoCanvas();
window.addEventListener("resize", scalePhotoCanvas);




//omnie character click → active state 

const character = document.querySelector(".omnie-character");
const navItems = document.querySelectorAll(".omnie-nav-item");

function setCharacterActive(isActive) {
  if (!character) return;

  if (isActive) {
    character.classList.add("omnie-character--active");
  } else {
    character.classList.remove("omnie-character--active");
  }
}

// klik w postać → aktywna
if (character) {
  character.addEventListener("click", () => {
    setCharacterActive(true);
  });
}

// klik w dokument / inne nav → deaktywacja postaci
navItems.forEach(item => {
  item.addEventListener("click", () => {
    setCharacterActive(false);
  });
});
// =====================================================
// COOKIE CONSENT BANNER
// =====================================================

(function () {

  // ── Read saved decision from localStorage ──
  // Possible values: null (no decision yet), "accepted", "declined"
  const cookieConsent = localStorage.getItem("cookieConsent");

  const banner     = document.getElementById("cookieBanner");
  if (!banner) return;   // safety check — exits silently on any page without the banner

  const initial    = document.getElementById("cookieInitial");
  const declined   = document.getElementById("cookieDeclined");
  const btnAccept  = document.getElementById("cookieAccept");
  const btnDecline = document.getElementById("cookieDecline");
  const btnClose   = document.getElementById("cookieClose");
  const btnReopen  = document.getElementById("cookieReopen");

  // ── Show or hide the banner based on saved state ──

  if (cookieConsent === "accepted") {
    // User already accepted — never show the banner again
    return;
  }

  if (cookieConsent === "declined") {
    // User previously declined — show the shrunken "declined" version
    showDeclinedState();
    banner.classList.add("visible");
    return;
  }

  // No decision yet — show the full initial banner
  banner.classList.add("visible");

  // ── Button handlers ──

  // "akceptuję" — save decision, hide banner, then immediately update
  // any video gates on the page without requiring a refresh
  btnAccept.addEventListener("click", function () {
    localStorage.setItem("cookieConsent", "accepted");
    banner.classList.remove("visible");

    // If the video gate functions exist on this page, call them directly.
    // The storage event only fires across tabs, not within the same tab,
    // so we trigger the update manually here.
    if (typeof window.renderFeaturedVideo === "function") {
      window.renderFeaturedVideo();
    }
    if (typeof window.loadAllVideoPlayers === "function") {
      window.loadAllVideoPlayers();
    }
  });

  // "odrzucam" — save decision, switch to declined state, update video gates
  btnDecline.addEventListener("click", function () {
    localStorage.setItem("cookieConsent", "declined");
    showDeclinedState();

    // Update the featured video gate immediately without a refresh
    if (typeof window.renderFeaturedVideo === "function") {
      window.renderFeaturedVideo();
    }
  });

  // "x" — close the declined banner (decision stays saved as "declined")
  btnClose.addEventListener("click", function () {
    banner.classList.remove("visible");
  });

  // "< Zmień ustawienia cookies" — go back to initial state
  // Also clears the saved decision so the user can choose again
  btnReopen.addEventListener("click", function () {
    localStorage.removeItem("cookieConsent");
    showInitialState();
  });

  // ── State switcher functions ──

  function showDeclinedState() {
    initial.style.display  = "none";
    declined.style.display = "block";
    banner.classList.add("declined");
    banner.classList.add("visible");    // make sure it's visible when called on page load
  }

  function showInitialState() {
    declined.style.display = "none";
    initial.style.display  = "block";
    banner.classList.remove("declined");
  }

})();
// The whole thing is wrapped in an IIFE (immediately invoked function expression)
// so none of these variables leak into the global scope and clash with other scripts


// =====================================================
// VIMEO CONSENT GATE
// Runs on video.html — controls what shows in place of
// each video depending on the user's cookie decision.
// =====================================================

(function () {

  // Only run on pages that have video items
  const featuredArticle = document.querySelector(".video-item--featured[data-vimeo-id]");
  if (!featuredArticle) return;

  // ── Read the saved consent state ──
  // Re-read from localStorage every time so it's always current
  function getConsent() {
    return localStorage.getItem("cookieConsent"); // "accepted", "declined", or null
  }

  // ── Build a Vimeo iframe from a video ID ──
  function makeIframe(vimeoId) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;border:none;";
    return iframe;
  }

  // ── Inject iframes into all non-featured videos ──
  // Called once when consent is "accepted"
  function loadAllPlayers() {
    document.querySelectorAll(".video-item[data-vimeo-id]").forEach(article => {
      const vimeoId  = article.dataset.vimeoId;
      const placeholder = article.querySelector(".video-placeholder-link");
      const player      = article.querySelector(".video-player");

      if (!placeholder || !player) return;

      // Hide the Vimeo-icon placeholder, show the player div
      placeholder.style.display = "none";
      player.style.display      = "block";

      // Only inject the iframe once — avoid duplicating on re-render
      if (!player.querySelector("iframe")) {
        player.appendChild(makeIframe(vimeoId));
      }
    });
  }

  // ── Handle the featured video (showreel) ──
  function renderFeatured() {
    const vimeoId  = featuredArticle.dataset.vimeoId;
    const isPlaceholder = vimeoId === "XXXXXXX"; // showreel not ready yet

    const gatePending  = featuredArticle.querySelector(".video-gate--pending");
    const gateDeclined = featuredArticle.querySelector(".video-gate--declined");
    const gateAccepted = featuredArticle.querySelector(".video-gate--accepted");
    const gateSoon     = featuredArticle.querySelector(".video-gate--soon");

    const consent = getConsent();

    // Hide everything first, then show only the relevant state
    [gatePending, gateDeclined, gateAccepted, gateSoon].forEach(el => {
      if (el) el.style.display = "none";
    });

    if (isPlaceholder) {
      // Showreel not ready — always show "coming soon", regardless of consent
      if (gateSoon) gateSoon.style.display = "block";
      return;
    }

    if (consent === "accepted") {
      // Show the actual player
      if (gateAccepted) {
        gateAccepted.style.display = "block";
        if (!gateAccepted.querySelector("iframe")) {
          gateAccepted.appendChild(makeIframe(vimeoId));
        }
      }

    } else if (consent === "declined") {
      // Show the "watch on Vimeo or accept here" message
      if (gateDeclined) gateDeclined.style.display = "flex";

    } else {
      // consent === null — show the inline consent request
      if (gatePending) gatePending.style.display = "flex";
    }
  }

  // ── Wire up the inline buttons inside the featured gate ──

  // "akceptuję" inside the gate — saves consent, reloads both gate and players
  featuredArticle.addEventListener("click", function (e) {
    if (e.target.classList.contains("video-gate-accept")) {
      localStorage.setItem("cookieConsent", "accepted");
      renderFeatured();
      loadAllPlayers();

      // Also update the global banner so it disappears consistently
      const banner = document.getElementById("cookieBanner");
      if (banner) banner.classList.remove("visible");
    }
  });

  // "odrzucam" inside the gate
  featuredArticle.addEventListener("click", function (e) {
    if (e.target.classList.contains("video-gate-decline")) {
      localStorage.setItem("cookieConsent", "declined");
      renderFeatured();

      // Switch the global banner to its declined state too
      const banner  = document.getElementById("cookieBanner");
      const initial = document.getElementById("cookieInitial");
      const declined = document.getElementById("cookieDeclined");
      if (banner && initial && declined) {
        initial.style.display  = "none";
        declined.style.display = "block";
        banner.classList.add("declined");
      }
    }
  });

  // "< chcę obejrzeć video" — clears consent, shows the pending gate
  featuredArticle.addEventListener("click", function (e) {
    if (e.target.classList.contains("video-gate-reopen")) {
      localStorage.removeItem("cookieConsent");
      renderFeatured();

      // Restore the global banner to its initial state
      const banner   = document.getElementById("cookieBanner");
      const initial  = document.getElementById("cookieInitial");
      const declined = document.getElementById("cookieDeclined");
      if (banner && initial && declined) {
        declined.style.display = "none";
        initial.style.display  = "block";
        banner.classList.remove("declined");
        banner.classList.add("visible");
      }
    }
  });

  // Expose on window so the global cookie banner can trigger updates
  window.renderFeaturedVideo = renderFeatured;
  window.loadAllVideoPlayers = loadAllPlayers;

  // ── Initial render on page load ──
  renderFeatured();

  if (getConsent() === "accepted") {
    loadAllPlayers();
  }

  // ── Also update video players if the global banner is used ──
  window.addEventListener("storage", function (e) {
    if (e.key === "cookieConsent") {
      renderFeatured();
      if (e.newValue === "accepted") loadAllPlayers();
    }
  });

})();

// =====================================================
// PRIVACY ALERT (kontakt.html)
//
// Browser handles field validation natively (required,
// email format). We only intercept to check the privacy
// checkbox — if it's not ticked we show a custom popup.
// =====================================================

(function () {

  const form = document.querySelector(".kontakt-form");
  if (!form) return;

  const privacyCheckbox = form.querySelector(".kontakt-checkbox");
  const privacyAlert    = document.getElementById("privacyAlert");
  const alertOverlay    = document.getElementById("privacyAlertOverlay");
  const alertClose      = document.getElementById("privacyAlertClose");
  const alertOk         = document.getElementById("privacyAlertOk");
  const checkboxPrompt  = document.getElementById("checkboxPrompt");

  if (!privacyCheckbox || !privacyAlert) return;

  // ── The form's submit event only fires after browser validation passes ──
  // So by the time we get here, all required fields and email format are valid.
  // We just need to check our custom privacy checkbox.
  form.addEventListener("submit", function (e) {
    if (!privacyCheckbox.checked) {
      e.preventDefault();
      privacyAlert.classList.add("open");
      if (checkboxPrompt) checkboxPrompt.classList.add("visible");
    }
  });

  function closeAlert() {
    privacyAlert.classList.remove("open");
  }

  if (alertClose)   alertClose.addEventListener("click", closeAlert);
  if (alertOk)      alertOk.addEventListener("click", closeAlert);
  if (alertOverlay) alertOverlay.addEventListener("click", closeAlert);

  privacyCheckbox.addEventListener("change", function () {
    if (privacyCheckbox.checked) {
      closeAlert();
      if (checkboxPrompt) checkboxPrompt.classList.remove("visible");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAlert();
  });

})();
