<script lang="ts">
    import { Save, RefreshCw } from "lucide-svelte";
    import { toast } from "$lib/stores/toast.store";

    interface Props {
        exerciseName: string;
        config: Record<string, any>;
        editableFields: string[];
        userConfig: Record<string, any>;
        onSave: (newConfig: Record<string, any>) => Promise<void>;
    }

    let { exerciseName, config, editableFields, userConfig, onSave }: Props =
        $props();

    let isLoading = $state(false);

    interface EditableField {
        path: string;
        label: string;
        value: any;
        defaultValue: any;
        inputType: "number" | "text" | "range";
        isRange: boolean;
        rangeMin?: any;
        rangeMax?: any;
    }

    let fields = $state<EditableField[]>([]);

    function parsePath(path: string): {
        segments: Array<{
            key: string;
            filter?: { key: string; value: string };
        }>;
    } {
        const segments: Array<{
            key: string;
            filter?: { key: string; value: string };
        }> = [];
        const regex = /([a-zA-Z_]+)(?:\[([a-zA-Z_]+)=([^\]]+)\])?/g;
        let match;

        while ((match = regex.exec(path)) !== null) {
            const segment: {
                key: string;
                filter?: { key: string; value: string };
            } = { key: match[1] };
            if (match[2] && match[3]) {
                segment.filter = { key: match[2], value: match[3] };
            }
            segments.push(segment);
        }

        return { segments };
    }

    function getValueByPath(obj: Record<string, any>, path: string): any {
        const { segments } = parsePath(path);
        let current = obj;

        for (const segment of segments) {
            if (current === undefined || current === null) return undefined;

            if (segment.filter && Array.isArray(current[segment.key])) {
                const item = current[segment.key].find(
                    (item: any) =>
                        String(item[segment.filter!.key]) ===
                        segment.filter!.value,
                );
                current = item;
            } else if (segment.key in current) {
                current = current[segment.key];
            } else {
                return undefined;
            }
        }

        return current;
    }

    function generateLabel(
        path: string,
        configObj: Record<string, any>,
    ): string {
        const { segments } = parsePath(path);
        let current = configObj;
        let foundName: string | null = null;

        for (const segment of segments) {
            if (current === undefined || current === null) break;

            if (segment.filter && Array.isArray(current[segment.key])) {
                const item = current[segment.key].find(
                    (item: any) =>
                        String(item[segment.filter!.key]) ===
                        segment.filter!.value,
                );
                if (item?.name) {
                    foundName = item.name;
                }
                current = item;
            } else if (segment.key in current) {
                if (current[segment.key]?.name) {
                    foundName = current[segment.key].name;
                }
                current = current[segment.key];
            } else {
                break;
            }
        }

        if (foundName) {
            return foundName;
        }

        const idMatch = path.match(/\[id=([^\]]+)\]/);
        if (idMatch) {
            return idMatch[1]
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());
        }

        const parts = path.split(".");
        const lastPart = parts[parts.length - 1].replace(/\[.*\]/, "");
        return lastPart
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .trim();
    }

    function isRangeValue(value: any): boolean {
        return (
            Array.isArray(value) &&
            value.length === 2 &&
            typeof value[0] === "number" &&
            typeof value[1] === "number"
        );
    }

    $effect(() => {
        const newFields: EditableField[] = [];

        for (const path of editableFields) {
            const defaultValue = getValueByPath(config, path);
            const userValue = getValueByPath(userConfig, path);
            const value = userValue !== undefined ? userValue : defaultValue;

            const isRange = isRangeValue(defaultValue) || isRangeValue(value);

            const field: EditableField = {
                path,
                label: generateLabel(path, config),
                value: isRange ? value : value,
                defaultValue,
                inputType:
                    typeof value === "number" || isRange ? "number" : "text",
                isRange,
                rangeMin: isRange
                    ? (value?.[0] ?? defaultValue?.[0])
                    : undefined,
                rangeMax: isRange
                    ? (value?.[1] ?? defaultValue?.[1])
                    : undefined,
            };

            newFields.push(field);
        }

        fields = newFields;
    });

    function buildOverrideObject(): Record<string, any> {
        const override: Record<string, any> = {};

        for (const field of fields) {
            const { segments } = parsePath(field.path);
            let current = override;

            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                const isLast = i === segments.length - 1;

                if (segment.filter) {
                    // Array with filter - ensure array exists
                    if (!current[segment.key]) {
                        current[segment.key] = [];
                    }

                    let item = current[segment.key].find(
                        (item: any) =>
                            String(item[segment.filter!.key]) ===
                            segment.filter!.value,
                    );

                    if (!item) {
                        item = { [segment.filter.key]: segment.filter.value };
                        current[segment.key].push(item);
                    }

                    if (isLast) {
                    } else {
                        current = item;
                    }
                } else {
                    if (isLast) {
                        if (field.isRange) {
                            current[segment.key] = [
                                field.rangeMin,
                                field.rangeMax,
                            ];
                        } else {
                            current[segment.key] = field.value;
                        }
                    } else {
                        if (!current[segment.key]) {
                            current[segment.key] = {};
                        }
                        current = current[segment.key];
                    }
                }
            }
        }

        return override;
    }

    async function handleSubmit() {
        isLoading = true;
        try {
            const override = buildOverrideObject();
            await onSave(override);
            toast.success("Configurações salvas com sucesso!");
        } catch (err: any) {
            toast.error(err.message || "Erro ao salvar");
        } finally {
            isLoading = false;
        }
    }

    function resetDefaults() {
        fields = fields.map((field) => ({
            ...field,
            value: field.defaultValue,
            rangeMin: field.isRange ? field.defaultValue?.[0] : undefined,
            rangeMax: field.isRange ? field.defaultValue?.[1] : undefined,
        }));
    }

    function updateFieldValue(index: number, value: any) {
        fields[index] = { ...fields[index], value };
    }

    function updateRangeMin(index: number, value: number) {
        fields[index] = { ...fields[index], rangeMin: value };
    }

    function updateRangeMax(index: number, value: number) {
        fields[index] = { ...fields[index], rangeMax: value };
    }

    function getFieldCategory(path: string): string {
        if (path.startsWith("metrics")) return "Metas";
        if (path.startsWith("heuristicConfig"))
            return "Parâmetros de Validação";
        return "Geral";
    }

    let groupedFields = $derived(() => {
        const groups: Record<string, EditableField[]> = {};
        for (const field of fields) {
            const category = getFieldCategory(field.path);
            if (!groups[category]) groups[category] = [];
            groups[category].push(field);
        }
        return groups;
    });
