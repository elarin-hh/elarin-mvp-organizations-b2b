<script lang="ts">
    import { onMount } from "svelte";
    import { organizationsApi } from "$lib/api/organizations.api";
    import Loading from "$lib/components/common/Loading.svelte";
    import X from "lucide-svelte/icons/x";
    import Check from "lucide-svelte/icons/check";
    import Plus from "lucide-svelte/icons/plus";
    import Trash2 from "lucide-svelte/icons/trash-2";

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

    // Filtered templates based on search
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
            console.error("Failed to load exercises:", error);
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
            // Remove exercise
            if (!confirm(`Remover "${template.name}" deste usuário?`)) return;

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
                }
            } catch (error) {
                console.error("Failed to remove exercise:", error);
                alert("Erro ao remover exercício");
            } finally {
                isProcessing = false;
            }
        } else {
            // Assign exercise
            isProcessing = true;
            try {
                const response = await organizationsApi.assignExercise(
                    user.id,
                    template.id,
                );
                if (response.success && response.data) {
                    userExercises = [...userExercises, response.data];
                }
            } catch (error: any) {
                console.error("Failed to assign exercise:", error);
                const message =
                    error?.response?.data?.message ||
                    "Erro ao atribuir exercício";
                alert(message);
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
        <!-- Header -->
        <div class="modal-header">
            <div>
                <h2>Gerenciar Exercícios</h2>
                <p class="user-name">{user.full_name}</p>
            </div>
            <button class="close-btn" onclick={handleClose} aria-label="Fechar">
                <X size={24} />
            </button>
        </div>

        <!-- Search -->
        <div class="search-container">
            <input
                type="text"
                placeholder="Buscar exercício..."
                bind:value={searchTerm}
                class="search-input"
            />
        </div>

        <!-- Content -->
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

        <!-- Footer -->
        <div class="modal-footer">
            <button class="btn-secondary" onclick={handleClose}>Fechar</button>
        </div>
    </div>
</div>

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
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .user-name {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .close-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background: #f3f4f6;
        color: #111827;
    }

    .search-container {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.875rem;
        transition: border-color 0.2s;
    }

    .search-input:focus {
        outline: none;
        border-color: #3b82f6;
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
        color: #6b7280;
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
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        transition: all 0.2s;
    }

    .exercise-item:hover {
        border-color: #d1d5db;
        background: #f9fafb;
    }

    .exercise-item.assigned {
        background: #f0fdf4;
        border-color: #86efac;
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
        border-radius: 10px;
        flex-shrink: 0;
    }

    .icon-check {
        background: #d1fae5;
        color: #059669;
    }

    .icon-plus {
        background: #e5e7eb;
        color: #6b7280;
    }

    .exercise-info h3 {
        margin: 0;
        font-size: 0.938rem;
        font-weight: 500;
        color: #111827;
    }

    .description {
        margin: 0.25rem 0 0;
        font-size: 0.813rem;
        color: #6b7280;
    }

    .toggle-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .toggle-btn:not(.remove) {
        background: #3b82f6;
        color: white;
    }

    .toggle-btn:not(.remove):hover:not(:disabled) {
        background: #2563eb;
    }

    .toggle-btn.remove {
        background: #fee2e2;
        color: #dc2626;
    }

    .toggle-btn.remove:hover:not(:disabled) {
        background: #fecaca;
    }

    .toggle-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
    }

    .btn-secondary {
        padding: 0.625rem 1.5rem;
        border: 1px solid #d1d5db;
        background: white;
        color: #374151;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
    }
</style>
