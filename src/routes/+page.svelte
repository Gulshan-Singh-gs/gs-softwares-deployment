<script>
  import { onMount } from 'svelte';

  let searchQuery = '';
  let activeCategory = 'all';
  let isDark = false;
  /** @type {any} */
  let deferredInstallPrompt = null;
  let showInstallBanner = false;
  let isOnline = true;
  /** @type {HTMLElement} */
  let tabsContainer;

  const tools = [
    {
      id: 'gs-pixels',
      category: 'image',
      icon: 'fa-layer-group',
      imageIcon: '/favicon.png',
      title: 'GS Pixels',
      description: 'Compress, erase, merge — 100% on your device. No uploads, ever.',
      badge: 'Utility Suite',
      badgeColor: '#08c5e5',
      href: '/gs-pixels/'
    },
    {
      id: 'gs-pdf',
      category: 'document',
      icon: 'fa-file-pdf',
      imageIcon: '/favicon.png',
      title: 'GS PDF',
      description: 'Merge, split, compress, and convert PDFs — 100% on your device.',
      badge: 'Utility Suite',
      badgeColor: '#e74c3c',
      href: '/gs-pdf/'
    },
    {
      id: 'gs-video',
      category: 'video',
      icon: 'fa-video',
      imageIcon: '/favicon.png',
      title: 'GS Video',
      description: 'Trim, compress, and convert videos entirely on your device. Zero uploads.',
      badge: 'Utility Suite',
      badgeColor: '#8e44ad',
      href: '/gs-video/'
    },
    {
      id: 'gs-audio',
      category: 'audio',
      icon: 'fa-music',
      imageIcon: '/favicon.png',
      title: 'Oxide Audio',
      description: 'The ultra-private, in-browser audio workstation. The tape never leaves the machine.',
      badge: 'Utility Suite',
      badgeColor: '#f39c12',
      href: '/gs-audio/'
    },
    {
      id: 'gs-text-editor',
      category: 'document',
      icon: 'fa-pen-nib',
      imageIcon: '/favicon.png',
      title: 'Vellum',
      description: 'Enterprise-grade, privacy-first text editor. Autosaving, fully local.',
      badge: 'Editor',
      badgeColor: '#27ae60',
      href: '/gs-text-editor/'
    }
  ];

  $: filteredTools = tools.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  function initTheme() {
    isDark = document.documentElement.classList.contains('dark');
  }

  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('gs_theme', isDark ? 'dark' : 'light');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', isDark ? '#0F172A' : '#ffffff');
    }
  }

  /**
   * @param {string} cat
   * @param {MouseEvent} ev
   */
  function selectCategory(cat, ev) {
    activeCategory = cat;
    if (ev && ev.target && ev.target instanceof HTMLElement) {
      ev.target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  async function triggerPwaInstall() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showInstallBanner = false;
    }
    deferredInstallPrompt = null;
  }

  onMount(() => {
    initTheme();
    isOnline = navigator.onLine;

    const handleOnline = () => (isOnline = true);
    const handleOffline = () => (isOnline = false);

    /**
     * @param {Event} e
     */
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      showInstallBanner = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    const observer = new MutationObserver(() => initTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      observer.disconnect();
    };
  });
</script>

