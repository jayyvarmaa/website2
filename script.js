// Add warning screen functionality
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced mobile device detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0) ||
                     window.innerWidth <= 768;
    
    console.log('Mobile detected:', isMobile);
    console.log('User Agent:', navigator.userAgent);
    console.log('Screen width:', window.innerWidth);
    console.log('Touch support:', 'ontouchstart' in window);
    
    // Get elements
    const warningScreen = document.getElementById('warning-screen');
    const terminal = document.querySelector('.terminal-content');
    const topNav = document.querySelector('.top-nav');
    
    console.log('Warning screen element:', warningScreen);
    console.log('Terminal element:', terminal);
    console.log('Top nav element:', topNav);
    
    // If on mobile, hide warning screen and show content
    if (isMobile) {
        console.log('Mobile device detected - bypassing warning screen');
        if (warningScreen) warningScreen.style.display = 'none';
        if (terminal) terminal.classList.remove('hidden');
        if (topNav) topNav.classList.remove('hidden');
        return;
    }
    
    // On desktop, show warning screen and hide content initially
    if (warningScreen) {
        console.log('Showing warning screen on desktop');
        warningScreen.style.display = 'flex';
        warningScreen.style.opacity = '1';
        console.log('Warning screen displayed immediately');
    }
    
    // Hide terminal content and top nav initially
    if (terminal) terminal.classList.add('hidden');
    if (topNav) topNav.classList.add('hidden');
    
    // Listen for 'E' key press to hide warning screen
    function handleKeyPress(e) {
        if (e.key.toLowerCase() === 'e' && warningScreen && warningScreen.style.opacity === '1') {
            // Remove the event listener to prevent multiple triggers
            document.removeEventListener('keydown', handleKeyPress);
            
            // Hide warning screen immediately and show content
            warningScreen.style.display = 'none';
            if (terminal) terminal.classList.remove('hidden');
            if (topNav) topNav.classList.remove('hidden');
        }
    }
    
    // Add the event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Handle window resize to ensure mobile detection works even after resize
    window.addEventListener('resize', function() {
        const isMobileAfterResize = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent) ||
                                   ('ontouchstart' in window) ||
                                   (navigator.maxTouchPoints > 0) ||
                                   window.innerWidth <= 768;
        
        if (isMobileAfterResize && warningScreen && warningScreen.style.display !== 'none') {
            console.log('Window resized to mobile - hiding warning screen');
            warningScreen.style.display = 'none';
            if (terminal) terminal.classList.remove('hidden');
            if (topNav) topNav.classList.remove('hidden');
        }
    });
});

