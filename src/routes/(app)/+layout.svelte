<script lang="ts">
    import { AppSidebar } from "$lib/components/common";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";

    let { children } = $props();
</script>

<div
    class="app-shell"
    style="--sidebar-width: {$sidebarCollapsed ? '64px' : '240px'}"
>
    <AppSidebar />

    <!-- Logo Header -->
    <div class="logo-header">
        <img src="/logo-elarin.png" alt="Elarin" class="logo" />
    </div>

    <!-- Main Content -->
    <div class="main-content">
        {@render children?.()}
    </div>
</div>

<style>
    .app-shell {
        min-height: 100vh;
    }

    .logo-header {
        position: fixed;
        top: 0;
        right: 0;
        left: var(--sidebar-width);
        height: 64px;
        width: calc(100% - var(--sidebar-width));
        display: flex;
        align-items: center;
        padding: 0 1.5rem;
        background: var(--color-bg-dark);
        z-index: 900;
        transition: left 0.2s ease, width 0.2s ease;
        box-sizing: border-box;
    }

    .logo {
        height: 48px;
    }

    .main-content {
        margin-left: var(--sidebar-width);
        width: calc(100% - var(--sidebar-width));
        padding-top: 64px;
        min-height: 100vh;
        transition: margin-left 0.2s ease, width 0.2s ease;
        box-sizing: border-box;
    }
</style>
