<script lang="ts">
	import { currentOrganization } from "$lib/stores/organization-auth.store";
	import NewsPanel from "$lib/components/organization/NewsPanel.svelte";

	const organization = $derived($currentOrganization);

	const newsItems = [
		{
			title: "MediaPipe Pose Landmarker: postura e movimentos",
			summary:
				"A documentação descreve que o Pose Landmarker identifica pontos-chave do corpo, analisa postura e categoriza movimentos em imagem ou vídeo.",
			sourceLabel: "MediaPipe Pose Landmarker",
			sourceUrl:
				"https://developers.google.com/mediapipe/solutions/vision/pose_landmarker",
			tag: "MediaPipe",
		},
		{
			title: "Landmarks em 2D e 3D",
			summary:
				"O task entrega landmarks do corpo em coordenadas de imagem e em coordenadas 3D do mundo, útil para análises de movimento.",
			sourceLabel: "MediaPipe Pose Landmarker",
			sourceUrl:
				"https://developers.google.com/mediapipe/solutions/vision/pose_landmarker",
			tag: "Visão",
		},
		{
			title: "Biomecânica como base científica",
			summary:
				"Biomecânica estuda estrutura, função e movimento dos aspectos mecânicos dos sistemas biológicos, usando métodos da mecânica.",
			sourceLabel: "Wikipedia — Biomechanics",
			sourceUrl: "https://en.wikipedia.org/wiki/Biomechanics",
			tag: "Biomecânica",
		},
		{
			title: "Cinemática foca no movimento",
			summary:
				"A cinemática descreve o movimento de corpos sem considerar as forças que o causam.",
			sourceLabel: "Wikipedia — Kinematics",
			sourceUrl: "https://en.wikipedia.org/wiki/Kinematics",
			tag: "Cinemática",
		},
	];

</script>

<div class="min-h-full">
	<!-- Main Content -->
	<main class="w-full min-h-full px-6 pb-8 pt-8">
		{#if organization}
			<div class="mb-8">
				<h2 class="text-3xl font-bold text-white mb-2">
					Olá, {organization.name}!
				</h2>
				<p class="text-white/70">Painel de gerenciamento</p>
			</div>
		{/if}

		<NewsPanel items={newsItems} />
	</main>
</div>
