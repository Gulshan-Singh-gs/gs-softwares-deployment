<script>
  import '../styles/global.css';
  import CookieBanner from '$lib/components/CookieBanner.svelte';
  import AboutModal from '$lib/components/AboutModal.svelte';
  import UserProfilePrompt from '$lib/components/UserProfilePrompt.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  
  // Default title
  let title = 'GS Softwares';
  $: activePage = $page.url.pathname === '/' ? 'home' : $page.url.pathname.split('/')[1];
  
  onMount(() => {
    // Theme Engine
    const saved = localStorage.getItem('gs_theme');
    let isDark = false;
    if (saved) {
      isDark = saved === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.setItem('gs_theme', isDark ? 'dark' : 'light');
    }
    document.documentElement.classList.toggle('dark', isDark);

    // Service worker
    if ('serviceWorker' in navigator) {
      // Unregister any old scoped service workers
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          if (registration.scope.includes('/background_eraser/')) {
            registration.unregister();
          }
        }
      });
      // Register the new global root service worker
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    if (window.GSShell && window.GSIDB) {
      window.GSIDB.open().catch(() => {});
    }
  });
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0F172A" />
  
  <title>{title}</title>
  <meta name="description" content="Remove backgrounds from multiple images at once for free. 100% private, client-side WebAssembly processing. No signups, no watermarks, no server uploads." />
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- WASM Multi-Thread & Hardware Concurrency Engine Initializer -->
  <script>
    window.ort = window.ort || {};
    window.ort.env = window.ort.env || {};
    window.ort.env.wasm = window.ort.env.wasm || {};
    window.ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency || 4, 8);
    window.ort.env.wasm.simd = true;
  </script>
  
  <script src="/background_eraser/gs-pwa-shell.js"></script>
</svelte:head>

<div class="antialiased selection:bg-primary/30" style="background-color: var(--bg-color, #ffffff); color: var(--text-main, #0f172a); min-height: 100vh;">
  <div id="root">
    <slot />
  </div>

  <CookieBanner />
  <AboutModal />
  <UserProfilePrompt />
</div>
