<script lang="ts">
	import "../app.css";
	import { goto } from "$app/navigation";
	import { setUnauthorizedHandler } from "$lib/api/rest.client";
	import { organizationAuthActions } from "$lib/stores/organization-auth.store";
	import { ScrollArea, ToastContainer } from "$lib/components/common";

	let { children } = $props();

	if (typeof window !== "undefined") {
		let handlingUnauthorized = false;
		setUnauthorizedHandler(() => {
			if (handlingUnauthorized) return;
			handlingUnauthorized = true;
			organizationAuthActions.forceLogout();
			if (window.location.pathname !== "/login") {
				goto("/login");
			}
		});
	}
</script>

<ScrollArea className="min-h-screen" style="height:100vh;">
	{@render children?.()}
</ScrollArea>

<ToastContainer />
