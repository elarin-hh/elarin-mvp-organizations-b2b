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
        Shield,
        Dumbbell,
    } from "lucide-svelte";
    import type { PageData } from "./$types";
    import ExerciseConfigEditor from "$lib/components/organization/ExerciseConfigEditor.svelte";
    import ManageExercisesModal from "$lib/components/organization/ManageExercisesModal.svelte";
    import { organizationsApi } from "$lib/api/organizations.api";
    import UserCheck from "lucide-svelte/icons/user-check";
    import CircleOff from "lucide-svelte/icons/circle-off";

    export let data: PageData;

    $: user = data.user;
    $: exercises = data.exercises ?? [];
    $: templates = data.templates;

    // State
    let selectedExerciseId: number | null = null;
    let fullConfig: any = null;
    let isLoadingConfig = false;
    let showAssignModal = false;

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
        if (selectedExerciseId === exercise.id) {
            selectedExerciseId = null;
            fullConfig = null;
            return;
        }

        selectedExerciseId = exercise.id;
        isLoadingConfig = true;
        try {
            const res = await organizationsApi.getExerciseConfig(
                user.users?.id,
                exercise.id,
            );
            if (res.success) {
                fullConfig = res.data;
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao carregar configurações");
        } finally {
            isLoadingConfig = false;
        }
    }

    async function handleSaveConfig(newConfig: any) {
        if (!selectedExerciseId) return;

        try {
            const res = await organizationsApi.updateExerciseConfig(
                user.users?.id,
                selectedExerciseId,
                newConfig,
            );
            if (res.success) {
                // Refresh local data if needed or just show success (handled in component)
            } else {
                throw new Error(res.error || "Failed");
            }
        } catch (err) {
            throw err; // Propagate to component handle
        }
    }

    async function handleRemoveExercise(exerciseId: number) {
        if (
            !confirm(
                "Tem certeza que deseja remover este exercício do usuário?",
            )
        )
            return;

        const res = await organizationsApi.removeExercise(
            user.users?.id,
            exerciseId,
        );
        if (res.success) {
            exercises = exercises.filter((e) => e.id !== exerciseId);
            if (selectedExerciseId === exerciseId) {
                selectedExerciseId = null;
                fullConfig = null;
            }
        } else {
            alert("Erro ao remover exercício");
        }
    }

    async function handleToggleStatus() {
        if (
            !confirm(
                `Tem certeza que deseja ${user.is_active ? "desativar" : "ativar"} este usuário?`,
            )
        )
            return;

        try {
            const res = await organizationsApi.toggleUserStatus(user.user_id);
            if (res.success) {
                user.is_active = !user.is_active;
                // Ideally reload or update local state
                goto($page.url, { invalidateAll: true });
            } else {
                alert("Erro ao alterar status");
            }
        } catch (e) {
            alert("Erro de conexão");
        }
    }

    async function handleRemoveUser() {
        if (
            !confirm(
                "Tem certeza que deseja remover este usuário permanentemente?",
            )
        )
            return;

        try {
            const res = await organizationsApi.removeUser(user.user_id);
            if (res.success) {
                goto("/users");
            } else {
                alert("Erro ao remover usuário");
            }
        } catch (e) {
            alert("Erro de conexão");
        }
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
                on:click={() => goto("/users")}
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
                        on:click={handleToggleStatus}
                        class="user-action-btn px-4 py-2 flex items-center gap-2 text-sm font-medium"
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
                        on:click={handleRemoveUser}
                        class="user-action-btn px-4 py-2 text-red-400 hover:text-red-300 flex items-center gap-2 text-sm font-medium"
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
                        <div
                            class="flex justify-between items-center py-3"
                        >
                            <div class="flex items-center gap-3 text-white/50">
                                <Calendar size={18} />
                                <span>Idade</span>
                            </div>
                            <span class="font-medium text-white"
                                >{getAge(user.users?.birth_date)} anos</span
                            >
                        </div>
                        <div
                            class="flex justify-between items-center py-3"
                        >
                            <div class="flex items-center gap-3 text-white/50">
                                <Ruler size={18} />
                                <span>Altura</span>
                            </div>
                            <span class="font-medium text-white"
                                >{user.users?.height_cm || "--"} cm</span
                            >
                        </div>
                        <div
                            class="flex justify-between items-center py-3"
                        >
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
                <div class="flex justify-between items-center">
                    <h3
                        class="text-xl font-bold text-white flex items-center gap-3"
                    >
                        Planos de Exercício
                    </h3>
                    <button
                        on:click={() => (showAssignModal = true)}
                        class="user-action-btn px-4 py-2 text-sm font-medium flex items-center gap-2 text-primary-500"
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
                                on:click={() => (showAssignModal = true)}
                                class="mt-4 text-primary-500 font-medium text-sm"
                            >
                                Clique para adicionar o primeiro exercício
                            </button>
                        </div>
                    {:else}
                        {#each exercises as exercise}
                            <div
                                class="user-card exercise-card overflow-hidden"
                                class:active={selectedExerciseId === exercise.id}
                            >
                                <div
                                    class="p-4 flex items-center justify-between cursor-pointer"
                                    on:click={() =>
                                        handleSelectExercise(exercise)}
                                >
                                    <div class="flex items-center gap-4">
                                        <div
                                            class="exercise-initial"
                                        >
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
                                            on:click|stopPropagation={() =>
                                                handleRemoveExercise(
                                                    exercise.id,
                                                )}
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

    .user-action-btn {
        background: transparent;
        border: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        transition: color var(--transition-base),
            background-color var(--transition-base);
    }

    .user-action-btn:hover {
        background: transparent;
    }
</style>
