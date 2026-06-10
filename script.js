(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* nav state */
    const nav = document.querySelector('.nav');
    const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* mobile menu */
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

    /* staggered scroll reveals */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        const parent = el.parentElement;
        if (parent && parent.dataset.stagger !== undefined) {
            const siblings = [...parent.children].filter(c => c.classList.contains('reveal'));
            el.style.transitionDelay = (siblings.indexOf(el) * 90) + 'ms';
        }
        revealObserver.observe(el);
    });

    /* active nav link */
    const sections = document.querySelectorAll('section[id], header[id]');
    if (sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
                    });
                }
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        sections.forEach(s => navObserver.observe(s));
    }

    /* count-up numbers */
    document.querySelectorAll('[data-count]').forEach(el => {
        const obs = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            obs.disconnect();
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            if (reduceMotion) { el.textContent = target + suffix; return; }
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / 1500, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.5 });
        obs.observe(el);
    });

    /* magnetic buttons */
    if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.18;
                const y = (e.clientY - r.top - r.height / 2) * 0.3;
                btn.style.transform = `translate(${x}px, ${y - 3}px) scale(1.02)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* duplicate marquee content for seamless loop */
    document.querySelectorAll('.marquee-track').forEach(track => {
        track.innerHTML += track.innerHTML;
    });

    /* footer year */
    document.querySelectorAll('.year').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
