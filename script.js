document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section[id]');

    const navHeight = () => navbar.offsetHeight;

    function hashFromHref(href) {
        if (!href) return '';
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return '';
        return href.slice(hashIndex);
    }

    function closeMobileNav() {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    }

    function openMobileNav() {
        navLinks.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
    }

    if (navToggle) navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    document.querySelectorAll('a[href*="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = hashFromHref(link.getAttribute('href'));
            if (!hash || hash === '#' || hash === '#inquiry') return;

            const targetElement = document.querySelector(hash);
            if (!targetElement) return;

            e.preventDefault();
            closeMobileNav();

            const targetPosition =
                targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight();

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth',
            });

            history.replaceState(null, '', hash);
        });
    });

    document.addEventListener('click', (e) => {
        if (
            navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            closeMobileNav();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1100) {
            closeMobileNav();
        }
    });

    const navSectionLinks = document.querySelectorAll('.nav-links a[href*="#"]');

    function updateActiveNav() {
        const scrollPos = window.scrollY + navHeight() + 40;
        let currentId = '';

        sections.forEach((section) => {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        });

        navSectionLinks.forEach((link) => {
            link.classList.toggle('active', hashFromHref(link.getAttribute('href')) === `#${currentId}`);
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // Shared classroom-day pulse (hero stage + how section)
    const dayBeats = [
        {
            teacher: 'Checked in · Sophie',
            parent: 'Arrived · just now',
            caption: 'Teacher checks Sophie in → Parent sees arrival',
        },
        {
            teacher: 'Logged lunch · Sophie',
            parent: 'Lunch update · just now',
            caption: 'Teacher logs lunch → Parent gets the update',
        },
        {
            teacher: 'Nap started · Sophie',
            parent: 'Nap update · just now',
            caption: 'Teacher starts nap → Parent stays informed',
        },
        {
            teacher: 'Ready for pickup',
            parent: 'Pickup ready · just now',
            caption: 'Teacher marks pickup ready → Parent sees pickup status',
        },
    ];

    function initDayPulse(root, {
        toastTeacherSel,
        toastParentSel,
        captionSel,
        beatSel,
        startOnView = true,
    }) {
        if (!root) return;
        const toastTeacher = root.querySelector(toastTeacherSel);
        const toastParent = root.querySelector(toastParentSel);
        const caption = captionSel ? root.querySelector(captionSel) : null;
        const buttons = Array.from(root.querySelectorAll(beatSel));
        let index = 0;
        let timer = 0;
        let started = false;

        const playBeat = (next) => {
            index = (next + dayBeats.length) % dayBeats.length;
            const beat = dayBeats[index];
            buttons.forEach((btn, i) => btn.classList.toggle('is-active', i === index));
            root.classList.remove('is-sending', 'is-received');
            void root.offsetWidth;
            if (toastTeacher) toastTeacher.textContent = beat.teacher;
            if (toastParent) toastParent.textContent = beat.parent;
            if (caption) caption.textContent = beat.caption;
            root.classList.add('is-sending');
            window.setTimeout(() => root.classList.add('is-received'), 520);
            window.setTimeout(() => root.classList.remove('is-sending', 'is-received'), 2400);
        };

        const stop = () => {
            window.clearInterval(timer);
            timer = 0;
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => playBeat(index + 1), 3400);
        };

        buttons.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                playBeat(i);
                start();
            });
        });

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', () => {
            if (started) start();
        });

        if (startOnView) {
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !started) {
                            started = true;
                            root.classList.add('is-visible');
                            playBeat(0);
                            start();
                        }
                        if (!entry.isIntersecting && started) stop();
                        else if (entry.isIntersecting && started && !timer) start();
                    });
                },
                { threshold: 0.28 },
            );
            io.observe(root);
        } else {
            started = true;
            root.classList.add('is-visible');
            playBeat(0);
            start();
        }
    }

    initDayPulse(document.querySelector('[data-hero-stage]'), {
        toastTeacherSel: '[data-hero-toast-teacher]',
        toastParentSel: '[data-hero-toast-parent]',
        captionSel: '[data-hero-caption]',
        beatSel: '[data-hero-beat]',
        startOnView: true,
    });

    const walkthrough = document.querySelector('[data-hero-walkthrough]');
    const heroVideo = document.querySelector('.hero-video');
    if (walkthrough) {
        const slides = Array.from(walkthrough.querySelectorAll('.hero-slide'));
        const dots = Array.from(walkthrough.querySelectorAll('.hero-slide-dots button'));
        const caption = walkthrough.querySelector('[data-slide-caption]');
        const captions = [
            'Admin — set up the centre',
            'Teacher — log meals, naps, check-in',
            'Parent — families see the day',
        ];
        let index = 0;
        let timer = 0;

        const show = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
            if (caption) caption.textContent = captions[index];
        };

        const stop = () => {
            window.clearInterval(timer);
            timer = 0;
        };

        const start = () => {
            stop();
            if (slides.length < 2) return;
            timer = window.setInterval(() => show(index + 1), 2800);
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                show(i);
                start();
            });
        });

        walkthrough.addEventListener('mouseenter', stop);
        walkthrough.addEventListener('mouseleave', start);
        walkthrough.addEventListener('focusin', stop);
        walkthrough.addEventListener('focusout', start);
        show(0);
        start();

        if (heroVideo) {
            const videoCaption = document.querySelector('[data-video-caption]');
            const videoFrame = document.querySelector('[data-hero-video-frame]');
            const useRecordedVideo = () => {
                if (!heroVideo.duration || !isFinite(heroVideo.duration) || heroVideo.videoWidth < 8) {
                    return;
                }
                stop();
                walkthrough.hidden = true;
                walkthrough.setAttribute('hidden', '');
                if (videoFrame) {
                    videoFrame.hidden = false;
                    videoFrame.removeAttribute('hidden');
                }
                if (videoCaption) {
                    videoCaption.hidden = false;
                    videoCaption.removeAttribute('hidden');
                }
                heroVideo.play().catch(() => {});
            };
            heroVideo.addEventListener('loadeddata', useRecordedVideo);
            if (heroVideo.readyState >= 2) {
                useRecordedVideo();
            }
            heroVideo.addEventListener('error', () => {
                if (videoFrame) {
                    videoFrame.hidden = true;
                    videoFrame.setAttribute('hidden', '');
                }
                if (videoCaption) {
                    videoCaption.hidden = true;
                    videoCaption.setAttribute('hidden', '');
                }
                walkthrough.hidden = false;
                walkthrough.removeAttribute('hidden');
                start();
            });
        }
    }

    // Feature icon grids: click to show description (independent of lightbox)
    document.querySelectorAll('[data-feature-icons]').forEach((grid) => {
        const detail = grid.parentElement?.querySelector('[data-feature-detail]');
        if (!detail) return;

        const titleEl = detail.querySelector('.feature-detail-title');
        const bodyEl = detail.querySelector('.feature-detail-body');
        const buttons = Array.from(grid.querySelectorAll('.feature-icon-btn'));

        const clear = () => {
            buttons.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
            detail.setAttribute('hidden', '');
            if (titleEl) titleEl.textContent = '';
            if (bodyEl) bodyEl.textContent = '';
        };

        const show = (btn) => {
            const label = btn.querySelector('.feature-icon-label')?.textContent?.trim() || '';
            const copyEl = btn.querySelector('.feature-icon-copy');
            const copy = (copyEl?.textContent || copyEl?.innerText || '').trim();
            buttons.forEach((item) => item.setAttribute('aria-expanded', item === btn ? 'true' : 'false'));
            if (titleEl) titleEl.textContent = label;
            if (bodyEl) bodyEl.textContent = copy;
            detail.removeAttribute('hidden');
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                if (btn.getAttribute('aria-expanded') === 'true') {
                    clear();
                    return;
                }
                show(btn);
            });
        });
    });

    const lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        return;
    }

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxGalleryName = lightbox.querySelector('.lightbox-gallery-name');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const screenshotButtons = document.querySelectorAll('.screenshot-wrapper');

    let lastFocusedElement = null;
    let gallerySlides = [];
    let currentIndex = 0;
    let galleryName = '';

    function getSlideFromButton(button) {
        const img = button.querySelector('img');
        if (!img) return null;

        return {
            src: img.currentSrc || img.src,
            alt: img.alt,
        };
    }

    function buildGalleryFromButton(button) {
        const showcase = button.closest('.image-showcase');
        if (!showcase) return [getSlideFromButton(button)].filter(Boolean);

        return Array.from(showcase.querySelectorAll('.screenshot-wrapper'))
            .map(getSlideFromButton)
            .filter(Boolean);
    }

    function updateNavButtons() {
        const hasMultiple = gallerySlides.length > 1;
        lightboxPrev.hidden = !hasMultiple;
        lightboxNext.hidden = !hasMultiple;
        lightboxPrev.disabled = !hasMultiple;
        lightboxNext.disabled = !hasMultiple;
    }

    function showSlide(index) {
        if (!gallerySlides.length) return;

        currentIndex = (index + gallerySlides.length) % gallerySlides.length;
        const slide = gallerySlides[currentIndex];

        lightboxImage.src = slide.src;
        lightboxImage.alt = slide.alt;
        lightboxCaption.textContent = slide.alt;
        lightboxGalleryName.textContent = galleryName;
        lightboxCounter.textContent = `${currentIndex + 1} / ${gallerySlides.length}`;
    }

    function openLightbox(button) {
        gallerySlides = buildGalleryFromButton(button);
        if (!gallerySlides.length) return;

        const showcase = button.closest('.image-showcase');
        galleryName = showcase?.dataset.gallery || 'Screenshots';

        const buttonsInGallery = showcase
            ? Array.from(showcase.querySelectorAll('.screenshot-wrapper'))
            : [button];
        currentIndex = Math.max(0, buttonsInGallery.indexOf(button));

        lastFocusedElement = button;
        showSlide(currentIndex);
        updateNavButtons();

        lightbox.hidden = false;
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('lightbox-open');
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.removeAttribute('src');
        gallerySlides = [];
        currentIndex = 0;
        document.body.classList.remove('lightbox-open');

        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function showPrevious() {
        showSlide(currentIndex - 1);
    }

    function showNext() {
        showSlide(currentIndex + 1);
    }

    screenshotButtons.forEach((button) => {
        button.addEventListener('click', () => openLightbox(button));
    });

    document.querySelectorAll('[data-open-gallery]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const showcase = trigger.closest('.feature-visual')?.querySelector('.image-showcase');
            if (!showcase) return;
            const shots = showcase.querySelectorAll('.screenshot-wrapper');
            openLightbox(shots[1] || shots[0]);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevious();
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;

        if (e.key === 'Escape') {
            closeLightbox();
            return;
        }

        if (gallerySlides.length <= 1) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showPrevious();
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            showNext();
        }
    });
});
