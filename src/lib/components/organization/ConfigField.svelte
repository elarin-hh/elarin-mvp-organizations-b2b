<script lang="ts">
    import { slide } from "svelte/transition";
    import { ChevronDown, ChevronRight } from "lucide-svelte";

    export let key: string;
    export let value: any;
    export let defaultValue: any = undefined;
    export let depth = 0;
    export let label: string = "";

    let isExpanded = true;

    $: type = getType(defaultValue !== undefined ? defaultValue : value);

    function getType(
        val: any,
    ): "number" | "boolean" | "string" | "object" | "unknown" {
        if (val === null || val === undefined) return "unknown";
        if (Array.isArray(val)) return "unknown";
        return typeof val as any;
    }

    function formatLabel(k: string): string {
        if (label) return label;
        return k
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    function toggleExpand() {
        isExpanded = !isExpanded;
    }
</script>

<div class="config-field" class:md:col-span-3={type === "object"}>
    {#if type === "object"}
        <div class="mb-3 mt-4">
            <button
                class="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 font-semibold hover:text-white/80 transition-colors w-full text-left"
                on:click={toggleExpand}
            >
                {#if isExpanded}
                    <ChevronDown size={14} />
                {:else}
                    <ChevronRight size={14} />
                {/if}
                {formatLabel(key)}
            </button>

            {#if isExpanded}
                <div
                    class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-l border-white/5 pl-4"
                    transition:slide|local
                >
                    {#each Object.entries(value || {}) as [subKey, subValue]}
                        <svelte:self
                            key={subKey}
                            bind:value={value[subKey]}
                            defaultValue={defaultValue?.[subKey]}
                            depth={depth + 1}
                        />
                    {/each}
                </div>
            {/if}
        </div>
    {:else if type === "boolean"}
        <div
            class="form-group flex items-center justify-between p-3 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
            <div class="flex flex-col">
                <span class="text-sm font-medium text-white/90"
                    >{formatLabel(key)}</span
                >
                <span class="text-xs text-white/40">
                    Padrão: {defaultValue ? "Ativado" : "Desativado"}
                </span>
            </div>
            <button
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                class:bg-primary-500={value}
                class:bg-white-20={!value}
                style={!value ? "background-color: rgba(255,255,255,0.1)" : ""}
                on:click={() => (value = !value)}
            >
                <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    class:translate-x-6={value}
                    class:translate-x-1={!value}
                />
            </button>
        </div>
    {:else if type === "number"}
        <label class="form-field">
            <span>{formatLabel(key)}</span>
            <div class="relative">
                <input
                    type="number"
                    bind:value
                    class="input-standard"
                    placeholder={defaultValue !== undefined
                        ? String(defaultValue)
                        : ""}
                />
                {#if defaultValue !== undefined}
                    <div
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none"
                    >
                        Padrão: {defaultValue}
                    </div>
                {/if}
            </div>
        </label>
    {:else if type === "string"}
        <label class="form-field">
            <span>{formatLabel(key)}</span>
            <div class="relative">
                <input
                    type="text"
                    bind:value
                    class="input-standard"
                    placeholder={defaultValue !== undefined
                        ? String(defaultValue)
                        : ""}
                />
                {#if defaultValue !== undefined}
                    <div
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none"
                    >
                        Padrão: "{defaultValue}"
                    </div>
                {/if}
            </div>
        </label>
    {/if}
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
    }

    .input-standard:focus {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 2px var(--color-primary-500-alpha);
    }
</style>
