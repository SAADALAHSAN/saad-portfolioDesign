// ══════════════════════════
        // CURSOR
        // ══════════════════════════
        const cD = document.getElementById('cd'), cR = document.getElementById('cr');
        let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cD.style.left = mx + 'px'; cD.style.top = my + 'px'; });
        document.addEventListener('mousedown', () => cR.classList.add('click'));
        document.addEventListener('mouseup', () => cR.classList.remove('click'));
        (function rAF() { rx += (mx - rx) * .1; ry += (my - ry) * .1; cR.style.left = rx + 'px'; cR.style.top = ry + 'px'; requestAnimationFrame(rAF); })();
        document.querySelectorAll('a,button,.exp-item,.skill-card,.glass-card,.rm-card').forEach(el => {
            el.addEventListener('mouseenter', () => cR.classList.add('hov'));
            el.addEventListener('mouseleave', () => cR.classList.remove('hov'));
        });

        // ══════════════════════════
        // NAV + SCROLL PROG
        // ══════════════════════════
        const nav = document.getElementById('nav');
        const sp = document.getElementById('scroll-prog');
        window.addEventListener('scroll', () => {
            nav.classList.toggle('compact', window.scrollY > 80);
            const p = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            sp.style.width = p + '%';
        }, { passive: true });

        // ══════════════════════════
        // CANVAS PARTICLES
        // ══════════════════════════
        const cv = document.getElementById('bgc'), ctx = cv.getContext('2d');
        let W, H;
        function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
        resize(); window.addEventListener('resize', resize);
        class P {
            constructor() { this.reset(true); }
            reset(i) {
                this.x = Math.random() * W; this.y = i ? Math.random() * H : -8;
                this.vx = (Math.random() - .5) * .22; this.vy = Math.random() * .18 + .04;
                this.r = Math.random() * 1.4 + .3; this.a = Math.random() * .25 + .04;
                this.c = Math.random() > .55 ? '61,31,10' : Math.random() > .5 ? '201,112,32' : '200,255,0';
            }
            update() {
                const dx = this.x - mx, dy = this.y - my, d = Math.hypot(dx, dy);
                if (d < 85) { const f = (85 - d) / 85 * 1.1; this.x += dx / d * f; this.y += dy / d * f; }
                this.x += this.vx; this.y += this.vy;
                if (this.y > H + 8 || this.x < -10 || this.x > W + 10) this.reset(false);
            }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${this.c},${this.a})`; ctx.fill(); }
        }
        const pts = Array.from({ length: 50 }, () => new P());
        const LK = 115;
        (function loop() {
            ctx.clearRect(0, 0, W, H);
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
                    if (d < LK) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(61,31,10,${(1 - d / LK) * .055})`; ctx.lineWidth = .5; ctx.stroke(); }
                }
                pts[i].update(); pts[i].draw();
            }
            requestAnimationFrame(loop);
        })();





        // ══════════════════════════════════════════════════════
        // ULTRA CINEMATIC ABOUT SCROLL ENGINE v2
        // - Per-panel scroll-driven card FLOAT ANIMATION
        // - Continuous translateY + rotate tied to scroll
        // - Per-panel background color theming
        // - 3D mouse tilt on right panel
        // - Text scramble + particle burst
        // ══════════════════════════════════════════════════════
        const aboutWrap = document.getElementById('about');
        const aboutTrack = document.getElementById('about-track');
        const aboutDots = document.querySelectorAll('.ap-dot');
        const cards = [document.getElementById('ac0'), document.getElementById('ac1'), document.getElementById('ac2')];
        const panels = [document.getElementById('apanel-0'), document.getElementById('apanel-1'), document.getElementById('apanel-2')];
        const scrollFill = document.getElementById('about-scroll-fill');
        const rightLabel = document.getElementById('about-right-label');
        const aboutRight = document.getElementById('about-right');
        const burstCvs = document.getElementById('about-burst-canvas');
        const bCtx = burstCvs ? burstCvs.getContext('2d') : null;
        let lastPanel = -1;
        let burstParts = [];
        let mouseTiltX = 0, mouseTiltY = 0;
        let isMouseInRight = false;

        // Add ambient orb inside right panel
        const cardOrb = document.createElement('div');
        cardOrb.className = 'card-orb';
        if (aboutRight) aboutRight.prepend(cardOrb);

        // Size burst canvas
        function sizeAboutCanvas() {
            if (!burstCvs || !burstCvs.parentElement) return;
            const p = burstCvs.parentElement;
            burstCvs.width = p.offsetWidth;
            burstCvs.height = p.offsetHeight;
        }
        sizeAboutCanvas();
        window.addEventListener('resize', sizeAboutCanvas);

        // ── Burst Particles ──
        class BurstP {
            constructor(x, y, color) {
                this.x = x; this.y = y;
                const a = Math.random() * Math.PI * 2;
                const s = Math.random() * 5 + 1.5;
                this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s;
                this.life = 1; this.dec = Math.random() * 0.02 + 0.012;
                this.r = Math.random() * 4 + 1.5;
                this.color = color;
            }
            update() {
                this.x += this.vx; this.y += this.vy * 0.65 + 0.25;
                this.life -= this.dec; this.vx *= 0.93; this.vy *= 0.93;
            }
            draw(c) {
                c.globalAlpha = Math.max(0, this.life * this.life);
                c.fillStyle = this.color;
                c.beginPath(); c.arc(this.x, this.y, this.r, 0, Math.PI * 2); c.fill();
            }
        }

        const BURST_COLORS = [
            ['#3D1F0A', '#C97020', '#C8FF00', '#5C2E0F'],
            ['#C97020', '#FFAA44', '#C8FF00', '#3D1F0A'],
            ['#00E87A', '#C8FF00', '#00BF65', '#3D1F0A'],
        ];

        function triggerBurst(idx) {
            if (!bCtx || !burstCvs) return;
            const cx = burstCvs.width * 0.5, cy = burstCvs.height * 0.5;
            const cols = BURST_COLORS[idx] || BURST_COLORS[0];
            for (let i = 0; i < 48; i++)
                burstParts.push(new BurstP(
                    cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 100,
                    cols[Math.floor(Math.random() * cols.length)]
                ));
        }

        function animBurst() {
            if (!bCtx || !burstCvs) return;
            bCtx.clearRect(0, 0, burstCvs.width, burstCvs.height);
            bCtx.globalAlpha = 1;
            burstParts = burstParts.filter(p => p.life > 0);
            burstParts.forEach(p => { p.update(); p.draw(bCtx); });
            bCtx.globalAlpha = 1;
            requestAnimationFrame(animBurst);
        }
        animBurst();

        // ── Panel Activation (side-slide via CSS, no scramble) ──
        function activatePanel(idx) {
            panels.forEach((p, i) => {
                p.classList.toggle('panel-active', i === idx);
            });
        }

        // ── Per-panel color class ──
        const PANEL_COLORS = ['panel-color-0', 'panel-color-1', 'panel-color-2'];
        const PANEL_LABELS = ['01 / 03', '02 / 03', '03 / 03'];

        function applyPanelColor(idx) {
            if (!aboutRight) return;
            aboutRight.classList.remove(...PANEL_COLORS);
            aboutRight.classList.add(PANEL_COLORS[idx]);
        }

        // ── Mouse 3D tilt ──
        if (aboutRight) {
            aboutRight.addEventListener('mousemove', e => {
                isMouseInRight = true;
                const rect = aboutRight.getBoundingClientRect();
                mouseTiltX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                mouseTiltY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            });
            aboutRight.addEventListener('mouseleave', () => {
                isMouseInRight = false;
                mouseTiltX = 0; mouseTiltY = 0;
            });
        }

        // ── Scroll-driven card float rAF ──
        let cardFloatY = 0;     // the live floating offset
        let cardFloatRot = 0;     // subtle rotation
        let prevPanelProg = 0;

        function updateCardFloat(panelProg) {
            // panelProg: 0→1 within the current panel
            // Wave: sin gives a smooth back-and-forth float
            const wave = Math.sin(panelProg * Math.PI * 2) * 18;    // ±18px Y float
            const rot = Math.sin(panelProg * Math.PI * 1.5) * 2.5; // ±2.5deg tilt
            const scale = 1 + Math.sin(panelProg * Math.PI) * 0.025; // subtle breathe

            const tiltX = isMouseInRight ? mouseTiltY * -5 : 0;
            const tiltY = isMouseInRight ? mouseTiltX * 8 : 0;

            const activeCard = cards.find(c => c.classList.contains('active'));
            if (activeCard) {
                activeCard.style.transform = `
                    translateY(${wave}px)
                    scale(${scale})
                    rotateZ(${rot}deg)
                    rotateX(${tiltX}deg)
                    rotateY(${tiltY}deg)
                `;
                activeCard.style.transition = 'transform 0.05s linear';
            }
        }

        // ── Main Scroll Handler ──
        window.addEventListener('scroll', () => {
            if (!aboutWrap) return;
            const sTop = aboutWrap.offsetTop;
            const sH = aboutWrap.offsetHeight;
            const vH = window.innerHeight;
            const sy = window.scrollY;
            const raw = (sy - sTop) / (sH - vH);
            const prog = Math.max(0, Math.min(1, raw));

            // Scroll fill line
            if (scrollFill) scrollFill.style.height = (prog * 100) + '%';

            // Smooth track translation
            const smoothY = prog * 200;
            aboutTrack.style.transform = `translateY(${-smoothY}vh)`;
            aboutTrack.style.transition = 'transform 0.04s linear';

            // Panel index + intra-panel progress
            const rawPanel = prog * 3;
            const panelIdx = Math.min(2, Math.floor(rawPanel));
            const panelProg = rawPanel - panelIdx; // 0→1 within the panel

            // Continuous card float driven by intra-panel scroll
            updateCardFloat(panelProg);
            prevPanelProg = panelProg;

            if (panelIdx !== lastPanel) {
                // Swap cards
                cards.forEach((c, i) => {
                    if (i === panelIdx) {
                        c.classList.add('active');
                    } else {
                        c.classList.remove('active');
                        c.style.transform = '';
                        c.style.transition = '';
                    }
                });

                // Pills
                aboutDots.forEach((d, i) => d.classList.toggle('active', i === panelIdx));

                // Label
                if (rightLabel) rightLabel.textContent = PANEL_LABELS[panelIdx];

                // Color theming
                applyPanelColor(panelIdx);

                // Panel text
                activatePanel(panelIdx);

                // Burst
                triggerBurst(panelIdx);

                lastPanel = panelIdx;
            }
        }, { passive: true });

        // Init
        activatePanel(0);
        applyPanelColor(0);

        // ══════════════════════════

        // HERO PARALLAX + FLOAT CARDS

        // ══════════════════════════

        // ══════════════════════════
        document.addEventListener('mousemove', e => {
            if (window.scrollY > window.innerHeight) return;
            const xp = (e.clientX / window.innerWidth - .5) * 2;
            const yp = (e.clientY / window.innerHeight - .5) * 2;
            const ht = document.querySelector('.hero-title');
            if (ht) ht.style.transform = `translate(${xp * 9}px,${yp * 4}px)`;
            document.querySelectorAll('.hero-float').forEach((f, i) => {
                const d = (i + 1) * 7;
                f.style.transform = `translate(${xp * d}px,${yp * d * .55}px)`;
                // CSS animation still runs via animation property — we override transform here
                // To keep float anim + parallax, use a wrapper approach
            });
            document.querySelectorAll('.orb').forEach((o, i) => {
                const d = (i + 1) * 16;
                o.style.transform = `translateY(${yp * d}px) translateX(${xp * d * .5}px)`;
            });
        });

        // ══════════════════════════
        // SPLIT-FLAP
        // ══════════════════════════
        const CS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.:-_/&+@';
        const FS = [
            ['WEB3 ENTREPRENEUR ', 'PROJECT CO-FOUNDER', 'CRYPTO TRADER     '],
            ['JAVA PYTHON NODE  ', 'EXCHANGE LISTINGS ', 'AI CYBERSECURITY  '],
            ['PRUF PROTOCOL   ', 'TRADESPY FOUNDER', 'CEX LISTING LEAD'],
        ];
        function buildFlap(id, len) { const el = document.getElementById(id); for (let i = 0; i < len; i++) { const c = document.createElement('div'); c.className = 'flap-char'; c.textContent = ' '; el.appendChild(c); } }
        buildFlap('flap0', 20); buildFlap('flap1', 20); buildFlap('flap2', 16);
        function flipTo(id, text, delay = 0) {
            const row = document.getElementById(id);
            const chars = row.querySelectorAll('.flap-char');
            const padded = text.padEnd(chars.length, ' ').toUpperCase();
            chars.forEach((ch, i) => {
                const t = padded[i] || ' '; let f = 0, tot = Math.ceil(Math.random() * 8 + 8);
                const iv = setInterval(() => { f++; if (f >= tot) { clearInterval(iv); ch.textContent = t; return; } ch.textContent = CS[Math.floor(Math.random() * CS.length)]; }, delay + i * 26 + Math.random() * 16);
            });
        }
        let fi = [0, 0, 0], fActive = false;
        function runFlaps() { [['flap0', 0], ['flap1', 1], ['flap2', 2]].forEach(([id, si]) => { flipTo(id, FS[si][fi[si]], si * 200); fi[si] = (fi[si] + 1) % FS[si].length; }); }
        const fObs = new IntersectionObserver(es => { if (es[0].isIntersecting && !fActive) { fActive = true; runFlaps(); const iv = setInterval(runFlaps, 3200); setTimeout(() => clearInterval(iv), 20000); } }, { threshold: .3 });
        if (document.getElementById('flap-section')) fObs.observe(document.getElementById('flap-section'));

        // ══════════════════════════
        // SKILLS DATA
        // ══════════════════════════
        const SKILLS = [
            { name: 'Python', cat: 'Core Programming', desc: 'Automation · Scripting · Bots', color: '#3776AB', level: .90, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
            { name: 'Java', cat: 'Core Programming', desc: 'Software Dev · Backend', color: '#b07219', level: .85, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
            { name: 'Node.js', cat: 'Backend', desc: 'REST APIs · Server logic', color: '#68A063', level: .85, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
            { name: 'HTML', cat: 'Frontend', desc: 'Web Structure', color: '#E34F26', level: .88, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
            { name: 'Web3 & Tokenomics', cat: 'Blockchain', desc: 'Project Analysis · Exchange Listings', color: '#A8A8C8', level: .92, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidity/solidity-original.svg' },
            { name: 'Finance & Trading', cat: 'Markets', desc: 'Forex · Crypto · Risk Mgt', color: '#F0C800', level: .95, logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
            { name: 'AI & Cloud', cat: 'Infrastructure', desc: 'Cloud Migration · Cybersecurity', color: '#3178C6', level: .80, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg' },
            { name: 'Community', cat: 'Soft Skills', desc: 'Leadership · Strategy', color: '#F05032', level: .95, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/slack/slack-original.svg' }
        ];

        // MacBook slides
        const mbScr = document.getElementById('mb-screen');
        SKILLS.forEach((sk, i) => {
            const s = document.createElement('div'); s.className = 'sk-slide' + (i === 0 ? ' active' : ''); s.id = 'sk' + i;
            s.innerHTML = `<div class="sk-inner"><div class="sk-logo"><img src="${sk.logo}" alt="${sk.name}"></div><div class="sk-cat" style="color:${sk.color}">${sk.cat}</div><div class="sk-name" style="color:${sk.color}">${sk.name}</div><div class="sk-desc">${sk.desc}</div><div class="sk-bar"><div class="sk-fill" style="background:${sk.color};width:${sk.level * 100}%"></div></div></div>`;
            mbScr.appendChild(s);
        });

        // Skills grid
        const sg = document.getElementById('skills-grid');
        const GRID = [
            { name: 'Python', cat: 'Automation', level: .88, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
            { name: 'JavaScript', cat: 'Full Stack', level: .93, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
            { name: 'React', cat: 'Frontend', level: .86, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
            { name: 'Next.js', cat: 'Frontend', level: .84, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
            { name: 'TypeScript', cat: 'Type-Safe', level: .80, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
            { name: 'Node.js', cat: 'Backend', level: .83, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
            { name: 'Solidity', cat: 'Web3', level: .78, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/solidity/solidity-plain.svg' },
            { name: 'PostgreSQL', cat: 'Database', level: .76, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
            { name: 'MongoDB', cat: 'Database', level: .74, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
            { name: 'Git', cat: 'Version Control', level: .95, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
            { name: 'Figma', cat: 'Design', level: .72, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
            { name: 'Java', cat: 'OOP', level: .70, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
        ];
        const row1 = GRID.slice(0, 6);
        const row2 = GRID.slice(6);

        function createTrack(items, directionClass) {
            const wrapper = document.createElement('div');
            wrapper.className = 'skills-track-wrapper';
            const marquee = document.createElement('div');
            marquee.className = `skills-marquee ${directionClass}`;

            const content = items.map(sk => `
                <div class="skill-card">
                    <div class="sc-inner">
                        <div class="sc-logo"><img src="${sk.logo}" alt="${sk.name}"></div>
                        <div class="sc-tag">
                            <div class="sc-cat">${sk.cat}</div>
                            <div class="sc-name">${sk.name}</div>
                        </div>
                        <div class="sc-bar"><div class="sc-fill" style="width:${sk.level * 100}%"></div></div>
                    </div>
                </div>
            `).join('');

            marquee.innerHTML = content + content;
            wrapper.appendChild(marquee);
            return wrapper;
        }

        sg.innerHTML = '';
        sg.appendChild(createTrack(row1, 'marquee-right'));
        sg.appendChild(createTrack(row2, 'marquee-left'));

        // ══════════════════════════
        // SKILLS ROADMAP
        // ══════════════════════════
        const ROADMAP = [
            { num: '01', role: 'Co-Founder & Lead', desc: 'Co-founded PRUF Protocol, Tradespy, Trollix, Solana Animal. Led strategic development and tokenomics.', chip: 'Founding · Strategy', bar: .95, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
            { num: '02', role: 'Exchange Listing Manager', desc: 'Facilitated end-to-end token listing on major CEXs (MEXC, LBank, Coinstore) and managed partnerships.', chip: 'CEX · Listings', bar: .90, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
            { num: '03', role: 'Forex & Crypto Trader', desc: 'Successfully managed a trading portfolio with deep expertise in market analysis and risk management.', chip: 'Trading · Forex', bar: .95, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
            { num: '04', role: 'Community Manager', desc: 'Managed massive user communities like NRC and AA. Educated users on crypto trends and airdrops.', chip: 'Growth · Ops', bar: .92, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
            { num: '05', role: 'Programming & Web3', desc: 'Technical skills in Java, Python, Node.js alongside Web3 auditing, token marketing strategy.', chip: 'Code · Tech', bar: .88, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
            { num: '06', role: 'AI & Cloud Infrastructure', desc: 'In-depth understanding of AI infrastructure, cloud migration, and cybersecurity.', chip: 'Cloud · Cyber', bar: .85, logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
        ];
        const rmTrack = document.getElementById('roadmap-track');
        ROADMAP.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'rm-item';
            div.style.transitionDelay = (i * .1) + 's';
            div.innerHTML = `
    <div class="rm-node">
      <div class="rm-node-num">${item.num}</div>
      <img src="${item.logo}" alt="${item.role}">
    </div>
    <div class="rm-card">
      <div class="rm-card-top">
        <div class="rm-role">${item.role}</div>
        <div class="rm-chip">${item.chip}</div>
      </div>
      <div class="rm-desc">${item.desc}</div>
      <div class="rm-bar-wrap">
        <div class="rm-bar"><div class="rm-bar-fill" style="--bar-w:${item.bar * 100}%"></div></div>
        <div class="rm-bar-pct">${Math.round(item.bar * 100)}%</div>
      </div>
    </div>
  `;
            rmTrack.appendChild(div);
        });

        // Roadmap scroll observer
        const rmObs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('rm-vis'); });
        }, { threshold: .2, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.rm-item').forEach(el => rmObs.observe(el));

        // ══════════════════════════
        // MAC CLOCK
        // ══════════════════════════
        function updateClock() { const n = new Date(); document.getElementById('mac-time').textContent = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); }
        updateClock(); setInterval(updateClock, 30000);

        // ══════════════════════════
        // MACBOOK SCROLL (preserved)
        // ══════════════════════════
        const mbSec = document.querySelector('.mb-section');
        const mbWrap = document.getElementById('mb-wrap');
        const scrCover = document.getElementById('scr-cover');
        const scrGlow = document.getElementById('scr-glow');
        const mbPfill = document.getElementById('mb-pfill');
        const sideNum = document.getElementById('side-num');
        const sideName = document.getElementById('side-name');
        const sideOf = document.getElementById('side-of');
        const macTitle = document.getElementById('mac-title');
        const mbLid = document.getElementById('mb-lid');
        let curSk = 0;
        const mbScroll = document.getElementById('mb-scroll');
        window.addEventListener('scroll', () => {
            const sy = window.scrollY;
            const sTop = mbSec.offsetTop, sH = mbSec.offsetHeight, vH = window.innerHeight;
            const prog = Math.max(0, Math.min(1, (sy - sTop) / (sH - vH)));

            // Fade out mb-scroll indicator
            if (mbScroll) {
                const sp = Math.min(1, prog / 0.08);
                mbScroll.style.opacity = 1 - sp;
                mbScroll.style.transform = `translateX(-50%) translateY(${sp * 30}px)`;
            }

            const ep = Math.min(1, prog / .03), xp = Math.max(0, (prog - .97) / .03);
            const sc = .72 + ep * .28 - xp * .18, tilt = 20 - ep * 20 + xp * 14;
            mbWrap.style.transform = `rotateX(${tilt}deg) scale(${Math.max(.35, sc)})`;
            mbWrap.style.opacity = Math.max(0, ep - xp);
            const cv2 = xp > 0 ? xp : (1 - ep);
            scrCover.style.transform = `scaleY(${Math.max(0, cv2)})`;
            const sr = Math.max(0, Math.min(1, (prog - .03) / .94));
            const si = Math.min(Math.floor(sr * SKILLS.length), SKILLS.length - 1);
            mbPfill.style.height = (sr * 100) + '%';
            if (si !== curSk) {
                document.getElementById('sk' + curSk).classList.remove('active');
                document.getElementById('sk' + si).classList.add('active');
                const sk = SKILLS[si];
                sideNum.textContent = String(si + 1).padStart(2, '0');
                sideName.textContent = sk.name; sideName.style.color = sk.color;
                sideOf.textContent = String(si + 1).padStart(2, '0') + ' / ' + String(SKILLS.length).padStart(2, '0');
                macTitle.textContent = 'zax.dev — ' + sk.name.toLowerCase().replace(/[\s&./]/g, '_') + '.sh';
                scrGlow.style.background = `radial-gradient(ellipse at center,${sk.color}14 0%,transparent 65%)`;
                mbLid.style.boxShadow = `0 0 0 1px rgba(255,255,255,.055),inset 0 0 0 1px rgba(255,255,255,.02),0 40px 100px rgba(0,0,0,.95),0 0 60px ${sk.color}18`;
                curSk = si;
            }
        }, { passive: true });

        // ══════════════════════════
        // SCROLL REVEAL
        // ══════════════════════════
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('vis');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });

        function initReveal() {
            document.querySelectorAll('.reveal').forEach(el => {
                const r = el.getBoundingClientRect();
                // Only immediately show if it's well within viewport, otherwise let observer handle it
                if (r.top < window.innerHeight - 100) el.classList.add('vis');
                obs.observe(el);
            });
        }
        initReveal();

        // Contact bg parallax
        window.addEventListener('scroll', () => {
            const cb = document.querySelector('.contact-bg-text');
            if (!cb) return;
            const r = document.querySelector('.contact').getBoundingClientRect();
            cb.style.transform = `translate(-50%,calc(-50% + ${(r.top / window.innerHeight) * -35}px))`;
        }, { passive: true });

        // ══════════════════════════════════════════════════════
        // PREMIUM UI UPGRADES JS
        // ══════════════════════════════════════════════════════

        // ── 1. HERO LINE CLIP REVEAL ──
        (function heroReveal() {
            const lines = document.querySelectorAll('.hero-title .line span');
            const eyebrow = document.querySelector('.hero-eyebrow');
            const sub = document.querySelector('.hero-sub');
            if (eyebrow) requestAnimationFrame(() => eyebrow.classList.add('eyebrow-in'));
            lines.forEach((span, i) => {
                setTimeout(() => span.classList.add('line-reveal'), 140 + i * 200);
            });
            if (sub) setTimeout(() => sub.classList.add('sub-in'), 680);
        })();

        // ── 2. HERO CURSOR ORB ──
        (function heroCursorOrb() {
            const orb = document.getElementById('hero-cursor-orb');
            if (!orb) return;
            let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
            let cx = tx, cy = ty;
            function lerp(a, b, t) { return a + (b - a) * t; }
            (function animOrb() {
                cx = lerp(cx, tx, 0.065);
                cy = lerp(cy, ty, 0.065);
                orb.style.left = cx + 'px';
                orb.style.top = cy + 'px';
                requestAnimationFrame(animOrb);
            })();
            document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
            window.addEventListener('scroll', () => {
                orb.style.opacity = window.scrollY > window.innerHeight * 0.8 ? '0' : '1';
            }, { passive: true });
        })();

        // ── 3. SPLIT-FLAP ROW GLOW ──
        (function flapGlow() {
            // Add glow divs after flap chars exist (they're built by buildFlap)
            setTimeout(() => {
                document.querySelectorAll('.flap-row').forEach(row => {
                    const g = document.createElement('div');
                    g.className = 'flap-row-glow';
                    row.style.position = 'relative';
                    row.appendChild(g);
                });
                // Observe char mutations to trigger glow
                const rows = document.querySelectorAll('.flap-row');
                const mo = new MutationObserver(() => {
                    rows.forEach(row => {
                        row.classList.add('flap-glowing');
                        clearTimeout(row._gt);
                        row._gt = setTimeout(() => row.classList.remove('flap-glowing'), 420);
                    });
                });
                document.querySelectorAll('.flap-char').forEach(ch =>
                    mo.observe(ch, { characterData: true, childList: true, subtree: true })
                );
            }, 600);
        })();

        // ── 4. CONTACT HEADING LETTER SPLIT ──
        (function contactLetterSplit() {
            const h = document.querySelector('.contact-h');
            if (!h) return;
            // Store original HTML to preserve <em> and <br>
            const html = h.innerHTML;
            // Split only text nodes into letter spans
            function wrapLetters(node, delayRef) {
                if (node.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    node.textContent.split('').forEach(ch => {
                        const span = document.createElement('span');
                        span.className = 'ch-letter';
                        span.style.animationDelay = (delayRef.d * 36) + 'ms';
                        delayRef.d++;
                        span.textContent = ch === ' ' ? '\u00a0' : ch;
                        if (ch === ' ') span.style.display = 'inline-block';
                        frag.appendChild(span);
                    });
                    return frag;
                }
                if (node.nodeType === 1 && node.tagName !== 'BR') {
                    const clone = node.cloneNode(false);
                    Array.from(node.childNodes).forEach(child => {
                        const wrapped = wrapLetters(child, delayRef);
                        if (wrapped) clone.appendChild(wrapped);
                    });
                    return clone;
                }
                return node.cloneNode(true);
            }
            const d = { d: 0 };
            const newH = document.createElement('h2');
            newH.className = h.className;
            Array.from(h.childNodes).forEach(child => {
                const w = wrapLetters(child, d);
                if (w) newH.appendChild(w);
            });
            h.replaceWith(newH);

            // Trigger on intersection
            const obs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    newH.querySelectorAll('.ch-letter').forEach(el => el.classList.add('ch-in'));
                    obs.disconnect();
                }
            }, { threshold: 0.25 });
            obs.observe(newH);
        })();

        // ── 5. SOC-BTN STAGGER ENTRANCE ──
        (function socStagger() {
            const btns = document.querySelectorAll('.soc-btn');
            if (!btns.length) return;
            const contact = document.querySelector('.contact');
            if (!contact) return;
            const obs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    btns.forEach((btn, i) => setTimeout(() => btn.classList.add('soc-in'), i * 110 + 180));
                    obs.disconnect();
                }
            }, { threshold: 0.15 });
            obs.observe(contact);
        })();




        // ── PORTFOLIO MACBOOK SCROLL ──
        (function pfScroll() {
            const wrap = document.getElementById('pf-sticky-wrap');
            const track = document.getElementById('pf-track');
            const slides = document.querySelectorAll('.pf-slide');
            if (!wrap || !track) return;

            // init first one
            slides[0].classList.add('active-coin');

            window.addEventListener('scroll', () => {
                const scrollStart = wrap.offsetTop - window.innerHeight * 0.15;
                const scrollDistance = wrap.offsetHeight - window.innerHeight;
                let progress = (window.scrollY - scrollStart) / scrollDistance;
                progress = Math.max(0, Math.min(1, progress));

                const numSlides = slides.length;
                const maxTrans = ((numSlides - 1) / numSlides) * 100;

                track.style.transform = `translateX(-${progress * maxTrans}%)`;
                track.style.transition = 'transform 0.05s linear';

                const currentIdx = Math.round(progress * (numSlides - 1));
                slides.forEach((sl, i) => {
                    if (i === currentIdx) sl.classList.add('active-coin');
                    else sl.classList.remove('active-coin');
                });
            }, { passive: true });
        })();


        // ── PORTFOLIO MACBOOK ANIMATION ──
        (function portfolioMacbook() {
            const COINS = [
                { name: 'Bitcoin', cat: 'Digital Gold', desc: 'Store of Value', color: '#F7931A', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', ticker: 'BTC' },
                { name: 'Ethereum', cat: 'Smart Contracts', desc: 'Decentralized Compute', color: '#627EEA', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', ticker: 'ETH' },
                { name: 'Solana', cat: 'High Performance', desc: 'Fast L1 Extradition', color: '#14F195', logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', ticker: 'SOL' },
                { name: 'Sui', cat: 'Object Centric', desc: 'Next-Gen L1', color: '#4DA2FF', logo: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg', ticker: 'SUI' },
                { name: 'Walrus', cat: 'Data Availability', desc: 'Decentralized Storage App', color: '#FF4D4D', logo: 'https://assets.coingecko.com/coins/images/54914/standard/Walrus_Token_Full_Color_200x200.png?1772722407', ticker: 'WAL' },
                { name: 'Monad', cat: 'Parallel EVM', desc: 'Extreme TPS', color: '#8233FF', logo: 'https://assets.coingecko.com/coins/images/38927/standard/mon.png?1766029057', ticker: 'MON' }
            ];

            const pfScr = document.getElementById('pf-screen');
            if (!pfScr) return;

            // clear if restarting
            pfScr.innerHTML = '';

            // Generate slides (fixed layout spacing, removed inline heights breaking flexbox)
            // Used margin-bottom and native .sk-logo sizing to maintain grid
            COINS.forEach((cn, i) => {
                const s = document.createElement('div');
                s.className = 'sk-slide' + (i === 0 ? ' active' : '');
                s.id = 'pfcn' + i;

                const logoHtml = cn.logo.startsWith('<svg') ? cn.logo : `<img src="${cn.logo}" alt="${cn.name}" style="width:100%; height:100%; border-radius:50%; box-shadow:0 8px 16px rgba(0,0,0,0.1); background:#fff; padding:6px; object-fit:contain;">`;

                s.innerHTML = `
                    <div class="sk-inner" style="gap:14px;">
                        <div class="pf-cg-logo" style="width:72px; height:72px; margin-bottom: 12px; display:flex; align-items:center; justify-content:center;">
                            ${logoHtml}
                        </div>
                        <div class="sk-cat" style="color:${cn.color}; font-weight:800; opacity:0.8; font-size:10px;">${cn.cat}</div>
                        <div class="sk-name" style="color:#222; font-size:32px; letter-spacing:-0.5px;">${cn.name} <span style="font-size:16px; opacity:0.5; font-weight:500;">${cn.ticker}</span></div>
                        <div class="sk-desc" style="color:#777; font-size:12px; margin-top:-4px;">${cn.desc}</div>
                    </div>
                `;
                pfScr.appendChild(s);
            });

            const pfSec = document.getElementById('portfolio-sec');
            const pfWrap = document.getElementById('pf-wrap');
            const pfScrCover = document.getElementById('pf-scr-cover');
            const pfScrGlow = document.getElementById('pf-scr-glow');
            const pfPfill = document.getElementById('pf-pfill');
            const pfSideNum = document.getElementById('pf-side-num');
            const pfSideName = document.getElementById('pf-side-name');
            const pfSideOf = document.getElementById('pf-side-of');
            const pfMacTitle = document.getElementById('pf-mac-title');
            const pfLid = document.getElementById('pf-lid');
            const pfScrollInd = document.getElementById('pf-scroll');
            let curCn = 0;

            window.addEventListener('scroll', () => {
                if (!pfSec) return;
                const sy = window.scrollY;
                const sTop = pfSec.offsetTop, sH = pfSec.offsetHeight, vH = window.innerHeight;
                const prog = Math.max(0, Math.min(1, (sy - sTop) / (sH - vH)));

                if (pfScrollInd) {
                    const sp = Math.min(1, prog / 0.08);
                    pfScrollInd.style.opacity = 1 - sp;
                    pfScrollInd.style.transform = `translateX(-50%) translateY(${sp * 30}px)`;
                }

                const ep = Math.min(1, prog / .12), xp = Math.max(0, (prog - .88) / .12);
                const sc = .72 + ep * .28 - xp * .18, tilt = 20 - ep * 20 + xp * 14;
                if (pfWrap) {
                    pfWrap.style.transform = `rotateX(${tilt}deg) scale(${Math.max(.35, sc)})`;
                    pfWrap.style.opacity = Math.max(0, ep - xp);
                }

                const cv2 = xp > 0 ? xp : (1 - ep);
                if (pfScrCover) pfScrCover.style.transform = `scaleY(${Math.max(0, cv2)})`;

                const sr = Math.max(0, Math.min(1, (prog - .12) / .76));
                const si = Math.min(Math.floor(sr * COINS.length), COINS.length - 1);
                if (pfPfill) pfPfill.style.height = (sr * 100) + '%';

                if (si !== curCn) {
                    document.getElementById('pfcn' + curCn).classList.remove('active');
                    document.getElementById('pfcn' + si).classList.add('active');
                    const cn = COINS[si];
                    if (pfSideNum) pfSideNum.textContent = String(si + 1).padStart(2, '0');
                    if (pfSideName) {
                        pfSideName.textContent = cn.name;
                        pfSideName.style.color = cn.color;
                    }
                    if (pfSideOf) pfSideOf.textContent = String(si + 1).padStart(2, '0') + ' / ' + String(COINS.length).padStart(2, '0');
                    if (pfMacTitle) pfMacTitle.textContent = 'zax.crypto — ' + cn.ticker.toLowerCase() + '_wallet.sh';
                    if (pfScrGlow) pfScrGlow.style.background = `radial-gradient(ellipse at center,${cn.color}14 0%,transparent 65%)`;
                    if (pfLid) pfLid.style.boxShadow = `0 0 0 1px rgba(0,0,0,.05), inset 0 0 0 1px rgba(255,255,255,.5), 0 40px 100px rgba(0,0,0,.15), 0 0 70px ${cn.color}15`;
                    curCn = si;
                }
            }, { passive: true });

            const pfTime = document.getElementById('pf-mac-time');
            if (pfTime) {
                setInterval(() => {
                    const d = new Date();
                    pfTime.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                }, 10000);
            }

            // Setup intersection observer for blur reveal
            const titleWrap = document.querySelector('.blur-reveal');
            if (titleWrap) {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            e.target.classList.add('vis');
                            obs.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.1 });
                obs.observe(titleWrap);
            }
        })();
        // ══════════════════════════
        // N8N STYLE WORKFLOW UI
        // ══════════════════════════
        (function initWorkflowUI() {
            const container = document.getElementById('workflow-container');
            if (!container) return;
            const svg = document.getElementById('workflow-svg');
            const nodes = document.querySelectorAll('.wf-node');

            // Connect Root to 1, 2, 3, 4
            const connections = [
                { from: 'node-root', to: 'node-1' },
                { from: 'node-root', to: 'node-2' },
                { from: 'node-root', to: 'node-3' },
                { from: 'node-root', to: 'node-4' },
            ];

            // Store paths
            const paths = [];

            // Initialize paths
            connections.forEach(conn => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.classList.add('workflow-line');
                svg.appendChild(path);
                paths.push({
                    path: path,
                    fromNode: document.getElementById(conn.from),
                    toNode: document.getElementById(conn.to)
                });
            });

            function getPortPos(node, type) {
                const rect = node.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Assuming port is vertically centered
                const y = (rect.top - containerRect.top) + rect.height / 2;
                let x;

                if (type === 'out') {
                    // Right edge
                    x = (rect.right - containerRect.left);
                } else {
                    // Left edge
                    x = (rect.left - containerRect.left);
                }
                return { x, y };
            }

            function drawLines() {
                paths.forEach(conn => {
                    const p1 = getPortPos(conn.fromNode, 'out');
                    const p2 = getPortPos(conn.toNode, 'in');

                    // N8N style cubic bezier
                    // Control points horizontally offset
                    const dx = Math.max(Math.abs(p2.x - p1.x) * 0.6, 60);
                    const cp1x = p1.x + dx;
                    const cp1y = p1.y;
                    const cp2x = p2.x - dx;
                    const cp2y = p2.y;

                    const d = `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
                    conn.path.setAttribute('d', d);
                });
            }

            // Draggable Logic
            let draggedNode = null;
            let offsetX = 0;
            let offsetY = 0;
            let isDragging = false;
            let dragMoved = false; // to distinguish click from drag
            let startX = 0, startY = 0;

            nodes.forEach(node => {
                node.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.wf-port')) return; // Ignore port clicks

                    draggedNode = node;
                    isDragging = true;
                    dragMoved = false;
                    startX = e.clientX;
                    startY = e.clientY;

                    const rect = node.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    offsetX = e.clientX - centerX;
                    offsetY = e.clientY - centerY;

                    node.style.zIndex = 20; // bring to front
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging || !draggedNode) return;

                // Only consider it a drag if moved more than 3px
                if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
                    dragMoved = true;
                }

                const containerRect = container.getBoundingClientRect();

                let newX = e.clientX - containerRect.left - offsetX;
                let newY = e.clientY - containerRect.top - offsetY;

                draggedNode.style.left = `${(newX / containerRect.width) * 100}%`;
                draggedNode.style.top = `${(newY / containerRect.height) * 100}%`;

                drawLines();
            });

            // Interactive Background Dots
            function setupGlow(container, glow) {
                if (!container || !glow) return;
                container.addEventListener('mousemove', (e) => {
                    const rect = container.getBoundingClientRect();
                    glow.style.setProperty('--x', `${e.clientX - rect.left}px`);
                    glow.style.setProperty('--y', `${e.clientY - rect.top}px`);
                });
                container.addEventListener('mouseleave', () => {
                    glow.style.setProperty('--x', `-1000px`);
                    glow.style.setProperty('--y', `-1000px`);
                });
            }

            setupGlow(document.getElementById('top'), document.getElementById('wf-bg-glow'));
            setupGlow(document.getElementById('skills-sec'), document.getElementById('skills-bg-glow'));
            setupGlow(document.getElementById('roadmap'), document.getElementById('roadmap-bg-glow'));
            setupGlow(document.getElementById('contact'), document.getElementById('contact-bg-glow'));

            document.addEventListener('mouseup', (e) => {
                if (draggedNode) {
                    draggedNode.style.zIndex = 10;

                    // Handle click if not moved
                    if (!dragMoved && draggedNode.id === 'node-root') {
                        window.open('https://x.com/0x_zax', '_blank');
                    }

                    draggedNode = null;
                    isDragging = false;
                }
            });

            // Handle touch events for mobile
            nodes.forEach(node => {
                node.addEventListener('touchstart', (e) => {
                    if (e.target.closest('.wf-port')) return;
                    const touch = e.touches[0];
                    draggedNode = node;
                    isDragging = true;
                    dragMoved = false;
                    startX = touch.clientX;
                    startY = touch.clientY;

                    const rect = node.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    offsetX = touch.clientX - centerX;
                    offsetY = touch.clientY - centerY;
                    node.style.zIndex = 20;
                }, { passive: true });
            });

            document.addEventListener('touchmove', (e) => {
                if (!isDragging || !draggedNode) return;
                const touch = e.touches[0];
                if (Math.abs(touch.clientX - startX) > 3 || Math.abs(touch.clientY - startY) > 3) {
                    dragMoved = true;
                }

                const containerRect = container.getBoundingClientRect();
                let newX = touch.clientX - containerRect.left - offsetX;
                let newY = touch.clientY - containerRect.top - offsetY;

                draggedNode.style.left = `${(newX / containerRect.width) * 100}%`;
                draggedNode.style.top = `${(newY / containerRect.height) * 100}%`;
                drawLines();
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                if (draggedNode) {
                    draggedNode.style.zIndex = 10;
                    if (!dragMoved && draggedNode.id === 'node-root') {
                        window.open('https://x.com/0x_zax', '_blank');
                    }
                    draggedNode = null;
                    isDragging = false;
                }
            });

            // Initial draw and handle resize
            window.addEventListener('resize', drawLines);
            setTimeout(drawLines, 50);
            setTimeout(drawLines, 500);
        })();