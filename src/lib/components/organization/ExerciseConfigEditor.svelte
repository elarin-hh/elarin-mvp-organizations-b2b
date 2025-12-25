<script lang="ts">
    import { slide } from "svelte/transition";
    import {
        type ExerciseTemplate,
        type UserExercise,
    } from "$lib/types/exercise";
    import {
        Save,
        AlertCircle,
        RefreshCw,
        ChevronDown,
        ChevronRight,
    } from "lucide-svelte";
    import { toast } from "$lib/stores/toast.store";
    import ConfigField from "./ConfigField.svelte";

    export let template: ExerciseTemplate;
    export let userConfig: Record<string, any> = {};
    export let onSave: (newConfig: Record<string, any>) => Promise<void>;

    let isLoading = false;
    let isMetricsExpanded = true;
    let error: string | null = null;

    // Deep merge helper
    function deepMerge(target: any, source: any) {
        if (!source || typeof source !== "object") return target;
        const output = { ...target };

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (
                    source[key] instanceof Object &&
                    key in target &&
                    target[key] instanceof Object &&
                    !Array.isArray(source[key])
                ) {
                    output[key] = deepMerge(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            }
        }
        return output;
    }

    // Merge defaults with user overrides
    $: mergedConfig = (() => {
        const defaults = template.default_config || {};
        // Ensure metrics are preserved from default if not in user
        const base = deepMerge(defaults, userConfig || {});
        // Explicitly handle metrics array if missing in result
        if (!base.metrics && defaults.metrics) {
            base.metrics = defaults.metrics;
        }
        console.log("[ExerciseConfigEditor] mergedConfig:", base);
        return base;
    })();

    let editedConfig: any = {};

    // React to mergedConfig changes (e.g. initial load or prop change)
    $: {
        if (mergedConfig) {
            // Only update if we don't have edits or if the base changed significantly?
            // Simplest is to just sync. If user is typing, we bind to editedConfig fields.
            // We need to initialize it.
            if (Object.keys(editedConfig).length === 0) {
                editedConfig = JSON.parse(JSON.stringify(mergedConfig));
                console.log(
                    "[ExerciseConfigEditor] editedConfig initialized:",
                    editedConfig,
                );
            }
        }
    }

    // Filter out internal keys or handled separately
    $: configEntries = Object.entries(editedConfig).filter(
        ([key]) => key !== "metrics", // heuristicConfig is now just another object, generic traversal handles it!
    );

    async function handleSubmit() {
        isLoading = true;
        error = null;
        try {
            await onSave(editedConfig);
            toast.success("Configurações salvas com sucesso!");
        } catch (err: any) {
            error = err.message || "Erro ao salvar configurações";
            toast.error(error || "Erro ao salvar");
        } finally {
            isLoading = false;
        }
    }

    function resetDefaults() {
        editedConfig = JSON.parse(
            JSON.stringify(template.default_config || {}),
        );
    }
</script>

<div class="config-editor">
    <div class="header flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            Configuração: {template.name}
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

    <div class="space-y-8">
        <!-- Generic Parameters -->
        <section>
            <h4
                class="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 pb-2 border-b border-white/5"
            >
                Parâmetros Gerais
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {#each Object.entries(editedConfig) as [key, value]}
                    {#if key !== "metrics"}
                        <!-- Check if value is object (simple check) to span full width -->
                        {@const isObject =
                            value !== null &&
                            typeof value === "object" &&
                            !Array.isArray(value)}
                        <div class={isObject ? "md:col-span-3" : ""}>
                            <ConfigField
                                {key}
                                bind:value={editedConfig[key]}
                                defaultValue={template.default_config?.[key]}
                            />
                        </div>
                    {/if}
                {/each}
            </div>
        </section>

        <!-- Metrics/Goals -->
        {#if editedConfig.metrics && editedConfig.metrics.length > 0}
            <section>
                <button
                    class="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 w-full text-left hover:text-white/80 transition-colors"
                    on:click={() => (isMetricsExpanded = !isMetricsExpanded)}
                >
                    {#if isMetricsExpanded}
                        <ChevronDown size={14} />
                    {:else}
                        <ChevronRight size={14} />
                    {/if}
                    Metas e Métricas
                </button>

                {#if isMetricsExpanded}
                    <div
                        class="grid grid-cols-1 md:grid-cols-3 gap-4 border-l border-white/5 pl-4"
                        transition:slide|local
                    >
                        {#each editedConfig.metrics as metric}
                            <div
                                class="p-4 flex items-center justify-between transition-colors hover:bg-white/5"
                                style="background: var(--color-bg-dark-secondary); border-radius: var(--radius-standard);"
                            >
                                <label class="form-field flex-1">
                                    <span>{metric.label} ({metric.unit})</span>
                                    <div class="relative">
                                        <input
                                            type="number"
                                            bind:value={metric.target}
                                            class="input-standard md:text-right"
                                            placeholder="0"
                                        />
                                    </div>
                                </label>
                            </div>
                        {/each}
                    </div>
                {/if}
            </section>
        {/if}

        <div class="pt-6 flex justify-end">
            <button
                on:click={handleSubmit}
                disabled={isLoading}
                class="bg-primary-600 hover:bg-primary-500 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                style="border-radius: var(--radius-md);"
            >
                {#if isLoading}
                    <div
                        class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                    ></div>
                    Salvando...
                {:else}
                    <Save size={16} />
                    Salvar Alterações
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
    }

    .input-standard {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        border-radius: var(--radius-standard);
        padding: 0.65rem 0.75rem;
        color: #fff;
        font-family: inherit;
        outline: none;
        transition: background-color 0.2s;
        font-family: monospace;
    }

    .input-standard:focus {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 2px var(--color-primary-500-alpha);
    }
</style>
