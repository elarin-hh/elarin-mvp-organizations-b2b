import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { organizationAuthActions } from '$lib/stores/organization-auth.store';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async () => {
    const session = await organizationAuthActions.checkSession();

    if (!session.success) {
        throw redirect(302, '/login');
    }

    return {};
};
