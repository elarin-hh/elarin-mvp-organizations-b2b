<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    import {
        ArrowLeft,
        User,
        Activity,
        Calendar,
        Ruler,
        Weight,
        Trash2,
        Shield,
        Settings,
        Dumbbell,
        X,
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
                class="flex items-center text-white/50 hover:text-white mb-4 transition-colors"
            >
                <ArrowLeft size={20} class="mr-2" />
                Voltar para Usuários
            </button>

            <div
                class="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div class="flex items-center gap-6">
                    {#if user.users?.avatar_url}
                        <img
                            src={user.users.avatar_url}
                            alt={user.users.full_name}
                            class="w-20 h-20 rounded-full object-cover border-2 border-primary-500 shadow-lg shadow-primary-500/20"
                        />
                    {:else}
                        <div
                            class="w-20 h-20 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 border-2 border-primary-500/50 shadow-lg shadow-primary-500/10"
                        >
                            <span class="text-3xl font-bold"
                                >{user.users?.full_name
                                    ?.charAt(0)
                                    .toUpperCase()}</span
                            >
                        </div>
                    {/if}
                    <div>
                        <h1
                            class="text-3xl font-bold text-white tracking-tight"
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
                                    ? 'text-green-400'
                                    : 'text-red-400'}"
                            >
                                <span
                                    class="w-2 h-2 rounded-full {user.is_active
                                        ? 'bg-green-400'
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
                        class="glass-button-secondary px-4 py-2 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium"
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
                        class="glass-button-secondary px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 text-sm font-medium"
                    >
                        <Trash2 size={16} /> Remover
                    </button>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sidebar: Profile Stats -->
            <div class="lg:col-span-1 space-y-6">
                <div class="glass-card p-6">
                    <h3
                        class="text-lg font-bold text-white mb-6 flex items-center gap-2"
                    >
                        <Activity class="w-5 h-5 text-primary-400" />
                        Perfil Biométrico
                    </h3>
                    <div class="space-y-4">
                        <div
                            class="flex justify-between items-center py-3 border-b border-white/5"
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
                            class="flex justify-between items-center py-3 border-b border-white/5"
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
                            class="flex justify-between items-center py-3 border-b border-white/5"
                        >
                            <div class="flex items-center gap-3 text-white/50">
                                <Weight size={18} />
                                <span>Peso</span>
                            </div>
                            <span class="font-medium text-white"
                                >{user.users?.weight_kg || "--"} kg</span
                            >
                        </div>
                        <div class="flex justify-between items-center py-3">
                            <div class="flex items-center gap-3 text-white/50">
                                <Shield size={18} />
                                <span>Função</span>
                            </div>
                            <span
                                class="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-primary-500/20"
                            >
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content: Exercises -->
            <div class="lg:col-span-2 space-y-6">
                <div class="flex justify-between items-center">
                    <h3
                        class="text-xl font-bold text-white flex items-center gap-3"
                    >
                        <Dumbbell class="w-6 h-6 text-primary-400" />
                        Planos de Exercício
                    </h3>
                    <button
                        on:click={() => (showAssignModal = true)}
                        class="glass-button px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-white/10"
                    >
                        + Adicionar Exercício
                    </button>
                </div>

                <div class="space-y-4">
                    {#if exercises.length === 0}
                        <div class="glass-card p-16 text-center">
                            <div
                                class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 text-white/20"
                            >
                                <Activity size={32} />
                            </div>
                            <p class="text-white/50 text-lg">
                                Nenhum exercício atribuído para este usuário.
                            </p>
                            <button
                                on:click={() => (showAssignModal = true)}
                                class="mt-4 text-primary-400 hover:text-primary-300 font-medium text-sm"
                            >
                                Clique para adicionar o primeiro exercício
                            </button>
                        </div>
                    {:else}
                        {#each exercises as exercise}
                            <div
                                class="glass-card overflow-hidden transition-all duration-300 {selectedExerciseId ===
                                exercise.id
                                    ? 'ring-2 ring-primary-500/50 bg-white/10'
                                    : 'hover:bg-white/5'}"
                            >
                                <div
                                    class="p-5 flex items-center justify-between cursor-pointer group"
                                    on:click={() =>
                                        handleSelectExercise(exercise)}
                                >
                                    <div class="flex items-center gap-5">
                                        <div
                                            class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-white font-bold text-lg border border-white/10 group-hover:scale-110 transition-transform duration-300"
                                        >
                                            {exercise.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4
                                                class="font-bold text-white group-hover:text-primary-300 transition-colors text-lg"
                                            >
                                                {exercise.name}
                                            </h4>
                                            <p
                                                class="text-xs text-white/40 mt-1"
                                            >
                                                Atribuído em {new Date(
                                                    exercise.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <span
                                            class="text-xs font-medium px-3 py-1 rounded-full {selectedExerciseId ===
                                            exercise.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-transparent text-white/30 border border-white/10 group-hover:border-white/30'} transition-all"
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
                                            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                                            title="Remover exercício"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {#if selectedExerciseId === exercise.id}
                                    <div
                                        class="border-t border-white/10 p-6 bg-black/20"
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
