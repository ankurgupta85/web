(function (global) {
    const NAV_SECTIONS = [
        { id: 'offer', label: 'What we offer' },
        { id: 'pilot', label: 'Getting started' },
    ];

    const NAV_PAGES = [
        { href: 'compliance.html', label: 'Compliance', page: 'compliance' },
    ];

    const FOOTER_LINKS = [
        { href: '/', label: 'Home', page: 'home' },
        { href: 'signup.html', label: 'Contact us about a pilot', page: 'signup' },
        { href: 'admin/', label: 'Admin web', page: 'admin' },
        { href: '/#offer', label: 'What we offer', page: '' },
        { href: 'compliance.html', label: 'Compliance', page: 'compliance' },
        { href: 'privacy.html', label: 'Privacy Policy', page: 'privacy' },
        { href: 'terms.html', label: 'Terms of Service', page: 'terms' },
    ];

    const CTA_HREF = 'signup.html';

    function renderLogo(href) {
        return `<a href="${href}" class="logo">DailyDotKids</a>`;
    }

    function getCurrentPage() {
        const fromBody = document.body.dataset.page;
        if (fromBody) return fromBody;

        const path = window.location.pathname.split('/').pop() || 'index.html';
        if (path === '' || path === 'index.html') return 'home';
        return path.replace(/\.html$/, '');
    }

    function isHomePage(page) {
        return page === 'home';
    }

    function sectionHref(sectionId, page) {
        return isHomePage(page) ? `#${sectionId}` : `/#${sectionId}`;
    }

    function renderFullHeader(page) {
        const logoHref = isHomePage(page) ? '#' : '/';
        const sectionItems = NAV_SECTIONS.map(
            (section) =>
                `<li><a href="${sectionHref(section.id, page)}">${section.label}</a></li>`,
        ).join('');

        const pageItems = NAV_PAGES.map((navPage) => {
            const active = navPage.page === page ? ' class="active"' : '';
            return `<li><a href="${navPage.href}"${active}>${navPage.label}</a></li>`;
        }).join('');

        return `
<nav class="navbar" aria-label="Site">
    <div class="nav-container">
        ${renderLogo(logoHref)}
        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <ul class="nav-links">
            ${sectionItems}
            ${pageItems}
            <li><a href="${CTA_HREF}" class="nav-cta">Register</a></li>
        </ul>
    </div>
</nav>`.trim();
    }

    function renderMinimalHeader() {
        return `
<nav class="navbar" aria-label="Site">
    <div class="nav-container">
        ${renderLogo('/')}
        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="${CTA_HREF}" class="nav-cta">Register</a></li>
        </ul>
    </div>
</nav>`.trim();
    }

    function renderFooter(page) {
        const linkItems = FOOTER_LINKS.map((link) => {
            const active = link.page === page ? ' class="active"' : '';
            return `<a href="${link.href}"${active}>${link.label}</a>`;
        }).join('\n            <span>|</span>\n            ');

        return `
<footer class="footer">
    <p>&copy; 2026 Anthor Canada corp. All rights reserved. Built for the future of early childhood education.</p>
    <p class="footer-links">
        ${linkItems}
    </p>
</footer>`.trim();
    }

    function initMobileNav() {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (!navbar || !navToggle || !navLinks) return null;

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

        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) closeMobileNav();
            else openMobileNav();
        });

        document.addEventListener('click', (event) => {
            if (
                navLinks.classList.contains('open') &&
                !navLinks.contains(event.target) &&
                !navToggle.contains(event.target)
            ) {
                closeMobileNav();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1200) closeMobileNav();
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => closeMobileNav());
        });

        return {
            closeMobileNav,
            navHeight: () => navbar.offsetHeight,
        };
    }

    function mount() {
        const page = getCurrentPage();
        const headerMount = document.getElementById('site-header');
        const footerMount = document.getElementById('site-footer');

        if (headerMount) {
            const chrome = headerMount.dataset.chrome || 'full';
            const headerHtml = chrome === 'minimal' ? renderMinimalHeader() : renderFullHeader(page);
            headerMount.outerHTML = headerHtml;

            if (chrome === 'minimal') {
                document.body.classList.add('presentation-chrome');
            }
        }

        if (footerMount && footerMount.dataset.show !== 'false') {
            footerMount.outerHTML = renderFooter(page);
        } else if (footerMount) {
            footerMount.remove();
        }

        const navApi = initMobileNav();
        global.SiteLayout = { page, navApi };
    }

    mount();
})(window);
