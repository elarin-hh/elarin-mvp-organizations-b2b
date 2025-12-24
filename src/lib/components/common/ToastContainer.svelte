<script lang="ts">
    import { toast } from "$lib/stores/toast.store";
    import ToastItem from "./Toast.svelte";

    import { onMount } from "svelte";

    let {} = $props();
</script>

<div class="toast-container">
    {#each $toast as item (item.id)}
        <ToastItem {item} />
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none; /* Allows clicking items underneath */
    }
</style>
