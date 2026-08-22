<script lang="ts">
  import { onMount } from 'svelte';

  let showPrompt = false;
  let username = '';

  const updateUsernameDisplays = (name: string) => {
    const displays = document.querySelectorAll('#dashboard-username, .user-name-display');
    displays.forEach(el => el.textContent = name || 'Creator');
  };

  onMount(() => {
    const savedName = localStorage.getItem('gs_username');
    if (savedName) {
      updateUsernameDisplays(savedName);
    } else {
      updateUsernameDisplays('Creator');
    }
  });

  function handleSubmit() {
    const name = username.trim() || 'Creator';
    localStorage.setItem('gs_username', name);
    updateUsernameDisplays(name);
    
    if (window.GSSound) window.GSSound.pop();
    
    showPrompt = false;
  }
</script>

{#if showPrompt}
  <div id="gs-profile-prompt-backdrop" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-[99] flex items-center justify-center p-4 transition-opacity duration-300">
    <div class="bg-white dark:bg-black rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700" id="gs-profile-prompt-modal">
      <div class="text-center mb-5">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fa-solid fa-user-astronaut text-2xl text-primary"></i>
        </div>
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">Welcome!</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">What should we call you?</p>
      </div>
      <form id="gs-profile-form" class="space-y-4" on:submit|preventDefault={handleSubmit}>
        <div>
          <!-- svelte-ignore a11y-autofocus -->
          <input type="text" id="gs-profile-input" bind:value={username} autofocus required placeholder="Enter your name" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
        </div>
        <button type="submit" class="w-full px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-sky-500 transition shadow-md shadow-primary/20">
          Let's Go <i class="fa-solid fa-arrow-right ml-1"></i>
        </button>
      </form>
    </div>
  </div>
{/if}
