<script lang="ts">
    import { AppSidebar, AppHeader } from "$lib/components/common";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";

    let { children } = $props();
</script>

<div
    class="app-shell"
    style="--sidebar-width: {$sidebarCollapsed ? '80px' : '300px'}"
>
    <AppSidebar />

    <AppHeader />

    <div class="main-content">
        {@render children?.()}
    </div>
</div>

<style>
    .app-shell {
        min-height: 100vh;
    }

    .main-content {
        margin-left: var(--sidebar-width);
        width: calc(100% - var(--sidebar-width));
        padding-top: 64px;
        min-height: 100vh;
        transition:
            margin-left 0.2s ease,
            width 0.2s ease;
        box-sizing: border-box;
    }
</style>
