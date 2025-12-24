<script lang="ts">
    import { onMount } from "svelte";
    import { sidebarCollapsed } from "$lib/stores/sidebar.store";
    import { currentOrganization } from "$lib/stores/organization-auth.store";

    const organization = $derived($currentOrganization);

    let isScrolled = $state(false);

    onMount(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            isScrolled = target.scrollTop > 50;
        };

        const viewport = document.querySelector(".sa-viewport");

        if (viewport) {
            viewport.addEventListener("scroll", handleScroll, {
                passive: true,
            });
            return () => {
                viewport.removeEventListener("scroll", handleScroll);
            };
        }

        const handleWindowScroll = () => {
            isScrolled = window.scrollY > 50;
        };
        window.addEventListener("scroll", handleWindowScroll, {
            passive: true,
        });
        return () => {
            window.removeEventListener("scroll", handleWindowScroll);
        };
    });
</script>

<header
    class="fixed top-0 z-[900]"
    style="right: 0; left: var(--sidebar-width, 300px); width: calc(100% - var(--sidebar-width, 300px)); transition: left 0.2s ease, width 0.2s ease;"
>
    <div class="header-container px-4">
        <div class="header-glass py-2" class:scrolled={isScrolled}>
            <div class="header-content px-4 flex items-center justify-between">
                <img src="/logo-elarin.png" alt="Elarin" class="h-12" />

                {#if organization}
                    {@const headerName =
                        organization.responsible_name || organization.name}
                    {@const headerInitial = headerName
                        ? headerName.charAt(0).toUpperCase()
                        : "?"}
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center"
                        >
                            <span class="text-white font-semibold"
                                >{headerInitial}</span
                            >
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</header>

<style>
    .header-container {
        transition: all 0.3s ease;
        padding: 0;
    }

    .header-glass {
        transition: all 0.3s ease;
        width: 100%;
    }

    .header-glass.scrolled {
        background: var(--glass-bg);
        backdrop-filter: var(--glass-backdrop);
        -webkit-backdrop-filter: var(--glass-backdrop);
        box-shadow: var(--glass-shadow);
    }

    .header-content {
        width: 100%;
    }

    :global(.bg-primary-500) {
        background-color: var(--color-primary-500);
    }
</style>
