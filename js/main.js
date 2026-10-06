/**
 * Jack B. Martin - Academic Website Scripts
 * Provides responsive navigation, language filtering, linguistic subfield filtering,
 * live keyword search, and accessibility features.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const nav = document.getElementById('access');
  const toggleBtn = document.querySelector('.menu-toggle');
  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      nav.classList.toggle('toggled');
      const expanded = nav.classList.contains('toggled');
      toggleBtn.setAttribute('aria-expanded', expanded);
    });
  }

  // 2. Publication Filter & Search System
  const langFilterBtns = document.querySelectorAll('.language-filter-nav .filter-btn');
  const subfieldFilterBtns = document.querySelectorAll('.subfield-filter-nav .subfield-btn');
  const pubItems = document.querySelectorAll('.pub-item');
  const searchInput = document.getElementById('pub-search');
  const languageSections = document.querySelectorAll('.language-section');
  const activeCountEl = document.getElementById('active-pub-count');

  if (pubItems.length > 0) {
    let currentLanguage = 'all';
    let currentSubfield = 'all';
    let currentSearch = '';

    // Function to calculate and update badge counts on subfield and language buttons
    function updateCounts() {
      // Calculate language counts (respecting currentSubfield and search)
      langFilterBtns.forEach(btn => {
        const lang = btn.getAttribute('data-filter');
        if (!lang) return;
        const countSpan = btn.querySelector('.filter-count');
        if (countSpan) {
          let count = 0;
          pubItems.forEach(item => {
            const itemLangs = (item.getAttribute('data-language') || '').toLowerCase().split(' ');
            const itemSubfields = (item.getAttribute('data-subfields') || '').toLowerCase().split(' ');
            const itemText = item.textContent.toLowerCase();

            const matchesLang = (lang === 'all') || itemLangs.includes(lang);
            const matchesSubfield = (currentSubfield === 'all') || itemSubfields.includes(currentSubfield);
            const matchesSearch = !currentSearch || itemText.includes(currentSearch);

            if (matchesLang && matchesSubfield && matchesSearch) count++;
          });
          countSpan.textContent = count;
        }
      });

      // Calculate subfield counts (respecting currentLanguage and search)
      subfieldFilterBtns.forEach(btn => {
        const subfield = btn.getAttribute('data-subfield');
        if (!subfield) return;
        const countSpan = btn.querySelector('.subfield-count');
        if (countSpan) {
          let count = 0;
          pubItems.forEach(item => {
            const itemLangs = (item.getAttribute('data-language') || '').toLowerCase().split(' ');
            const itemSubfields = (item.getAttribute('data-subfields') || '').toLowerCase().split(' ');
            const itemText = item.textContent.toLowerCase();

            const matchesLang = (currentLanguage === 'all') || itemLangs.includes(currentLanguage);
            const matchesSubfield = (subfield === 'all') || itemSubfields.includes(subfield);
            const matchesSearch = !currentSearch || itemText.includes(currentSearch);

            if (matchesLang && matchesSubfield && matchesSearch) count++;
          });
          countSpan.textContent = count;
        }
      });
    }

    function applyFilters() {
      let visibleCount = 0;

      pubItems.forEach(item => {
        const itemLanguages = (item.getAttribute('data-language') || '').toLowerCase().split(' ');
        const itemSubfields = (item.getAttribute('data-subfields') || '').toLowerCase().split(' ');
        const itemText = item.textContent.toLowerCase();

        const matchesLanguage = (currentLanguage === 'all') || itemLanguages.includes(currentLanguage);
        const matchesSubfield = (currentSubfield === 'all') || itemSubfields.includes(currentSubfield);
        const matchesSearch = !currentSearch || itemText.includes(currentSearch);

        if (matchesLanguage && matchesSubfield && matchesSearch) {
          item.style.display = 'flex';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      // Update visibility of language section headers
      languageSections.forEach(section => {
        const sectionLang = (section.getAttribute('data-language') || '').toLowerCase();
        // Check if there are visible items inside this section
        const visibleChildren = section.querySelectorAll('.pub-item:not([style*="display: none"])');
        
        if (currentLanguage === 'all') {
          section.style.display = (visibleChildren.length > 0) ? 'block' : 'none';
        } else {
          section.style.display = (sectionLang === currentLanguage && visibleChildren.length > 0) ? 'block' : 'none';
        }
      });

      if (activeCountEl) {
        activeCountEl.textContent = visibleCount;
      }

      updateCounts();
    }

    // Language Filter Button Handlers
    langFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterVal = btn.getAttribute('data-filter');
        if (filterVal) {
          e.preventDefault();
          langFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentLanguage = filterVal;
          applyFilters();

          if (filterVal !== 'all') {
            const targetSection = document.getElementById(filterVal);
            if (targetSection && targetSection.style.display !== 'none') {
              targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      });
    });

    // Subfield Filter Button Handlers
    subfieldFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subfieldVal = btn.getAttribute('data-subfield');
        if (subfieldVal) {
          e.preventDefault();
          subfieldFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentSubfield = subfieldVal;
          applyFilters();
        }
      });
    });

    // Search Input Handler
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }

    // Initial count calculation and URL hash check
    updateCounts();

    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      const matchingLangBtn = document.querySelector(`.language-filter-nav .filter-btn[data-filter="${hash}"]`);
      if (matchingLangBtn) {
        matchingLangBtn.click();
      } else {
        const matchingSubfieldBtn = document.querySelector(`.subfield-filter-nav .subfield-btn[data-subfield="${hash}"]`);
        if (matchingSubfieldBtn) {
          matchingSubfieldBtn.click();
        }
      }
    }
  }

  // 3. Header Global Search (searches within the site)
  const headerSearchForm = document.getElementById('searchform');
  if (headerSearchForm) {
    headerSearchForm.addEventListener('submit', (e) => {
      const q = headerSearchForm.querySelector('.field').value.trim();
      if (q) {
        window.location.href = `publications.html?q=${encodeURIComponent(q)}`;
        e.preventDefault();
      }
    });
  }

  // 4. Handle ?q= parameter on publications page
  if (window.location.pathname.includes('publications')) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query && searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input'));
    }
  }
});
