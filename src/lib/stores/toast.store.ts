import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    function add(message: string, type: ToastType = "info", duration = 3000) {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, duration };

        update((toasts) => [...toasts, toast]);

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
    }

    function remove(id: string) {
        update((toasts) => toasts.filter((t) => t.id !== id));
    }

    return {
        subscribe,
        add,
        remove,
        success: (msg: string, duration?: number) =>
            add(msg, "success", duration),
        error: (msg: string, duration?: number) => add(msg, "error", duration),
        warning: (msg: string, duration?: number) =>
            add(msg, "warning", duration),
        info: (msg: string, duration?: number) => add(msg, "info", duration),
    };
}

export const toast = createToastStore();