<div class="neumorphic-scope" data-theme={isDark ? 'dark' : 'light'}>
  {#if !isOnline}
    <div class="offline-banner" role="status" aria-live="polite">
      <i class="fa-solid fa-wifi-slash"></i> You are currently offline. Local WebAssembly utilities remain 100% functional.
    </div>
  {/if}

  <!-- Header Navigation -->
  <header class="app-header">
    <div class="brand-group">
      <div class="neu-card-sm logo-box">
        <img src="/favicon.png" alt="GS Softwares Logo" />
      </div>
      <div>
        <div class="brand-title">GS Softwares</div>
        <p class="brand-subtitle">HIGH-UTILITY MICRO-SAAS SUITE</p>
      </div>
    </div>

    <div class="header-functions">
      <!-- Navigation Tabs -->
      <nav class="nav-tabs" aria-label="Tool Categories" bind:this={tabsContainer}>
        <button class="nav-tab {activeCategory === 'all' ? 'active' : ''}" on:click={(e) => selectCategory('all', e)}>All Tools</button>
        <button class="nav-tab {activeCategory === 'image' ? 'active' : ''}" on:click={(e) => selectCategory('image', e)}>Image Utilities</button>
        <button class="nav-tab {activeCategory === 'dev' ? 'active' : ''}" on:click={(e) => selectCategory('dev', e)}>Developer Suite</button>
        <button class="nav-tab {activeCategory === 'design' ? 'active' : ''}" on:click={(e) => selectCategory('design', e)}>Design Lab</button>
        <button class="nav-tab {activeCategory === 'document' ? 'active' : ''}" on:click={(e) => selectCategory('document', e)}>Document Utilities</button>
        <button class="nav-tab {activeCategory === 'video' ? 'active' : ''}" on:click={(e) => selectCategory('video', e)}>Video Utilities</button>
        <button class="nav-tab {activeCategory === 'audio' ? 'active' : ''}" on:click={(e) => selectCategory('audio', e)}>Audio Utilities</button>
      </nav>

      {#if showInstallBanner && deferredInstallPrompt}
        <button class="pwa-install-btn" on:click={triggerPwaInstall} title="Install App">
          <i class="fa-solid fa-download"></i> Install App
        </button>
      {/if}

      <!-- Theme Switcher -->
      <button class="theme-toggle-btn" title="Toggle Light / Dark Mode" aria-label="Toggle light or dark theme" on:click={toggleTheme}>
        <i class="fa-solid {isDark ? 'fa-sun' : 'fa-moon'}" style="color: {isDark ? '#f59e0b' : '#2563eb'}"></i>
      </button>
    </div>
  </header>

  <!-- Main Container -->
  <main class="main-container">

    <!-- Hero Header -->
    <section class="neu-card hero-section">
      <div class="hero-badge">
        ⚡ 100% Client-Side & Zero Uploads
      </div>
      <h1 class="hero-title">
        High-Performance Web Utilities Suite
      </h1>
      <p class="hero-subtitle">
        Engineered for solopreneurs, developers, and creators. Instant background removal, WebAssembly image optimization, and visual code generators — executed strictly inside your browser.
      </p>

      <!-- Search Bar -->
      <div class="search-container">
        <input type="text" bind:value={searchQuery} class="neu-input search-input" placeholder="Search tools (e.g. eraser, compressor, json)...">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
      </div>
    </section>

    <!-- Top AdSense Banner -->
    <div class="adsense-zone" id="ad-header-slot">
      <span>ADVERTISEMENT</span>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-9081845361192725"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>

    <!-- Tools Grid -->
    <section id="toolsContainer" class="tools-grid">
      {#each filteredTools as t}
        <article class="neu-card tool-item" style="padding: 28px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div class="neu-card-sm" style="width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: {t.badgeColor};">
                {#if t.imageIcon}
                  <img src={t.imageIcon} alt={t.title} style="width: 32px; height: 32px; object-fit: contain;" />
                {:else}
                  <i class="fa-solid {t.icon}"></i>
                {/if}
              </div>
              <span style="font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; box-shadow: var(--shadow-pressed); color: {t.badgeColor}; text-transform: uppercase;">
                {t.badge}
              </span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: var(--text);">{t.title}</h3>
            <p style="font-size: 0.88rem; color: var(--text-dim); line-height: 1.5; margin-bottom: 20px;">
              {t.description}
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); pt: 16px; margin-top: 12px;">
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-dim);">PWA Application</span>
            <a href={t.href} rel="external" class="neu-btn" style="padding: 8px 18px; font-size: 0.85rem; color: var(--accent);">
              Launch App <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>
            </a>
          </div>
        </article>
      {/each}
    </section>

    <!-- In-Article AdSense Banner -->
    <div class="adsense-zone" id="ad-middle-slot" style="margin-top: 48px;">
      <span>SPONSORED CONTENT / ADVERTISEMENT</span>
      <ins class="adsbygoogle"
           style="display:block; text-align:center;"
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-9081845361192725"
           data-ad-slot="9876543210"></ins>
    </div>

  </main>
</div>

<style>
  :global(.neumorphic-scope[data-theme="light"]) {
    --bg: #e0e5ec;
    --card: #e0e5ec;
    --text: #2d3748;
    --text-dim: #718096;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --shadow-flat: 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff;
    --shadow-flat-sm: 4px 4px 10px #a3b1c6, -4px -4px 10px #ffffff;
    --shadow-pressed: inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff;
    --shadow-hover: 12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff;
    --border-subtle: rgba(255, 255, 255, 0.6);
    --ad-bg: rgba(163, 177, 198, 0.15);
  }

  :global(.neumorphic-scope[data-theme="dark"]) {
    --bg: #000000;
    --card: #000000;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --accent: #3b82f6;
    --accent-hover: #60a5fa;
    --shadow-flat: 8px 8px 18px #101216, -8px -8px 18px #20242a;
    --shadow-flat-sm: 4px 4px 10px #101216, -4px -4px 10px #20242a;
    --shadow-pressed: inset 4px 4px 8px #101216, inset -4px -4px 8px #20242a;
    --shadow-hover: 12px 12px 24px #101216, -12px -12px 24px #20242a;
    --border-subtle: rgba(255, 255, 255, 0.05);
    --ad-bg: rgba(16, 18, 22, 0.5);
  }

  /* Custom Neumorphic Scrollbar */
  :global(::-webkit-scrollbar) {
    width: 14px;
    height: 14px;
  }
  :global(::-webkit-scrollbar-track) {
    background: var(--bg);
  }
  :global(::-webkit-scrollbar-thumb) {
    background-color: var(--card);
    border-radius: 10px;
    border: 3px solid var(--bg);
  }
  :global(.neumorphic-scope[data-theme="light"] ::-webkit-scrollbar-thumb) {
    box-shadow: inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff;
  }
  :global(.neumorphic-scope[data-theme="dark"] ::-webkit-scrollbar-thumb) {
    box-shadow: inset 2px 2px 5px #101216, inset -2px -2px 5px #20242a;
  }
  :global(::-webkit-scrollbar-thumb:hover) {
    background-color: var(--text-dim);
  }

  .neumorphic-scope {
    background-color: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .neu-card {
    background: var(--card);
    border-radius: 20px;
    box-shadow: var(--shadow-flat);
    border: 1px solid var(--border-subtle);
  }

  .neu-card-sm {
    background: var(--card);
    border-radius: 14px;
    box-shadow: var(--shadow-flat-sm);
    border: 1px solid var(--border-subtle);
  }

  .neu-btn {
    background: var(--card);
    border-radius: 14px;
    box-shadow: var(--shadow-flat-sm);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--text);
    text-decoration: none;
  }

  .neu-btn:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
  }

  .neu-btn:active {
    box-shadow: var(--shadow-pressed);
    transform: translateY(0);
  }

  .neu-input {
    background: var(--card);
    border-radius: 14px;
    box-shadow: var(--shadow-pressed);
    border: 1px solid var(--border-subtle);
    color: var(--text);
    outline: none;
    padding: 12px 18px;
    font-size: 0.95rem;
  }

  .theme-toggle-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    box-shadow: var(--shadow-flat-sm);
    background: var(--card);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--accent);
  }

  .theme-toggle-btn:active {
    box-shadow: var(--shadow-pressed);
  }

  .adsense-zone {
    background: var(--ad-bg);
    border: 2px dashed rgba(148, 163, 184, 0.25);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 250px;
    color: var(--text-dim);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 24px 0;
  }

  .nav-tab {
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-dim);
    background: transparent;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }

  .nav-tab.active, .nav-tab:hover {
    color: var(--accent);
    box-shadow: var(--shadow-pressed);
  }

  /* Responsive layout styles */
  .app-header {
    padding: 24px 8%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-box {
    width: 44px;
    height: 44px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  .logo-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }

  .brand-title {
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
  }

  .brand-subtitle {
    font-size: 0.75rem;
    color: var(--text-dim);
    font-weight: 600;
  }

  .header-functions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .nav-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 4px 0;
  }

  .nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .nav-tab {
    scroll-snap-align: start;
    white-space: nowrap;
    min-height: 44px;
    padding: 10px 16px;
    font-size: 0.88rem;
    cursor: pointer;
  }

  .theme-toggle-btn {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .main-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px 60px;
    flex: 1;
    width: 100%;
  }

  .hero-section {
    padding: 40px 36px;
    margin-bottom: 32px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    box-shadow: var(--shadow-pressed);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .hero-title {
    font-size: 2.4rem;
    font-weight: 800;
    margin-bottom: 12px;
    color: var(--text);
  }

  .hero-subtitle {
    max-width: 680px;
    margin: 0 auto 28px;
    color: var(--text-dim);
    font-size: 1rem;
    line-height: 1.6;
  }

  .search-container {
    max-width: 520px;
    margin: 0 auto;
    position: relative;
  }

  .search-input {
    width: 100%;
    min-height: 44px;
    padding-left: 44px;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 28px;
    margin-top: 32px;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    .app-header {
      padding: 16px 20px;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .brand-group {
      width: 100%;
    }

    .header-functions {
      flex-direction: row;
      align-items: center;
      width: 100%;
      gap: 12px;
    }

    .main-container {
      padding: 0 16px 40px;
    }

    .hero-section {
      padding: 24px 16px;
    }

    .hero-title {
      font-size: 1.8rem;
    }
  }

  .offline-banner {
    background: #ef4444;
    color: #ffffff;
    text-align: center;
    padding: 8px 16px;
    font-size: 0.82rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pwa-install-btn {
    min-height: 44px;
    padding: 8px 16px;
    background: var(--accent, #2563eb);
    color: #ffffff;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    .tools-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .hero-title {
      font-size: 1.5rem;
    }
  }
</style>
