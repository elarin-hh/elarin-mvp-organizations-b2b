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
			title: "MoveNet acelera a estimativa de pose em tempo real",
			summary:
				"O modelo MoveNet do TensorFlow foca em baixa latência e boa precisão, facilitando aplicações de análise de movimento e feedback imediato.",
			sourceLabel: "TensorFlow Blog — MoveNet",
			sourceUrl: "https://blog.tensorflow.org/2021/05/movenet.html",
			tag: "TensorFlow",
		},
		{
			title: "DeepLabCut para rastreamento sem marcadores",
			summary:
				"Publicação apresenta uma ferramenta open-source que estima pose e rastreia partes do corpo sem marcadores, útil em biomecânica e reabilitação.",
			sourceLabel: "Nature Neuroscience — DeepLabCut",
			sourceUrl: "https://www.nature.com/articles/s41593-018-0209-y",
			tag: "Pesquisa",
		},
		{
			title: "OpenSim Moco para otimizar movimentos",
			summary:
				"A extensão do OpenSim mostra como modelar e otimizar movimentos musculoesqueléticos para estimar forças internas.",
			sourceLabel: "OpenSim Moco",
			sourceUrl: "https://opensim-org.github.io/opensim-moco-site/",
			tag: "Biomecânica",
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
