<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";
    import {
        ArrowLeft,
        Activity,
        Calendar,
        Ruler,
        Weight,
        Trash2,
        Dumbbell,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import ExerciseConfigEditor from "$lib/components/organization/ExerciseConfigEditor.svelte";
    import ManageExercisesModal from "$lib/components/organization/ManageExercisesModal.svelte";
    import { organizationsApi } from "$lib/api/organizations.api";
    import type {
        TrainingPlan,
        TrainingPlanAssignment,
    } from "$lib/types/training-plan";
    import UserCheck from "lucide-svelte/icons/user-check";
    import CircleOff from "lucide-svelte/icons/circle-off";
    import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
    import { toast } from "$lib/stores/toast.store";

    let { data }: { data: PageData } = $props();

    let user = $state(data.user);
    let exercises = $state(data.exercises ?? []);
    let templates = $state(data.templates ?? []);
    let trainingPlans = $state<TrainingPlan[]>(data.trainingPlans ?? []);
    let assignedTrainingPlans = $state<TrainingPlanAssignment[]>(
        data.assignedTrainingPlans ?? [],
    );

    $effect(() => {
        user = data.user;
        exercises = data.exercises ?? [];
        templates = data.templates ?? [];
        trainingPlans = data.trainingPlans ?? [];
        assignedTrainingPlans = data.assignedTrainingPlans ?? [];
    });

    // State
    let selectedExerciseId = $state<number | null>(null);
    let fullConfig = $state<any>(null);
    let isLoadingConfig = $state(false);
    let showAssignModal = $state(false);
    let selectedPlanId = $state<number | null>(null);
    let planAssignError = $state("");
    let isAssigningPlan = $state(false);

    // Dialog State
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

    // Helper to calculate age
    function getAge(birthDate: string | null): string {
        if (!birthDate) return "--";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    }

    async function handleSelectExercise(exercise: any) {
        console.log(
            "[handleSelectExercise] Starting for exercise:",
            exercise.id,
        );
        if (selectedExerciseId === exercise.id) {
            selectedExerciseId = null;
            fullConfig = null;
            return;
        }

        selectedExerciseId = exercise.id;
        isLoadingConfig = true;
        console.log("[handleSelectExercise] isLoadingConfig set to true");
        try {
            const res = await organizationsApi.getExerciseConfig(
                user.user_id,
                exercise.id,
            );
            console.log("[handleSelectExercise] API response:", res);
            if (res.success) {
                fullConfig = res.data;
                console.log(
                    "[handleSelectExercise] fullConfig set:",
                    fullConfig,
                );
            } else {
                console.error(
                    "[handleSelectExercise] API returned failure:",
                    res,
                );
            }
        } catch (err) {
            console.error("[handleSelectExercise] Error:", err);
            toast.error("Erro ao carregar configurações");
        } finally {
            isLoadingConfig = false;
            console.log(
                "[handleSelectExercise] isLoadingConfig set to false, fullConfig:",
                fullConfig,
            );
        }
    }

    async function handleSaveConfig(newConfig: any) {
        if (!selectedExerciseId) return;

        try {
            const res = await organizationsApi.updateExerciseConfig(
                user.user_id,
                selectedExerciseId,
                newConfig,
            );
            if (res.success) {
                // Refresh local data if needed or just show success (handled in component)
            } else {
                throw new Error(res.error?.message || "Failed");
            }
        } catch (err) {
            throw err; // Propagate to component handle
        }
    }

    async function handleRemoveExercise(exerciseId: number) {
        openDialog({
            title: "Remover exercício",
            message:
                "Tem certeza que deseja remover este exercício do usuário?",
            variant: "danger",
            confirmLabel: "Remover",
            onConfirm: async () => {
                const res = await organizationsApi.removeExercise(
                    user.user_id,
                    exerciseId,
                );
                if (res.success) {
                    exercises = exercises.filter((e) => e.id !== exerciseId);
                    if (selectedExerciseId === exerciseId) {
                        selectedExerciseId = null;
                        fullConfig = null;
                    }
                    closeDialog();
                    closeDialog(); // Double close dialog is weird but keeping strict replacement scope
                    toast.success("Expercício removido com sucesso");
                } else {
                    toast.error("Erro ao remover exercício");
                }
            },
        });
    }

    async function handleToggleStatus() {
        const action = user.is_active ? "desativar" : "ativar";
        openDialog({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuário`,
            message: `Tem certeza que deseja ${action} este usuário?`,
            variant: user.is_active ? "warning" : "default",
            confirmLabel: user.is_active ? "Desativar" : "Ativar",
            onConfirm: async () => {
                try {
                    const res = await organizationsApi.toggleUserStatus(
                        user.user_id,
                    );
                    if (res.success) {
                        user.is_active = !user.is_active;
                        goto($page.url, { invalidateAll: true });
                        goto($page.url, { invalidateAll: true });
                        closeDialog();
                        toast.success(
                            `Usuário ${user.is_active ? "ativado" : "desativado"} com sucesso`,
                        );
                    } else {
                        toast.error("Erro ao alterar status");
                    }
                } catch (e) {
                    toast.error("Erro de conexão");
                }
            },
        });
    }

    async function handleRemoveUser() {
        openDialog({
            title: "Remover usuário",
            message:
                "Tem certeza que deseja remover este usuário permanentemente? Esta ação não pode ser desfeita.",
            variant: "danger",
            confirmLabel: "Remover Permanentemente",
            onConfirm: async () => {
                try {
                    const res = await organizationsApi.removeUser(user.user_id);
                    if (res.success) {
                        closeDialog();
                        toast.success("Usuário removido com sucesso");
                        goto("/users");
                    } else {
                        toast.error("Erro ao remover usuário");
                    }
                } catch (e) {
                    toast.error("Erro de conexão");
                }
            },
        });
    }
    async function handleAssignPlan() {
        if (!selectedPlanId || isAssigningPlan) {
            planAssignError = "Selecione um plano de treino.";
            return;
        }

        planAssignError = "";
        isAssigningPlan = true;

        const res = await organizationsApi.assignTrainingPlanToUser(
            user.user_id,
            selectedPlanId,
        );

        if (res.success) {
            assignedTrainingPlans = [res.data, ...assignedTrainingPlans];
            selectedPlanId = null;
            toast.success("Plano atribuído com sucesso");
        } else {
            planAssignError = res.error?.message || "Erro ao atribuir plano.";
            toast.error(planAssignError);
        }

        isAssigningPlan = false;
    }

    async function handleRemovePlan(planId: number) {
        openDialog({
            title: "Remover plano",
            message: "Deseja remover o plano deste usuário?",
            variant: "danger",
            confirmLabel: "Remover",
            onConfirm: async () => {
                const res = await organizationsApi.removeTrainingPlanFromUser(
                    user.user_id,
                    planId,
                );

                if (res.success) {
                    assignedTrainingPlans = assignedTrainingPlans.filter(
                        (p) => p.plan_id !== planId,
                    );
                    closeDialog();
                } else {
                    planAssignError =
                        res.error?.message || "Erro ao remover plano.";
                }
            },
        });
    }

    function handleExercisesUpdated() {
        // Reload page data to get fresh exercises list
        goto($page.url, { invalidateAll: true });
    }
</script>

<div class="min-h-full pb-8">
    <main class="w-full min-h-full px-6 pt-8">
        <!-- Back & Header -->
        <div class="mb-8">
            <button
                onclick={() => goto("/users")}
                class="flex items-center text-white/50 mb-4 transition-colors"
            >
                <ArrowLeft size={20} class="mr-2" />
                Voltar
            </button>

            <div
                class="user-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div class="flex items-center gap-4">
                    {#if user.users?.avatar_url}
                        <img
                            src={user.users.avatar_url}
                            alt={user.users.full_name}
                            class="w-16 h-16 rounded-full object-cover"
                        />
                    {:else}
                        <div
                            class="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white"
                        >
                            <span class="text-2xl font-bold"
                                >{user.users?.full_name
                                    ?.charAt(0)
                                    .toUpperCase()}</span
                            >
                        </div>
                    {/if}
                    <div>
                        <h1
                            class="text-2xl font-bold text-white tracking-tight"
                        >
                            {user.users?.full_name || "Usuário sem nome"}
                        </h1>
                        <div
                            class="flex items-center gap-3 text-white/60 text-sm mt-2"
                        >
                            <span>{user.users?.email}</span>
                            <span class="w-1 h-1 bg-white/20 rounded-full"
                            ></span>
                            <span
                                class="flex items-center gap-1.5 {user.is_active
                                    ? 'text-primary-500'
                                    : 'text-red-400'}"
                            >
                                <span
                                    class="w-2 h-2 rounded-full {user.is_active
                                        ? 'bg-primary-500'
                                        : 'bg-red-400'}"
                                ></span>
                                {user.is_active ? "Ativo" : "Inativo"}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button
                        onclick={handleToggleStatus}
                        class="btn-ghost flex items-center gap-2 text-sm font-medium"
                        style={`border-radius: var(--radius-md); ${
                            user.is_active
                                ? "color: rgba(255, 255, 255, 0.8);"
                                : "color: var(--color-primary-500);"
                        }`}
                        title={user.is_active
                            ? "Desativar usuário"
                            : "Ativar usuário"}
                    >
                        {#if user.is_active}
                            <CircleOff size={16} /> Desativar
                        {:else}
                            <UserCheck size={16} /> Ativar
                        {/if}
                    </button>
                    <button
                        onclick={handleRemoveUser}
                        class="btn-ghost text-red-400 flex items-center gap-2 text-sm font-medium"
                        style="border-radius: var(--radius-md);"
                    >
                        <Trash2 size={16} /> Remover
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Sidebar: Profile Stats -->
            <div class="lg:col-span-1 space-y-4">
                <div class="user-card p-5">
                    <h3
                        class="text-sm font-semibold uppercase text-white/70 tracking-wide mb-5"
                    >
                        Perfil Biométrico
                    </h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-3">
                            <div class="flex items-center gap-3 text-white/50">
                                <Calendar size={18} />
                                <span>Idade</span>
                            </div>
                            <span class="font-medium text-white"
                                >{getAge(user.users?.birth_date)} anos</span
                            >
                        </div>
                        <div class="flex justify-between items-center py-3">
                            <div class="flex items-center gap-3 text-white/50">
                                <Ruler size={18} />
                                <span>Altura</span>
                            </div>
                            <span class="font-medium text-white"
                                >{user.users?.height_cm || "--"} cm</span
                            >
                        </div>
                        <div class="flex justify-between items-center py-3">
                            <div class="flex items-center gap-3 text-white/50">
                                <Weight size={18} />
                                <span>Peso</span>
                            </div>
                            <span class="font-medium text-white"
                                >{user.users?.weight_kg || "--"} kg</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content: Exercises -->
            <div class="lg:col-span-2 space-y-4">
                <div class="user-card p-5 plan-assignment-card">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <h3
                            class="text-lg font-semibold text-white flex items-center gap-2"
                        >
                            <Dumbbell size={18} /> Planos de treino
                        </h3>
                        {#if assignedTrainingPlans.length > 0}
                            <span class="assignment-chip"
                                >{assignedTrainingPlans.length} Ativos</span
                            >
                        {/if}
                    </div>

                    {#if assignedTrainingPlans.length > 0}
                        <div class="space-y-3 mb-6">
                            {#each assignedTrainingPlans as assignment}
                                <div
                                    class="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div class="flex flex-col">
                                        <span class="text-white font-medium"
                                            >{assignment.plan?.name ||
                                                "Plano sem nome"}</span
                                        >
                                        <div
                                            class="flex items-center gap-2 text-xs text-white/50"
                                        >
                                            <span
                                                >Atribuído em: {new Date(
                                                    assignment.assigned_at,
                                                ).toLocaleDateString()}</span
                                            >
                                        </div>
                                    </div>
                                    <button
                                        class="btn-ghost text-red-400 p-2 hover:bg-white/10"
                                        style="border-radius: var(--radius-md);"
                                        onclick={() =>
                                            handleRemovePlan(
                                                assignment.plan_id,
                                            )}
                                        title="Remover plano"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div
                            class="text-center py-6 text-white/40 bg-white/5 rounded-md mb-4 border border-white/5 border-dashed"
                        >
                            <Dumbbell
                                size={24}
                                class="mx-auto mb-2 opacity-50"
                            />
                            <p class="text-sm">Nenhum plano ativo.</p>
                        </div>
                    {/if}

                    <div
                        class="assignment-controls pt-4 border-t border-white/10"
                    >
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-medium text-white/60"
                                >Adicionar novo plano</span
                            >
                            <div class="flex gap-2">
                                <label class="plan-select flex-1">
                                    <select
                                        onchange={(e) =>
                                            (selectedPlanId =
                                                Number(
                                                    (
                                                        e.target as HTMLSelectElement
                                                    ).value,
                                                ) || null)}
                                        value={selectedPlanId || ""}
                                        class="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:bg-white/10"
                                    >
                                        <option value=""
                                            >Selecione um plano...</option
                                        >
                                        {#each trainingPlans.filter((p) => p.is_active && !assignedTrainingPlans.find((ap) => ap.plan_id === p.id)) as plan}
                                            <option value={plan.id}>
                                                {plan.name}
                                            </option>
                                        {/each}
                                    </select>
                                </label>
                                <button
                                    class="bg-primary-600 hover:bg-primary-500 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onclick={handleAssignPlan}
                                    disabled={!selectedPlanId ||
                                        isAssigningPlan}
                                >
                                    {isAssigningPlan ? "..." : "Adicionar"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {#if planAssignError}
                        <p class="plan-error mt-2 text-red-400 text-sm">
                            {planAssignError}
                        </p>
                    {/if}
                </div>
                <div class="flex justify-between items-center">
                    <h3
                        class="text-xl font-bold text-white flex items-center gap-3"
                    >
                        Planos de Exercício
                    </h3>
                    <button
                        onclick={() => (showAssignModal = true)}
                        class="btn-ghost text-sm font-medium flex items-center gap-2 text-primary-500"
                        style="border-radius: var(--radius-md);"
                    >
                        + Adicionar Exercício
                    </button>
                </div>

                <div class="space-y-4">
                    {#if exercises.length === 0}
                        <div class="user-card p-10 text-center">
                            <div
                                class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4 text-white/30"
                            >
                                <Activity size={24} />
                            </div>
                            <p class="text-white/50 text-lg">
                                Nenhum exercício atribuído para este usuário.
                            </p>
                            <button
                                onclick={() => (showAssignModal = true)}
                                class="mt-4 text-primary-500 font-medium text-sm"
                            >
                                Clique para adicionar o primeiro exercício
                            </button>
                        </div>
                    {:else}
                        {#each exercises as exercise}
                            <div
                                class="user-card exercise-card overflow-hidden"
                                class:active={selectedExerciseId ===
                                    exercise.id}
                            >
                                <div
                                    class="p-4 flex items-center justify-between cursor-pointer"
                                    onclick={() =>
                                        handleSelectExercise(exercise)}
                                >
                                    <div class="flex items-center gap-4">
                                        <div class="exercise-initial">
                                            {exercise.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4
                                                class="font-semibold text-white text-base"
                                            >
                                                {exercise.name}
                                            </h4>
                                            <p
                                                class="text-xs text-white/50 mt-1"
                                            >
                                                Atribuído em {new Date(
                                                    exercise.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span
                                            class="exercise-pill {selectedExerciseId ===
                                            exercise.id
                                                ? 'exercise-pill--active'
                                                : 'exercise-pill--idle'}"
                                        >
                                            {selectedExerciseId === exercise.id
                                                ? "Editando"
                                                : "Configurar"}
                                        </span>
                                        <button
                                            onclick={(event) => {
                                                event.stopPropagation();
                                                handleRemoveExercise(
                                                    exercise.id,
                                                );
                                            }}
                                            class="w-8 h-8 flex items-center justify-center hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                                            style="border-radius: var(--radius-md);"
                                            title="Remover exercício"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {#if selectedExerciseId === exercise.id}
                                    <div
                                        class="config-panel p-5"
                                        transition:slide
                                    >
                                        {#if isLoadingConfig}
                                            <div
                                                class="py-12 text-center flex flex-col items-center justify-center"
                                            >
                                                <div
                                                    class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"
                                                ></div>
                                                <span
                                                    class="text-white/50 text-sm"
                                                    >Carregando configurações...</span
                                                >
                                            </div>
                                        {:else if fullConfig}
                                            <ExerciseConfigEditor
                                                template={{
                                                    ...exercise,
                                                    default_config:
                                                        fullConfig.default_config,
                                                    fixed_config:
                                                        fullConfig.fixed_config,
                                                    name: fullConfig.exercise_name,
                                                }}
                                                userConfig={fullConfig.user_config}
                                                onSave={handleSaveConfig}
                                            />
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </main>

    <!-- Reuse existing logic for modal -->
    {#if showAssignModal}
        <ManageExercisesModal
            user={user.users}
            {exercises}
            {templates}
            onClose={() => (showAssignModal = false)}
            onUpdate={handleExercisesUpdated}
        />
    {/if}

    <ConfirmDialog
        isOpen={dialogOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmLabel={dialogConfig.confirmLabel}
        variant={dialogConfig.variant}
        onConfirm={dialogConfig.onConfirm}
        onCancel={closeDialog}
    />
</div>

<style>
    .user-card {
        border-radius: var(--radius-standard);
        background: var(--color-bg-dark-secondary);
    }

    .exercise-card {
        transition: background-color var(--transition-base);
    }

    .exercise-card.active {
        background: color-mix(
            in srgb,
            var(--color-primary-200) 15%,
            var(--color-bg-dark-secondary)
        );
    }

    .exercise-initial {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-standard);
        background: var(--color-primary-500);
        color: #fff;
        font-weight: 700;
        font-size: 1.125rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .exercise-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--radius-sm);
    }

    .exercise-pill--active {
        color: var(--color-primary-500);
        background: color-mix(
            in srgb,
            var(--color-primary-500) 14%,
            transparent
        );
    }

    .exercise-pill--idle {
        color: rgba(255, 255, 255, 0.5);
        background: rgba(255, 255, 255, 0.06);
    }

    .config-panel {
        background: var(--color-bg-dark-secondary);
    }

    .plan-assignment-card {
        border: none;
    }

    .assignment-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1.25rem;
        font-weight: 600;
        border-radius: var(--radius-sm);
        text-transform: none;
        letter-spacing: 0;
        color: var(--color-status-active);
        background-color: var(--color-status-active-bg);
    }

    .assignment-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
        justify-content: space-between;
    }

    .plan-select {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        min-width: 220px;
        flex: 1;
    }

    .plan-select select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: rgba(255, 255, 255, 0.05);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' opacity='0.5' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.85rem center;
        background-size: 12px 12px;
        border: none;
        border-radius: var(--radius-standard);
        padding: 0.5rem 2.2rem 0.5rem 0.75rem;
        color: #fff;
        outline: none;
    }

    .plan-select select option {
        background: var(--color-bg-dark);
        color: var(--color-text-primary);
    }

    .plan-error {
        color: rgb(239, 68, 68);
        font-size: 0.8rem;
        margin-top: 0.5rem;
    }
</style>
