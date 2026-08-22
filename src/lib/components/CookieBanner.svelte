<script>
  import { onMount } from 'svelte';

  let showBanner = false;

  onMount(() => {
    if (!localStorage.getItem('gs_cookie_consent')) {
      showBanner = true;
    }
  });

  function accept() {
    if (window.GSSound) window.GSSound.pop();
    localStorage.setItem('gs_cookie_consent', 'accepted');
    showBanner = false;
  }

  function decline() {
    if (window.GSSound) window.GSSound.whoosh();
    localStorage.setItem('gs_cookie_consent', 'declined');
    showBanner = false;
  }
</script>

{#if showBanner}
  <div id="gs-cookie-banner" role="dialog" aria-label="Cookie consent">
    <p>
      <strong class="text-white">🍪 We value your privacy.</strong>
      We use minimal, non-tracking cookies solely to keep this tool functional and free.
      Your images are <strong class="text-[#00b4d8]">never uploaded</strong> anywhere.
    </p>
    <div class="gs-cookie-btns">
      <button id="gs-cookie-decline" aria-label="Decline cookies" on:click={decline}>Decline</button>
      <button id="gs-cookie-accept" aria-label="Accept cookies" on:click={accept}>Accept All</button>
    </div>
  </div>
{/if}

<style>
  #gs-cookie-banner {
    position: fixed;
    bottom: 64px; left: 0; right: 0;
    background: #0f172a;
    color: #e2e8f0;
    z-index: 8999;
    padding: 16px 20px;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
    border-top: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: gs-slide-up 0.3s ease forwards;
  }
  @media (min-width: 640px) {
    #gs-cookie-banner {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 16px 32px;
    }
  }
  #gs-cookie-banner p {
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
  }
  #gs-cookie-banner .gs-cookie-btns {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }
  #gs-cookie-banner button {
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    min-height: 44px;
    min-width: 80px;
  }
  #gs-cookie-decline {
    background: #1e293b;
    color: #94a3b8;
  }
  #gs-cookie-decline:hover { background: #334155; color: #fff; }
  #gs-cookie-accept {
    background: #00b4d8;
    color: #fff;
  }
  #gs-cookie-accept:hover { background: #0284c7; }

  @keyframes gs-slide-up {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
</style>
