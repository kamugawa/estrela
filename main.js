// Van Gogh Love Map Interactive System
class VanGoghLoveMap {
    constructor() {
        this.visitedPoints = new Set();
        this.pointData = {
            1: {
                title: "Carta a seu irmão Theo van Gogh",
                text: "O amor é algo eterno — o aspecto pode mudar, mas não a essência. Com você, eu sinto que o amor verdadeiro não muda, apenas se aprofunda.",
                music: "4.mp3"
            },
            2: {
                title: "Carta a Theo, setembro de 1882",
                text: "Há paz mesmo na tempestade. Mesmo nos meus dias turbulentos, seu amor é meu abrigo mais calmo.",
                music: "11.mp3"
            },
            3: {
                title: " Carta a Theo, 22 de outubro de 1882",      
                text: "Grandes coisas não são feitas por impulso, mas por uma soma de pequenas coisas reunidas. Nosso amor é feito de pequenos gestos diários, e é isso que o torna tão grandioso.",
                music: "42.mp3"
            }
        };
        
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.modalMusic = document.getElementById('modalMusic');
        this.modal = document.getElementById('modalOverlay');
        this.roseContainer = document.getElementById('roseContainer');
        this.loveMessage = document.getElementById('loveMessage');
        this.currentModalMusic = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startBackgroundMusic();
        this.setupPoints();
        this.setupMusicPlayer();
        this.setupTouchOptimizations();
    }
    
