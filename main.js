// ============================================
// MAIN PORTFOLIO SCRIPTS - Jay Varma
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initDiagnostics();
    initNavigation();
    initScrollAnimations();
    initStatCounters();
    initProjectFilters();
    initMediaModals();
    initLogoLoops();
    initTooltips();
    initLanyardDelay();
    loadPostsIntoGallery();
});

// ============================================
// NAVIGATION & SMOOTH SCROLLING
// ============================================
function initNavigation() {
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Sticky Navigation Class
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        header.classList.toggle('menu-open');
        navMenu.classList.toggle('active');
    });

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            header.classList.remove('menu-open');
            navMenu.classList.remove('active');
        });
    });

    // IntersectionObserver for Active Nav Link Highlight
    const navObserverOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => navObserver.observe(section));
}

// ============================================
// SCROLL-TRIGGERED ENTRY ANIMATIONS
// ============================================
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find all .reveal elements inside the intersecting section
                const reveals = entry.target.querySelectorAll('.reveal');
                reveals.forEach(el => el.classList.add('visible'));
                revealObserver.unobserve(entry.target); // Trigger only once per section
            }
        });
    }, revealObserverOptions);

    sections.forEach(sec => revealObserver.observe(sec));
}

// ============================================
// HERO STAT COUNTERS ANIMATION
// ============================================
function initStatCounters() {
    const statsSection = document.getElementById('stats-container');
    const statNums = document.querySelectorAll('.stat-num');

    if (!statsSection || statNums.length === 0) return;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNums.forEach(animateCounter);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1200; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Easing function: easeOutQuad
        const easeProgress = progress * (2 - progress);
        const currentValue = Math.floor(easeProgress * target);

        element.textContent = currentValue + '+';

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    requestAnimationFrame(updateCounter);
}

// ============================================
// PROJECTS FILTER TABS
// ============================================
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            projectCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');

                if (category === 'all' || cardCat === category) {
                    card.style.display = 'flex';
                    card.classList.remove('animating');
                    void card.offsetWidth; // Force reflow to trigger keyframe animation
                    card.classList.add('animating');
                } else {
                    card.style.display = 'none';
                    card.classList.remove('animating');
                }
            });
        });
    });
}

