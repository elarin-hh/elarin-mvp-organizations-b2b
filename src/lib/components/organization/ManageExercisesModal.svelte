<script lang="ts">
    import { onMount } from "svelte";
    import { organizationsApi } from "$lib/api/organizations.api";
    import Loading from "$lib/components/common/Loading.svelte";
    import X from "lucide-svelte/icons/x";
    import Check from "lucide-svelte/icons/check";
    import Plus from "lucide-svelte/icons/plus";
    import Trash2 from "lucide-svelte/icons/trash-2";
    import { toast } from "$lib/stores/toast.store";
    import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";

    interface Props {
        user: {
            id: number;
            full_name: string;
        };
        onClose: () => void;
        onSuccess?: () => void;
    }

    let { user, onClose, onSuccess }: Props = $props();

    let templates = $state<any[]>([]);
    let userExercises = $state<any[]>([]);
    let isLoading = $state(true);
    let isProcessing = $state(false);
    let searchTerm = $state("");

    let dialogOpen = $state(false);
    let dialogConfig = $state({
        title: "",
        message: "",
        confirmLabel: "Confirmar",
        variant: "default" as "default" | "danger" | "warning",
        onConfirm: () => {},
    });

    function openDialog(
        config: Partial<typeof dialogConfig> & { onConfirm: () => void },
    ) {
        dialogConfig = {
            title: config.title || "Confirmar ação",
            message: config.message || "Tem certeza?",
            confirmLabel: config.confirmLabel || "Confirmar",
            variant: config.variant || "default",
            onConfirm: config.onConfirm,
        };
        dialogOpen = true;
    }

    function closeDialog() {
        dialogOpen = false;
    }

    let filteredTemplates = $derived(
        templates.filter((t) =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    async function loadData() {
        isLoading = true;
        try {
            const [templatesRes, exercisesRes] = await Promise.all([
                organizationsApi.getExerciseTemplates(),
                organizationsApi.getUserExercises(user.id),
            ]);

            if (templatesRes.success && templatesRes.data) {
                templates = templatesRes.data;
            }

            if (exercisesRes.success && exercisesRes.data) {
                userExercises = exercisesRes.data;
            }
        } catch (error) {
            console.error("Falha ao carregar exercícios:", error);
        } finally {
            isLoading = false;
        }
    }

    function isAssigned(templateId: number): boolean {
        return userExercises.some((ex) => ex.template_id === templateId);
    }

    function getUserExerciseId(templateId: number): number | null {
        const exercise = userExercises.find(
            (ex) => ex.template_id === templateId,
        );
        return exercise?.id || null;
    }

    async function handleToggleExercise(template: any) {
        if (isProcessing) return;

        const exerciseId = getUserExerciseId(template.id);

        if (exerciseId) {
            openDialog({
                title: "Remover exercício",
                message: `Remover "${template.name}" deste usuário?`,
                variant: "danger",
                confirmLabel: "Remover",
                onConfirm: async () => {
                    isProcessing = true;
                    try {
                        const response = await organizationsApi.removeExercise(
                            user.id,
                            exerciseId,
                        );
                        if (response.success) {
                            userExercises = userExercises.filter(
                                (ex) => ex.id !== exerciseId,
                            );
                            toast.success("Exercício removido");
                        }
                    } catch (error) {
                        console.error("Falha ao remover exercício:", error);
                        toast.error("Erro ao remover exercício");
                    } finally {
                        isProcessing = false;
                        closeDialog();
                    }
                },
            });
        } else {
            isProcessing = true;
            try {
                const response = await organizationsApi.assignExercise(
                    user.id,
                    template.id,
                );
                if (response.success && response.data) {
                    userExercises = [...userExercises, response.data];
                    toast.success("Exercício atribuído");
                }
            } catch (error: any) {
                console.error("Falha ao atribuir exercício:", error);
                const message =
                    error?.response?.data?.message ||
                    "Erro ao atribuir exercício";
                toast.error(message);
            } finally {
                isProcessing = false;
            }
        }
    }

    function handleClose() {
        if (onSuccess) {
            onSuccess();
        }
        onClose();
    }

    onMount(() => {
        loadData();
    });
</script>

<div class="modal-overlay" onclick={handleClose} role="button" tabindex="-1">
    <div
        class="modal-content"
        onclick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
    >
        <div class="modal-header">
            <div>
                <h2>Gerenciar Exercícios</h2>
                <p class="user-name">{user.full_name}</p>
            </div>
            <button class="close-btn" onclick={handleClose} aria-label="Fechar">
                <X size={24} />
            </button>
        </div>

        <div class="search-container">
            <input
                type="text"
                placeholder="Buscar exercício..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>

        <div class="modal-body">
            {#if isLoading}
                <div class="loading-container">
                    <Loading />
                </div>
            {:else if filteredTemplates.length === 0}
                <p class="empty-state">Nenhum exercício disponível</p>
            {:else}
                <div class="exercises-list">
                    {#each filteredTemplates as template (template.id)}
                        {@const assigned = isAssigned(template.id)}
                        <div class="exercise-item" class:assigned>
                            <div class="exercise-info">
                                <div
                                    class:icon-check={assigned}
                                    class:icon-plus={!assigned}
                                >
                                    {#if assigned}
                                        <Check size={20} />
                                    {:else}
                                        <Plus size={20} />
                                    {/if}
                                </div>
                                <div>
                                    <h3>{template.name}</h3>
                                    {#if template.description}
                                        <p class="description">
                                            {template.description}
                                        </p>
                                    {/if}
                                </div>
                            </div>
                            <button
                                class="toggle-btn"
                                class:remove={assigned}
                                onclick={() => handleToggleExercise(template)}
                                disabled={isProcessing}
                                aria-label={assigned
                                    ? "Remover exercício"
                                    : "Adicionar exercício"}
                            >
                                {#if assigned}
                                    <Trash2 size={18} />
                                    Remover
                                {:else}
                                    <Plus size={18} />
                                    Adicionar
                                {/if}
                            </button>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="modal-footer">
            <button class="btn-secondary" onclick={handleClose}>Fechar</button>
        </div>
    </div>
</div>

<ConfirmDialog
    isOpen={dialogOpen}
    title={dialogConfig.title}
    message={dialogConfig.message}
    confirmLabel={dialogConfig.confirmLabel}
    variant={dialogConfig.variant}
    onConfirm={dialogConfig.onConfirm}
    onCancel={closeDialog}
/>

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal-content {
        background: var(--color-bg-dark-secondary);
        border-radius: var(--radius-standard);
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-2xl);
        color: var(--color-text-primary);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .user-name {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--color-text-muted);
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--radius-standard);
        transition:
            background-color 0.2s ease,
            color 0.2s ease;
    }

    .close-btn:hover {
        background: var(--color-glass-light-weak);
        color: var(--color-text-primary);
    }

    .search-container {
        padding: 1rem 1.5rem;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: var(--radius-standard);
        font-size: 0.875rem;
        background: var(--color-bg-dark-secondary);
        color: var(--color-text-primary);
        transition: box-shadow 0.2s ease;
    }

    .search-input:focus {
        outline: none;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 1.5rem;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        padding: 3rem;
    }

    .empty-state {
        text-align: center;
        color: var(--color-text-muted);
        padding: 3rem;
    }

    .exercises-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .exercise-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.04);
        border-radius: var(--radius-standard);
        transition: background-color 0.2s ease;
    }

    .exercise-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    .exercise-item.assigned {
        background: rgba(255, 255, 255, 0.04);
    }

    .exercise-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
    }

    .icon-check,
    .icon-plus {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-standard);
        flex-shrink: 0;
        background: var(--color-glass-light-weak);
        color: var(--color-text-muted);
    }

    .icon-check {
        background: color-mix(
            in srgb,
            var(--color-primary-500) 7%,
            transparent
        );
        color: var(--color-primary-500);
    }

    .exercise-info h3 {
        margin: 0;
        font-size: 0.938rem;
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .description {
        margin: 0.25rem 0 0;
        font-size: 0.813rem;
        color: var(--color-text-muted);
    }

    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s ease;
        white-space: nowrap;
    }

    .toggle-btn:not(.remove) {
        background: var(--color-primary-500);
        color: var(--color-text-dark);
    }

    .toggle-btn.remove {
        background: color-mix(in srgb, var(--color-error) 12%, transparent);
        color: var(--color-error);
    }

    .toggle-btn.remove:hover:not(:disabled) {
        background: color-mix(in srgb, var(--color-error) 18%, transparent);
    }

    .toggle-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: flex-end;
    }

    .btn-secondary {
        padding: 0.625rem 1.5rem;
        border: none;
        background: var(--color-bg-dark-secondary);
        color: var(--color-text-secondary);
        border-radius: var(--radius-standard);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.04);
    }
</style>
