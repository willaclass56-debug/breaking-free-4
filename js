/**
 * Breaking Free - Main JavaScript
 * Black Background Theme with Advanced Interactions
 */

// Global Configuration
const CONFIG = {
    OMNISEND_API_KEY: '68cb7de74a5b0b0d7aa7f517-1Mzk9FGFaQxN1nDPr7mK9MjObrELrBO9YbLn2Aq7GBmXG6zG8J',
    KOFI_URL: 'https://ko-fi.com/s/901892076f',
    SOCIAL_PROOF_INTERVAL: 8000,
    POPUP_DELAYS: {
        scroll: 30000,    // 30 seconds
        exit: 1000,       // 1 second delay for exit intent
        time: 45000       // 45 seconds
    }
};

// Global State
let state = {
    hasOptedIn: false,
    pageStartTime: Date.now(),
    scrollEvents: [],
    ctaClicks: [],
    popupShown: false,
    exitIntentShown: false,
    socialProofTimer: null,
    isReturningVisitor: localStorage.getItem('breaking_free_visitor') === 'true'
};

// Utility Functions
const utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Generate UUID for tracking
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Format time for display
    formatTimeAgo(minutes) {
        if (minutes < 1) return 'just now';
        if (minutes === 1) return '1 minute ago';
        if (minutes < 60) return `${Math.floor(minutes)} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
    },

    // Animate element into view
    animateInView(element, animationClass = 'fadeInUp') {
        element.classList.add('loading');
        element.style.animationName = animationClass;
    },

    // Create glowing effect
    addGlowEffect(element, color = 'red') {
        element.style.boxShadow = `0 0 20px var(--color-${color}-glow)`;
        element.style.transition = 'box-shadow 0.3s ease';
    }
};

// Analytics and Tracking
const analytics = {
    // Initialize tracking
    init() {
        this.setupGoogleAnalytics();
        this.setupFacebookPixel();
        this.trackPageView();
        this.setupScrollTracking();
        this.setupTimeOnPage();
    },

    // Google Analytics setup
    setupGoogleAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: 'Breaking Free - Stop Self Sabotage',
                page_location: window.location.href,
                custom_map: {
                    'custom_parameter_1': 'book_funnel'
                }
            });
        }
    },

    // Facebook Pixel setup
    setupFacebookPixel() {
        if (typeof fbq !== 'undefined') {
            fbq('track', 'ViewContent', {
                content_name: 'Breaking Free Book',
                content_category: 'Self Help',
                content_type: 'product',
                value: 40,
                currency: 'USD'
            });
        }
    },

    // Track page view
    trackPageView() {
        const data = {
            event: 'page_view',
            timestamp: new Date().toISOString(),
            page: 'breaking-free-landing',
            user_id: this.getUserId(),
            session_id: this.getSessionId(),
            is_returning: state.isReturningVisitor
        };
        
        this.sendEvent(data);
    },

    // Setup scroll depth tracking
    setupScrollTracking() {
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const trackScroll = utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('Scroll Depth', `${milestone}%`, scrollPercent);
                    
                    // Show popup at 50% scroll
                    if (milestone === 50 && !state.popupShown) {
                        setTimeout(() => popups.showLeadMagnet(), 2000);
                    }
                }
            });
        }, 250);

        window.addEventListener('scroll', trackScroll);
    },

    // Time on page tracking
    setupTimeOnPage() {
        const milestones = [30, 60, 120, 300]; // seconds
        const tracked = new Set();

        setInterval(() => {
            const timeSpent = Math.floor((Date.now() - state.pageStartTime) / 1000);
            
            milestones.forEach(milestone => {
                if (timeSpent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('Time on Page', `${milestone}s`, timeSpent);
                    
                    // Show popup after 45 seconds
                    if (milestone === 30 && !state.popupShown) {
                        setTimeout(() => popups.showLeadMagnet(), 15000);
                    }
                }
            });
        }, 1000);
    },

    // Track custom events
    trackEvent(action, label, value = null) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'Breaking Free',
                event_label: label,
                value: value
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', action, {
                label: label,
                value: value
            });
        }

        // Local storage for analysis
        const events = JSON.parse(localStorage.getItem('breaking_free_events') || '[]');
        events.push({
            action,
            label,
            value,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('breaking_free_events', JSON.stringify(events.slice(-50)));

        console.log('Event tracked:', { action, label, value });
    },

    // Get or create user ID
    getUserId() {
        let userId = localStorage.getItem('breaking_free_user_id');
        if (!userId) {
            userId = utils.generateUUID();
            localStorage.setItem('breaking_free_user_id', userId);
        }
        return userId;
    },

    // Get or create session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('breaking_free_session_id');
        if (!sessionId) {
            sessionId = utils.generateUUID();
            sessionStorage.setItem('breaking_free_session_id', sessionId);
        }
        return sessionId;
    },

    // Send event to external analytics
    sendEvent(data) {
        // This would typically send to your analytics backend
        console.log('Analytics event:', data);
    }
};

// Email Marketing Integration
const emailMarketing = {
    // Initialize OmniSend integration
    init() {
        this.setupOmniSend();
    },

    // Setup OmniSend API
    setupOmniSend() {
        this.apiKey = CONFIG.OMNISEND_API_KEY;
        this.baseUrl = 'https://api.omnisend.com/v3';
    },

    // Add contact to OmniSend
    async addContact(email, firstName, source, saboteurType = null) {
        try {
            const contactData = {
                email: email,
                firstName: firstName,
                customProperties: {
                    source: source,
                    timestamp: new Date().toISOString(),
                    saboteur_type: saboteurType,
                    funnel_step: 'lead_capture',
                    page_url: window.location.href,
                    user_agent: navigator.userAgent.slice(0, 100)
                },
                tags: [
                    'breaking-free-lead',
                    source,
                    saboteurType ? `saboteur-${saboteurType}` : null
                ].filter(Boolean)
            };

            // Simulate API call (in real implementation, you'd call OmniSend API)
            console.log('Adding contact to OmniSend:', contactData);
            
            // Track successful signup
            analytics.trackEvent('Email Signup', source, 1);
            
            // Mark as opted in
            state.hasOptedIn = true;
            localStorage.setItem('breaking_free_opted_in', 'true');
            
            return { success: true, contactId: utils.generateUUID() };
            
        } catch (error) {
            console.error('Error adding contact:', error);
            analytics.trackEvent('Email Signup Error', source, 0);
            return { success: false, error: error.message };
        }
    },

    // Trigger welcome email sequence
    async triggerWelcomeSequence(email, source) {
        try {
            // This would trigger the email automation in OmniSend
            console.log('Triggering welcome sequence for:', email, 'from:', source);
            
            analytics.trackEvent('Welcome Sequence Triggered', source, 1);
            return { success: true };
            
        } catch (error) {
            console.error('Error triggering welcome sequence:', error);
            return { success: false, error: error.message };
        }
    },

    // Segment contacts
    async segmentContact(email, segment) {
        try {
            console.log('Segmenting contact:', email, 'to segment:', segment);
            
            analytics.trackEvent('Contact Segmented', segment, 1);
            return { success: true };
            
        } catch (error) {
            console.error('Error segmenting contact:', error);
            return { success: false, error: error.message };
        }
    }
};

// Popup Management
const popups = {
    // Initialize popup system
    init() {
        this.setupExitIntent();
        this.setupPopupTriggers();
        this.bindPopupEvents();
    },

    // Setup exit intent detection
    setupExitIntent() {
        let exitIntentTriggered = false;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !exitIntentTriggered && !state.exitIntentShown) {
                exitIntentTriggered = true;
                setTimeout(() => {
                    this.showExitIntent();
                }, CONFIG.POPUP_DELAYS.exit);
            }
        });
    },

    // Setup various popup triggers
    setupPopupTriggers() {
        // Time-based trigger
        setTimeout(() => {
            if (!state.popupShown && !state.hasOptedIn) {
                this.showLeadMagnet();
            }
        }, CONFIG.POPUP_DELAYS.time);
    },

    // Bind popup events
    bindPopupEvents() {
        // Close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Form submissions
        this.bindFormEvents();
    },

    // Bind form events
    bindFormEvents() {
        // Lead magnet forms
        document.querySelectorAll('#leadMagnetForm, #modalLeadForm').forEach(form => {
            form.addEventListener('submit', (e) => this.handleLeadMagnetSubmission(e));
        });

        // Exit intent form
        const exitForm = document.getElementById('exitIntentForm');
        if (exitForm) {
            exitForm.addEventListener('submit', (e) => this.handleExitIntentSubmission(e));
        }
    },

    // Show lead magnet popup
    showLeadMagnet() {
        if (state.popupShown || state.hasOptedIn) return;
        
        const modal = document.getElementById('leadMagnetModal');
        if (modal) {
            modal.classList.add('show');
            state.popupShown = true;
            analytics.trackEvent('Popup Shown', 'Lead Magnet', 1);
            
            // Add dramatic entrance effect
            const content = modal.querySelector('.modal-content');
            utils.addGlowEffect(content, 'gold');
        }
    },

    // Show exit intent popup
    showExitIntent() {
        if (state.exitIntentShown || state.hasOptedIn) return;
        
        const modal = document.getElementById('exitIntentModal');
        if (modal) {
            modal.classList.add('show');
            state.exitIntentShown = true;
            analytics.trackEvent('Popup Shown', 'Exit Intent', 1);
            
            // Add dramatic effect
            const content = modal.querySelector('.modal-content');
            utils.addGlowEffect(content, 'red');
        }
    },

    // Close modal
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            analytics.trackEvent('Popup Closed', modal.id, 1);
        }
    },

    // Handle lead magnet form submission
    async handleLeadMagnetSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const firstName = formData.get('firstName');
        const email = formData.get('email');
        
        if (!this.validateEmail(email)) {
            this.showFormError(form, 'Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Add to email list
            const result = await emailMarketing.addContact(email, firstName, 'lead-magnet');
            
            if (result.success) {
                // Trigger welcome sequence
                await emailMarketing.triggerWelcomeSequence(email, 'lead-magnet');
                
                // Show success message
                this.showSuccessMessage(form);
                
                // Close modal after delay
                setTimeout(() => {
                    this.closeModal(form.closest('.modal'));
                }, 2000);
                
                // Track conversion
                analytics.trackEvent('Lead Conversion', 'Lead Magnet', 1);
                
            } else {
                throw new Error(result.error || 'Signup failed');
            }
            
        } catch (error) {
            console.error('Lead magnet signup error:', error);
            this.showFormError(form, 'Something went wrong. Please try again.');
            
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    // Handle exit intent form submission
    async handleExitIntentSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const firstName = formData.get('firstName');
        const email = formData.get('email');
        
        if (!this.validateEmail(email)) {
            this.showFormError(form, 'Please enter a valid email address');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Add to email list with exit intent tag
            const result = await emailMarketing.addContact(email, firstName, 'exit-intent');
            
            if (result.success) {
                // Segment as high-intent lead
                await emailMarketing.segmentContact(email, 'exit-intent');
                
                // Show success message
                this.showSuccessMessage(form);
                
                // Close modal
                setTimeout(() => {
                    this.closeModal(form.closest('.modal'));
                }, 2000);
                
                // Track conversion
                analytics.trackEvent('Lead Conversion', 'Exit Intent', 1);
                
            } else {
                throw new Error(result.error || 'Signup failed');
            }
            
        } catch (error) {
            console.error('Exit intent signup error:', error);
            this.showFormError(form, 'Something went wrong. Please try again.');
            
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Show form error
    showFormError(form, message) {
        let errorDiv = form.querySelector('.form-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.style.cssText = `
                color: var(--color-red);
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid var(--color-red);
                border-radius: var(--border-radius-md);
                padding: var(--spacing-sm);
                margin-top: var(--spacing-sm);
                text-align: center;
            `;
            form.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        
        // Add shake animation
        errorDiv.style.animation = 'shake 0.5s ease-in-out';
    },

    // Show success message
    showSuccessMessage(form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.style.cssText = `
            color: var(--color-green);
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid var(--color-green);
            border-radius: var(--border-radius-md);
            padding: var(--spacing-sm);
            margin-top: var(--spacing-sm);
            text-align: center;
        `;
        successDiv.innerHTML = '<i class="fas fa-check"></i> Success! Check your email for your free content.';
        
        // Remove form elements
        form.querySelectorAll('.form-group, button').forEach(el => el.style.display = 'none');
        form.appendChild(successDiv);
    }
};

// Social Proof System
const socialProof = {
    // Initialize social proof notifications
    init() {
        this.notifications = [
            { text: 'Sarah M. just purchased Breaking Free', time: 3 },
            { text: 'Michael R. downloaded the free assessment', time: 7 },
            { text: 'Jennifer L. joined 2,847+ readers', time: 12 },
            { text: 'David K. completed the self-sabotage quiz', time: 18 },
            { text: 'Lisa H. got her personalized results', time: 25 },
            { text: 'Robert T. purchased the complete system', time: 31 }
        ];
        
        this.currentIndex = 0;
        this.startNotifications();
    },

    // Start showing notifications
    startNotifications() {
        if (state.socialProofTimer) {
            clearInterval(state.socialProofTimer);
        }
        
        state.socialProofTimer = setInterval(() => {
            this.showNotification();
        }, CONFIG.SOCIAL_PROOF_INTERVAL);
        
        // Show first notification after delay
        setTimeout(() => this.showNotification(), 3000);
    },

    // Show notification
    showNotification() {
        const container = document.getElementById('socialProofNotifications');
        if (!container) return;
        
        const notification = this.notifications[this.currentIndex];
        const notificationEl = this.createNotificationElement(notification);
        
        container.appendChild(notificationEl);
        
        // Show notification
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notificationEl.classList.add('hide');
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 500);
        }, 5000);
        
        // Update index
        this.currentIndex = (this.currentIndex + 1) % this.notifications.length;
    },

    // Create notification element
    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = 'notification';
        div.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="notification-text">
                ${notification.text}
            </div>
            <div class="notification-time">
                ${utils.formatTimeAgo(notification.time)}
            </div>
        `;
        return div;
    }
};

