<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { organizationAuthActions } from "$lib/stores/organization-auth.store";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";
    import Home from "lucide-svelte/icons/home";
    import Users from "lucide-svelte/icons/users";
    import Settings from "lucide-svelte/icons/settings";
    import LogOut from "lucide-svelte/icons/log-out";
    import Menu from "lucide-svelte/icons/menu";

    const currentPath = $derived($page.url.pathname);

    function toggleCollapse() {
        sidebarCollapsed.update((v) => !v);
    }

    function navigateTo(path: string) {
        goto(path);
    }

    async function handleLogout() {
        await organizationAuthActions.logout();
        goto("/login");
    }

    function handleSettings() {
        console.log("Settings clicked");
    }
</script>

<aside
    class="sidebar"
    class:collapsed={$sidebarCollapsed}
    role="navigation"
    aria-label="Main navigation"
>
    <!-- Top Section -->
    <div class="sidebar-top">
        <button
            type="button"
            class="icon-btn"
            onclick={toggleCollapse}
            aria-label={$sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"}
        >
            <Menu class="w-5 h-5" />
        </button>
    </div>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
        <button
            type="button"
            class="nav-item"
            class:active={currentPath === "/dashboard"}
            onclick={() => navigateTo("/dashboard")}
            title="Dashboard"
        >
            <Home class="w-5 h-5" />
            {#if !$sidebarCollapsed}
                <span>Dashboard</span>
            {/if}
        </button>

        <button
            type="button"
            class="nav-item"
            class:active={currentPath.startsWith("/usuarios")}
            onclick={() => navigateTo("/usuarios")}
            title="Usuários"
        >
            <Users class="w-5 h-5" />
            {#if !$sidebarCollapsed}
                <span>Usuários</span>
            {/if}
        </button>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
        <button
            type="button"
            class="nav-item"
            onclick={handleSettings}
            title="Configurações"
        >
            <Settings class="w-5 h-5" />
            {#if !$sidebarCollapsed}
                <span>Configurações</span>
            {/if}
        </button>

        <button
            type="button"
            class="nav-item logout"
            onclick={handleLogout}
            title="Sair"
        >
            <LogOut class="w-5 h-5" />
            {#if !$sidebarCollapsed}
                <span>Sair</span>
            {/if}
        </button>
    </div>
</aside>

<style>
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 240px;
        background: var(--color-bg-dark-secondary);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        transition: width 0.2s ease;
    }

    .sidebar.collapsed {
        width: 64px;
    }

    .sidebar-top {
        padding: 1rem;
        display: flex;
        align-items: center;
    }

    .icon-btn {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.6);
        transition: all 0.15s ease;
    }

    .icon-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }

    .sidebar-nav {
        flex: 1;
        padding: 0.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .sidebar-bottom {
        padding: 0.5rem 0 1rem 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 1rem;
        margin: 0 0.5rem;
        color: rgba(255, 255, 255, 0.6);
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 400;
        transition: all 0.15s ease;
        text-align: left;
        white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
        justify-content: center;
        padding: 0.625rem;
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }

    .nav-item.active {
        background: rgba(142, 180, 40, 0.15);
        color: var(--color-primary-400);
    }

    .nav-item.logout {
        color: rgba(239, 68, 68, 0.8);
    }

    .nav-item.logout:hover {
        background: rgba(239, 68, 68, 0.1);
        color: rgba(239, 68, 68, 1);
    }
</style>
