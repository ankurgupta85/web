/**
 * Site-wide “Ask a question” widget.
 * Quick FAQ answers + message form → Formspree (emails hello@ via existing form).
 */
(function (global) {
    var FORMSPREE_URL = 'https://formspree.io/f/mqeogpop';

    var FAQ = [
        {
            q: 'How do I start free?',
            a: 'Install DailyDotKids Admin from the App Store or Google Play, tap Start on Free, set up your centre, then invite teachers and parents with codes. No credit card.',
        },
        {
            q: 'What is on Free?',
            a: '1 location · 1 class · 8 students · 2 teachers · 16 parents. Attendance, classroom logs, and parent updates. Paid adds more capacity, vault, invoices, and licensing export.',
        },
        {
            q: 'Do I need a sales call?',
            a: 'No. Start Free yourself in the Admin app. Message us here if you want help or a Paid / pilot conversation.',
        },
        {
            q: 'Where is data stored?',
            a: 'Production centre data is stored in Canada (Google Cloud Montréal). Built by Anthor Canada corp in Langley, BC.',
        },
    ];

    var root = null;
    var panel = null;
    var formView = null;
    var successView = null;
    var answerEl = null;
    var openBtn = null;
    var lastFocus = null;

    function track(name, params) {
        if (global.DDK && typeof global.DDK.track === 'function') {
            global.DDK.track(name, params || {});
        }
    }

    function setOpen(open) {
        if (!root) return;
        root.classList.toggle('is-open', open);
        openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.classList.toggle('ask-open', open);
        if (open) {
            lastFocus = document.activeElement;
            track('ask_open', { page_path: global.location.pathname });
            var first = panel.querySelector('button.ask-faq-btn, input, textarea');
            if (first) first.focus();
        } else if (lastFocus && typeof lastFocus.focus === 'function') {
            lastFocus.focus();
            lastFocus = null;
        }
    }

    function showAnswer(item) {
        if (!answerEl) return;
        answerEl.hidden = false;
        answerEl.innerHTML =
            '<p class="ask-answer-q">' +
            escapeHtml(item.q) +
            '</p><p class="ask-answer-a">' +
            escapeHtml(item.a) +
            '</p>';
        track('ask_faq_tap', { question: item.q, page_path: global.location.pathname });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    async function submitForm(form, errorNode, button) {
        if (errorNode) {
            errorNode.textContent = '';
            errorNode.hidden = true;
        }
        if (!form.reportValidity()) return;

        var data = new FormData(form);
        if (data.get('_gotcha')) {
            formView.hidden = true;
            successView.hidden = false;
            return;
        }

        var payload = {
            name: String(data.get('name') || '').trim(),
            email: String(data.get('email') || '').trim(),
            daycare: String(data.get('daycare') || '').trim(),
            message: String(data.get('message') || '').trim(),
            page_path: global.location.pathname,
            _subject: 'DailyDotKids website question',
        };

        var original = button.textContent;
        button.disabled = true;
        button.textContent = 'Sending…';

        try {
            var response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            var body = await response.json().catch(function () {
                return {};
            });

            if (!response.ok) {
                errorNode.textContent =
                    typeof body.error === 'string'
                        ? body.error
                        : 'Something went wrong. Email hello@dailydotkids.ca instead.';
                errorNode.hidden = false;
                button.disabled = false;
                button.textContent = original;
                return;
            }

            form.reset();
            track('ask_submit', { page_path: global.location.pathname });
            formView.hidden = true;
            successView.hidden = false;
            var closeBtn = successView.querySelector('.ask-success-close');
            if (closeBtn) closeBtn.focus();
        } catch (_) {
            errorNode.textContent = 'Network error. Please try again or email hello@dailydotkids.ca.';
            errorNode.hidden = false;
            button.disabled = false;
            button.textContent = original;
        }
    }

    function mount() {
        if (document.getElementById('ask-widget')) return;
        if (document.body && document.body.dataset.askWidget === 'off') return;

        var faqButtons = FAQ.map(function (item, i) {
            return (
                '<button type="button" class="ask-faq-btn" data-faq="' +
                i +
                '">' +
                escapeHtml(item.q) +
                '</button>'
            );
        }).join('');

        var wrapper = document.createElement('div');
        wrapper.id = 'ask-widget';
        wrapper.className = 'ask-widget';
        wrapper.innerHTML =
            '<button type="button" class="ask-launcher" aria-expanded="false" aria-controls="ask-panel">' +
            '<span class="ask-launcher-label">Ask a question</span>' +
            '</button>' +
            '<div id="ask-panel" class="ask-panel" role="dialog" aria-modal="true" aria-labelledby="ask-title" aria-hidden="true">' +
            '<div class="ask-panel-head">' +
            '<h2 id="ask-title">Ask a question</h2>' +
            '<button type="button" class="ask-close" aria-label="Close">&times;</button>' +
            '</div>' +
            '<div class="ask-form-view">' +
            '<p class="ask-lead">Quick answers below — or leave a message and we will reply by email.</p>' +
            '<div class="ask-faq" role="group" aria-label="Common questions">' +
            faqButtons +
            '</div>' +
            '<div class="ask-answer" hidden></div>' +
            '<form class="ask-form" novalidate>' +
            '<div class="inquiry-field">' +
            '<label for="ask-name">Name</label>' +
            '<input id="ask-name" name="name" type="text" autocomplete="name" required>' +
            '</div>' +
            '<div class="inquiry-field">' +
            '<label for="ask-email">Email</label>' +
            '<input id="ask-email" name="email" type="email" autocomplete="email" required>' +
            '</div>' +
            '<div class="inquiry-field">' +
            '<label for="ask-daycare">Centre name <span class="ask-optional">(optional)</span></label>' +
            '<input id="ask-daycare" name="daycare" type="text" autocomplete="organization">' +
            '</div>' +
            '<div class="inquiry-field">' +
            '<label for="ask-message">Your question</label>' +
            '<textarea id="ask-message" name="message" rows="3" required placeholder="What should we help with?"></textarea>' +
            '</div>' +
            '<input class="inquiry-honeypot" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="inquiry-error ask-error" hidden></p>' +
            '<button type="submit" class="btn btn-primary ask-submit">Send message</button>' +
            '</form>' +
            '</div>' +
            '<div class="ask-success-view" hidden>' +
            '<h2>Got it</h2>' +
            '<p>We will reply to the email you entered.</p>' +
            '<button type="button" class="btn btn-secondary ask-success-close">Close</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(wrapper);

        root = wrapper;
        openBtn = wrapper.querySelector('.ask-launcher');
        panel = wrapper.querySelector('.ask-panel');
        formView = wrapper.querySelector('.ask-form-view');
        successView = wrapper.querySelector('.ask-success-view');
        answerEl = wrapper.querySelector('.ask-answer');
        var form = wrapper.querySelector('.ask-form');
        var errorNode = wrapper.querySelector('.ask-error');
        var submitBtn = wrapper.querySelector('.ask-submit');

        openBtn.addEventListener('click', function () {
            setOpen(!root.classList.contains('is-open'));
        });
        wrapper.querySelector('.ask-close').addEventListener('click', function () {
            setOpen(false);
        });
        wrapper.querySelector('.ask-success-close').addEventListener('click', function () {
            successView.hidden = true;
            formView.hidden = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
            setOpen(false);
        });

        wrapper.querySelectorAll('.ask-faq-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = FAQ[Number(btn.getAttribute('data-faq'))];
                if (item) showAnswer(item);
            });
        });

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            submitForm(form, errorNode, submitBtn);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && root.classList.contains('is-open')) {
                setOpen(false);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})(window);