// Navigation System
const navigation = {
    // Initialize navigation
    init() {
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.setupScrollSpy();
        this.setupProgressBar();
    },

    // Setup smooth scrolling
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Track navigation
                    analytics.trackEvent('Navigation', anchor.getAttribute('href'), 1);
                }
            });
        });
    },

    // Setup mobile menu
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                analytics.trackEvent('Mobile Menu', 'Toggle', 1);
            });
            
            // Close menu when clicking on links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    },

    // Setup scroll spy for active navigation
    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        const scrollSpy = utils.throttle(() => {
            const scrollPosition = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100);
        
        window.addEventListener('scroll', scrollSpy);
    },

    // Setup progress bar
    setupProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (!progressBar) return;
        
        const updateProgress = utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }, 50);
        
        window.addEventListener('scroll', updateProgress);
    }
};

// Interactive Elements
const interactions = {
    // Initialize interactive elements
    init() {
        this.setupHoverEffects();
        this.setupClickAnimations();
        this.setupLightbox();
        this.setupFormEnhancements();
        this.setupScrollAnimations();
    },

    // Setup hover effects
    setupHoverEffects() {
        // Card hover effects
        document.querySelectorAll('.saboteur-card, .technique-item, .testimonial-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                utils.addGlowEffect(card, 'gold');
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
                card.style.transform = '';
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (btn.classList.contains('btn-primary')) {
                    utils.addGlowEffect(btn, 'red');
                } else if (btn.classList.contains('btn-secondary')) {
                    utils.addGlowEffect(btn, 'gold');
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.boxShadow = '';
            });
        });
    },

    // Setup click animations
    setupClickAnimations() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Ripple effect
                const ripple = document.createElement('span');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                btn.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });
    },

    // Setup lightbox for images
    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImage');
        const closeBtn = lightbox?.querySelector('.lightbox-close');
        
        if (!lightbox) return;
        
        // Lightbox triggers
        document.querySelectorAll('.book-cover, .author-image').forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('show');
                analytics.trackEvent('Lightbox', 'Open', 1);
            });
        });
        
        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('show');
            analytics.trackEvent('Lightbox', 'Close', 1);
        };
        
        closeBtn?.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) {
                closeLightbox();
            }
        });
    },

    // Setup form enhancements
    setupFormEnhancements() {
        // Real-time validation
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('input', () => {
                const isValid = popups.validateEmail(input.value);
                input.style.borderColor = input.value ? (isValid ? 'var(--color-green)' : 'var(--color-red)') : '';
            });
        });

        // Focus effects
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('focus', () => {
                utils.addGlowEffect(input, 'gold');
            });
            
            input.addEventListener('blur', () => {
                input.style.boxShadow = '';
            });
        });
    },

    // Setup scroll animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    utils.animateInView(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements for animation
        document.querySelectorAll('.section-header, .saboteur-card, .technique-item, .testimonial-card').forEach(el => {
            observer.observe(el);
        });
    }
};

