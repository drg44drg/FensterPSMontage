document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    toggle?.addEventListener("click", () => {
        mobileNav?.classList.toggle("active");
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
                top: target.getBoundingClientRect().top + window.scrollY - 86,
                behavior: "smooth",
            });

            mobileNav?.classList.remove("active");
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
            if (window.innerWidth <= 1024) {
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
});
