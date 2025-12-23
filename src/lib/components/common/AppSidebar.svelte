<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { organizationAuthActions } from "$lib/stores/organization-auth.store";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";
    import Home from "lucide-svelte/icons/home";
    import Users from "lucide-svelte/icons/users";
    import Dumbbell from "lucide-svelte/icons/dumbbell";
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
            <span class="nav-icon">
                <Home class="w-5 h-5" />
            </span>
            <span class="nav-label">Dashboard</span>
        </button>

        <button
            type="button"
            class="nav-item"
            class:active={currentPath.startsWith("/users")}
            onclick={() => navigateTo("/users")}
            title="Usuários"
        >
            <span class="nav-icon">
                <Users class="w-5 h-5" />
            </span>
            <span class="nav-label">Usuários</span>
        </button>
        <button
            type="button"
            class="nav-item"
            class:active={currentPath.startsWith("/training-plans")}
            onclick={() => navigateTo("/training-plans")}
            title="Planos de treino"
        >
            <span class="nav-icon">
                <Dumbbell class="w-5 h-5" />
            </span>
            <span class="nav-label">Planos de treino</span>
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
            <span class="nav-icon">
                <Settings class="w-5 h-5" />
            </span>
            <span class="nav-label">Configurações</span>
        </button>

        <button
            type="button"
            class="nav-item logout"
            onclick={handleLogout}
            title="Sair"
        >
            <span class="nav-icon">
                <LogOut class="w-5 h-5" />
            </span>
            <span class="nav-label">Sair</span>
        </button>
    </div>
</aside>

<style>
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: var(--sidebar-width, 300px);
        background: var(--color-bg-dark-secondary);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        transition: width 0.2s ease;
    }

    .sidebar.collapsed {
        width: var(--sidebar-width, 80px);
    }

    .sidebar-top {
        padding: 1rem;
        display: flex;
        align-items: center;
        padding-left: 1.25rem;
    }


    .icon-btn {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
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
        border-radius: var(--radius-md);
    }

    .icon-btn:focus-visible {
        border-radius: var(--radius-md);
    }

    .sidebar-nav {
        flex: 1;
        padding: 0.5rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .sidebar-bottom {
        padding: 0.5rem 1rem 1rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        height: 40px;
        padding: 0 0.25rem;
        margin: 0;
        width: 100%;
        box-sizing: border-box;
        color: rgba(255, 255, 255, 0.6);
        background: transparent;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 400;
        transition: background-color 0.15s ease, color 0.15s ease;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
    }

    .sidebar.collapsed .nav-item {
        justify-content: flex-start;
        padding: 0 0.25rem;
        gap: 0.5rem;
    }

    .nav-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        flex: 0 0 40px;
        border-radius: var(--radius-md);
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .nav-label {
        display: inline-block;
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: opacity 0.15s ease;
    }

    .sidebar.collapsed .nav-label {
        opacity: 0;
        pointer-events: none;
        width: 0;
        max-width: 0;
        flex: 0 0 0;
    }

    .nav-item:hover,
    .nav-item:focus-visible {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
    }

    .nav-item.active {
        background: color-mix(
            in srgb,
            #fff 10%,
            transparent
        );
        color: var(--color-primary-500);
    }

    .nav-item.logout {
        color: rgba(239, 68, 68, 0.8);
    }

    .nav-item.logout:hover {
        background: rgba(239, 68, 68, 0.1);
        color: rgba(239, 68, 68, 1);
    }
</style>

