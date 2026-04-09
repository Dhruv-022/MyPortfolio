document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    //  THEME SWITCHER LOGIC (SYNCED WITH MAIN PAGE)
    // =================================================================
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const themeOptionsMenu = document.getElementById('theme-options-menu');
    const themeOptionButtons = document.querySelectorAll('.theme-option-btn');

    function applyTheme(themeName) {
        document.body.classList.remove('theme-lucid-blue', 'theme-metallic-sky');
        document.documentElement.classList.remove('theme-lucid-blue', 'theme-metallic-sky');
        
        document.body.classList.add(themeName);
        document.documentElement.classList.add(themeName);
        
        localStorage.setItem('theme', themeName);

        if (typeof startCanvasAnimation === 'function') {
            setTimeout(startCanvasAnimation, 100);
        }
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isExpanded = themeToggleButton.getAttribute('aria-expanded') === 'true';
            themeToggleButton.setAttribute('aria-expanded', String(!isExpanded));
            themeOptionsMenu.classList.toggle('visible');
        });
    }

    themeOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.theme;
            applyTheme(selectedTheme);
            themeOptionsMenu.classList.remove('visible');
            themeToggleButton.setAttribute('aria-expanded', 'false');
        });
    });

    window.addEventListener('click', () => {
        if (themeOptionsMenu && themeOptionsMenu.classList.contains('visible')) {
            themeOptionsMenu.classList.remove('visible');
            themeToggleButton.setAttribute('aria-expanded', 'false');
        }
    });

    const savedTheme = localStorage.getItem('theme') || 'theme-metallic-sky';
    applyTheme(savedTheme);


    // =================================================================
    //  ORIGINAL CONTACT PAGE LOGIC (Animations & Form Handling)
    // =================================================================
    const contactForm = document.getElementById('contact-form');
    const title = document.querySelector('.contact-form-container h2');
    const submitBtn = document.querySelector('.submit-btn');
    const canvas = document.getElementById('constellation-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animationFrameId;

    // --- Advanced Title Animation (Flicker Effect) ---
    if (title) {
        const titleText = title.textContent.trim();
        title.innerHTML = '';
        let charIndex = 0;
        titleText.split(' ').forEach((word, wordIndex) => {
            const wordWrapper = document.createElement('span');
            wordWrapper.style.display = 'inline-block';
            word.split('').forEach((char) => {
                const letterSpan = document.createElement('span');
                letterSpan.className = 'letter';
                letterSpan.textContent = char;
                letterSpan.style.animationDelay = `${0.5 + charIndex * 0.05}s`;
                wordWrapper.appendChild(letterSpan);
                charIndex++;
            });
            title.appendChild(wordWrapper);
            if (wordIndex < titleText.split(' ').length - 1) {
                title.append(' ');
            }
        });
    }

    // --- Canvas Particle System (Nexus Constellation) ---
    const getThemeColor = (variable) => getComputedStyle(document.body).getPropertyValue(variable).trim();

    class Particle {
        constructor(x, y, size, color) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.vx = Math.random() * 0.2 - 0.1;
            this.vy = Math.random() * 0.2 - 0.1;
            this.pulseSpeed = Math.random() * 0.02;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }
        draw() {
            const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (1 + pulse * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            this.draw();
        }
    }

    function initCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const particleColor = getThemeColor('--particle-color') || '#888';
        const numberOfParticles = (canvas.width * canvas.height) / 12000;
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 1.5 + 0.5;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y, size, particleColor));
        }
    }

    function connectParticles() {
        const lineColor = getThemeColor('--line-color') || 'rgba(150,150,150,0.2)';
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateCanvas() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        connectParticles();
        particles.forEach(p => p.update());
        animationFrameId = requestAnimationFrame(animateCanvas);
    }

    window.startCanvasAnimation = function() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        initCanvas();
        animateCanvas();
    };
    
    startCanvasAnimation();
    window.addEventListener('resize', startCanvasAnimation);

    // --- Ripple Effect on Click ---
    function createRipple(event) {
        const target = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(target.clientWidth, target.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - target.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - target.getBoundingClientRect().top - radius}px`;
        circle.classList.add("ripple");
        const ripple = target.querySelector(".ripple");
        if (ripple) ripple.remove();
        target.appendChild(circle);
    }

    // --- Form Submission Updated for Vercel Serverless ---
    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            createRipple({ clientX: e.x, clientY: e.y, currentTarget: submitBtn });

            submitBtn.textContent = 'Transmitting...';
            submitBtn.disabled = true;

            // Convert form data to a plain JSON object
            const formData = new FormData(contactForm);
            const dataObject = Object.fromEntries(formData.entries());

            // Point to your new Vercel Serverless Function
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dataObject) 
            })
            .then(response => {
                if (!response.ok) throw new Error('Transmission Failed');
                return response.json();
            })
            .then(data => {
                const formContainer = document.querySelector('.contact-form-container');
                formContainer.style.transition = 'opacity 0.5s ease-out';
                formContainer.style.opacity = '0';

                setTimeout(() => {
                    formContainer.innerHTML = '';
                    const newTitle = document.createElement('h2');
                    const successText = "Response Submitted";
                    successText.split('').forEach((char, index) => {
                        const letterSpan = document.createElement('span');
                        letterSpan.className = 'letter';
                        letterSpan.textContent = char === ' ' ? '\u00A0' : char;
                        letterSpan.style.animationDelay = `${index * 0.05}s`;
                        newTitle.appendChild(letterSpan);
                    });
                    formContainer.appendChild(newTitle);
                    formContainer.style.opacity = '1';
                }, 500);
            })
            .catch((error) => {
                console.error('Error:', error);
                submitBtn.textContent = 'Transmission Failed';
                setTimeout(() => {
                    submitBtn.textContent = 'Transmit';
                    submitBtn.disabled = false;
                }, 2000);
            });
        });
    }
});