<script lang="ts">
    import { AppSidebar } from "$lib/components/common";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";
    import { currentOrganization } from "$lib/stores/organization-auth.store";

    const organization = $derived($currentOrganization);
    let { children } = $props();
</script>

<div
    class="app-shell"
    style="--sidebar-width: {$sidebarCollapsed ? '80px' : '300px'}"
>
    <AppSidebar />

    <!-- Logo Header -->
    <div class="logo-header">
        <img src="/logo-elarin.png" alt="Elarin" class="logo" />
        {#if organization}
            {@const headerName =
                organization.responsible_name || organization.name}
            {@const headerInitial = headerName
                ? headerName.charAt(0).toUpperCase()
                : "?"}
            <div class="header-user">
                <div class="header-avatar">{headerInitial}</div>
            </div>
        {/if}
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
        justify-content: space-between;
        padding: 0 1rem;
        background: var(--color-bg-dark);
        z-index: 900;
        transition: left 0.2s ease, width 0.2s ease;
        box-sizing: border-box;
    }

    .logo {
        height: 48px;
    }

    .header-user {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
    }

    .header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        background: var(--color-primary-500);
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