// CTA Tracking
const ctaTracking = {
    // Initialize CTA tracking
    init() {
        this.setupCTATracking();
        this.setupKoFiTracking();
    },

    // Setup CTA button tracking
    setupCTATracking() {
        document.querySelectorAll('a[href*="ko-fi"], .btn[onclick*="trackEvent"]').forEach(cta => {
            cta.addEventListener('click', (e) => {
                const buttonText = cta.textContent.trim();
                const location = this.getCTALocation(cta);
                
                analytics.trackEvent('CTA Click', buttonText, 1);
                analytics.trackEvent('CTA Location', location, 1);
                
                // Facebook Pixel conversion tracking
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'InitiateCheckout', {
                        content_name: 'Breaking Free Book',
                        value: 40,
                        currency: 'USD'
                    });
                }
                
                state.ctaClicks.push({
                    text: buttonText,
                    location: location,
                    timestamp: new Date().toISOString()
                });
                
                console.log('CTA clicked:', buttonText, 'at:', location);
            });
        });
    },

    // Setup Ko-fi specific tracking
    setupKoFiTracking() {
        document.querySelectorAll(`a[href*="${CONFIG.KOFI_URL}"]`).forEach(link => {
            link.addEventListener('click', (e) => {
                analytics.trackEvent('Ko-fi Click', 'Purchase Intent', 40);
                
                // Track high-value conversion event
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Purchase', {
                        content_name: 'Breaking Free Book',
                        value: 40,
                        currency: 'USD'
                    });
                }
                
                // Mark visitor as purchase-interested
                localStorage.setItem('breaking_free_purchase_intent', 'true');
            });
        });
    },

    // Get CTA location context
    getCTALocation(element) {
        const section = element.closest('section');
        if (section) {
            return section.id || 'unknown-section';
        }
        
        const container = element.closest('.hero, .navbar, .footer');
        if (container) {
            return container.className.split(' ')[0];
        }
        
        return 'unknown';
    }
};

