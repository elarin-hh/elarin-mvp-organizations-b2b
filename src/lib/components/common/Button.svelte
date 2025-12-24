<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    onclick?: () => void;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    onclick,
    class: className = "",
    children,
  }: Props = $props();

  const baseClasses = "font-medium transition-colors focus:outline-none";

  const variantClasses = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-400",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-400",
    outline:
      "border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/20 disabled:border-gray-400 disabled:text-gray-400",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
</script>

<button
  {type}
  {disabled}
  {onclick}
  class="{baseClasses} {variantClasses[variant]} {sizeClasses[
    size
  ]} {className}"
  style="border-radius: var(--radius-standard);"
>
  {@render children?.()}
</button>
