// ============================================
// PROJECT DATA - Easy to update!
// ============================================
const projects = [
    // GAMES
    {
        id: 'asteroids',
        name: 'Asteroids Game',
        category: 'games',
        description: 'A modern take on the classic Asteroids arcade game. Experience retro gaming with enhanced visuals and smooth controls in this space shooter.',
        image: 'assets/thumbnails/Asterioid Thumbnail.jpg',
        tech: ['Unity', 'C#'],
        links: {
            view: 'https://jayyvarmaa.itch.io/asteroids'
        },
        badge: null,
        featured: false
    },
    {
        id: 'cube-game',
        name: 'Cube Game',
        category: 'games',
        description: 'An exciting 3D cube-based game developed under VarmaBrothers. This engaging project showcases advanced 3D game mechanics and immersive gameplay elements.',
        image: 'assets/thumbnails/cube Thumbnail.jpg',
        tech: ['Unity', 'C#', '3D'],
        links: {
            view: 'https://jayyvarmaa.itch.io/cube'
        },
        badge: null,
        featured: false
    },

    // WEB PROJECTS
    {
        id: 'noan',
        name: 'NoAn!',
        category: 'web',
        description: 'A Chrome extension that disables annotations on YouTube videos. Removes the Share, Watch Later, and iCart buttons that appear when watching YouTube videos in fullscreen mode.',
        image: 'assets/thumbnails/noan Thumbnail.jpg',
        tech: ['JavaScript', 'Chrome API', 'CSS'],
        links: {
            view: 'https://noan.jayvarma.site'
        },
        badge: 'Latest',
        featured: true
    },
    {
        id: 'ransomtype',
        name: 'RansomType',
        category: 'web',
        description: 'A free online tool that transforms your text into random ransom-style newspaper cutout letters. Features live preview, one-click randomization, alignment options, and black-and-white effects.',
        image: 'assets/thumbnails/ransomtype Thumbnail.jpg',
        tech: ['JavaScript', 'HTML', 'CSS'],
        links: {
            view: 'https://ransomtype.jayvarma.site'
        },
        badge: null,
        featured: false
    },
    {
        id: 'portfolio',
        name: 'Portfolio Website',
        category: 'web',
        description: 'This very website! A terminal-themed portfolio with interactive elements, Discord activity integration, and responsive design.',
        image: null,
        livePreview: true,
        tech: ['HTML', 'CSS', 'JavaScript'],
        links: {
            view: 'https://github.com/jayyvarmaa/website'
        },
        badge: null,
        featured: false
    },

    // DATA SCIENCE
    {
        id: 'mnist',
        name: 'MNIST Digit Recognition',
        category: 'datascience',
        description: 'Deep learning model for handwritten digit classification. This interactive notebook demonstrates real-time training and prediction using Scikit-Learn in your browser.',
        image: 'assets/thumbnails/MNIST Thumbnail.jpg',
        tech: ['Python', 'Scikit-Learn', 'NumPy', 'Matplotlib'],
        links: {
            explore: 'global:MNIST_NOTEBOOK_DATA'
        },
        badge: 'ML / AI',
        featured: true,
        demo: false
    }
];

// ============================================
// 3D MODELS DATA - Supports Sketchfab & Local
// ============================================
// ============================================
// 3D MODELS DATA - External Links Only
// ============================================
const models3D = [
    {
        id: 'stylized-house',
        name: 'Stylized House',
        description: 'A low-poly stylized house model with detailed PBR texturing. Features hand-painted textures and optimized geometry for real-time rendering.',
        thumbnail: 'assets/thumbnails/Stylized House Thumbnail.jpg',
        tech: ['3DS Max', 'GLTF'],
        sketchfabUrl: 'https://sketchfab.com/3d-models/stylized-cozy-house-b2abb4b19a9b411790f8a29d490cafe5'
    },
    {
        id: 'buoy',
        name: 'Stylized Buoy',
        description: 'A stylized variation of a buoy, capable of floating in water. Modeled and textured in Blender.',
        thumbnail: 'assets/thumbnails/Buoy Model.jpg',
        tech: ['Blender', 'GLB'],
        sketchfabUrl: 'https://sketchfab.com/3d-models/buoy-model-d4f9bcba737a4beab33518e53025f456'
    },
    {
        id: 'perfume-bottle',
        name: 'Perfume Bottle',
        description: 'A detailed 3D model of a perfume bottle with metal and marble textures. Features normal mapping for realistic surface details.',
        thumbnail: 'assets/thumbnails/perfume.jpg',
        tech: ['Blender', 'GLTF', 'PBR'],
        sketchfabUrl: 'https://sketchfab.com/3d-models/perfume-bottle-38567420de4f456594241367e2bff6d2'
    }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initWarningScreen();
    initNavigation();
    initTypingAnimation();
    initSocialLinks();
    initDeveloperMode();
    initStatsCounter();
    initProjectsGrid();
    initCategoryFilters();
    init3DGallery();
    initCinematicPage();
    connectToLanyard();
});

