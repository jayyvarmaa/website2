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
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target); // Trigger only once
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));
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

    if (!modal) return;

    // Helper: Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        // Clear media content to stop video/audio playback
        setTimeout(() => {
            modalMedia.innerHTML = '';
        }, 300);
    };

    // Helper: Open Modal
    const openModal = (title, desc, mediaHTML, tech, sketchfabId = null) => {
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalMedia.innerHTML = mediaHTML;
        
        if (tech) {
            modalTechWrapper.style.display = 'block';
            modalTech.textContent = tech;
        } else {
            modalTechWrapper.style.display = 'none';
        }

        // Action button for Sketchfab models
        if (sketchfabId) {
            modalActionWrapper.style.display = 'block';
            modalActionWrapper.innerHTML = `
                <a href="https://sketchfab.com/3d-models/${sketchfabId}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
                    <i class="fas fa-external-link-alt" aria-hidden="true"></i> View on Sketchfab
                </a>
            `;
        } else {
            modalActionWrapper.style.display = 'none';
            modalActionWrapper.innerHTML = '';
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
            const name = card.getAttribute('data-name');
            const desc = card.getAttribute('data-desc');
            const tech = card.getAttribute('data-tech');
            const sketchfabId = card.getAttribute('data-sketchfab');
            
            const embedHTML = `<div class="sketchfab-embed-wrapper"><iframe src="https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&internal=1&tracking=0" title="${name}" allow="autoplay; fullscreen; xr-spatial-tracking" execution-while-out-of-viewport execution-while-not-rendered web-share></iframe></div>`;
            
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
        const target = e.target.closest('[title], [data-title]');
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
        const target = e.target.closest('[data-title]');
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
        const response = await fetch('assets/posts_manifest.json');
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

    const first3DModel = galleryGrid.firstElementChild;

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

        if (first3DModel) {
            galleryGrid.insertBefore(card, first3DModel);
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
            for(let i=0; i < post.images.length; i++) {
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