// Global Functions (for inline onclick handlers)
function trackEvent(action, label, value = null) {
    analytics.trackEvent(action, label, value);
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('show');
        analytics.trackEvent('Lightbox', 'Open Book Cover', 1);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Breaking Free website loaded successfully');
    
    // Mark as returning visitor
    if (state.isReturningVisitor) {
        console.log('Welcome back! Returning visitor detected.');
    } else {
        localStorage.setItem('breaking_free_visitor', 'true');
    }
    
    // Initialize all systems
    try {
        analytics.init();
        emailMarketing.init();
        popups.init();
        socialProof.init();
        navigation.init();
        interactions.init();
        ctaTracking.init();
        
        console.log('All systems initialized successfully');
        
        // Track successful initialization
        analytics.trackEvent('System', 'Initialized', 1);
        
    } catch (error) {
        console.error('Error initializing systems:', error);
        analytics.trackEvent('System', 'Error', 0);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    const timeSpent = Math.floor((Date.now() - state.pageStartTime) / 1000);
    analytics.trackEvent('Page Unload', 'Time Spent', timeSpent);
    
    // Clean up timers
    if (state.socialProofTimer) {
        clearInterval(state.socialProofTimer);
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        analytics.trackEvent('Page', 'Hidden', Date.now() - state.pageStartTime);
    } else {
        analytics.trackEvent('Page', 'Visible', Date.now() - state.pageStartTime);
        state.pageStartTime = Date.now(); // Reset timer for accurate tracking
    }
});

// Error handling
window.addEventListener('error', (e) => {
    analytics.trackEvent('JavaScript Error', e.message, 1);
    console.error('JavaScript error:', e);
});

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
