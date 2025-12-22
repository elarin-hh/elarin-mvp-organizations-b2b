<script lang="ts">
    import { AppSidebar } from "$lib/components/common";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";

    let { children } = $props();
</script>

<AppSidebar />

<!-- Logo Header -->
<div
    class="logo-header"
    style="margin-left: {$sidebarCollapsed ? '64px' : '240px'}"
>
    <img src="/logo-elarin.png" alt="Elarin" class="logo" />
</div>

<!-- Main Content -->
<div
    class="main-content"
    style="margin-left: {$sidebarCollapsed ? '64px' : '240px'}"
>
    {@render children?.()}
</div>

<style>
    .logo-header {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 2rem;
        background: var(--color-bg-dark);
        z-index: 900;
        transition: margin-left 0.2s ease;
    }

    .logo {
        height: 40px;
    }

    .main-content {
        padding-top: 64px;
        min-height: 100vh;
        transition: margin-left 0.2s ease;
    }
</style>
