<script lang="ts">
    import { onMount } from "svelte";
    import { Loading } from "$lib/components/common";
    import type { ExerciseTemplate } from "$lib/api/exercises-templates.api";
    import { getExerciseTemplates } from "$lib/api/exercises-templates.api";

    let templates = $state<ExerciseTemplate[]>([]);
    let isLoading = $state(true);
    let errorMessage = $state("");

    async function loadData() {
        isLoading = true;
        const response = await getExerciseTemplates();
        if (response.success && response.data) {
            templates = response.data;
        } else {
            errorMessage =
                response.error?.message || "Erro ao carregar exercícios.";
        }
        isLoading = false;
    }

    onMount(async () => {
        await loadData();
    });
</script>

<div class="min-h-full">
    <main class="w-full min-h-full px-6 pt-8 pb-8">
        <div class="flex items-start justify-between gap-4 mb-6">
            <div>
                <h1 class="text-2xl font-bold text-white">Exercícios</h1>
                <p class="text-white/50 text-sm mt-1">
                    Visualize os exercícios disponíveis.
                </p>
            </div>
        </div>

        {#if isLoading}
            <Loading message="Carregando exercícios..." />
        {:else}
            {#if errorMessage}
                <div class="error-banner">{errorMessage}</div>
            {/if}

            {#if templates.length === 0}
                <div class="empty-card">
                    <p class="text-white/60">Nenhum exercício cadastrado.</p>
                </div>
            {:else}
                <div class="exercise-grid">
                    {#each templates as template}
                        <div
                            class="exercise-card {template.is_active
                                ? ''
                                : 'inactive'}"
                        >
                            <div class="exercise-header">
                                <div class="exercise-info">
                                    <h3 class="exercise-title">
                                        {template.name}
                                    </h3>
                                    <code class="exercise-type"
                                        >{template.type}</code
                                    >
                                </div>
                                <span
                                    class="status-chip {template.is_active
                                        ? 'active'
                                        : 'inactive'}"
                                >
                                    {template.is_active ? "Ativo" : "Inativo"}
                                </span>
                            </div>
                            {#if template.description}
                                <p class="exercise-description">
                                    {template.description}
                                </p>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
    </main>
</div>

<style>
    .exercise-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .exercise-card {
        background: var(--color-bg-dark-secondary);
        border-radius: var(--radius-standard);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        transition: background-color 0.2s ease;
    }

    .exercise-card:hover {
        background: color-mix(
            in srgb,
            var(--color-bg-dark-secondary) 95%,
            white 5%
        );
    }

    .exercise-card.inactive {
        opacity: 0.65;
    }

    .exercise-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .exercise-info {
        flex: 1;
        min-width: 0;
    }

    .exercise-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: #fff;
        margin: 0 0 0.35rem 0;
    }

    .exercise-type {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.08);
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-sm);
        font-family: "Monaco", "Courier New", monospace;
    }

    .exercise-description {
        font-size: 0.88rem;
        color: rgba(255, 255, 255, 0.65);
        margin: 0;
        line-height: 1.5;
    }

    .status-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1.25rem;
        font-weight: 600;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
    }

    .status-chip.active {
        color: var(--color-primary-500);
        background-color: color-mix(
            in srgb,
            var(--color-primary-500) 16%,
            transparent
        );
    }

    .status-chip.inactive {
        color: var(--color-gray-400);
        background-color: color-mix(
            in srgb,
            var(--color-gray-400) 12%,
            transparent
        );
    }

    .empty-card {
        background: var(--color-bg-dark-secondary);
        border-radius: var(--radius-standard);
        padding: 2rem;
        text-align: center;
    }

    .error-banner {
        background: rgba(239, 68, 68, 0.12);
        color: rgba(239, 68, 68, 0.95);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-standard);
        margin-bottom: 1rem;
    }
</style>
