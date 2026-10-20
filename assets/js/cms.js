/**
 * SEGUN B. ADEGOKE — OFFICIAL PERSONAL BRAND WEBSITE
 * Executive Content Management System (CMS) & Data Store
 * Supports 6 collections: Biography, Awards, Publications, Trips, Projects, Contact
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'sba_content_override';
  let siteData = null;

  async function loadContent() {
    // Check localStorage first for admin overrides
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        siteData = JSON.parse(local);
        return siteData;
      } catch (e) {
        console.warn('Error reading saved CMS override, falling back to JSON', e);
      }
    }

    try {
      const res = await fetch('data/content.json');
      if (res.ok) {
        siteData = await res.json();
        return siteData;
      }
    } catch (err) {
      console.warn('Could not load data/content.json', err);
    }

    return null;
  }

  function initCMSModal() {
    const dialog = document.getElementById('cmsModal');
    const openBtn = document.getElementById('openCmsBtn');
    if (!dialog) return;

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    // Keyboard shortcut: Ctrl + Alt + A (or Cmd + Option + A)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (dialog.hasAttribute('open')) {
          dialog.close();
        } else {
          openModal();
        }
      }
    });

    const closeBtn = dialog.querySelector('.cms-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }

    // Tab switching
    const tabBtns = dialog.querySelectorAll('.cms-tab-btn');
    const tabPanels = dialog.querySelectorAll('.cms-tab-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => b.classList.remove('active'));
        tabPanels.forEach((p) => (p.style.display = 'none'));

        btn.classList.add('active');
        const targetPanel = dialog.querySelector(`#cms-panel-${targetTab}`);
        if (targetPanel) targetPanel.style.display = 'block';
      });
    });

    // Populate data into forms
    function openModal() {
      populateForm();
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    async function populateForm() {
      if (!siteData) {
        await loadContent();
      }
      if (!siteData) return;

      // Biography
      setVal('cms_bio_intro', siteData.biography?.introduction);
      setVal('cms_bio_early', siteData.biography?.earlyLife);
      setVal('cms_bio_journey', siteData.biography?.professionalJourney);
      setVal('cms_bio_values', siteData.biography?.visionValues);
      setVal('cms_bio_political', siteData.biography?.politicalAcumen);

      // Featured Project
      if (siteData.projects?.items?.[0]) {
        const proj = siteData.projects.items[0];
        setVal('cms_proj_title', proj.title);
        setVal('cms_proj_desc', proj.description);
        setVal('cms_proj_day', proj.dateDayMonth);
        setVal('cms_proj_year', proj.dateYear);
      }

      // Inquiries List
      renderInquiries();
    }

    function setVal(id, val) {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    }

    function renderInquiries() {
      const listEl = document.getElementById('cmsInquiriesList');
      if (!listEl) return;
      try {
        const items = JSON.parse(localStorage.getItem('sba_inquiries') || '[]');
        if (!items.length) {
          listEl.innerHTML = '<p style="color: #69717D; font-size: 0.9rem;">No inquiries received yet.</p>';
          return;
        }
        listEl.innerHTML = items.map((inq, i) => `
          <div style="background: #F7F5F0; padding: 1rem; border-radius: 4px; margin-bottom: 0.75rem; border: 1px solid rgba(16,27,45,0.08);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
              <strong style="color: #101B2D;">${escapeHtml(inq.fullName)}</strong>
              <span style="font-size: 0.75rem; color: #69717D;">${new Date(inq.date).toLocaleDateString()}</span>
            </div>
            <div style="font-size: 0.85rem; color: #B89A60; margin-bottom: 0.5rem;">${escapeHtml(inq.email)} — <em>${escapeHtml(inq.subject)}</em></div>
            <p style="font-size: 0.9rem; color: #20252D; margin: 0;">${escapeHtml(inq.message)}</p>
          </div>
        `).join('');
      } catch (e) {
        listEl.innerHTML = '<p>Error loading inquiries.</p>';
      }
    }

    // Save button
    const saveBtn = document.getElementById('cmsSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (!siteData) return;

        // Update biography
        siteData.biography.introduction = document.getElementById('cms_bio_intro')?.value || siteData.biography.introduction;
        siteData.biography.earlyLife = document.getElementById('cms_bio_early')?.value || siteData.biography.earlyLife;
        siteData.biography.professionalJourney = document.getElementById('cms_bio_journey')?.value || siteData.biography.professionalJourney;
        siteData.biography.visionValues = document.getElementById('cms_bio_values')?.value || siteData.biography.visionValues;
        siteData.biography.politicalAcumen = document.getElementById('cms_bio_political')?.value || siteData.biography.politicalAcumen;

        // Update project
        if (siteData.projects?.items?.[0]) {
          siteData.projects.items[0].title = document.getElementById('cms_proj_title')?.value || siteData.projects.items[0].title;
          siteData.projects.items[0].description = document.getElementById('cms_proj_desc')?.value || siteData.projects.items[0].description;
          siteData.projects.items[0].dateDayMonth = document.getElementById('cms_proj_day')?.value || siteData.projects.items[0].dateDayMonth;
          siteData.projects.items[0].dateYear = document.getElementById('cms_proj_year')?.value || siteData.projects.items[0].dateYear;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
        alert('Changes saved successfully to browser storage. Reloading to reflect changes.');
        window.location.reload();
      });
    }

    // Export JSON button
    const exportBtn = document.getElementById('cmsExportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (!siteData) return;
        const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Reset button
    const resetBtn = document.getElementById('cmsResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all CMS customizations back to the original source-of-truth?')) {
          localStorage.removeItem(STORAGE_KEY);
          alert('Customizations reset. Page will reload.');
          window.location.reload();
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    initCMSModal();
  });

  window.SBACMS = {
    loadContent,
    getData: () => siteData
  };
})();
