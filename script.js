/* ============================================================
   Portfolio interactions & animations
   ============================================================ */

(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Scroll progress bar ---------- */
    const progress = document.querySelector('.scroll-progress');
    const nav = document.querySelector('.nav');
    const backTop = document.querySelector('.back-top');

    const onScroll = () => {
        const y = window.scrollY;
        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        }
        if (nav) nav.classList.toggle('scrolled', y > 24);
        if (backTop) backTop.classList.toggle('show', y > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile nav ---------- */
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            links.classList.toggle('open');
            document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
        });
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            toggle.classList.remove('open');
            links.classList.remove('open');
            document.body.style.overflow = '';
        }));
    }

    /* ---------- Reveal on scroll ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        const delay = el.dataset.delay || (el.parentElement.classList.contains('stagger') ? (i % 6) * 90 : 0);
        if (delay) el.style.transitionDelay = delay + 'ms';
        revealObserver.observe(el);
    });

    /* ---------- Active nav link highlighting ---------- */
    const sections = document.querySelectorAll('section[id]');
    if (sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => navObserver.observe(s));
    }

    /* ---------- Count-up stats ---------- */
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                countObserver.unobserve(e.target);
                const el = e.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';
                const decimals = (el.dataset.count.split('.')[1] || '').length;
                if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
                const dur = 1800;
                const start = performance.now();
                const tick = (now) => {
                    const p = Math.min((now - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.5 });
        counters.forEach(c => countObserver.observe(c));
    }

    /* ---------- Hero role typewriter ---------- */
    const typedEl = document.querySelector('.typed-text');
    if (typedEl) {
        const roles = ['DevOps Engineer', 'Cloud Engineer', 'Platform Engineer', 'Site Reliability Engineer', 'Automation Specialist'];
        if (reduceMotion) {
            typedEl.textContent = roles[0];
        } else {
            let roleIdx = 0, charIdx = 0, deleting = false;
            const type = () => {
                const word = roles[roleIdx];
                typedEl.textContent = word.slice(0, charIdx);
                let speed = deleting ? 38 : 75;
                if (!deleting && charIdx === word.length) { speed = 2200; deleting = true; }
                else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; speed = 350; }
                else charIdx += deleting ? -1 : 1;
                setTimeout(type, speed);
            };
            type();
        }
    }

    /* ---------- Terminal typing simulation ---------- */
    const termBody = document.querySelector('.terminal-body');
    if (termBody) {
        const script = [
            { type: 'cmd', text: 'whoami' },
            { type: 'out', text: 'saad-minhas · devops & cloud engineer', cls: 'out-info' },
            { type: 'cmd', text: 'terraform apply -auto-approve' },
            { type: 'out', text: 'Apply complete! Resources: 42 added, 0 changed, 0 destroyed.', cls: 'out-ok' },
            { type: 'cmd', text: 'kubectl get pods -n production' },
            { type: 'out', text: 'NAME            READY   STATUS    RESTARTS   AGE' },
            { type: 'out', text: 'api-7d4f9b      2/2     Running   0          14d', cls: 'out-ok' },
            { type: 'out', text: 'canary-v2-x8k   1/1     Running   0          2h', cls: 'out-ok' },
            { type: 'cmd', text: 'az aks show --query provisioningState' },
            { type: 'out', text: '"Succeeded"', cls: 'out-ok' },
            { type: 'cmd', text: 'echo "$COST_SAVINGS | $INCIDENT_RESPONSE"' },
            { type: 'out', text: '-18% monthly cloud spend | +30% faster incident response', cls: 'out-info' },
            { type: 'cmd', text: './deploy.sh --status' },
            { type: 'out', text: '✔ pipelines green · uptime 99.99% · open to new opportunities', cls: 'out-ok' }
        ];

        const renderLine = (item) => {
            const div = document.createElement('div');
            div.className = 'line';
            if (item.type === 'cmd') {
                div.innerHTML = '<span class="prompt-sym">➜ ~ </span><span class="cmd"></span>';
            } else {
                div.innerHTML = `<span class="out ${item.cls || ''}"></span>`;
            }
            termBody.appendChild(div);
            return div.lastElementChild;
        };

        const caret = document.createElement('span');
        caret.className = 'terminal-caret';

        if (reduceMotion) {
            script.forEach(item => { renderLine(item).textContent = item.text; });
            termBody.appendChild(caret);
        } else {
            let started = false;
            const termObserver = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting || started) return;
                started = true;
                termObserver.disconnect();

                let i = 0;
                const playNext = () => {
                    if (i >= script.length) {
                        const last = document.createElement('div');
                        last.className = 'line';
                        last.innerHTML = '<span class="prompt-sym">➜ ~ </span>';
                        last.appendChild(caret);
                        termBody.appendChild(last);
                        return;
                    }
                    const item = script[i++];
                    const span = renderLine(item);
                    termBody.parentElement.scrollTop = termBody.parentElement.scrollHeight;

                    if (item.type === 'cmd') {
                        let c = 0;
                        span.parentElement.appendChild(caret);
                        const typeChar = () => {
                            span.textContent = item.text.slice(0, ++c);
                            if (c < item.text.length) setTimeout(typeChar, 28 + Math.random() * 40);
                            else setTimeout(playNext, 320);
                        };
                        typeChar();
                    } else {
                        span.textContent = item.text;
                        setTimeout(playNext, 140);
                    }
                };
                setTimeout(playNext, 500);
            }, { threshold: 0.3 });
            termObserver.observe(termBody);
        }
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll('.year').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
