document.addEventListener("DOMContentLoaded", () => {
    const consentCookieName = "ps_montage_cookie_consent";
    const googleFontsHref = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    const root = document.documentElement;
    const cookieBanner = document.querySelector(".cookie-banner");
    const cookieButtons = cookieBanner?.querySelectorAll("[data-cookie-choice]") ?? [];
    const reopenCookieSettingsButton = document.querySelector("[data-open-cookie-settings]");
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");
    const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");
    const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const getPreferredTheme = () => {
        return themeMediaQuery.matches ? "dark" : "light";
    };

    const updateThemeToggleUi = (theme) => {
        const nextTheme = theme === "dark" ? "Hellmodus" : "Dunkelmodus";

        themeToggleButtons.forEach((button) => {
            button.setAttribute("aria-label", `${nextTheme} aktivieren`);
            button.setAttribute("title", `${nextTheme} aktivieren`);
            button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        });
    };

    const applyTheme = (theme) => {
        root.setAttribute("data-theme", theme);
        updateThemeToggleUi(theme);
    };

    const getConsent = () => {
        const cookieEntry = document.cookie
            .split("; ")
            .find((entry) => entry.startsWith(`${consentCookieName}=`));

        return cookieEntry ? decodeURIComponent(cookieEntry.split("=")[1]) : "";
    };

    const setConsent = (value) => {
        const maxAge = 60 * 60 * 24 * 180;
        document.cookie = `${consentCookieName}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
    };

    const loadGoogleFonts = () => {
        const existingLink = document.querySelector('link[data-font-consent="google-inter"]');
        if (existingLink) {
            return;
        }

        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = googleFontsHref;
        fontLink.dataset.fontConsent = "google-inter";
        document.head.appendChild(fontLink);
    };

    const hideCookieBanner = () => {
        cookieBanner?.classList.remove("is-visible");
        document.body.classList.remove("cookie-banner-visible");
    };

    const showCookieBanner = () => {
        cookieBanner?.classList.add("is-visible");
        document.body.classList.add("cookie-banner-visible");
    };

    const applyConsent = (value) => {
        if (value === "accepted") {
            loadGoogleFonts();
            hideCookieBanner();
            return;
        }

        if (value === "declined") {
            hideCookieBanner();
            return;
        }

        showCookieBanner();
    };

    const setMenuState = (isOpen) => {
        mobileNav?.classList.toggle("active", isOpen);
        toggle?.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    applyTheme(getPreferredTheme());

    themeToggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(nextTheme);
        });
    });

    const handleSystemThemeChange = (event) => {
        applyTheme(event.matches ? "dark" : "light");
    };

    if (typeof themeMediaQuery.addEventListener === "function") {
        themeMediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (typeof themeMediaQuery.addListener === "function") {
        themeMediaQuery.addListener(handleSystemThemeChange);
    }

    toggle?.addEventListener("click", () => {
        const isOpen = !mobileNav?.classList.contains("active");
        setMenuState(isOpen);
    });

    cookieButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const choice = button.getAttribute("data-cookie-choice");
            if (!choice) {
                return;
            }

            setConsent(choice);
            applyConsent(choice);
        });
    });

    reopenCookieSettingsButton?.addEventListener("click", () => {
        showCookieBanner();
        cookieBanner?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - 108,
                behavior: "smooth",
            });

            setMenuState(false);
        });
    });

    document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement)) {
            return;
        }

        const name = form.querySelector('[name="name"]')?.value ?? "";
        const email = form.querySelector('[name="email"]')?.value ?? "";
        const message = form.querySelector('[name="message"]')?.value ?? "";

        const subject = encodeURIComponent(`Anfrage von ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${message}`);
        window.location.href = `mailto:info@montageexperte-ps.de?subject=${subject}&body=${body}`;
    });

    const serviceSpotlight = document.querySelector(".service-spotlight");
    const servicePanels = serviceSpotlight
        ? Array.from(serviceSpotlight.querySelectorAll("[data-service-panel]"))
        : [];

    if (serviceSpotlight && servicePanels.length > 0) {
        let activeServiceIndex = Math.max(0, servicePanels.findIndex((panel) => panel.classList.contains("is-active")));
        let serviceAutoplayTimer = null;
        let servicePaused = false;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        const setActiveService = (nextIndex) => {
            activeServiceIndex = nextIndex;

            servicePanels.forEach((panel, index) => {
                const isActive = index === nextIndex;
                panel.classList.toggle("is-active", isActive);
                panel.setAttribute("aria-pressed", isActive ? "true" : "false");
            });
        };

        const stopServiceAutoplay = () => {
            if (serviceAutoplayTimer) {
                window.clearInterval(serviceAutoplayTimer);
                serviceAutoplayTimer = null;
            }
        };

        const startServiceAutoplay = () => {
            stopServiceAutoplay();
            if (reducedMotion.matches) {
                return;
            }

            serviceAutoplayTimer = window.setInterval(() => {
                if (servicePaused) {
                    return;
                }

                const nextIndex = (activeServiceIndex + 1) % servicePanels.length;
                setActiveService(nextIndex);
            }, 4200);
        };

        setActiveService(activeServiceIndex);
        startServiceAutoplay();

        servicePanels.forEach((panel, index) => {
            panel.addEventListener("click", () => {
                setActiveService(index);
                startServiceAutoplay();
            });

            panel.addEventListener("focus", () => {
                setActiveService(index);
            });

            panel.addEventListener("mouseenter", () => {
                setActiveService(index);
            });
        });

        serviceSpotlight.addEventListener("mouseenter", () => {
            servicePaused = true;
        });

        serviceSpotlight.addEventListener("mouseleave", () => {
            servicePaused = false;
        });

        const handleReducedMotionChange = () => {
            startServiceAutoplay();
        };

        if (typeof reducedMotion.addEventListener === "function") {
            reducedMotion.addEventListener("change", handleReducedMotionChange);
        } else if (typeof reducedMotion.addListener === "function") {
            reducedMotion.addListener(handleReducedMotionChange);
        }
    }

    const carousel = document.querySelector(".project-carousel");
    const track = carousel?.querySelector(".carousel-track");
    const slides = track ? Array.from(track.querySelectorAll(".carousel-slide")) : [];
    const prevBtn = carousel?.querySelector(".carousel-arrow.prev");
    const nextBtn = carousel?.querySelector(".carousel-arrow.next");

    if (carousel && track && slides.length > 0) {
        let currentIndex = 0;
        let autoplayTimer = null;
        let isHovered = false;

        const getVisibleSlides = () => {
            if (window.innerWidth <= 760) {
                return 1;
            }
            if (window.innerWidth <= 1120) {
                return 2;
            }
            return 3;
        };

        const getStepSize = () => {
            const firstSlide = slides[0];
            const secondSlide = slides[1];
            if (!firstSlide) {
                return 0;
            }
            if (!secondSlide) {
                return firstSlide.getBoundingClientRect().width;
            }
            return secondSlide.offsetLeft - firstSlide.offsetLeft;
        };

        const updateCarousel = () => {
            const visible = getVisibleSlides();
            const maxIndex = Math.max(0, slides.length - visible);
            if (currentIndex > maxIndex) {
                currentIndex = 0;
            }

            const step = getStepSize();
            track.style.transform = `translateX(${-currentIndex * step}px)`;
        };

        const goTo = (index) => {
            const visible = getVisibleSlides();
            const maxIndex = Math.max(0, slides.length - visible);

            if (index > maxIndex) {
                currentIndex = 0;
            } else if (index < 0) {
                currentIndex = maxIndex;
            } else {
                currentIndex = index;
            }

            updateCarousel();
        };

        const stopAutoplay = () => {
            if (autoplayTimer) {
                window.clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        };

        const startAutoplay = () => {
            stopAutoplay();
            autoplayTimer = window.setInterval(() => {
                if (isHovered) {
                    return;
                }
                goTo(currentIndex + 1);
            }, 3200);
        };

        prevBtn?.addEventListener("click", () => {
            goTo(currentIndex - 1);
        });

        nextBtn?.addEventListener("click", () => {
            goTo(currentIndex + 1);
        });

        carousel.addEventListener("mouseenter", () => {
            isHovered = true;
        });

        carousel.addEventListener("mouseleave", () => {
            isHovered = false;
        });

        window.addEventListener("resize", updateCarousel);

        updateCarousel();
        startAutoplay();
    }

    applyConsent(getConsent());
});