// ============================================
// WARNING SCREEN
// ============================================
function initWarningScreen() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const warningScreen = document.getElementById('warning-screen');
    const terminalContent = document.querySelector('.terminal-content');
    const topNav = document.querySelector('.top-nav');

    if (isMobile) {
        if (warningScreen) warningScreen.style.display = 'none';
        if (terminalContent) terminalContent.classList.remove('hidden');
        if (topNav) topNav.classList.remove('hidden');
        window.scrollTo(0, 0);
        return;
    }

    if (warningScreen) warningScreen.style.display = 'flex';
    if (terminalContent) terminalContent.classList.add('hidden');
    if (topNav) topNav.classList.add('hidden');

    document.addEventListener('keydown', function (e) {
        if (e.key.toLowerCase() === 'e' && warningScreen && warningScreen.style.display !== 'none') {
            warningScreen.style.display = 'none';
            if (terminalContent) terminalContent.classList.remove('hidden');
            if (topNav) topNav.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    });
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const announcer = document.getElementById('page-announce');

    function showPage(pageId, updateHash = true) {
        const targetPage = pageId.replace('#', '');
        const targetElement = document.getElementById(targetPage + '-page');
        
        if (!targetElement) return;

        // Update links
        navLinks.forEach(nav => {
            if (nav.getAttribute('data-page') === targetPage) {
                nav.classList.add('active');
                nav.setAttribute('aria-current', 'page');
            } else {
                nav.classList.remove('active');
                nav.removeAttribute('aria-current');
            }
        });

        // Update pages
        pages.forEach(page => page.classList.remove('active'));
        targetElement.classList.add('active');

        // Announce for screen readers
        if (announcer) {
            announcer.textContent = targetPage.charAt(0).toUpperCase() + targetPage.slice(1) + ' page loaded';
        }

        // Move focus for accessibility
        const heading = targetElement.querySelector('h1, h2');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
        }

        window.scrollTo(0, 0);

        if (updateHash) {
            history.pushState(null, null, '#' + targetPage);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            showPage(targetPage);
        });
    });

    // Handle initial hash or back/forward buttons
    function handleRouting() {
        const hash = window.location.hash.substring(1) || 'home';
        showPage(hash, false);
    }

    window.addEventListener('popstate', handleRouting);
    
    // Initial load
    handleRouting();
}

// ============================================
// TYPING ANIMATION
// ============================================
function initTypingAnimation() {
    const titleWrapper = document.querySelector('.terminal-title');
    const title = document.querySelector('.terminal-title .underline-text');
    const description = document.querySelector('.terminal-description');

    if (!title || !description || !titleWrapper) return;

    const originalTitle = title.textContent;
    const originalDescription = description.textContent;
    let typingCompleted = false;

    title.textContent = '';
    description.textContent = '';

    let titleIndex = 0;
    function typeTitle() {
        if (titleIndex < originalTitle.length) {
            title.textContent += originalTitle.charAt(titleIndex);
            titleIndex++;
            setTimeout(typeTitle, 60);
        } else {
            setTimeout(typeDescription, 300);
        }
    }

    let descIndex = 0;
    function typeDescription() {
        if (descIndex < originalDescription.length) {
            description.textContent += originalDescription.charAt(descIndex);
            descIndex++;
            setTimeout(typeDescription, 25);
        } else {
            typingCompleted = true;
        }
    }

    setTimeout(typeTitle, 300);
}

// ============================================
// SOCIAL LINKS KEYBOARD NAVIGATION
// ============================================
function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    let currentIndex = -1;

    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % socialLinks.length;
            updateSocialSelection(socialLinks, currentIndex);
        } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
            e.preventDefault();
            currentIndex = currentIndex <= 0 ? socialLinks.length - 1 : currentIndex - 1;
            updateSocialSelection(socialLinks, currentIndex);
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            socialLinks[currentIndex].click();
        }
    });
}

function updateSocialSelection(links, index) {
    links.forEach((link, i) => {
        link.classList.toggle('selected', i === index);
    });
}

