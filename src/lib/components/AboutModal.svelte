<script lang="ts">
  import { onMount } from 'svelte';

  let isOpen = false;

  function close() {
    if (window.GSSound) window.GSSound.whoosh();
    isOpen = false;
    document.body.style.overflow = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) close();
  }

  onMount(() => {
    const openHandler = () => {
      if (window.GSSound) window.GSSound.pop();
      isOpen = true;
      document.body.style.overflow = 'hidden';
    };
    window.addEventListener('gs:openAbout', openHandler);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('gs:openAbout', openHandler);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div id="gs-about-backdrop" role="dialog" aria-modal="true" aria-label="About GS Softwares Eraser" on:click={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div id="gs-about-modal">
      <div id="gs-about-modal-inner">
        <button id="gs-about-close" aria-label="Close about modal" on:click={close}>
          <i class="fa-solid fa-xmark"></i>
        </button>
        <h2><i class="fa-solid fa-circle-info" style="color:#00b4d8;margin-right:8px;"></i>About GS Softwares Eraser</h2>
        <p>
          GS Softwares Eraser is a <strong>100% client-side</strong> AI background removal tool
          powered by the ONNX Runtime and WebAssembly SIMD. Every image you process stays entirely
          on your device — no cloud, no servers, no subscriptions.
        </p>
        <p style="margin-top:12px;">
          The AI model runs directly inside your browser using multi-threaded WebAssembly,
          which means it works even without an internet connection once loaded. Your privacy
          is guaranteed by design, not just policy.
        </p>
        <p style="margin-top:12px;font-size:12px;color:#94a3b8;">
          &copy; 2026 GS Softwares Hub &bull; <a href="../privacy.html" style="color:#00b4d8;text-decoration:underline;">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  #gs-about-backdrop {
    display: flex;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 9999;
    align-items: flex-end;
    justify-content: center;
    animation: gs-fade-in 0.2s ease forwards;
  }
  #gs-about-modal {
    background: #fff;
    border-radius: 24px 24px 0 0;
    padding: 32px 28px 48px;
    max-width: 640px;
    width: 100%;
    animation: gs-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    max-height: 80vh;
    overflow-y: auto;
  }
  :global(.dark) #gs-about-modal {
    background: #1e293b;
    color: #e2e8f0;
  }
  #gs-about-modal h2 {
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 12px;
    color: #0f172a;
  }
  :global(.dark) #gs-about-modal h2 { color: #f1f5f9; }
  #gs-about-modal p {
    font-size: 14px;
    line-height: 1.7;
    color: #475569;
  }
  :global(.dark) #gs-about-modal p { color: #94a3b8; }
  #gs-about-close {
    position: absolute;
    top: 16px; right: 20px;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 15px;
    color: #64748b;
  }
  #gs-about-modal-inner { position: relative; }

  @keyframes gs-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes gs-slide-up {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
</style>
