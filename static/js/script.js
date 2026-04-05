/*
==========================================================================
 JAVASCRIPT CONFIGURATION
==========================================================================
*/
const INTRO_CONFIG = {
    TEXT: "Dhruv Vaishnav",
    ERA_TEXT: "Era 2026",
    PRESENTS_TEXT: "Presents",
    FORMULAS: [
        '∑(x-μ)²/N', 'class User {}', 'e=mc²', 'const animate = () => {}', 
        'a²+b²=c²', 'Promise.resolve()', '∇·E=ρ/ε₀', 'for(let i=0; i<n; i++)'
    ],
    PARTICLE_INTERVAL: 250,
    TEXT_SAFE_ZONE: 200,
    TEXT_FADE_DISTANCE: 100,
};

const JS_CONFIG = {
    TYPEWRITER_TEXTS: [
        "Dhruv Vaishnav", 
        "Critical Problem Thinker", 
        "Future Tech Leader", 
        "Aspiring World's Best"
    ],
    TYPE_SPEED: 100, 
    DELETE_SPEED: 50, 
    PAUSE_DELAY: 2000, 
    PARTICLE_COUNT: 100,
    CONNECTION_DISTANCE: 120, 
    MOUSE_REPULSION_RADIUS: 150,
};

/*
==========================================================================
 INITIALIZATION
==========================================================================
*/
document.addEventListener('DOMContentLoaded', () => {
    initIntroAnimation();
    setupIntersectionObservers(); 
});

/*
==========================================================================
 INTRO ANIMATION LOGIC
==========================================================================
*/
function initIntroAnimation() {
    const overlay = document.getElementById('intro-overlay');
    const textContainer = document.getElementById('intro-text');
    const formulaContainer = document.getElementById('formula-container');
    // Ensure sync with CSS --intro-duration (9500ms)
    const introDuration = parseInt(getComputedStyle(overlay).getPropertyValue('--intro-duration'), 10) || 9500;
    
    document.body.classList.add('intro-active');
    
    let particles = [];
    let animationFrameId;

    // Helper function to create typewriter spans for the intro sequence
    function typeify(text, targetElement, baseDelay, charSpeed) {
        if (!targetElement) return;
        targetElement.innerHTML = ''; 
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.opacity = "0";
            span.style.animationDelay = `${index * charSpeed + baseDelay}ms`; 
            targetElement.appendChild(span);
        });
    }

    // --- 1. START SEQUENTIAL TEXT ---
    const eraContainer = document.getElementById('intro-era');
    if (eraContainer) typeify(INTRO_CONFIG.ERA_TEXT, eraContainer, 500, 50);

    const presentsContainer = document.getElementById('intro-presents');
    if (presentsContainer) typeify(INTRO_CONFIG.PRESENTS_TEXT, presentsContainer, 4500, 50);

    typeify(INTRO_CONFIG.TEXT, textContainer, 6500, 150);

    // --- 2. FORMULA PARTICLES ---
    function createFormulaParticle() {
        const particleEl = document.createElement('div');
        particleEl.classList.add('formula-particle');
        particleEl.textContent = INTRO_CONFIG.FORMULAS[Math.floor(Math.random() * INTRO_CONFIG.FORMULAS.length)];
        
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        const edge = Math.floor(Math.random() * 4);
        let startX, startY;
        switch (edge) {
            case 0: startX = Math.random() * vw; startY = -100; break;
            case 1: startX = vw + 100; startY = Math.random() * vh; break;
            case 2: startX = Math.random() * vw; startY = vh + 100; break;
            case 3: startX = -100; startY = Math.random() * vh; break;
        }

        const particle = {
            el: particleEl, x: startX, y: startY,
            vx: (vw / 2 - startX) / (Math.random() * 400 + 800), // Cinematic slow drift
            vy: (vh / 2 - startY) / (Math.random() * 400 + 800),
        };
        
        particles.push(particle);
        formulaContainer.appendChild(particleEl);
        setTimeout(() => { particle.el.style.opacity = '0.7'; }, 100);
    }

    function updateParticles() {
        const textRect = textContainer.getBoundingClientRect();
        const textCenterX = textRect.left + textRect.width / 2;
        const textCenterY = textRect.top + textRect.height / 2;

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;

            const dx = p.x - textCenterX;
            const dy = p.y - textCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy) - (textRect.width / 2);

            if (distance < INTRO_CONFIG.TEXT_SAFE_ZONE) {
                const fadeFactor = Math.max(0, distance - (INTRO_CONFIG.TEXT_SAFE_ZONE - INTRO_CONFIG.TEXT_FADE_DISTANCE)) / INTRO_CONFIG.TEXT_FADE_DISTANCE;
                p.el.style.opacity = Math.min(0.7, fadeFactor).toFixed(2);
            } else {
                p.el.style.opacity = '0.7';
            }

            if (p.x < -200 || p.x > window.innerWidth + 200 || p.y < -200 || p.y > window.innerHeight + 200) {
                p.el.remove();
                particles.splice(i, 1);
            }
        }
        animationFrameId = requestAnimationFrame(updateParticles);
    }

    const formulaInterval = setInterval(createFormulaParticle, INTRO_CONFIG.PARTICLE_INTERVAL);
    updateParticles();

    // --- 3. TRANSITION TO PORTFOLIO ---
    setTimeout(() => {
        const presents = document.getElementById('intro-presents');
        if (presents) presents.style.opacity = '0'; // Sync Presents fade out
        
        textContainer.style.opacity = '0';
        formulaContainer.style.opacity = '0';
        formulaContainer.style.transition = 'opacity 1.5s ease-out';
        
        overlay.classList.add('hidden');
        clearInterval(formulaInterval);

        // This launches the main scripts ONLY ONCE
        initMainPageScripts();

        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            overlay.remove();
            document.body.classList.remove('intro-active');
        }, 2000);
    }, introDuration);
}