// ============================================
// DEVELOPER MODE (7 clicks on name)
// ============================================
function initDeveloperMode() {
    const nameElement = document.getElementById('name-clicker');
    let clickCount = 0;
    let clickTimer = null;

    if (!nameElement) return;

    nameElement.addEventListener('click', function () {
        clickCount++;

        if (clickTimer) clearTimeout(clickTimer);

        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 2000);

        if (clickCount >= 7) {
            activateDeveloperMode();
            clickCount = 0;
        }
    });
}

function activateDeveloperMode() {
    document.body.classList.toggle('developer-mode');

    const isActive = document.body.classList.contains('developer-mode');

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-family: 'Space Mono', monospace;
        z-index: 10000;
        font-size: 0.9rem;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = isActive ? 'Developer Mode: ON' : 'Developer Mode: OFF';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================
// STATS COUNTER ANIMATION
// ============================================
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.dataset.count);
                animateCounter(target, countTo);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 50);
}

// ============================================
// PROJECTS GRID
// ============================================
function initProjectsGrid() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    renderProjects(projects);
}

function renderProjects(projectsToRender) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    projectsToRender.forEach((project, index) => {
        const card = createProjectCard(project, index);
        grid.appendChild(card);
    });
}

function createProjectCard(project, index) {
    const isClickable = !!project.links.view;
    const card = document.createElement(isClickable ? 'a' : 'div');
    card.className = 'project-card';
    card.dataset.category = project.category;
    card.style.animationDelay = `${index * 0.05}s`;

    if (isClickable) {
        card.href = project.links.view;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('aria-label', `View ${project.name} project`);
    }

    const imageSection = document.createElement('div');
    imageSection.className = 'project-image';

    // Add Overlay for clickable cards
    if (isClickable) {
        const overlay = document.createElement('div');
        overlay.className = 'model-card-overlay'; // Reusing the 3D model overlay style
        overlay.innerHTML = '<i class="fas fa-external-link-alt"></i>';
        imageSection.appendChild(overlay);
    }

    if (project.livePreview) {
        // Read stats from home page DOM to stay in sync
        const statEls = document.querySelectorAll('.stat-item');
        const stats = [];
        statEls.forEach(el => {
            const num = el.querySelector('.stat-number')?.getAttribute('data-count') || '0';
            const label = el.querySelector('.stat-label')?.textContent || '';
            stats.push({ num: num + '+', label });
        });

        const preview = document.createElement('div');
        preview.className = 'portfolio-live-preview';
        preview.innerHTML = `
            <div class="plp-scanline"></div>
            <div class="plp-title">Jay Varma</div>
            <div class="plp-subtitle">Game Developer | 3D Artist | Data Scientist</div>
            <div class="plp-stats">
                ${stats.map(s => `<div class="plp-stat"><span class="plp-stat-num">${s.num}</span><span class="plp-stat-label">${s.label}</span></div>`).join('')}
            </div>
            <div class="plp-links">
                <span class="plp-link"><i class="fab fa-linkedin"></i></span>
                <span class="plp-link"><i class="fab fa-github"></i></span>
                <span class="plp-link"><i class="fab fa-instagram"></i></span>
                <span class="plp-link"><i class="fas fa-envelope"></i></span>
            </div>
        `;
        imageSection.appendChild(preview);

        // Add overlay for hover
        const overlay = document.createElement('div');
        overlay.className = 'model-card-overlay';
        overlay.innerHTML = '<i class="fas fa-external-link-alt"></i>';
        imageSection.appendChild(overlay);
    } else if (project.image) {
        const picture = document.createElement('picture');
        // WebP source (if .webp versions exist alongside .jpg)
        const webpSrc = project.image.replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
        const sourceWebP = document.createElement('source');
        sourceWebP.srcset = webpSrc;
        sourceWebP.type = 'image/webp';
        picture.appendChild(sourceWebP);

        const img = document.createElement('img');
        img.src = project.image;
        img.alt = `${project.name} — ${project.description.substring(0, 80)}`;
        img.loading = 'lazy';
        img.width = 400;
        img.height = 225;
        img.decoding = 'async';
        picture.appendChild(img);
        imageSection.appendChild(picture);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'project-image-placeholder';
        placeholder.innerHTML = `
            <i class="fas ${getCategoryIcon(project.category)}"></i>
            <span>${project.name}</span>
        `;
        imageSection.appendChild(placeholder);
    }

    card.appendChild(imageSection);

    const content = document.createElement('div');
    content.className = 'project-content';

    // Filter out 'view' link for buttons if card is clickable
    const linksToRender = Object.entries(project.links).filter(([type]) => !isClickable || type !== 'view');

    content.innerHTML = `
        <div class="project-tags">
            <span class="project-category-tag">${getCategoryLabel(project.category)}</span>
            ${project.badge ? `<span class="project-status-tag">${project.badge}</span>` : ''}
        </div>
        <h3 class="project-name">${project.name}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-card-footer">
            <div class="tech-badges">
                ${project.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
            <div class="project-links">
                ${linksToRender.map(([type, url]) => createLinkButton(type, url, project.name)).join('')}
                ${project.demo ? `<button class="project-link demo-btn" onclick="openAIDemo(event)"><i class="fas fa-play"></i> Live Demo</button>` : ''}
            </div>
        </div>
    `;

    card.appendChild(content);

    // Prevent default on button clicks inside anchor
    if (isClickable) {
        const buttons = content.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // If it's an anchor inside an anchor, browser handles it, but we stop propagation to outer card
            });
        });
    }

    return card;
}