</script>

<div class="config-editor">
    <div class="header flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            Configuração: {exerciseName}
        </h3>
        <button
            onclick={resetDefaults}
            class="text-xs text-primary-500 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
            title="Restaurar padrões"
        >
            <RefreshCw size={12} /> Restaurar Padrões
        </button>
    </div>

    {#if fields.length === 0}
        <div class="text-white/50 text-center py-8">
            Nenhum campo editável configurado para este exercício.
        </div>
    {:else}
        <div class="space-y-6">
            {#each Object.entries(groupedFields()) as [category, categoryFields]}
                <section>
                    <h4
                        class="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 pb-2 border-b border-white/5"
                    >
                        {category}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each categoryFields as field, fieldIndex}
                            {@const globalIndex = fields.findIndex(
                                (f) => f.path === field.path,
                            )}
                            <div
                                class="form-field"
                                class:md:col-span-2={field.isRange}
                            >
                                <label for={`field-${globalIndex}`}
                                    >{field.label}</label
                                >

                                {#if field.isRange}
                                    <div class="flex gap-4 items-center">
                                        <div class="flex-1">
                                            <span class="text-xs text-white/40"
                                                >Mínimo</span
                                            >
                                            <input
                                                id={`field-${globalIndex}-min`}
                                                type="number"
                                                step="0.01"
                                                value={field.rangeMin}
                                                oninput={(e) =>
                                                    updateRangeMin(
                                                        globalIndex,
                                                        parseFloat(
                                                            e.currentTarget
                                                                .value,
                                                        ),
                                                    )}
                                                class="input-standard"
                                            />
                                        </div>
                                        <span class="text-white/30 pt-4">–</span
                                        >
                                        <div class="flex-1">
                                            <span class="text-xs text-white/40"
                                                >Máximo</span
                                            >
                                            <input
                                                id={`field-${globalIndex}-max`}
                                                type="number"
                                                step="0.01"
                                                value={field.rangeMax}
                                                oninput={(e) =>
                                                    updateRangeMax(
                                                        globalIndex,
                                                        parseFloat(
                                                            e.currentTarget
                                                                .value,
                                                        ),
                                                    )}
                                                class="input-standard"
                                            />
                                        </div>
                                    </div>
                                    <span class="default-hint">
                                        Padrão: [{field.defaultValue?.[0]}, {field
                                            .defaultValue?.[1]}]
                                    </span>
                                {:else}
                                    <div class="input-wrapper">
                                        <input
                                            id={`field-${globalIndex}`}
                                            type={field.inputType}
                                            step={field.inputType === "number"
                                                ? "0.01"
                                                : undefined}
                                            value={field.value}
                                            oninput={(e) =>
                                                updateFieldValue(
                                                    globalIndex,
                                                    field.inputType === "number"
                                                        ? parseFloat(
                                                              e.currentTarget
                                                                  .value,
                                                          )
                                                        : e.currentTarget.value,
                                                )}
                                            class="input-standard"
                                        />
                                        <span class="default-hint"
                                            >Padrão: {field.defaultValue}</span
                                        >
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}

            <div class="pt-6 flex justify-end">
                <button
                    onclick={handleSubmit}
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

    .form-field label {
        font-weight: 500;
    }

    .input-wrapper {
        position: relative;
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

    .default-hint {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.3);
        margin-top: 0.25rem;
    }
</style>