/*
==========================================================================
 MAIN PAGE SCRIPT INITIALIZATION
==========================================================================
*/
function initMainPageScripts() {
    initTypewriter();
    initParticleSystem();
    initAboutMeSection();
}

function setupIntersectionObservers() {
    const aboutSection = document.getElementById('about-me');
    if (!aboutSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(aboutSection);
}

/*
==========================================================================
 TYPEWRITER EFFECT LOGIC (HERO SECTION)
==========================================================================
*/
let typewriterStarted = false; // Guard variable to prevent double-speed bug

function initTypewriter() {
    if (typewriterStarted) return; 
    typewriterStarted = true;

    const textElement = document.getElementById('typewriter-text');
    if (!textElement) return;

    let textIndex = 0, charIndex = 0, isDeleting = false;

    function type() {
        const currentText = JS_CONFIG.TYPEWRITER_TEXTS[textIndex];
        let displayText = isDeleting 
            ? currentText.substring(0, charIndex - 1) 
            : currentText.substring(0, charIndex + 1);
        
        textElement.textContent = displayText;
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        
        let typeSpeed = isDeleting ? JS_CONFIG.DELETE_SPEED : JS_CONFIG.TYPE_SPEED;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = JS_CONFIG.PAUSE_DELAY;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % JS_CONFIG.TYPEWRITER_TEXTS.length;
        }
        setTimeout(type, typeSpeed);
    }
    type();
}

/*
==========================================================================
 HERO PARTICLE SYSTEM (BACKGROUND)
==========================================================================
*/
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    const mouse = { x: null, y: null };

    function resizeCanvas() { 
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight; 
    }
    resizeCanvas();

    class Particle {
        constructor(x, y, dirX, dirY, size, color) {
            this.x = x; this.y = y; 
            this.directionX = dirX; this.directionY = dirY; 
            this.size = size; this.color = color;
        }
        draw() { 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); 
            ctx.fillStyle = this.color; 
            ctx.fill(); 
        }
        update() {
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
            
            let dx = mouse.x - this.x; 
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < JS_CONFIG.MOUSE_REPULSION_RADIUS) { 
                this.x -= dx / 20; 
                this.y -= dy / 20; 
            } else { 
                this.x += this.directionX; 
                this.y += this.directionY; 
            }
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        const particleColor = getComputedStyle(document.documentElement).getPropertyValue('--color-particle').trim();
        let numParticles = Math.min(JS_CONFIG.PARTICLE_COUNT, (canvas.height * canvas.width) / 9000);
        for (let i = 0; i < numParticles; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let dirX = (Math.random() * 0.4) - 0.2; 
            let dirY = (Math.random() * 0.4) - 0.2;
            particles.push(new Particle(x, y, dirX, dirY, size, particleColor));
        }
    }
    
    function connectParticles() {
        const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--color-particle-line').trim();
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) ** 2) + ((particles[a].y - particles[b].y) ** 2);
                if (distance < (JS_CONFIG.CONNECTION_DISTANCE ** 2)) {
                    let opacityValue = 1 - (distance / (JS_CONFIG.CONNECTION_DISTANCE ** 2));
                    const colorParts = lineColor.match(/[\d\.]+/g);
                    if (colorParts && colorParts.length >= 3) {
                        ctx.strokeStyle = `rgba(${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]}, ${opacityValue.toFixed(2)})`;
                    } else {
                        ctx.strokeStyle = lineColor;
                    }
                    ctx.lineWidth = 1; 
                    ctx.beginPath(); 
                    ctx.moveTo(particles[a].x, particles[a].y); 
                    ctx.lineTo(particles[b].x, particles[b].y); 
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particles.length; i++) particles[i].update();
        connectParticles();
        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { 
        if(animationFrameId) cancelAnimationFrame(animationFrameId); 
        resizeCanvas(); 
        initParticles(); 
        animate(); 
    });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
    
    initParticles();
    animate();
}