function getCategoryIcon(category) {
    const icons = {
        games: 'fa-gamepad',
        web: 'fa-globe',
        '3d': 'fa-cube',
        cinematic: 'fa-film',
        datascience: 'fa-brain'
    };
    return icons[category] || 'fa-folder';
}

function getCategoryLabel(category) {
    const labels = {
        games: 'Game',
        web: 'Web',
        '3d': '3D',
        cinematic: 'Cinematic',
        datascience: 'Data Science'
    };
    return labels[category] || category;
}

function createLinkButton(type, url, projectName = '') {
    const icons = {
        view: 'fa-external-link-alt',
        github: 'fa-github',
        download: 'fa-download',
        demo: 'fa-play',
        notebook: 'fa-book',
        report: 'fa-file-pdf',
        slides: 'fa-file-powerpoint',
        watch: 'fa-film'
    };

    const labels = {
        view: 'View',
        github: 'GitHub',
        download: 'Download',
        demo: 'Demo',
        notebook: 'Notebook',
        explore: 'Explore',
        report: 'Report',
        slides: 'Slides',
        watch: 'Watch'
    };

    if (type === 'watch') {
        return `
            <button class="project-link cinema-watch-btn" onclick="navigateToPage('${url}')">
                <i class="fas ${icons[type]}"></i>
                ${labels[type]}
            </button>
        `;
    }

    if (type === 'notebook' || type === 'explore') {
        const safeTitle = projectName.replace(/'/g, "\\'"); // simple escape
        const icon = type === 'explore' ? 'fa-rocket' : icons[type];
        return `
            <button class="project-link notebook-btn" onclick="openNotebook('${url}', '${safeTitle}')">
                <i class="fas ${icon}"></i>
                ${labels[type]}
            </button>
        `;
    }

    const isDownload = type === 'download';

    // Determine icon set (Brands vs Solid)
    const isBrand = ['github', 'linkedin', 'instagram', 'twitter', 'discord'].includes(type);
    const iconClass = isBrand ? 'fab' : 'fas';

    return `
        <a href="${url}" 
           class="project-link" 
           ${isDownload ? 'download' : 'target="_blank"'}
           rel="noopener noreferrer"
           aria-label="${labels[type] || type} link for project">
            <i class="${iconClass} ${icons[type] || 'fa-link'}" aria-hidden="true"></i>
            ${labels[type] || type}
        </a>
    `;
}

// ============================================
// CATEGORY FILTERS
// ============================================
function initCategoryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            filterProjects(category);
        });
    });
}