// ============================================
// LIGHTBOX & MEDIA MODALS
// ============================================
function initMediaModals() {
    const modal = document.getElementById('media-modal');
    const modalTitle = document.getElementById('media-modal-title');
    const modalDesc = document.getElementById('media-modal-desc');
    const modalMedia = document.getElementById('media-modal-wrapper');
    const modalTech = document.getElementById('media-modal-tech');
    const modalTechWrapper = document.getElementById('media-modal-tech-wrapper');
    const modalActionWrapper = document.getElementById('media-modal-action-wrapper');
    const closeBtn = document.getElementById('media-modal-close');
    const modalInfoSection = document.querySelector('.modal-info-section');

    if (!modal || !modalInfoSection) return;

    const originalSidebarHTML = modalInfoSection.innerHTML;

    // Helper: Close Modal
    const closeModal = () => {
        // Run pixel explorer cleanup if active
        if (window.cleanupPixelExplorer) {
            window.cleanupPixelExplorer();
        }

        modal.classList.remove('active');
        modal.classList.remove('is-pixel-explorer');
        modal.classList.remove('is-sketchfab');
        modal.classList.remove('is-post');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Restore sidebar HTML and clear media content
        setTimeout(() => {
            modalMedia.innerHTML = '';
            modalInfoSection.innerHTML = originalSidebarHTML;
        }, 300);
    };

    // Helper: Open Modal
    const openModal = (title, desc, mediaHTML, tech, sketchfabId = null) => {
        // Query elements dynamically to ensure we always get the live DOM elements.
        // This is necessary because the Pixel Explorer overwrites and restores the sidebar HTML,
        // which creates new DOM nodes and disconnects the originally cached ones.
        const liveModalTitle = document.getElementById('media-modal-title');
        const liveModalDesc = document.getElementById('media-modal-desc');
        const liveModalMedia = document.getElementById('media-modal-wrapper');
        const liveModalTech = document.getElementById('media-modal-tech');
        const liveModalTechWrapper = document.getElementById('media-modal-tech-wrapper');
        const liveModalActionWrapper = document.getElementById('media-modal-action-wrapper');

        if (liveModalTitle) liveModalTitle.textContent = title;
        if (liveModalDesc) liveModalDesc.textContent = desc;
        if (liveModalMedia) liveModalMedia.innerHTML = mediaHTML;

        if (tech && liveModalTechWrapper && liveModalTech) {
            liveModalTechWrapper.style.display = 'block';
            liveModalTech.textContent = tech;
        } else if (liveModalTechWrapper) {
            liveModalTechWrapper.style.display = 'none';
        }

        // Action button for Sketchfab models
        if (sketchfabId && liveModalActionWrapper) {
            modal.classList.add('is-sketchfab');
            liveModalActionWrapper.style.display = 'block';
            liveModalActionWrapper.innerHTML = `
                <a href="https://sketchfab.com/3d-models/${sketchfabId}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
                    <i class="fas fa-external-link-alt" aria-hidden="true"></i> View on Sketchfab
                </a>
            `;
        } else if (liveModalActionWrapper) {
            modal.classList.remove('is-sketchfab');
            liveModalActionWrapper.style.display = 'none';
            liveModalActionWrapper.innerHTML = '';
        }

        // Tag modal if it's a Post
        if (title && title.startsWith('Post #')) {
            modal.classList.add('is-post');
        } else {
            modal.classList.remove('is-post');
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    window.openMediaModal = openModal;

    // 3D Model Card Triggers
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.hasAttribute('data-pixel-explorer')) {
                openPixelExplorerInModal();
                return;
            }

            const name = card.getAttribute('data-name');
            const desc = card.getAttribute('data-desc');
            const tech = card.getAttribute('data-tech');
            const sketchfabId = card.getAttribute('data-sketchfab');

            const embedHTML = `<div class="sketchfab-embed-wrapper"><iframe src="https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&internal=1&tracking=0&ui_infos=0&ui_fullscreen=0&ui_share=0&ui_watermark=1" title="${name}" allow="autoplay; fullscreen; xr-spatial-tracking" execution-while-out-of-viewport execution-while-not-rendered web-share></iframe></div>`;

            openModal(name, desc, embedHTML, tech, sketchfabId);
        });
    });

    // Modal Close Listeners
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // PIXEL EXPLORER INTEGRATION LOGIC
    function openPixelExplorerInModal() {
        // ── Asset Database ──
        const ASSET_DATABASE = {
            static: [
                { id: "character", name: "Character", file: "Character image.png", width: 64, height: 64, desc: "A detailed pixel art character sprite." },
                { id: "octopus", name: "Pink Octopus", file: "Pink octopus.png", width: 33, height: 31, desc: "A pink octopus character sprite." },
                { id: "vest", name: "Vest", file: "vest.png", width: 96, height: 32, desc: "A tactical vest equipment sprite." },
                { id: "two_guns", name: "Two Guns", file: "Two guns.png", width: 64, height: 48, desc: "Dual-wielded pixel art firearms." },
                { id: "flare_gun", name: "Flare Gun", file: "Flare gun.png", width: 32, height: 32, desc: "A compact flare gun sprite." },
                { id: "bullet", name: "Bullet", file: "Bullet.png", width: 7, height: 18, desc: "A bullet projectile sprite." },
                { id: "bullet_shell", name: "Bullet Shell", file: "Bullet Shell.png", width: 7, height: 13, desc: "A spent bullet shell casing." },
                { id: "filled_hp", name: "Filled Health Bar", file: "FilledHealth bar.png", width: 87, height: 20, desc: "A filled health bar UI element." },
                { id: "empty_hp", name: "Empty Health Bar", file: "Empty health bar.png", width: 87, height: 20, desc: "An empty health bar UI element." },
                { id: "red_table", name: "Red Table", file: "Red table.png", width: 22, height: 24, desc: "A red table furniture piece." },
                { id: "sword", name: "Sword", file: "Sword.png", width: 33, height: 31, desc: "A pixel art sword weapon." },
                { id: "concrete", name: "Concrete Block", file: "Concrete block.png", width: 32, height: 32, desc: "A tileable concrete block." },
                { id: "acid_drop", name: "Acid Drop", file: "Acid drop.png", width: 32, height: 32, desc: "An acid drop projectile sprite." },
                { id: "stones", name: "Stones", file: "Stones.png", width: 80, height: 29, desc: "Environmental stone tile assets." },
                { id: "cube", name: "Cube", file: "Cube.png", width: 15, height: 22, desc: "A simple isometric cube." }
            ],
            spritesheets: [
                { id: "anim_idle", name: "Idle", thumb: "Idle animation.gif", file: "Idle Sprite sheet.png", width: 64, height: 64, frames: 4, desc: "Character idle animation cycle." },
                { id: "anim_walk", name: "Walk", thumb: "Walk animation.gif", file: "Walk sprite sheet.png", width: 64, height: 64, frames: 4, desc: "Character walking animation cycle." },
                { id: "anim_jump", name: "Jumping", thumb: "Jump animation.gif", file: "Jump Sprite sheet.png", width: 64, height: 64, frames: 4, desc: "Character jump animation cycle." },
                { id: "anim_shooting", name: "Shooting", thumb: "Shoot animation.gif", file: "Shooting sprite sheet.png", width: 64, height: 64, frames: 4, desc: "Character shooting animation cycle." },
                { id: "anim_shiny_gun", name: "Shiny Gun", thumb: "Shiny gun animation.gif", file: "Shiny gun sprite sheet.png", width: 32, height: 32, frames: 5, desc: "Shiny gun animation cycle." },
                { id: "anim_acid_drop", name: "Acid Drop Thing", thumb: "Acid drop animation.gif", file: "Acid drop sprite sheet.png", width: 32, height: 32, frames: 4, desc: "Acid drop animation cycle." }
            ],
            parallax: [
                {
                    id: "scene_full",
                    name: "Full Scene",
                    file: "Parallax thing/thumbnail.png",
                    width: 320,
                    height: 180,
                    desc: "Interactive parallax scene with 5 depth layers. Move your mouse to explore.",
                    isScene: true,
                    layers: [
                        { file: "0.png", depth: 0.05, label: "Sky" },
                        { file: "1.png", depth: 0.12, label: "City Silhouette" },
                        { file: "2.png", depth: 0.20, label: "Underground Base" },
                        { file: "3.png", depth: 0.32, label: "Broken Road" },
                        { file: "4.png", depth: 0.40, label: "Light Pole" }
                    ]
                },
                { id: "layer_0", name: "Sky", file: "Parallax thing/0.png", width: 320, height: 180, desc: "Background sky layer." },
                { id: "layer_1", name: "City Silhouette", file: "Parallax thing/1.png", width: 320, height: 180, desc: "Distant city silhouette layer." },
                { id: "layer_2", name: "Underground Base", file: "Parallax thing/2.png", width: 320, height: 180, desc: "Underground base texture layer." },
                { id: "layer_3", name: "Broken Road", file: "Parallax thing/3.png", width: 320, height: 180, desc: "Main platform layer." },
                { id: "layer_4", name: "Light Pole", file: "Parallax thing/4.png", width: 320, height: 180, desc: "Foreground details layer." }
            ]
        };

        const BASE_PATH = "assets/Posts/Pixelart";

        // ── Inject Layout: Media Section (Left) ──
        modalMedia.innerHTML = `
            <div class="pixel-explorer-wrapper" id="pixel-wrapper">
                <canvas class="pixel-explorer-canvas bg-checker" id="pixel-canvas"></canvas>
                <div class="pixel-explorer-parallax-view bg-checker" id="pixel-parallax" style="display:none;"></div>

                <button class="pixel-explorer-control-btn pixel-explorer-sheet-toggle" id="pixel-btn-toggle-sheet" style="display: none;">
                    <i class="fas fa-search"></i> <span id="pixel-toggle-sheet-text">Explore Sprite Sheet</span>
                </button>

                <div class="pixel-explorer-controls">
                    <button class="pixel-explorer-control-btn" id="pixel-btn-reset" title="Reset View">
                        <i class="fas fa-compress-arrows-alt"></i> Reset
                    </button>
                    <button class="pixel-explorer-control-btn" id="pixel-btn-grid" title="Toggle Pixel Grid">
                        <i class="fas fa-th"></i> Grid
                    </button>

                    <div class="pixel-explorer-bg-switcher">
                        <button class="bg-toggle active" data-bg="bg-checker" title="Checkerboard"></button>
                        <button class="bg-toggle" data-bg="bg-dark" title="Dark"></button>
                        <button class="bg-toggle" data-bg="bg-light" title="Light"></button>
                        <button class="bg-toggle" data-bg="bg-blue" title="Blueprint"></button>
                    </div>

                    <div class="pixel-explorer-slider-group" id="pixel-zoom-slider-group">
                        <span>Zoom</span>
                        <input type="range" class="pixel-explorer-slider" id="pixel-slider-zoom" min="1" max="80" value="8">
                        <span class="pixel-explorer-slider-val" id="pixel-val-zoom">800%</span>
                    </div>
                    <div class="pixel-explorer-slider-group" id="pixel-anim-slider-group" style="display:none;">
                        <button class="pixel-explorer-control-btn" id="pixel-btn-play" title="Play/Pause">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <span>Speed</span>
                        <input type="range" class="pixel-explorer-slider" id="pixel-slider-fps" min="1" max="60" value="8">
                        <span class="pixel-explorer-slider-val" id="pixel-val-fps">8 fps</span>
                    </div>
                    <div class="pixel-explorer-slider-group" id="pixel-parallax-slider-group" style="display:none;">
                        <span><i class="fas fa-mouse-pointer"></i> Move mouse to scroll layers</span>
                    </div>
                </div>
            </div>
        `;

        // ── Inject Layout: Info Section (Right Sidebar) ──
        modalInfoSection.innerHTML = `
            <div class="pixel-explorer-sidebar">
                <div class="modal-header-clean">
                    <h2 class="modal-title">Pixel Art Explorer</h2>
                </div>
                <div class="pixel-explorer-tabs">
                    <button class="pixel-explorer-tab active" data-cat="static">Static</button>
                    <button class="pixel-explorer-tab" data-cat="spritesheets">Sprites</button>
                    <button class="pixel-explorer-tab" data-cat="parallax">Parallax</button>
                </div>
                <ul class="pixel-explorer-list" id="pixel-sidebar-list"></ul>
                <div class="pixel-explorer-detail-panel">
                    <h3 id="pixel-detail-title">Select an asset</h3>
                    <p id="pixel-detail-desc">Choose an item from the list above.</p>
                    <div class="pixel-explorer-detail-meta">
                        <span class="pixel-explorer-detail-badge" id="pixel-detail-tech">PNG</span>
                    </div>
                </div>
            </div>
        `;

        // ── State ──
        let activeTab = "static";
        let currentAsset = null;
        let zoomScale = 8;
        let panX = 0, panY = 0;
        let isDragging = false;
        let dragStartX = 0, dragStartY = 0;
        let showGrid = false;
        let loadedImage = null;
        let animRafId = null;
        let isExploringSheet = false;
        let animFrameIndex = 0;
        let animFps = 8;
        let animLastTime = 0;
        let isAnimPaused = false;
        let parallaxRafId = null;
        let currentParallaxX = 0, currentParallaxY = 0;
        let targetParallaxX = 0, targetParallaxY = 0;

        // Touch state
        let lastTouchDist = 0;
        let lastTouchX = 0, lastTouchY = 0;

        // ── DOM References ──
        const canvas = document.getElementById("pixel-canvas");
        const ctx = canvas.getContext("2d");
        const parallaxContainer = document.getElementById("pixel-parallax");
        const sidebarList = document.getElementById("pixel-sidebar-list");
        const wrapper = document.getElementById("pixel-wrapper");

        const btnReset = document.getElementById("pixel-btn-reset");
        const btnGrid = document.getElementById("pixel-btn-grid");
        const btnToggleSheet = document.getElementById("pixel-btn-toggle-sheet");
        const txtToggleSheet = document.getElementById("pixel-toggle-sheet-text");
        const sliderZoom = document.getElementById("pixel-slider-zoom");
        const valZoom = document.getElementById("pixel-val-zoom");
        const btnPlay = document.getElementById("pixel-btn-play");
        const sliderFps = document.getElementById("pixel-slider-fps");
        const valFps = document.getElementById("pixel-val-fps");
        const zoomGroup = document.getElementById("pixel-zoom-slider-group");
        const animGroup = document.getElementById("pixel-anim-slider-group");
        const parallaxGroup = document.getElementById("pixel-parallax-slider-group");
        const lblTitle = document.getElementById("pixel-detail-title");
        const lblDesc = document.getElementById("pixel-detail-desc");
        const lblTech = document.getElementById("pixel-detail-tech");
        const bgToggles = wrapper.querySelectorAll('.bg-toggle');

        // ── Activate Modal ──
        modal.classList.add('is-pixel-explorer');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // ── Helper: Get effective asset dimensions ──
        const getAssetDims = () => {
            if (activeTab === "spritesheets" && !isExploringSheet && currentAsset) {
                return { w: currentAsset.width, h: currentAsset.height };
            }
            if (loadedImage) {
                return { w: loadedImage.naturalWidth, h: loadedImage.naturalHeight };
            }
            return { w: 1, h: 1 };
        };

        // ── Canvas Sizing ──
        const syncCanvasSize = () => {
            if (!canvas.parentNode) return;
            const rect = canvas.parentNode.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = Math.floor(rect.width);
                canvas.height = Math.floor(rect.height);
            }
        };

        // ── Render Canvas ──
        const renderCanvas = () => {
            if (!loadedImage || (activeTab === "parallax" && currentAsset && currentAsset.isScene)) return;
            syncCanvasSize();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;

            const { w, h } = getAssetDims();

            if (activeTab === "spritesheets" && !isExploringSheet) {
                ctx.drawImage(loadedImage, animFrameIndex * w, 0, w, h, panX, panY, w * zoomScale, h * zoomScale);
            } else {
                ctx.drawImage(loadedImage, panX, panY, w * zoomScale, h * zoomScale);
            }

            if (showGrid && zoomScale >= 4) drawPixelGrid();
        };

        // ── Pixel Grid ──
        const drawPixelGrid = () => {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
            ctx.lineWidth = 0.5;

            const offsetX = ((panX % zoomScale) + zoomScale) % zoomScale;
            const offsetY = ((panY % zoomScale) + zoomScale) % zoomScale;

            for (let x = offsetX; x < canvas.width; x += zoomScale) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = offsetY; y < canvas.height; y += zoomScale) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        // ── Zoom / Pan Utilities ──
        const resetView = () => {
            if (!loadedImage && !(activeTab === "parallax" && currentAsset && currentAsset.isScene)) return;
            syncCanvasSize();
            const { w, h } = getAssetDims();

            // Calculate zoom to fit nicely (fill ~60% of viewport)
            const fitZoomX = (canvas.width * 0.6) / w;
            const fitZoomY = (canvas.height * 0.6) / h;
            zoomScale = Math.max(1, Math.min(80, Math.round(Math.min(fitZoomX, fitZoomY))));

            panX = Math.round((canvas.width - w * zoomScale) / 2);
            panY = Math.round((canvas.height - h * zoomScale) / 2);

            // Snap to pixel grid
            panX = Math.round(panX / zoomScale) * zoomScale;
            panY = Math.round(panY / zoomScale) * zoomScale;

            sliderZoom.value = zoomScale;
            valZoom.textContent = `${zoomScale * 100}%`;
            renderCanvas();
        };

        const clampPan = (rawX, rawY) => {
            const { w, h } = getAssetDims();
            const imgW = w * zoomScale;
            const imgH = h * zoomScale;

            const minX = -imgW + 50;
            const maxX = canvas.width - 50;
            const minY = -imgH + 50;
            const maxY = canvas.height - 50;

            panX = Math.round(Math.max(minX, Math.min(maxX, rawX)) / zoomScale) * zoomScale;
            panY = Math.round(Math.max(minY, Math.min(maxY, rawY)) / zoomScale) * zoomScale;
        };

        const zoomAtPoint = (newZoom, pivotX, pivotY) => {
            const modelX = (pivotX - panX) / zoomScale;
            const modelY = (pivotY - panY) / zoomScale;
            zoomScale = Math.max(1, Math.min(80, newZoom));
            clampPan(pivotX - modelX * zoomScale, pivotY - modelY * zoomScale);
            sliderZoom.value = zoomScale;
            valZoom.textContent = `${zoomScale * 100}%`;
            renderCanvas();
        };

        // ── Animation Loop ──
        const startAnimationLoop = () => {
            if (animRafId) cancelAnimationFrame(animRafId);
            animLastTime = 0;
            const loop = (timestamp) => {
                if (activeTab !== "spritesheets" || isExploringSheet || !currentAsset) return;
                if (!animLastTime) animLastTime = timestamp;
                const delta = timestamp - animLastTime;
                if (delta > 1000 / animFps) {
                    if (!isAnimPaused) {
                        animFrameIndex = (animFrameIndex + 1) % (currentAsset.frames || 1);
                    }
                    animLastTime = timestamp;
                    renderCanvas();
                }
                animRafId = requestAnimationFrame(loop);
            };
            animRafId = requestAnimationFrame(loop);
        };

        // ── Parallax ──
        const loadParallax = (asset) => {
            parallaxContainer.innerHTML = "";
            parallaxContainer.style.position = "relative";
            parallaxContainer.style.overflow = "hidden";

            asset.layers.forEach((layer, idx) => {
                const div = document.createElement("div");
                div.className = "pixel-explorer-parallax-layer";
                div.style.position = "absolute";
                div.style.backgroundImage = `url('${BASE_PATH}/Parallax thing/${layer.file}')`;
                div.style.imageRendering = "pixelated";
                div.style.zIndex = idx + 1;
                div.style.willChange = "transform";
                div.style.transition = "none";
                div.style.transform = "translate3d(0, 0, 0) scale(1.1)";
                div.dataset.depth = layer.depth;

                // Layer 2 is partial-size
                if (layer.file === "2.png") {
                    div.style.width = "50%";
                    div.style.height = "71.11%";
                    div.style.left = "0";
                    div.style.bottom = "0";
                    div.style.top = "auto";
                    div.style.backgroundSize = "100% 100%";
                } else {
                    div.style.width = "100%";
                    div.style.height = "100%";
                    div.style.left = "0";
                    div.style.top = "0";
                    div.style.backgroundSize = "cover";
                    div.style.backgroundPosition = "center";
                }

                layer.el = div;
                parallaxContainer.appendChild(div);
            });

            currentParallaxX = 0;
            currentParallaxY = 0;
            targetParallaxX = 0;
            targetParallaxY = 0;

            const animateParallax = () => {
                if (activeTab !== "parallax" || !currentAsset || !currentAsset.isScene) return;

                currentParallaxX += (targetParallaxX - currentParallaxX) * 0.06;
                currentParallaxY += (targetParallaxY - currentParallaxY) * 0.06;

                asset.layers.forEach(layer => {
                    if (!layer.el) return;
                    const depth = parseFloat(layer.el.dataset.depth || 0.1);
                    const moveX = currentParallaxX * depth;
                    const moveY = currentParallaxY * depth;
                    layer.el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.1)`;
                });

                parallaxRafId = requestAnimationFrame(animateParallax);
            };
            parallaxRafId = requestAnimationFrame(animateParallax);
        };

        const resizeParallax = () => {
            if (activeTab !== "parallax" || !parallaxContainer || !parallaxContainer.parentNode) return;
            const parentRect = parallaxContainer.parentNode.getBoundingClientRect();
            if (parentRect.width === 0 || parentRect.height === 0) return;

            const targetRatio = 16 / 9;
            const parentRatio = parentRect.width / parentRect.height;

            if (parentRatio > targetRatio) {
                parallaxContainer.style.height = `${parentRect.height}px`;
                parallaxContainer.style.width = `${parentRect.height * targetRatio}px`;
            } else {
                parallaxContainer.style.width = `${parentRect.width}px`;
                parallaxContainer.style.height = `${parentRect.width / targetRatio}px`;
            }
            parallaxContainer.style.margin = "auto";
        };

        // ── Tab Selection ──
        const selectTab = (catId) => {
            activeTab = catId;
            document.querySelectorAll(".pixel-explorer-tab").forEach(tab => {
                tab.classList.toggle("active", tab.getAttribute("data-cat") === catId);
            });

            // Stop running animations
            if (animRafId) { cancelAnimationFrame(animRafId); animRafId = null; }
            if (parallaxRafId) { cancelAnimationFrame(parallaxRafId); parallaxRafId = null; }

            // Toggle visibility of controls
            const isParallax = catId === "parallax";
            const isSprites = catId === "spritesheets";

            canvas.style.display = isParallax ? "none" : "block";
            parallaxContainer.style.display = isParallax ? "block" : "none";
            zoomGroup.style.display = isParallax ? "none" : "flex";
            animGroup.style.display = isSprites ? "flex" : "none";
            parallaxGroup.style.display = isParallax ? "flex" : "none";
            if (btnToggleSheet) btnToggleSheet.style.display = isSprites ? "flex" : "none";

            // Populate sidebar list
            sidebarList.innerHTML = "";
            const assets = ASSET_DATABASE[catId];
            assets.forEach(asset => {
                const li = document.createElement("li");
                li.className = "pixel-explorer-item";

                let thumbSrc = "";
                if (catId === "static") {
                    thumbSrc = `${BASE_PATH}/${asset.file}`;
                } else if (catId === "spritesheets") {
                    thumbSrc = `${BASE_PATH}/animations/${asset.thumb}`;
                } else if (catId === "parallax") {
                    thumbSrc = `${BASE_PATH}/${asset.file}`;
                }

                li.innerHTML = `
                    <div class="pixel-explorer-item-thumb"><img src="${thumbSrc}" alt="${asset.name}"></div>
                    <div class="pixel-explorer-item-info">
                        <span class="pixel-explorer-item-name">${asset.name}</span>
                        <span class="pixel-explorer-item-meta">${asset.width}×${asset.height} px</span>
                    </div>
                `;
                li.addEventListener("click", () => selectAsset(asset));
                sidebarList.appendChild(li);
                asset._el = li;
            });

            // Auto-select first asset
            if (assets.length > 0) selectAsset(assets[0]);
        };

        // ── Asset Selection ──
        const selectAsset = (asset) => {
            currentAsset = asset;

            // Highlight in sidebar
            document.querySelectorAll(".pixel-explorer-item").forEach(el => el.classList.remove("active"));
            if (asset._el) asset._el.classList.add("active");

            // Update detail panel
            lblTitle.textContent = asset.name;
            lblDesc.textContent = asset.desc;
            lblTech.textContent = (activeTab === "parallax" && asset.isScene) ? "LAYERED" : "PNG";

            // Reset spritesheet state
            if (activeTab === "spritesheets") {
                isExploringSheet = false;
                isAnimPaused = false;
                if (btnPlay) btnPlay.innerHTML = '<i class="fas fa-pause"></i> Pause';
                if (btnToggleSheet) {
                    btnToggleSheet.style.display = "flex";
                    txtToggleSheet.textContent = "Explore Sprite Sheet";
                }
                animFrameIndex = 0;
                animLastTime = 0;
            }

            // Stop any running loops
            if (animRafId) { cancelAnimationFrame(animRafId); animRafId = null; }
            if (parallaxRafId) { cancelAnimationFrame(parallaxRafId); parallaxRafId = null; }

            // ── Load content based on type ──
            if (activeTab === "parallax" && asset.isScene) {
                canvas.style.display = "none";
                parallaxContainer.style.display = "block";
                zoomGroup.style.display = "none";
                parallaxGroup.style.display = "flex";
                loadParallax(asset);
                setTimeout(resizeParallax, 50);
            } else {
                canvas.style.display = "block";
                parallaxContainer.style.display = "none";
                zoomGroup.style.display = "flex";
                parallaxGroup.style.display = "none";

                let src = "";
                if (activeTab === "static" || (activeTab === "parallax" && !asset.isScene)) {
                    src = `${BASE_PATH}/${asset.file}`;
                } else {
                    src = `${BASE_PATH}/animations/Sprite Sheets/${asset.file}`;
                }

                loadedImage = new Image();
                loadedImage.onload = () => {
                    // Wait a tick for the DOM layout to stabilize after display:block
                    requestAnimationFrame(() => {
                        resetView();
                        if (activeTab === "spritesheets" && !isExploringSheet) {
                            startAnimationLoop();
                        }
                    });
                };
                loadedImage.onerror = () => {
                    console.warn("Pixel Explorer: Failed to load", src);
                };
                loadedImage.src = src;
            }
        };

        // ── Event Binding ──
        const boundHandlers = [];
        const on = (el, evt, fn, opts) => {
            el.addEventListener(evt, fn, opts);
            boundHandlers.push({ el, evt, fn, opts });
        };

        // Background toggles
        bgToggles.forEach(btn => {
            on(btn, "click", () => {
                bgToggles.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const bgClass = btn.getAttribute('data-bg');
                canvas.classList.remove('bg-checker', 'bg-dark', 'bg-light', 'bg-blue');
                parallaxContainer.classList.remove('bg-checker', 'bg-dark', 'bg-light', 'bg-blue');
                if (bgClass) {
                    canvas.classList.add(bgClass);
                    parallaxContainer.classList.add(bgClass);
                }
            });
        });

        // Tab clicks
        document.querySelectorAll(".pixel-explorer-tab").forEach(tab => {
            on(tab, "click", () => selectTab(tab.getAttribute("data-cat")));
        });

        // Zoom slider
        on(sliderZoom, "input", (e) => {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const modelX = (cx - panX) / zoomScale;
            const modelY = (cy - panY) / zoomScale;
            zoomScale = parseInt(e.target.value);
            clampPan(cx - modelX * zoomScale, cy - modelY * zoomScale);
            valZoom.textContent = `${zoomScale * 100}%`;
            renderCanvas();
        });

        // Reset button
        on(btnReset, "click", resetView);

        // Grid toggle
        on(btnGrid, "click", () => {
            showGrid = !showGrid;
            btnGrid.classList.toggle("active", showGrid);
            btnGrid.innerHTML = showGrid
                ? `<i class="fas fa-th"></i> Grid: On`
                : `<i class="fas fa-th"></i> Grid`;
            renderCanvas();
        });

        // Sprite sheet toggle
        if (btnToggleSheet) {
            on(btnToggleSheet, "click", () => {
                isExploringSheet = !isExploringSheet;
                txtToggleSheet.textContent = isExploringSheet ? "View Animation" : "Explore Sprite Sheet";

                if (isExploringSheet) {
                    if (animRafId) { cancelAnimationFrame(animRafId); animRafId = null; }
                }
                resetView();
                if (!isExploringSheet) {
                    animFrameIndex = 0;
                    animLastTime = 0;
                    startAnimationLoop();
                } else {
                    renderCanvas();
                }
            });
        }

        // FPS slider
        if (sliderFps) {
            on(sliderFps, "input", (e) => {
                animFps = parseInt(e.target.value);
                if (valFps) valFps.textContent = `${animFps} fps`;
            });
        }

        // Play/Pause
        if (btnPlay) {
            on(btnPlay, "click", () => {
                isAnimPaused = !isAnimPaused;
                btnPlay.innerHTML = isAnimPaused
                    ? `<i class="fas fa-play"></i> Play`
                    : `<i class="fas fa-pause"></i> Pause`;
            });
        }

        // ── Mouse: Drag to pan ──
        on(canvas, "mousedown", (e) => {
            isDragging = true;
            dragStartX = e.clientX - panX;
            dragStartY = e.clientY - panY;
            canvas.style.cursor = "grabbing";
        });
        on(window, "mouseup", () => {
            isDragging = false;
            canvas.style.cursor = "grab";
        });
        on(canvas, "mousemove", (e) => {
            if (!isDragging) return;
            clampPan(e.clientX - dragStartX, e.clientY - dragStartY);
            renderCanvas();
        });

        // ── Mouse: Scroll to zoom ──
        on(canvas, "wheel", (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const step = zoomScale >= 20 ? 4 : (zoomScale >= 8 ? 2 : 1);
            const newZoom = e.deltaY < 0
                ? Math.min(80, zoomScale + step)
                : Math.max(1, zoomScale - step);

            zoomAtPoint(newZoom, mouseX, mouseY);
        }, { passive: false });

        // ── Touch: Drag + Pinch zoom ──
        on(canvas, "touchstart", (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.hypot(dx, dy);
            }
        }, { passive: true });

        on(canvas, "touchmove", (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isDragging) {
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                clampPan(panX + dx, panY + dy);
                renderCanvas();
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const dist = Math.hypot(dx, dy);
                if (lastTouchDist > 0) {
                    const scale = dist / lastTouchDist;
                    const rect = canvas.getBoundingClientRect();
                    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
                    zoomAtPoint(Math.round(zoomScale * scale), midX, midY);
                }
                lastTouchDist = dist;
            }
        }, { passive: false });

        on(canvas, "touchend", () => {
            isDragging = false;
            lastTouchDist = 0;
        }, { passive: true });

        // ── Parallax mouse tracking ──
        on(parallaxContainer, "mousemove", (e) => {
            if (activeTab !== "parallax" || !currentAsset || !currentAsset.isScene) return;
            const rect = parallaxContainer.getBoundingClientRect();
            targetParallaxX = ((e.clientX - rect.left) / rect.width - 0.5) * 200;
            targetParallaxY = ((e.clientY - rect.top) / rect.height - 0.5) * 100;
        });
        on(parallaxContainer, "mouseleave", () => {
            targetParallaxX = 0;
            targetParallaxY = 0;
        });
        on(parallaxContainer, "touchmove", (e) => {
            if (e.touches.length > 0) {
                const rect = parallaxContainer.getBoundingClientRect();
                targetParallaxX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 200;
                targetParallaxY = ((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 100;
            }
        }, { passive: true });

        // ── Resize handling ──
        const resizeHandler = () => {
            if (activeTab === "parallax") {
                resizeParallax();
            } else if (currentAsset) {
                renderCanvas();
            }
        };
        on(window, "resize", resizeHandler);

        let containerObserver = null;
        if (window.ResizeObserver) {
            containerObserver = new ResizeObserver(() => {
                if (activeTab === "parallax") {
                    resizeParallax();
                } else if (currentAsset && canvas.parentNode) {
                    renderCanvas();
                }
            });
            if (canvas.parentNode) containerObserver.observe(canvas.parentNode);
        }

        // ── Cleanup (called when modal closes) ──
        window.cleanupPixelExplorer = () => {
            if (animRafId) cancelAnimationFrame(animRafId);
            if (parallaxRafId) cancelAnimationFrame(parallaxRafId);
            boundHandlers.forEach(({ el, evt, fn, opts }) => el.removeEventListener(evt, fn, opts));
            boundHandlers.length = 0;
            if (containerObserver) containerObserver.disconnect();
            window.cleanupPixelExplorer = null;
        };

        // ── Boot ──
        selectTab("static");
    }
}

// ============================================
// AUDIO DICTIONARY PRONUNCIATION BUTTON
// ============================================
// Removed unused Audio and Lanyard Status modules per user request.

// ============================================
// DIAGNOSTIC LOGGER & CLIENT REPORT PIPELINE
// ============================================
function initDiagnostics() {
    console.log("=== PORTFOLIO DIAGNOSTICS ===");
    console.log("URL:", window.location.href);
    console.log("Protocol:", window.location.protocol);
    console.log("Secure Context:", window.isSecureContext);
    console.log("Referrer Policy (Meta):", document.querySelector('meta[name="referrer"]')?.content || "none");
    console.log("Document Referrer:", document.referrer || "(empty)");

    const report = {
        url: window.location.href,
        protocol: window.location.protocol,
        secureContext: window.isSecureContext,
        referrer: document.referrer || "(empty)",
        referrerPolicy: document.querySelector('meta[name="referrer"]')?.content || "none",
        userAgent: navigator.userAgent
    };

    // Test connection to youtube-nocookie.com domain
    const nocookieUrl = "https://www.youtube-nocookie.com/embed/o_DbgIUeTB4";
    fetch(nocookieUrl, { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            console.log("YouTube No-Cookie connection: SUCCESS");
            report.youtubeNoCookieConnection = "SUCCESS";
            sendReport(report);
        })
        .catch(err => {
            console.warn("YouTube No-Cookie connection: FAILED", err);
            report.youtubeNoCookieConnection = "FAILED: " + err.message;
            sendReport(report);
        });

    // Test connection to standard youtube.com domain
    const standardUrl = "https://www.youtube.com/embed/o_DbgIUeTB4";
    fetch(standardUrl, { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
            console.log("Standard YouTube connection: SUCCESS");
            report.youtubeStandardConnection = "SUCCESS";
        })
        .catch(err => {
            console.warn("Standard YouTube connection: FAILED", err);
            report.youtubeStandardConnection = "FAILED: " + err.message;
        });
}

function sendReport(rep) {
    if (window.location.protocol.startsWith("http")) {
        fetch("/diagnostics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(rep)
        }).then(res => {
            console.log("Diagnostics report sent to server successfully.");
        }).catch(err => {
            console.warn("Failed to send diagnostics report to dev server:", err);
        });
    } else {
        console.log("Diagnostics report not sent: Page is running locally via file:// protocol.");
    }
}

// ============================================
// LOGOLOOP INFINITE SCROLL COMPONENT
// ============================================
class LogoLoop {
    constructor(element) {
        this.element = element;
        this.track = element.querySelector('.logoloop__track');
        this.originalList = element.querySelector('.logoloop__list');
        if (!this.track || !this.originalList) return;

        // Configuration
        const speedAttr = parseFloat(element.getAttribute('data-speed'));
        this.speed = isNaN(speedAttr) ? 120 : speedAttr;
        if (window.innerWidth <= 768) {
            this.speed *= 3;
        }
        this.direction = element.getAttribute('data-direction') || 'left';

        // Easing config matching React Bits ANIMATION_CONFIG
        this.SMOOTH_TAU = 0.25;
        this.MIN_COPIES = 2;
        this.COPY_HEADROOM = 2;

        // Pause or set custom speed on hover
        const hoverSpeedAttr = element.getAttribute('data-hover-speed');
        this.hoverSpeed = hoverSpeedAttr !== null ? parseFloat(hoverSpeedAttr) : 0;

        this.isVertical = this.direction === 'up' || this.direction === 'down';

        // Physics and tracking state
        this.offset = 0;
        this.velocity = 0;
        this.targetVelocity = this.calculateTargetVelocity();
        this.isHovered = false;
        this.rafId = null;
        this.lastTimestamp = null;
        this.seqSize = 0;
        this.copyCount = this.MIN_COPIES;
        this.clones = [];

        // Binding methods
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);

        this.track.addEventListener('mouseenter', this.handleMouseEnter);
        this.track.addEventListener('mouseleave', this.handleMouseLeave);

        // Responsive tracking
        this.resizeObserver = null;
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(this.updateDimensions);
            this.resizeObserver.observe(this.element);
            this.resizeObserver.observe(this.originalList);
        } else {
            window.addEventListener('resize', this.updateDimensions);
        }

        // Image load tracking (re-calculates dimensions when SVGs finish loading)
        this.initImageLoader();

        // Start animation loop
        this.start();
    }

    calculateTargetVelocity() {
        const magnitude = Math.abs(this.speed);
        let directionMultiplier;
        if (this.isVertical) {
            directionMultiplier = this.direction === 'up' ? 1 : -1;
        } else {
            directionMultiplier = this.direction === 'left' ? 1 : -1;
        }
        const speedMultiplier = this.speed < 0 ? -1 : 1;
        return magnitude * directionMultiplier * speedMultiplier;
    }

    initImageLoader() {
        const images = this.originalList.querySelectorAll('img');
        if (images.length === 0) {
            this.updateDimensions();
            return;
        }
        let remainingImages = images.length;

        images.forEach(img => {
            const item = img.closest('.logoloop__item');

            const handleLoad = () => {
                remainingImages -= 1;
                if (remainingImages === 0) {
                    this.updateDimensions();
                }
            };

            const handleError = () => {
                if (item) {
                    item.style.display = 'none';
                }
                remainingImages -= 1;
                if (remainingImages === 0) {
                    this.updateDimensions();
                }
            };

            if (img.complete) {
                if (img.naturalWidth === 0) {
                    handleError();
                } else {
                    handleLoad();
                }
            } else {
                img.addEventListener('load', handleLoad, { once: true });
                img.addEventListener('error', handleError, { once: true });
            }
        });
    }

    updateDimensions() {
        const containerWidth = this.element.clientWidth || 0;
        const parentHeight = this.element.parentElement ? this.element.parentElement.clientHeight : 0;
        const sequenceRect = this.originalList.getBoundingClientRect();
        const sequenceWidth = sequenceRect.width || 0;
        const sequenceHeight = sequenceRect.height || 0;

        if (this.isVertical) {
            if (parentHeight > 0) {
                const targetHeight = Math.ceil(parentHeight);
                if (this.element.style.height !== `${targetHeight}px`) {
                    this.element.style.height = `${targetHeight}px`;
                }
            }
            if (sequenceHeight > 0) {
                this.seqSize = Math.ceil(sequenceHeight);
                const viewport = this.element.clientHeight || parentHeight || sequenceHeight;
                const copiesNeeded = Math.ceil(viewport / sequenceHeight) + this.COPY_HEADROOM;
                this.adjustClonesCount(Math.max(this.MIN_COPIES, copiesNeeded));
            }
        } else {
            if (sequenceWidth > 0) {
                this.seqSize = Math.ceil(sequenceWidth);
                const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + this.COPY_HEADROOM;
                this.adjustClonesCount(Math.max(this.MIN_COPIES, copiesNeeded));
            }
        }
    }

    adjustClonesCount(targetCopyCount) {
        if (this.copyCount === targetCopyCount) return;

        // Clean up previous clones
        this.clones.forEach(clone => clone.remove());
        this.clones = [];

        // Clone nodes to fill viewport
        for (let i = 1; i < targetCopyCount; i++) {
            const clone = this.originalList.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            // Remove ID to prevent duplicates if any existed
            clone.removeAttribute('id');
            this.track.appendChild(clone);
            this.clones.push(clone);
        }
        this.copyCount = targetCopyCount;
    }

    handleMouseEnter() {
        this.isHovered = true;
    }

    handleMouseLeave() {
        this.isHovered = false;
    }

    start() {
        const animate = (timestamp) => {
            if (this.lastTimestamp === null) {
                this.lastTimestamp = timestamp;
            }

            const deltaTime = Math.max(0, timestamp - this.lastTimestamp) / 1000;
            this.lastTimestamp = timestamp;

            const target = this.isHovered && this.hoverSpeed !== undefined ? this.hoverSpeed : this.targetVelocity;

            // Exponential easing to simulate physical inertia on velocity changes (e.g. hover pause)
            const easingFactor = 1 - Math.exp(-deltaTime / this.SMOOTH_TAU);
            this.velocity += (target - this.velocity) * easingFactor;

            if (this.seqSize > 0) {
                let nextOffset = this.offset + this.velocity * deltaTime;
                nextOffset = ((nextOffset % this.seqSize) + this.seqSize) % this.seqSize;
                this.offset = nextOffset;

                const transformValue = this.isVertical
                    ? `translate3d(0, ${-this.offset}px, 0)`
                    : `translate3d(${-this.offset}px, 0, 0)`;
                this.track.style.transform = transformValue;
            }

            this.rafId = requestAnimationFrame(animate);
        };

        this.rafId = requestAnimationFrame(animate);
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        } else {
            window.removeEventListener('resize', this.updateDimensions);
        }
        this.track.removeEventListener('mouseenter', this.handleMouseEnter);
        this.track.removeEventListener('mouseleave', this.handleMouseLeave);
        this.clones.forEach(clone => clone.remove());
    }
}

function initLogoLoops() {
    const loopElements = document.querySelectorAll('.logoloop');
    loopElements.forEach(el => {
        new LogoLoop(el);
    });
}

// ============================================
// CUSTOM TOOLTIP SYSTEM
// ============================================
function initTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', (e) => {
        // Only show tooltip for skills scroll items
        const target = e.target.closest('.logoloop__item[title], .logoloop__item[data-title]');
        if (!target) return;

        // Move title to data-title to prevent default tooltip
        if (target.hasAttribute('title')) {
            target.setAttribute('data-title', target.getAttribute('title'));
            target.removeAttribute('title');
        }

        const title = target.getAttribute('data-title');
        if (!title) return;

        tooltip.textContent = title;
        tooltip.classList.add('visible');
    });

    document.addEventListener('mousemove', (e) => {
        if (!tooltip.classList.contains('visible')) return;

        const x = e.clientX;
        const y = e.clientY - 15;

        // Horizontal constraint only to keep it centered above cursor
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.logoloop__item[data-title]');
        if (target) {
            tooltip.classList.remove('visible');
        }
    });

    // Dismiss on interaction
    window.addEventListener('scroll', () => tooltip.classList.remove('visible'), { passive: true });
    window.addEventListener('click', () => tooltip.classList.remove('visible'));
}

// ============================================
// LANYARD DELAY INITIALIZATION
// ============================================
function initLanyardDelay() {
    const lanyardContainer = document.getElementById('lanyard-container');
    if (!lanyardContainer) return;

    const hintElement = document.getElementById('lanyard-hint');
    const canvas = document.getElementById('lanyard-canvas');
    let hintTimeoutId = null;
    let hideHintTimeoutId = null;

    // Function to hide hint instantly
    const hideHintInstantly = () => {
        if (hintElement && hintElement.classList.contains('visible')) {
            hintElement.classList.remove('visible');
        }
        // Clear the timeout that would hide it anyway
        if (hideHintTimeoutId) {
            clearTimeout(hideHintTimeoutId);
        }
        // Remove event listeners after hint is hidden
        removeInteractionListeners();
    };

    // Function to add interaction listeners
    const addInteractionListeners = () => {
        if (canvas) {
            canvas.addEventListener('mousedown', hideHintInstantly);
            canvas.addEventListener('touchstart', hideHintInstantly);
        }
    };

    // Function to remove interaction listeners
    const removeInteractionListeners = () => {
        if (canvas) {
            canvas.removeEventListener('mousedown', hideHintInstantly);
            canvas.removeEventListener('touchstart', hideHintInstantly);
        }
    };

    // Wait for GLB to load, then show after 2 seconds
    if (window.lanyardCardLoaded) {
        window.lanyardCardLoaded.then(() => {
            hintTimeoutId = setTimeout(() => {
                lanyardContainer.style.opacity = '1';
                if (hintElement) {
                    hintElement.classList.add('visible');
                    // Add interaction listeners once hint is visible
                    addInteractionListeners();

                    // Hide hint message after 5 seconds of being visible
                    hideHintTimeoutId = setTimeout(() => {
                        hideHintInstantly();
                    }, 5000);
                }
            }, 2000);
        });
    }
}

// ============================================
// DYNAMIC POSTS GALLERY
// ============================================
async function loadPostsIntoGallery() {
    const postsDir = 'assets/Posts';
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    let postsData = [];
    try {
        const response = await fetch('assets/posts_manifest.json?v=' + new Date().getTime());
        postsData = await response.json();
    } catch (e) {
        console.error('Failed to load posts manifest:', e);
        return;
    }

    if (postsData.length === 0) return;

    // Background preloader for instant carousel shuffles - Sequential Tiered Loading
    window._preloadedPostMedia = [];

    (async function sequentialPreload() {
        // Tier 1: Wait for card.glb to finish loading
        if (window.lanyardCardLoaded) {
            await window.lanyardCardLoaded;
        }

        // Helper to strictly load media and wait for completion
        const loadMedia = (src, isVideo) => new Promise((resolve) => {
            if (isVideo) {
                const vid = document.createElement('video');
                vid.preload = 'auto';
                vid.onloadeddata = resolve;
                vid.onerror = resolve; // Resolve anyway to avoid blocking queue
                vid.src = src;
                window._preloadedPostMedia.push(vid);
            } else {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = src;
                window._preloadedPostMedia.push(img);
            }
        });

        // Tier 2: Thumbnail webps are natively handled by HTML parsing priority.

        // Tier 3: All the 0 images (excluding videos as they are handled in tier 4)
        let tier3Batch = [];
        postsData.forEach(post => {
            const file = post.images[0];
            if (file && !file.toLowerCase().endsWith('.mp4')) {
                tier3Batch.push(loadMedia(`${postsDir}/${post.folder}/${file}`, false));
            }
        });
        await Promise.all(tier3Batch);

        // Tier 4: All the videos showcased across all posts
        let tier4Batch = [];
        postsData.forEach(post => {
            post.images.forEach(file => {
                if (file.toLowerCase().endsWith('.mp4')) {
                    tier4Batch.push(loadMedia(`${postsDir}/${post.folder}/${file}`, true));
                }
            });
        });
        await Promise.all(tier4Batch);

        // Tier 5+: All the 1 images, then 2 images, then 3 images, sequentially
        let maxImages = Math.max(...postsData.map(p => p.images.length));
        for (let i = 1; i < maxImages; i++) {
            let batch = [];
            postsData.forEach(post => {
                const file = post.images[i];
                if (file && !file.toLowerCase().endsWith('.mp4')) {
                    batch.push(loadMedia(`${postsDir}/${post.folder}/${file}`, false));
                }
            });
            if (batch.length > 0) {
                await Promise.all(batch);
            }
        }
    })();

    // Insert before the Stylized Cozy House so that Sci-Fi Lever and Pixel Art Explorer stay at the top.
    const insertTarget = document.getElementById('model-house') || galleryGrid.firstElementChild;

    postsData.forEach((post) => {
        // Create the gallery card for the post
        const card = document.createElement('article');
        card.className = 'gallery-card';
        card.setAttribute('data-name', `Post #${post.post_num}`);
        card.setAttribute('data-desc', `A creative post containing ${post.image_count} media items.`);

        // Find the first item to use as thumbnail (usually 0.png, 0.mp4, etc.)
        const firstItem = post.images[0];
        const isVideoThumb = firstItem.endsWith('.mp4');
        const thumbSrc = `${postsDir}/${post.folder}/${firstItem}`;

        let thumbHTML = '';
        if (isVideoThumb) {
            thumbHTML = `<video src="${thumbSrc}" muted autoplay loop playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`;
        } else {
            thumbHTML = `<img src="${thumbSrc}" alt="Post ${post.post_num} thumbnail" loading="lazy" width="400" height="300">`;
        }

        card.innerHTML = `
            <div class="gallery-thumb">
                ${thumbHTML}
            </div>
        `;

        // Click handler to open the modal carousel
        card.addEventListener('click', () => {
            openPostCarouselModal(post, postsDir);
        });

        if (insertTarget) {
            galleryGrid.insertBefore(card, insertTarget);
        } else {
            galleryGrid.appendChild(card);
        }
    });
}