    setupEventListeners() {
        // Point click handlers with touch optimization
        document.querySelectorAll('.point').forEach(point => {
            point.addEventListener('click', (e) => {
                e.preventDefault();
                const pointId = e.currentTarget.dataset.point;
                this.openModal(pointId);
            });
            
            // Touch feedback
            point.addEventListener('touchstart', (e) => {
                e.currentTarget.style.transform = 'scale(1.3)';
            });
            
            point.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    e.currentTarget.style.transform = '';
                }, 150);
            });
        });
        
        // Modal close handlers
        document.getElementById('closeModal').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal();
        });
        
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
        
        // Rose click handler with touch optimization
        document.getElementById('rose').addEventListener('click', (e) => {
            e.preventDefault();
            this.explodeRose();
        });
        
        // Keyboard handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Prevent zoom on double tap
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            const timeSince = now - this.lastTouchEnd;
            if ((timeSince < 300) && (timeSince > 0)) {
                e.preventDefault();
            }
            this.lastTouchEnd = now;
        });
    }
    
    setupTouchOptimizations() {
        // Prevent default touch behaviors that might interfere
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.modal-content')) {
                // Allow scrolling in modal
                return;
            }
            e.preventDefault();
        }, { passive: false });
        
        // Optimize viewport for mobile
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    setupPoints() {
        // Add hover effects and animations
        document.querySelectorAll('.point').forEach(point => {
            point.addEventListener('mouseenter', () => {
                this.addPointHoverEffect(point);
            });
            
            point.addEventListener('mouseleave', () => {
                this.removePointHoverEffect(point);
            });
        });
    }
    
    setupMusicPlayer() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const progressFill = document.getElementById('progressFill');
        const progressBar = document.querySelector('.progress-bar');
        const currentTimeEl = document.getElementById('currentTime');
        const durationEl = document.getElementById('duration');
        
        // Play/Pause functionality
        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.modalMusic.paused) {
                this.modalMusic.play();
                this.updatePlayPauseButton(true);
            } else {
                this.modalMusic.pause();
                this.updatePlayPauseButton(false);
            }
        });
        
        // Volume control
        volumeSlider.addEventListener('input', (e) => {
            this.modalMusic.volume = e.target.value / 100;
        });
        
        // Progress bar click/touch to seek
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (this.modalMusic.duration) {
                this.modalMusic.currentTime = percent * this.modalMusic.duration;
            }
        });
        
        // Touch support for progress bar
        progressBar.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleProgressTouch(e);
        });
        
        progressBar.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleProgressTouch(e);
        });
        
        // Progress tracking
        this.modalMusic.addEventListener('timeupdate', () => {
            if (this.modalMusic.duration) {
                const progress = (this.modalMusic.currentTime / this.modalMusic.duration) * 100;
                progressFill.style.width = progress + '%';
                
                currentTimeEl.textContent = this.formatTime(this.modalMusic.currentTime);
                durationEl.textContent = this.formatTime(this.modalMusic.duration);
            }
        });
        
        // Auto-update play button when music ends
        this.modalMusic.addEventListener('ended', () => {
            this.updatePlayPauseButton(false);
            progressFill.style.width = '0%';
        });
        
        // Load metadata
        this.modalMusic.addEventListener('loadedmetadata', () => {
            durationEl.textContent = this.formatTime(this.modalMusic.duration);
        });
        
        // Error handling
        this.modalMusic.addEventListener('error', (e) => {
            console.log('Music loading error:', e);
            this.updatePlayPauseButton(false);
        });
    }
    
    handleProgressTouch(e) {
        const touch = e.touches[0];
        const rect = document.querySelector('.progress-bar').getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        
        if (this.modalMusic.duration) {
            this.modalMusic.currentTime = percent * this.modalMusic.duration;
        }
    }
    
    updatePlayPauseButton(isPlaying) {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    addPointHoverEffect(point) {
        const glow = point.querySelector('.point-glow');
        glow.style.animation = 'pulse 1s infinite, pointHover 0.3s ease-out';
    }
    
    removePointHoverEffect(point) {
        const glow = point.querySelector('.point-glow');
        glow.style.animation = 'pulse 2s infinite';
    }
    
    startBackgroundMusic() {
        // Dark romantic jazz background music
        this.backgroundMusic.volume = 0.15;
        this.backgroundMusic.play().catch(e => {
            console.log('Background music autoplay blocked:', e);
            // Add click handler to start music on first user interaction
            document.addEventListener('click', () => {
                this.backgroundMusic.play();
            }, { once: true });
            
            document.addEventListener('touchstart', () => {
                this.backgroundMusic.play();
            }, { once: true });
        });
    }
    
    openModal(pointId) {
        const data = this.pointData[pointId];
        if (!data) return;
        
        // Stop background music
        this.backgroundMusic.pause();
        
        // Populate modal content
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalImage').src = data.image;
        document.getElementById('modalText').textContent = data.text;
        
        // Setup modal music
        this.modalMusic.src = data.music;
        this.modalMusic.volume = 0.7;
        this.modalMusic.load(); // Reload the audio element
        
        // Reset player UI
        this.updatePlayPauseButton(false);
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
        document.getElementById('volumeSlider').value = 70;
        
        // Show modal with mobile optimization
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Mark point as visited
        this.visitedPoints.add(pointId);
        this.updateProgressIndicator(pointId);
        
        // Check if all points visited
        if (this.visitedPoints.size === 3) {
            setTimeout(() => {
                this.showRose();
            }, 1000);
        }
        
        // Add modal animation
        const modalContent = this.modal.querySelector('.modal-content');
        modalContent.style.animation = 'modalAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        // Focus management for accessibility
        setTimeout(() => {
            document.getElementById('closeModal').focus();
        }, 100);
    }
    
    closeModal() {
        // Stop modal music
        this.modalMusic.pause();
        this.modalMusic.currentTime = 0;
        this.updatePlayPauseButton(false);
        
        // Resume background music
        this.backgroundMusic.play();
        
        // Hide modal
        this.modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    updateProgressIndicator(pointId) {
        const dot = document.querySelector(`.progress-dot[data-point="${pointId}"]`);
        if (dot) {
            dot.classList.add('visited');
        }
    }
    
    showRose() {
        // Hide instructions
        document.querySelector('.instructions').style.display = 'none';
        
        // Show rose with animation
        this.roseContainer.style.display = 'block';
        this.roseContainer.style.animation = 'loveAppear 1s ease-out';
        
        // Add sparkle effect around rose
        this.addSparkleEffect();
    }
    
    addSparkleEffect() {
        const rose = document.getElementById('rose');
        
        // Create sparkles
        for (let i = 0; i < 25; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #ffeb3b;
                border-radius: 50%;
                pointer-events: none;
                animation: sparkleFloat ${2 + Math.random() * 3}s linear infinite;
                left: ${Math.random() * 120}px;
                top: ${Math.random() * 140}px;
                box-shadow: 0 0 12px rgba(255, 235, 59, 0.8);
                z-index: 5;
            `;
            
            rose.appendChild(sparkle);
        }
        
        // Add sparkle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sparkleFloat {
                0% { opacity: 0; transform: translateY(0) scale(0); }
                10% { opacity: 1; transform: translateY(-15px) scale(1); }
                90% { opacity: 1; transform: translateY(-60px) scale(1); }
                100% { opacity: 0; transform: translateY(-80px) scale(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    explodeRose() {
        const rose = document.getElementById('rose');
        const petals = rose.querySelectorAll('.petal');
        const center = rose.querySelector('.rose-center');
        
        // Stop background music
        this.backgroundMusic.pause();
        
        // Add explosion class
        rose.classList.add('exploding');
        
        // Set random directions for each petal with enhanced physics
        petals.forEach((petal, index) => {
            const angle = (index * 45) * (Math.PI / 180);
            const distance = 250 + Math.random() * 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            // Store initial rotation for animation
            const initialRotation = index * 45;
            petal.style.setProperty('--initial-rotation', `${initialRotation}deg`);
            petal.style.setProperty('--x', `${x}px`);
            petal.style.setProperty('--y', `${y}px`);
            
            // Add individual delay for more realistic explosion
            petal.style.animationDelay = `${Math.random() * 0.2}s`;
        });
        
        // Create explosion particles
        this.createExplosionParticles();
        
        // Show love message after explosion
        setTimeout(() => {
            this.roseContainer.style.display = 'none';
            this.showLoveMessage();
        }, 1200);
    }
    
    createExplosionParticles() {
        const rose = document.getElementById('rose');
        const roseRect = rose.getBoundingClientRect();
        const centerX = roseRect.left + roseRect.width / 2;
        const centerY = roseRect.top + roseRect.height / 2;
        
        // Create explosion particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const colors = ['#dc143c', '#b22222', '#8b0000', '#ffeb3b', '#ff9800'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: ${4 + Math.random() * 6}px;
                height: ${4 + Math.random() * 6}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 25;
                box-shadow: 0 0 10px ${color};
            `;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.setProperty('--px', `${x}px`);
            particle.style.setProperty('--py', `${y}px`);
            
            particle.style.animation = `explosionParticle ${0.8 + Math.random() * 0.4}s ease-out forwards`;
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
        
        // Add explosion particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes explosionParticle {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--px), var(--py)) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showLoveMessage() {
        this.loveMessage.style.display = 'block';
        
        // Play dark romantic music
        const loveMusic = new Audio('2.mp3');
        loveMusic.volume = 0.4;
        loveMusic.play().catch(e => console.log('Love music error:', e));
        
        // Add floating hearts
        this.createFloatingHearts();
        
        // Add fireworks effect
        setTimeout(() => {
            this.createFireworks();
        }, 1000);
    }
    
    createFloatingHearts() {
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = '❤️';
                heart.style.cssText = `
                    position: fixed;
                    font-size: ${20 + Math.random() * 25}px;
                    left: ${Math.random() * 100}vw;
                    top: 100vh;
                    pointer-events: none;
                    z-index: 25;
                    animation: floatHeart ${3 + Math.random() * 2}s linear forwards;
                `;
                
                document.body.appendChild(heart);
                
                // Remove heart after animation
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 6000);
            }, i * 80);
        }
        
        // Add heart floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatHeart {
                0% {
                    opacity: 0;
                    transform: translateY(0) rotate(0deg) scale(0.5);
                }
                10% {
                    opacity: 1;
                    transform: translateY(-20px) rotate(10deg) scale(1);
                }
                90% {
                    opacity: 1;
                    transform: translateY(-100vh) rotate(350deg) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-110vh) rotate(360deg) scale(0.5);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createFireworks() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.style.cssText = `
                    position: fixed;
                    left: ${20 + Math.random() * 60}vw;
                    top: ${20 + Math.random() * 60}vh;
                    pointer-events: none;
                    z-index: 30;
                `;
                
                // Create particles for each firework
                for (let j = 0; j < 12; j++) {
                    const particle = document.createElement('div');
                    const colors = ['#ff1744', '#ffeb3b', '#4caf50', '#03a9f4', '#9c27b0', '#ff9800'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    particle.style.cssText = `
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        background: ${color};
                        border-radius: 50%;
                        animation: fireworkParticle 1.8s ease-out forwards;
                        transform-origin: center;
                        box-shadow: 0 0 15px ${color};
                    `;
                    
                    const angle = (j * 30) * (Math.PI / 180);
                    const distance = 60 + Math.random() * 40;
                    
                    particle.style.setProperty('--fx', `${Math.cos(angle) * distance}px`);
                    particle.style.setProperty('--fy', `${Math.sin(angle) * distance}px`);
                    
                    firework.appendChild(particle);
                }
                
                document.body.appendChild(firework);
                
                // Remove firework after animation
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 2500);
            }, i * 150);
        }
        
        // Add firework particle animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fireworkParticle {
                0% {
                    opacity: 1;
                    transform: translate(0, 0) scale(1);
                }
                50% {
                    opacity: 1;
                    transform: translate(calc(var(--fx) * 0.7), calc(var(--fy) * 0.7)) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(var(--fx), var(--fy)) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the love map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VanGoghLoveMap();
});

// Add additional style for point hover effect
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes pointHover {
        0% { transform: scale(1); }
        100% { transform: scale(1.2); }
    }
`;
document.head.appendChild(additionalStyles);