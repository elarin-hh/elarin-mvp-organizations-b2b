<script lang="ts">
    import { enhance } from "$app/forms";
    import { slide } from "svelte/transition";
    import {
        type ExerciseTemplate,
        type UserExercise,
    } from "$lib/types/exercise";
    import { Save, AlertCircle, RefreshCw } from "lucide-svelte";

    export let template: ExerciseTemplate;
    export let userConfig: Record<string, any> = {};
    export let onSave: (newConfig: Record<string, any>) => Promise<void>;

    let isLoading = false;
    let error: string | null = null;
    let success: string | null = null;

    // Merge defaults with user overrides
    $: mergedConfig = {
        ...template.default_config,
        ...userConfig,
        heuristicConfig: {
            ...(template.default_config?.heuristicConfig || {}),
            ...(userConfig?.heuristicConfig || {}),
        },
        metrics: userConfig?.metrics || template.default_config?.metrics || [],
    };

    let editedConfig = JSON.parse(JSON.stringify(mergedConfig));

    // Helper to format labels
    function formatLabel(key: string): string {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    async function handleSubmit() {
        isLoading = true;
        error = null;
        success = null;
        try {
            // Clean up config to only include allowed overrides
            const cleanConfig = {
                heuristicConfig: editedConfig.heuristicConfig,
                metrics: editedConfig.metrics,
            };
            await onSave(cleanConfig);
            success = "Configurações salvas com sucesso!";
            setTimeout(() => (success = null), 3000);
        } catch (err: any) {
            error = err.message || "Erro ao salvar configurações";
        } finally {
            isLoading = false;
        }
    }

    function resetDefaults() {
        editedConfig = JSON.parse(JSON.stringify(template.default_config));
    }
</script>

<div class="config-editor">
    <div class="header flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            ⚙️ Configuração: {template.name}
        </h3>
        <button
            on:click={resetDefaults}
            class="text-xs text-primary-500 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
            title="Restaurar padrões"
        >
            <RefreshCw size={12} /> Restaurar Padrões
        </button>
    </div>

    {#if error}
        <div
            class="mb-4 p-4 bg-red-400/10 text-red-400 flex items-center gap-2"
            style="border-radius: var(--radius-standard);"
            transition:slide
        >
            <AlertCircle size={20} />
            {error}
        </div>
    {/if}

    {#if success}
        <div
            class="mb-4 p-4 bg-primary-500/10 text-primary-500 flex items-center gap-2"
            style="border-radius: var(--radius-standard);"
            transition:slide
        >
            <Save size={20} />
            {success}
        </div>
    {/if}

    <div class="space-y-8">
        <!-- Biomechanical Parameters -->
        {#if template.default_config?.heuristicConfig}
            <section>
                <h4
                    class="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 pb-2"
                >
                    Parâmetros Biomecânicos
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each Object.entries(template.default_config.heuristicConfig) as [key, defaultValue]}
                        <div class="form-group">
                            <label
                                class="block text-sm font-medium text-white/80 mb-1.5"
                            >
                                {formatLabel(key)}
                            </label>
                            <div class="relative">
                                <input
                                    type="number"
                                    bind:value={
                                        editedConfig.heuristicConfig[key]
                                    }
                                    class="w-full px-4 py-2.5 text-white placeholder-white/30 transition-all font-mono focus:ring-2 focus:ring-primary-500/50"
                                    style="background: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);"
                                />
                                <div
                                    class="absolute right-3 top-3 text-xs text-white/30 pointer-events-none"
                                >
                                    Padrão: {defaultValue}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Metrics/Goals -->
        {#if editedConfig.metrics && editedConfig.metrics.length > 0}
            <section>
                <h4
                    class="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 pb-2"
                >
                    Metas e Métricas
                </h4>
                <div class="space-y-4">
                    {#each editedConfig.metrics as metric}
                        <div
                            class="p-4 flex items-center justify-between transition-colors hover:bg-white/5"
                            style="background: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);"
                        >
                            <div>
                                <span class="font-medium text-white"
                                    >{metric.label}</span
                                >
                                <span class="text-xs text-white/50 ml-2"
                                    >({metric.unit})</span
                                >
                            </div>
                            <div class="w-32">
                                <input
                                    type="number"
                                    bind:value={metric.target}
                                    class="w-full px-3 py-1.5 md:text-right font-mono text-white focus:ring-2 focus:ring-primary-500/50"
                                    style="background: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);"
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}

        <!-- Fixed Config (Read-Only) -->
        {#if template.fixed_config}
            <section class="opacity-60 grayscale filter">
                <h4
                    class="text-xs uppercase tracking-wider text-white/50 font-semibold mb-2 flex justify-between items-center"
                >
                    Parâmetros do Sistema (Fixo)
                    <span
                        class="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded"
                        >Não editável</span
                    >
                </h4>
                <pre
                    class="p-4 text-xs overflow-x-auto text-white/60 font-mono"
                    style="background: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);">
{JSON.stringify(template.fixed_config, null, 2)}
				</pre>
            </section>
        {/if}

        <div class="pt-6 flex justify-end">
            <button
                on:click={handleSubmit}
                disabled={isLoading}
                class="bg-primary-500 hover:bg-primary-500 text-white px-6 py-2.5 shadow-lg shadow-primary-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                style="border-radius: var(--radius-standard);"
            >
                {#if isLoading}
                    <div
                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                    ></div>
                    Salvando...
                {:else}
                    <Save size={18} />
                    Salvar Alterações
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    /* Add any specific styles if needed, but Tailwind handles most */
</style>