/*
==========================================================================
 ABOUT ME SECTION LOGIC
==========================================================================
*/
function initAboutMeSection() {
    const aboutSection = document.getElementById('about-me');
    if(!aboutSection) return;
    
    const toggleButton = document.getElementById('more-info-btn');
    const moreInfoContent = document.getElementById('more-info-content');
    const resumeButton = document.getElementById('resume-btn');
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const themeOptionsMenu = document.getElementById('theme-options-menu');
    const themeOptionButtons = document.querySelectorAll('.theme-option-btn');
    const canvas = document.getElementById('background-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let nodes = [];
    let animationFrameId;
    const NODE_COUNT = 100;
    const CONNECTION_DISTANCE = 150;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const THEME_PALETTES = {
        'lucid-blue': { node: 'rgba(0, 0, 0, 0.5)', line: 'rgba(25, 118, 210, 0.25)' },
        'metallic-sky': { node: 'rgba(255, 255, 255, 0.8)', line: 'rgba(255, 255, 255, 0.3)' }
    };
    
    const mouse = { x: null, y: null, radius: 100 };

    class Node {
        constructor(w, h) {
            this.x = Math.random() * w; this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
            this.baseRadius = Math.random() * 1.5 + 1; this.radius = this.baseRadius;
            this.pulseFactor = Math.random() * Math.PI * 2;
        }
        draw(theme) {
            if (!ctx || !theme) return;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = theme.node; ctx.fill();
        }
        update(w, h) {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
            this.pulseFactor += 0.02;
            this.radius = this.baseRadius + Math.sin(this.pulseFactor) * 0.5;

            if (mouse.x && mouse.y) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    this.radius = this.baseRadius + (1 - distance / mouse.radius) * 5;
                }
            }
        }
    }

    function initNodes() {
        if (!canvas) return;
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push(new Node(canvas.width, canvas.height));
        }
    }

    function animateNetwork() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let currentThemeKey = document.body.classList.contains('theme-metallic-sky') ? 'metallic-sky' : 'lucid-blue';
        const theme = THEME_PALETTES[currentThemeKey];

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update(canvas.width, canvas.height);
            nodes[i].draw(theme);
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < CONNECTION_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = theme.line;
                    ctx.lineWidth = 1 - distance / CONNECTION_DISTANCE;
                    ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animateNetwork);
    }

    function setupAnimation() {
        if (prefersReducedMotion || !canvas) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            return;
        }
        canvas.width = aboutSection.clientWidth;
        canvas.height = aboutSection.clientHeight;
        initNodes();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animateNetwork);
    }
    
    function applyTheme(themeName) {
        document.body.classList.remove('theme-lucid-blue', 'theme-metallic-sky');
        document.documentElement.classList.remove('theme-lucid-blue', 'theme-metallic-sky');
        document.body.classList.add(themeName);
        document.documentElement.classList.add(themeName);
        
        const cardImageMap = {
            'crypto-card': { light: 'matrixl.jpg', dark: 'matrix.jpg' },
            'portfolio-card': { light: 'planetl.jpg', dark: 'planet.jpg' },
            'judo-card': { light: 'ai1l.jpg', dark: 'ai1.jpg' },
            'top-secret-card': { light: 'tabbystarl.jpg', dark: 'tabbstar.jpg' }
        };
        
        const isDarkTheme = themeName === 'theme-metallic-sky';
        Object.entries(cardImageMap).forEach(([cardId, images]) => {
            const card = document.getElementById(cardId);
            if (card) {
                const imageName = isDarkTheme ? images.dark : images.light;
                card.style.backgroundImage = `url('static/images/${imageName}')`;
            }
        });
        
        initParticleSystem();
        setupAnimation();
    }

    const savedTheme = localStorage.getItem('theme') || 'theme-lucid-blue';
    applyTheme(savedTheme);

    themeToggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeOptionsMenu.classList.toggle('visible');
    });

    themeOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.theme;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            themeOptionsMenu.classList.remove('visible');
        });
    });

    if (toggleButton && moreInfoContent) {
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            toggleButton.style.opacity = '0';
            setTimeout(() => {
                toggleButton.setAttribute('aria-expanded', !isExpanded);
                moreInfoContent.classList.toggle('expanded');
                toggleButton.textContent = !isExpanded ? 'Less About Me' : 'More About Me';
                toggleButton.style.opacity = '1';
            }, 200); 
        });
    }



    setupAnimation();
    window.addEventListener('resize', setupAnimation);
}

/*
==========================================================================
 RESUME DOWNLOAD FUNCTION
==========================================================================
*/
function downloadResume(e) {
    e.preventDefault();
    const resumeUrl = document.getElementById('resume-btn').getAttribute('data-resume-url');
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Dhruv_Vaishnav_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/*
==========================================================================
 CROSS-TAB SYNC CHANNEL
==========================================================================
*/
const portfolioChannel = new BroadcastChannel('portfolio_sync');
portfolioChannel.onmessage = (event) => {
    if (event.data === 'ARE_YOU_OPEN') {
        portfolioChannel.postMessage('PORTFOLIO_IS_OPEN');
    }
    if (event.data === 'REQUEST_FOCUS') {
        window.focus();
    }
};
setInterval(() => portfolioChannel.postMessage('PORTFOLIO_IS_OPEN'), 1000);