// Add 7-click developer mode feature (Android build number style)
document.addEventListener('DOMContentLoaded', function() {
    const nameElement = document.getElementById('name-clicker');
    let clickCount = 0;
    let clickTimer = null;
    let isDeveloperModeActive = false;
    
    if (nameElement) {
        nameElement.addEventListener('click', function() {
            // Don't proceed if developer mode is already active
            if (isDeveloperModeActive) return;
            
            clickCount++;
            
            // Reset the timer every time the user clicks
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            
            // Show countdown only after first click
            if (clickCount === 1) {
                showCountdown();
            }
            
            // Update the countdown text
            if (clickCount < 7) {
                updateCountdown(7 - clickCount);
            } else {
                // 7th click - reload the page
                updateCountdown(0);
                isDeveloperModeActive = true;
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
            
            // Set a timer to reset the counter after 2 seconds of inactivity
            clickTimer = setTimeout(() => {
                hideCountdown();
                clickCount = 0;
            }, 2000);
        });
    }
    
    function showCountdown() {
        // Create countdown element if it doesn't exist
        let countdownElement = document.getElementById('dev-countdown');
        if (!countdownElement) {
            countdownElement = document.createElement('div');
            countdownElement.id = 'dev-countdown';
            countdownElement.style.cssText = `
                position: fixed;
                bottom: 56px;
                left: 0;
                width: 100%;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                color: var(--primary-color);
                opacity: 0.7;
                font-size: 0.9rem;
                text-align: center;
                font-family: 'Space Mono', monospace;
                white-space: nowrap;
                margin-bottom: 4px;
            `;
            document.body.appendChild(countdownElement);
        }
        countdownElement.style.display = 'flex';
    }
    
    function updateCountdown(stepsLeft) {
        const countdownElement = document.getElementById('dev-countdown');
        if (countdownElement) {
            if (stepsLeft > 0) {
                countdownElement.textContent = `${stepsLeft} steps away from unlocking developer mode`;
            } else {
                countdownElement.textContent = 'Developer mode unlocked! Reloading...';
            }
        }
    }
    
    function hideCountdown() {
        const countdownElement = document.getElementById('dev-countdown');
        if (countdownElement) {
            countdownElement.style.display = 'none';
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const titleWrapper = document.querySelector('.terminal-title');
    const title = document.querySelector('.terminal-title .underline-text');
    const description = document.querySelector('.terminal-description');
    let typingCompleted = false;
    
    if (title && description && titleWrapper) {
        const originalTitle = title.textContent;
        const originalDescription = description.textContent;

        function runTypingAnimation() {
            if (typingCompleted) return;

            title.textContent = '';
            description.textContent = '';

            titleWrapper.classList.add('typing-cursor');

            let titleIndex = 0;
            function typeTitle() {
                if (titleIndex < originalTitle.length) {
                    title.textContent += originalTitle.charAt(titleIndex);
                    titleIndex++;
                    setTimeout(typeTitle, 60);
                } else {
                    titleWrapper.classList.remove('typing-cursor');
                    description.classList.add('typing-cursor');
                    setTimeout(typeDescription, 300);
                }
            }

            let descIndex = 0;
            function typeDescription() {
                if (descIndex < originalDescription.length) {
                    description.textContent += originalDescription.charAt(descIndex);
                    descIndex++;
                    setTimeout(typeDescription, 30);
                } else {
                    typingCompleted = true;
                }
            }

            setTimeout(typeTitle, 300);
        }

        runTypingAnimation();
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        // Skip the secret gamer button
        if (link.id === 'gamer-button') return;
        
        link.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            navLinks.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetPage + '-page').classList.add('active');
        });
    });
    
    const socialLinks = document.querySelectorAll('.social-link');
    let currentIndex = -1;
    let selectedIndex = -1;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'Tab') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % socialLinks.length;
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = currentIndex <= 0 ? socialLinks.length - 1 : currentIndex - 1;
            updateSelection();
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            selectedIndex = currentIndex;
            updateSelection();
            setTimeout(() => {
                socialLinks[currentIndex].click();
            }, 100);
        }
    });
    
    socialLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            selectedIndex = index;
            updateSelection();
        });
    });
    
    function updateSelection() {
        socialLinks.forEach((link, index) => {
            if (index === currentIndex || index === selectedIndex) {
                link.classList.add('selected');
            } else {
                link.classList.remove('selected');
            }
        });
    }
    
    socialLinks.forEach((link, index) => {
        link.addEventListener('mouseenter', () => {
            if (selectedIndex !== index) {
                currentIndex = -1;
                updateSelection();
            }
        });
    });
    
    // Add random fun facts rotation
    const funFacts = [
        "Can code for 12+ hours straight when debugging that one elusive bug",
        "Believes that 3 AM is the optimal time for creative coding",
        "Has more game ideas than time to implement them (classic developer problem)",
        "Thinks coffee should be considered a programming language",
        "Still gets excited when a build compiles without errors on the first try",
        "Has memorized more shortcut keys than phone numbers",
        "Once spent 6 hours fixing a bug caused by a single missing semicolon",
        "Believes that all problems can be solved with enough caffeine and determination"
    ];
    
    // Rotate fun facts every 10 seconds
    setInterval(() => {
        const funFactsElement = document.querySelector('.fun-facts ul');
        if (funFactsElement && funFactsElement.children.length > 0) {
            // Get random fact
            const randomIndex = Math.floor(Math.random() * funFacts.length);
            const randomFact = funFacts[randomIndex];
            
            // Update a random list item
            const listItems = funFactsElement.querySelectorAll('li');
            if (listItems.length > 0) {
                const randomListItem = listItems[Math.floor(Math.random() * listItems.length)];
                randomListItem.textContent = randomFact;
            }
        }
    }, 10000);
    
    // Add matrix rain effect to background periodically
    setInterval(() => {
        const terminal = document.querySelector('.terminal');
        if (terminal) {
            terminal.classList.add('matrix-effect');
            setTimeout(() => {
                terminal.classList.remove('matrix-effect');
            }, 2000);
        }
    }, 30000);
});
