<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>404 — Page Not Found | GS Softwares</title>
</svelte:head>

<div class="error-container">
  <div class="grid-background"></div>
  
  <div class="error-card">
    <div class="status-badge">
      <span class="dot"></span>
      HTTP {$page.status || 404} : ROUTE_NOT_FOUND
    </div>

    <div class="illustration">
      <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="160" height="100" rx="12" stroke="currentColor" stroke-width="2" stroke-dasharray="6 6" class="box-stroke" />
        <path d="M40 40L140 80M140 40L40 80" stroke="var(--accent, #3b82f6)" stroke-width="3" stroke-linecap="round" />
        <circle cx="90" cy="60" r="18" fill="var(--surface, #0f172a)" stroke="currentColor" stroke-width="2" />
        <text x="90" y="65" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">404</text>
      </svg>
    </div>

    <h1 class="error-title">Page Not Found</h1>
    <p class="error-message">
      The web utility or route you requested doesn't exist or was moved in this local session.
    </p>

    <div class="action-row">
      <a href="/" class="btn primary-btn">
        <i class="fas fa-home"></i> Return Home
      </a>
      <a href="/gs-pixels/" class="btn secondary-btn">
        <i class="fas fa-layer-group"></i> Open GS Pixels
      </a>
    </div>
  </div>
</div>

<style>
  .error-container {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 24px;
    overflow: hidden;
  }

  .grid-background {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
    pointer-events: none;
  }

  .error-card {
    position: relative;
    z-index: 10;
    max-width: 500px;
    width: 100%;
    background: var(--surface, #1e293b);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    border-radius: 20px;
    padding: 40px 32px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    font-size: 0.78rem;
    font-weight: 700;
    font-family: monospace;
    letter-spacing: 0.5px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 8px #ef4444;
  }

  .illustration {
    color: var(--text-muted, #94a3b8);
    margin: 8px 0;
  }

  .box-stroke {
    opacity: 0.4;
  }

  .error-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text, #f8fafc);
    margin: 0;
  }

  .error-message {
    font-size: 0.92rem;
    color: var(--text-muted, #94a3b8);
    line-height: 1.5;
    margin: 0;
  }

  .action-row {
    display: flex;
    gap: 12px;
    width: 100%;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 160px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .primary-btn {
    background: var(--accent, #3b82f6);
    color: #ffffff;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }

  .secondary-btn {
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    color: var(--text, #f8fafc);
  }

  .secondary-btn:hover {
    background: var(--surface-raised, rgba(255, 255, 255, 0.1));
    transform: translateY(-2px);
  }
</style>
