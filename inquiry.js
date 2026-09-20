(function (global) {
    const FORMSPREE_URL = 'https://formspree.io/f/mqeogpop';

    let modal = null;
    let form = null;
    let formView = null;
    let successView = null;
    let errorEl = null;
    let submitBtn = null;
    let lastFocusedElement = null;

    function payloadFromForm(target) {
        const formData = new FormData(target);
        const city = String(formData.get('city') || '').trim();
        const province = String(formData.get('province') || '').trim();
        const location =
            [city, province].filter(Boolean).join(', ') ||
            String(formData.get('location') || '').trim();

        return {
            name: formData.get('name'),
            email: formData.get('email'),
            daycare: formData.get('daycare') || '',
            city,
            province,
            location,
            children: formData.get('children') || '',
            message: formData.get('message') || '',
            acceptedTerms: formData.get('acceptedTerms') === 'yes' ? 'yes' : '',
            termsVersion: '2026-08',
            _subject: 'DailyDotKids pilot inquiry',
        };
    }

    async function postSignup(target, { errorNode, button, onSuccess }) {
        if (errorNode) {
            errorNode.textContent = '';
            errorNode.hidden = true;
        }

        if (!target.reportValidity()) {
            return;
        }

        const formData = new FormData(target);
        if (formData.get('_gotcha')) {
            onSuccess();
            return;
        }

        const originalLabel = button ? button.textContent : '';
        if (button) {
            button.disabled = true;
            button.textContent = 'Sending…';
        }

        try {
            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadFromForm(target)),
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const message =
                    typeof body.error === 'string'
                        ? body.error
                        : 'Something went wrong. Please try again or email hello@dailydotkids.ca.';
                if (errorNode) {
                    errorNode.textContent = message;
                    errorNode.hidden = false;
                }
                if (button) {
                    button.disabled = false;
                    button.textContent = originalLabel || 'Contact us about a pilot';
                }
                return;
            }

            target.reset();
            if (global.DDK && typeof global.DDK.track === 'function') {
                global.DDK.track('signup_success', {
                    page_path: global.location.pathname,
                });
            }
            onSuccess();
        } catch (_) {
            if (errorNode) {
                errorNode.textContent = 'Network error. Please check your connection and try again.';
                errorNode.hidden = false;
            }
            if (button) {
                button.disabled = false;
                button.textContent = originalLabel || 'Contact us about a pilot';
            }
        }
    }

    function showPageSuccess(card) {
        const view = card.querySelector('.signup-form-view');
        const success = card.querySelector('.signup-success-view');
        if (view) view.hidden = true;
        if (success) {
            success.hidden = false;
            success.focus?.();
        }
    }

    function bindPageForms() {
        document.querySelectorAll('.pilot-signup-form').forEach((pageForm) => {
            pageForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const card = pageForm.closest('.signup-card') || pageForm.parentElement;
                postSignup(pageForm, {
                    errorNode: pageForm.querySelector('.inquiry-error'),
                    button: pageForm.querySelector('.inquiry-submit'),
                    onSuccess: () => showPageSuccess(card),
                });
            });
        });

        if (new URLSearchParams(global.location.search).get('sent') === '1') {
            document.querySelectorAll('.signup-card').forEach(showPageSuccess);
        }
    }

    function mountModal() {
        if (document.getElementById('inquiry-modal')) {
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
<div id="inquiry-modal" class="inquiry-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
    <button type="button" class="inquiry-backdrop" aria-label="Close form"></button>
    <div class="inquiry-panel">
        <button type="button" class="inquiry-close" aria-label="Close form">&times;</button>
        <div id="inquiry-form-view">
            <h2 id="inquiry-title">Contact us about a pilot</h2>
            <p class="inquiry-lead">Licensed centres in Canada and the USA. Send the form and we will email you to discuss a structured pilot or guided setup. Production data is stored in Canada for now.</p>
            <form class="inquiry-form" id="inquiry-form" novalidate>
                <div class="inquiry-field">
                    <label for="inquiry-name">Name</label>
                    <input id="inquiry-name" name="name" type="text" autocomplete="name" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-email">Email</label>
                    <input id="inquiry-email" name="email" type="email" autocomplete="email" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-daycare">Centre name</label>
                    <input id="inquiry-daycare" name="daycare" type="text" autocomplete="organization" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-city">City</label>
                    <input id="inquiry-city" name="city" type="text" autocomplete="address-level2" required>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-province">Province / state</label>
                    <select id="inquiry-province" name="province" required>
                        <option value="">Select one</option>
                        <optgroup label="Canada">
                            <option>Alberta</option>
                            <option>British Columbia</option>
                            <option>Manitoba</option>
                            <option>New Brunswick</option>
                            <option>Newfoundland and Labrador</option>
                            <option>Northwest Territories</option>
                            <option>Nova Scotia</option>
                            <option>Nunavut</option>
                            <option>Ontario</option>
                            <option>Prince Edward Island</option>
                            <option>Quebec</option>
                            <option>Saskatchewan</option>
                            <option>Yukon</option>
                        </optgroup>
                        <optgroup label="United States">
                            <option>Alabama</option>
                            <option>Alaska</option>
                            <option>Arizona</option>
                            <option>Arkansas</option>
                            <option>California</option>
                            <option>Colorado</option>
                            <option>Connecticut</option>
                            <option>Delaware</option>
                            <option>District of Columbia</option>
                            <option>Florida</option>
                            <option>Georgia</option>
                            <option>Hawaii</option>
                            <option>Idaho</option>
                            <option>Illinois</option>
                            <option>Indiana</option>
                            <option>Iowa</option>
                            <option>Kansas</option>
                            <option>Kentucky</option>
                            <option>Louisiana</option>
                            <option>Maine</option>
                            <option>Maryland</option>
                            <option>Massachusetts</option>
                            <option>Michigan</option>
                            <option>Minnesota</option>
                            <option>Mississippi</option>
                            <option>Missouri</option>
                            <option>Montana</option>
                            <option>Nebraska</option>
                            <option>Nevada</option>
                            <option>New Hampshire</option>
                            <option>New Jersey</option>
                            <option>New Mexico</option>
                            <option>New York</option>
                            <option>North Carolina</option>
                            <option>North Dakota</option>
                            <option>Ohio</option>
                            <option>Oklahoma</option>
                            <option>Oregon</option>
                            <option>Pennsylvania</option>
                            <option>Rhode Island</option>
                            <option>South Carolina</option>
                            <option>South Dakota</option>
                            <option>Tennessee</option>
                            <option>Texas</option>
                            <option>Utah</option>
                            <option>Vermont</option>
                            <option>Virginia</option>
                            <option>Washington</option>
                            <option>West Virginia</option>
                            <option>Wisconsin</option>
                            <option>Wyoming</option>
                        </optgroup>
                    </select>
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-children">Approx. number of children</label>
                    <input id="inquiry-children" name="children" type="text" inputmode="numeric">
                </div>
                <div class="inquiry-field">
                    <label for="inquiry-message">Message</label>
                    <textarea id="inquiry-message" name="message" rows="4" placeholder="Optional — how you run today, or what you need to see."></textarea>
                </div>
                <input class="inquiry-honeypot" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
                <div class="terms-consent">
                    <label class="terms-consent-label">
                        <input id="inquiry-terms" name="acceptedTerms" type="checkbox" value="yes" required>
                        <span>I agree to the <a href="terms.html" target="_blank" rel="noopener">Terms of Service</a>. By registering, our centre accepts these terms in place of a separate written contract for Free plans.</span>
                    </label>
                </div>
                <p class="inquiry-error" id="inquiry-error" hidden></p>
                <button type="submit" class="btn btn-primary inquiry-submit">Contact us about a pilot</button>
            </form>
        </div>
        <div id="inquiry-success-view" class="inquiry-success-view" hidden>
            <h2>Thanks &mdash; we got it</h2>
            <p>We will email you at the address you provided to set up your centre.</p>
            <button type="button" class="btn btn-secondary" id="inquiry-success-close">Close</button>
        </div>
    </div>
</div>`.trim();

        document.body.appendChild(wrapper.firstElementChild);

        modal = document.getElementById('inquiry-modal');
        form = document.getElementById('inquiry-form');
        formView = document.getElementById('inquiry-form-view');
        successView = document.getElementById('inquiry-success-view');
        errorEl = document.getElementById('inquiry-error');
        submitBtn = form.querySelector('.inquiry-submit');

        modal.querySelector('.inquiry-backdrop').addEventListener('click', closeInquiry);
        modal.querySelector('.inquiry-close').addEventListener('click', closeInquiry);
        document.getElementById('inquiry-success-close').addEventListener('click', closeInquiry);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            postSignup(form, {
                errorNode: errorEl,
                button: submitBtn,
                onSuccess: () => {
                    formView.hidden = true;
                    successView.hidden = false;
                    document.getElementById('inquiry-success-close').focus();
                },
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeInquiry();
            }
        });
    }

    function openInquiry(trigger) {
        mountModal();
        formView.hidden = false;
        successView.hidden = true;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Contact us about a pilot';
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }

        lastFocusedElement = trigger || document.activeElement;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('inquiry-open');
        global.SiteLayout?.navApi?.closeMobileNav?.();

        const nameInput = document.getElementById('inquiry-name');
        if (nameInput) {
            nameInput.focus();
        }
    }

    function closeInquiry() {
        if (!modal) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('inquiry-open');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
    }

    function isInquiryTrigger(element) {
        if (!element) return false;
        if (element.matches('.inquiry-cta, .open-inquiry, a[href="#inquiry"]')) return true;
        if (element.matches('a[href^="mailto:"]')) {
            const href = element.getAttribute('href') || '';
            return (
                href.includes('hello@dailydotkids.ca') &&
                !element.classList.contains('inquiry-ignore')
            );
        }
        return false;
    }

    document.addEventListener(
        'click',
        (event) => {
            const trigger = event.target.closest('a, button');
            if (!isInquiryTrigger(trigger)) return;

            event.preventDefault();
            event.stopPropagation();
            openInquiry(trigger);
        },
        true,
    );

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindPageForms);
    } else {
        bindPageForms();
    }

    global.InquiryModal = { open: openInquiry, close: closeInquiry };
})();