function openPostCarouselModal(post, postsDir) {
    // We will dynamically determine the aspect ratio of the 0th image/video
    const firstItem = post.images[0];
    const firstItemSrc = `${postsDir}/${post.folder}/${firstItem}`;
    const isVideo = firstItem.endsWith('.mp4');

    const buildAndOpenModal = (aspectRatio) => {
        let currentIdx = 0;

        const updateMedia = (container, idx) => {
            const item = post.images[idx];
            const src = `${postsDir}/${post.folder}/${item}`;
            const isVid = item.endsWith('.mp4');

            if (isVid) {
                container.innerHTML = `<video class="modal-carousel-media" src="${src}" autoplay loop playsinline controls></video>`;
            } else {
                container.innerHTML = `<img class="modal-carousel-media" src="${src}" alt="Post media">`;
            }

            const counter = document.getElementById('modal-carousel-counter-text');
            if (counter) counter.textContent = `${idx + 1} / ${post.images.length}`;

            // Update dots
            document.querySelectorAll('.modal-carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === idx);
            });
        };

        let controlsHTML = '';

        if (post.images.length > 1) {
            let dotsHTML = '<div class="modal-carousel-dots">';
            for (let i = 0; i < post.images.length; i++) {
                dotsHTML += `<div class="modal-carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`;
            }
            dotsHTML += '</div>';

            controlsHTML = `
                <div class="modal-carousel-overlay">
                    <div class="modal-carousel-counter" id="modal-carousel-counter-text">1 / ${post.images.length}</div>
                </div>

                <button class="modal-carousel-arrow modal-carousel-prev" id="modal-carousel-prev" aria-label="Previous">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="modal-carousel-arrow modal-carousel-next" id="modal-carousel-next" aria-label="Next">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                
                ${dotsHTML}
            `;
        }

        const carouselHTML = `
            <div class="modal-carousel-container" style="--aspect-ratio: ${aspectRatio};">
                <div id="modal-carousel-content" style="width:100%; height:100%;"></div>
                ${controlsHTML}
            </div>
        `;

        // Use the globally exposed openMediaModal
        if (window.openMediaModal) {
            window.openMediaModal(`Post #${post.post_num}`, `Creative showcase with ${post.image_count} items.`, carouselHTML, null, null);

            // Bind events after modal is populated
            setTimeout(() => {
                const contentContainer = document.getElementById('modal-carousel-content');
                if (!contentContainer) return;

                updateMedia(contentContainer, 0);

                const prevBtn = document.getElementById('modal-carousel-prev');
                const nextBtn = document.getElementById('modal-carousel-next');

                if (prevBtn) {
                    prevBtn.addEventListener('click', () => {
                        currentIdx = (currentIdx - 1 + post.images.length) % post.images.length;
                        updateMedia(contentContainer, currentIdx);
                    });
                }

                if (nextBtn) {
                    nextBtn.addEventListener('click', () => {
                        currentIdx = (currentIdx + 1) % post.images.length;
                        updateMedia(contentContainer, currentIdx);
                    });
                }

                document.querySelectorAll('.modal-carousel-dot').forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        currentIdx = parseInt(e.target.getAttribute('data-idx'));
                        updateMedia(contentContainer, currentIdx);
                    });
                });

                // Keyboard navigation for modal carousel
                const keydownHandler = (e) => {
                    const modal = document.getElementById('media-modal');
                    if (!modal || !modal.classList.contains('active')) {
                        document.removeEventListener('keydown', keydownHandler);
                        return;
                    }
                    if (e.key === 'ArrowLeft') {
                        document.getElementById('modal-carousel-prev')?.click();
                    } else if (e.key === 'ArrowRight') {
                        document.getElementById('modal-carousel-next')?.click();
                    }
                };
                document.addEventListener('keydown', keydownHandler);

            }, 50);
        }
    };

    // Calculate aspect ratio
    if (isVideo) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            const ratio = video.videoWidth / video.videoHeight;
            buildAndOpenModal(ratio);
        };
        video.onerror = () => buildAndOpenModal('16/9');
        video.src = firstItemSrc;
    } else {
        const img = new Image();
        img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            buildAndOpenModal(ratio);
        };
        img.onerror = () => buildAndOpenModal('16/9');
        img.src = firstItemSrc;
    }
}

