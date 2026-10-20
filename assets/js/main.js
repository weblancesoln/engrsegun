/**
 * SEGUN B. ADEGOKE — OFFICIAL PERSONAL BRAND WEBSITE
 * Core Interactions, Navigation, Lightbox & Forms
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Header Scroll Detection
  // ---------------------------------------------------------------------------
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 25) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------------------------------------------------------------------------
  // 2. Accessible Mobile Navigation Drawer
  // ---------------------------------------------------------------------------
  function initMobileDrawer() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const drawer = document.querySelector('.mobile-drawer');
    const backdrop = document.querySelector('.mobile-drawer-backdrop');
    if (!toggle || !drawer || !backdrop) return;

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      // Focus first link in drawer
      const firstLink = drawer.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.focus();
    }

    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Close when clicking nav link inside drawer
    drawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Smooth In-page Scrolling with Offset
  // ---------------------------------------------------------------------------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 90;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Set focus for accessibility
          targetEl.setAttribute('tabindex', '-1');
          targetEl.focus({ preventScroll: true });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Biography Table of Contents Active Highlighting
  // ---------------------------------------------------------------------------
  function initBioToc() {
    const sections = document.querySelectorAll('.bio-section-block');
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!sections.length || !tocLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            tocLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px'
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // ---------------------------------------------------------------------------
  // 5. Fullscreen Lightbox Modal for Galleries
  // ---------------------------------------------------------------------------
  function initLightbox() {
    const dialog = document.getElementById('lightboxModal');
    if (!dialog) return;

    const imageEl = dialog.querySelector('.lightbox-image');
    const captionEl = dialog.querySelector('.lightbox-caption');
    const counterEl = dialog.querySelector('.lightbox-counter');
    const closeBtn = dialog.querySelector('.lightbox-close');
    const prevBtn = dialog.querySelector('.lightbox-prev');
    const nextBtn = dialog.querySelector('.lightbox-next');

    // Collect all gallery items
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (!galleryItems.length) return;

    let currentIndex = 0;

    function showItem(index) {
      if (index < 0) index = galleryItems.length - 1;
      if (index >= galleryItems.length) index = 0;
      currentIndex = index;

      const item = galleryItems[currentIndex];
      const img = item.querySelector('img');
      const captionText = item.getAttribute('data-caption') || img?.alt || 'No Caption';
      const imgSrc = img?.src || '';

      imageEl.src = imgSrc;
      imageEl.alt = captionText;
      captionEl.textContent = captionText;
      if (counterEl) {
        counterEl.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
      }
    }

    galleryItems.forEach((item, idx) => {
      item.addEventListener('click', () => {
        showItem(idx);
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      });

      // Keyboard accessible click via Enter or Space
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showItem(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showItem(currentIndex + 1);
      });
    }

    // Keyboard navigation inside lightbox
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showItem(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showItem(currentIndex + 1);
      }
    });

    // Light dismiss when clicking outside content
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    dialog.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    dialog.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const threshold = 40;
      if (touchEndX < touchStartX - threshold) {
        // Swiped left -> next
        showItem(currentIndex + 1);
      }
      if (touchEndX > touchStartX + threshold) {
        // Swiped right -> prev
        showItem(currentIndex - 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Contact Form Validation & Submission
  // ---------------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const feedback = document.getElementById('formFeedback');

    function showError(message) {
      if (!feedback) return;
      feedback.className = 'form-feedback error';
      feedback.textContent = message;
      feedback.style.display = 'block';
      feedback.setAttribute('role', 'alert');
    }

    function showSuccess(message) {
      if (!feedback) return;
      feedback.className = 'form-feedback success';
      feedback.textContent = message;
      feedback.style.display = 'block';
      feedback.setAttribute('role', 'status');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = (form.querySelector('#fullName')?.value || '').trim();
      const email = (form.querySelector('#emailAddress')?.value || '').trim();
      const subject = (form.querySelector('#subject')?.value || '').trim();
      const message = (form.querySelector('#message')?.value || '').trim();

      // Validation
      if (!fullName) {
        showError('Please enter your full name.');
        form.querySelector('#fullName')?.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        form.querySelector('#emailAddress')?.focus();
        return;
      }

      if (!subject) {
        showError('Please enter a subject for your message.');
        form.querySelector('#subject')?.focus();
        return;
      }

      if (!message || message.length < 10) {
        showError('Please enter a message containing at least 10 characters.');
        form.querySelector('#message')?.focus();
        return;
      }

      // Store inquiry in localStorage
      try {
        const inquiries = JSON.parse(localStorage.getItem('sba_inquiries') || '[]');
        inquiries.push({
          fullName,
          email,
          subject,
          message,
          date: new Date().toISOString()
        });
        localStorage.setItem('sba_inquiries', JSON.stringify(inquiries));
      } catch (err) {
        console.warn('Could not persist message locally', err);
      }

      showSuccess('Thank you. Your message has been received. Our executive office will review your inquiry promptly.');
      form.reset();
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Back to Top Button
  // ---------------------------------------------------------------------------
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Initialize all modules on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileDrawer();
    initSmoothScroll();
    initBioToc();
    initLightbox();
    initContactForm();
    initBackToTop();
  });
})();