function filterProjects(category) {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach((card, index) => {
        const cardCategory = card.dataset.category;
        const shouldShow = category === 'all' || cardCategory === category;

        if (shouldShow) {
            card.style.display = 'block';
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
            card.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s backwards`;
        } else {
            card.style.display = 'none';
        }
    });
}


// ============================================
// DISCORD ACTIVITY (Lanyard)
// ============================================
let activitiesCache = [];
let ws = null;
let heartbeatInterval = null;
const USER_ID = '745203026335236178';

function connectToLanyard() {
    try {
        ws = new WebSocket('wss://api.lanyard.rest/socket');

        ws.onopen = function () {
            console.log('Connected to Lanyard WebSocket');
        };

        ws.onmessage = function (event) {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };

        ws.onclose = function () {
            console.log('Lanyard WebSocket closed, reconnecting...');
            setTimeout(connectToLanyard, 5000);
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }
        };

        ws.onerror = function (error) {
            console.error('Lanyard WebSocket error:', error);
        };
    } catch (error) {
        console.error('Failed to connect to Lanyard:', error);
    }
}

function handleWebSocketMessage(message) {
    switch (message.op) {
        case 1:
            startHeartbeat(message.d.heartbeat_interval);
            sendInitialize();
            break;
        case 0:
            if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
                activitiesCache = message.d.activities || [];
            }
            break;
    }
}

function startHeartbeat(intervalMs) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);

    heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 3 }));
        }
    }, intervalMs);
}

function sendInitialize() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: USER_ID }
        }));
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatElapsedTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// ============================================
// 3D GALLERY
// ============================================
function init3DGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    models3D.forEach((model, index) => {
        const card = create3DModelCard(model, index);
        grid.appendChild(card);
    });
}

function create3DModelCard(model, index) {
    // Create an anchor tag if it has a URL, otherwise a div
    const card = document.createElement(model.sketchfabUrl ? 'a' : 'div');
    card.className = 'model-card';
    card.style.animationDelay = `${index * 0.05}s`;

    if (model.sketchfabUrl) {
        card.href = model.sketchfabUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
    }

    // Static Thumbnail
    let thumbnailHTML;
    if (model.thumbnail) {
        const webpSrc = model.thumbnail.replace(/\.jpg$/i, '.webp').replace(/\.png$/i, '.webp');
        thumbnailHTML = `<picture>
            <source srcset="${webpSrc}" type="image/webp">
            <img src="${model.thumbnail}" alt="${model.name} — 3D model by Jay Varma" class="model-card-thumbnail" loading="lazy" width="400" height="300" decoding="async">
        </picture>`;
    } else {
        // Fallback placeholder - Cyberpunk Style
        thumbnailHTML = `
            <div class="model-card-thumbnail model-placeholder-cyber">
                <i class="fas fa-cube"></i>
                <span>ASSET::PREVIEW</span>
            </div>
        `;
    }

    // Overlay with Icon
    let overlayIcon = 'fa-external-link-alt';
    const overlayHTML = model.comingSoon
        ? `<div class="model-card-overlay" style="opacity: 1; background: rgba(0,0,0,0.7);"><span style="font-size: 0.9rem;">Coming Soon</span></div>`
        : `<div class="model-card-overlay"><i class="fas ${overlayIcon}"></i></div>`;

    card.innerHTML = `
        ${thumbnailHTML}
        ${overlayHTML}
        <div class="model-info">
            <h3>${model.name}</h3>
            <p>${model.description.substring(0, 80)}${model.description.length > 80 ? '...' : ''}</p>
            <div class="tech-badges">
                ${model.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}
            </div>
        </div>
    `;

    return card;
}

// ============================================
// PAGE NAVIGATION HELPER
// ============================================
function navigateToPage(pageName) {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const announcer = document.getElementById('page-announce');

    navLinks.forEach(nav => {
        nav.classList.remove('active');
        nav.removeAttribute('aria-current');
    });
    pages.forEach(page => page.classList.remove('active'));

    const targetNav = document.querySelector(`.nav-link[data-page="${pageName}"]`);
    const targetPage = document.getElementById(pageName + '-page');

    if (targetNav) {
        targetNav.classList.add('active');
        targetNav.setAttribute('aria-current', 'page');
    }
    if (targetPage) {
        targetPage.classList.add('active');
        if (announcer) {
            announcer.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1) + ' page loaded';
        }
    }
    window.scrollTo(0, 0);
}

// ============================================
// CINEMATIC PAGE (Simple YouTube Embeds)
// ============================================

function initCinematicPage() {
    // Inline link navigation (home page bio links)
    document.querySelectorAll('.cinematic-inline-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateToPage(this.dataset.page);
        });
    });
}


// ============================================
// DICTIONARY SPEAKER BUTTON
// ============================================
(function () {
    const btn = document.getElementById('dict-audio-btn');
    if (!btn) return;

    // Audio source pointed to the provided file
    let audio = null;
    const audioSrc = 'assets/polymath.mp3';

    btn.addEventListener('click', () => {
        if (!audio) {
            audio = new Audio(audioSrc);
            audio.volume = 0.8;
        }
        audio.currentTime = 0;
        audio.play().catch(() => {
            // Audio file not found â€” visual feedback only
        });

        // Visual pulse feedback
        btn.style.transform = 'scale(1.15)';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.style.transform = '';
            btn.style.color = '';
        }, 200);
    });
})();
