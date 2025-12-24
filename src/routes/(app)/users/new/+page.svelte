<script lang="ts">
	import { goto } from "$app/navigation";
	import { organizationsApi } from "$lib/api/organizations.api";
	import ArrowLeft from "lucide-svelte/icons/arrow-left";

	// Form states
	let full_name = $state("");
	let email = $state("");
	let birth_date = $state("");
	let password = $state("");
	let confirmPassword = $state("");
	let locale = $state("pt-BR");
	let marketing_consent = $state(false);
	let height_cm = $state<number | undefined>(undefined);
	let weight_kg = $state<number | undefined>(undefined);

	// Error states
	let formError = $state("");
	let fullNameError = $state("");
	let emailError = $state("");
	let birthDateError = $state("");
	let passwordError = $state("");
	let confirmPasswordError = $state("");
	let heightError = $state("");
	let weightError = $state("");

	// Loading state
	let isSubmitting = $state(false);
	let submitSuccess = $state(false);

	// Validation functions
	function validateAge(birthDateStr: string): boolean {
		if (!birthDateStr) return false;

		const today = new Date();
		const birth = new Date(birthDateStr);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birth.getDate())
		) {
			age--;
		}

		return age >= 13;
	}

	function validateHeight(height?: number): string {
		if (height === undefined || height === null) return "";

		if (height < 50) {
			return "Altura deve ser no mínimo 50cm";
		}

		if (height > 300) {
			return "Altura deve ser no máximo 300cm";
		}

		if (!Number.isInteger(height)) {
			return "Altura deve ser um número inteiro";
		}

		return "";
	}

	function validateWeight(weight?: number): string {
		if (weight === undefined || weight === null) return "";

		if (weight < 20) {
			return "Peso deve ser no mínimo 20kg";
		}

		if (weight > 500) {
			return "Peso deve ser no máximo 500kg";
		}

		const decimalPart = weight.toString().split(".")[1];
		if (decimalPart && decimalPart.length > 1) {
			return "Peso deve ter no máximo 1 casa decimal";
		}

		return "";
	}

	function validateEmail(emailStr: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(emailStr);
	}

	// Real-time validation effects
	$effect(() => {
		if (height_cm !== undefined && height_cm !== null) {
			heightError = validateHeight(height_cm);
		}
	});

	$effect(() => {
		if (weight_kg !== undefined && weight_kg !== null) {
			weightError = validateWeight(weight_kg);
		}
	});

	// Form validation
	function validateForm(): boolean {
		let isValid = true;

		// Reset errors
		fullNameError = "";
		emailError = "";
		birthDateError = "";
		passwordError = "";
		confirmPasswordError = "";
		formError = "";

		// Validate full name
		if (!full_name.trim()) {
			fullNameError = "Nome completo é obrigatório";
			isValid = false;
		} else if (full_name.trim().length < 2) {
			fullNameError = "Nome deve ter no mínimo 2 caracteres";
			isValid = false;
		}

		// Validate email
		if (!email.trim()) {
			emailError = "Email é obrigatório";
			isValid = false;
		} else if (!validateEmail(email)) {
			emailError = "Email inválido";
			isValid = false;
		}

		// Validate birth date
		if (!birth_date) {
			birthDateError = "Data de nascimento é obrigatória";
			isValid = false;
		} else if (!validateAge(birth_date)) {
			birthDateError =
				"Usuário deve ter pelo menos 13 anos (LGPD Art. 14, §1º)";
			isValid = false;
		}

		// Validate password
		if (!password) {
			passwordError = "Senha é obrigatória";
			isValid = false;
		} else if (password.length < 6) {
			passwordError = "Senha deve ter no mínimo 6 caracteres";
			isValid = false;
		}

		// Validate confirm password
		if (!confirmPassword) {
			confirmPasswordError = "Confirme a senha";
			isValid = false;
		} else if (password !== confirmPassword) {
			confirmPasswordError = "As senhas não coincidem";
			isValid = false;
		}

		// Validate optional fields
		if (height_cm !== undefined && height_cm !== null) {
			const heightValidation = validateHeight(height_cm);
			if (heightValidation) {
				heightError = heightValidation;
				isValid = false;
			}
		}

		if (weight_kg !== undefined && weight_kg !== null) {
			const weightValidation = validateWeight(weight_kg);
			if (weightValidation) {
				weightError = weightValidation;
				isValid = false;
			}
		}

		return isValid;
	}

	// Form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm()) {
			formError = "Por favor, corrija os erros no formulário";
			return;
		}

		isSubmitting = true;
		formError = "";

		const response = await organizationsApi.createUser({
			email: email.trim(),
			password,
			full_name: full_name.trim(),
			birth_date,
			locale: locale || "pt-BR",
			marketing_consent: marketing_consent || false,
			height_cm:
				height_cm !== undefined && height_cm !== null
					? height_cm
					: undefined,
			weight_kg:
				weight_kg !== undefined && weight_kg !== null
					? weight_kg
					: undefined,
		});

		isSubmitting = false;

		if (response.success) {
			submitSuccess = true;
			// Wait a bit to show success message, then redirect
			setTimeout(() => {
				goto("/users");
			}, 2000);
		} else {
			formError = response.error?.message || "Erro ao cadastrar usuário";
		}
	}

	function handleCancel() {
		// Check if form has data
		const hasData =
			full_name ||
			email ||
			birth_date ||
			password ||
			confirmPassword ||
			height_cm ||
			weight_kg;

		if (
			hasData &&
			!confirm("Deseja cancelar? Os dados preenchidos serão perdidos.")
		) {
			return;
		}

		goto("/users");
	}
</script>

<div class="min-h-full pb-8">
	<main class="w-full min-h-full px-6 pt-8">
		<!-- Header -->
		<div class="mb-8">
			<button
				onclick={() => goto("/users")}
				class="flex items-center text-white/50 hover:text-white mb-4 transition-colors"
			>
				<ArrowLeft size={20} class="mr-2" />
				Voltar
			</button>

			<h1 class="text-3xl font-bold text-white tracking-tight">
				Cadastrar Novo Usuário
			</h1>
			<p class="text-white/60 mt-2">
				Preencha os dados do usuário para vinculá-lo à organização
			</p>
		</div>

		<!-- Success Message -->
		{#if submitSuccess}
			<div
				class="bg-green-500/10 text-green-200 px-6 py-4 mb-6"
				style="border-radius: var(--radius-standard);"
			>
				<p class="font-semibold mb-1">
					Usuário cadastrado com sucesso!
				</p>
				<p class="text-sm text-green-200/80">
					O usuário foi criado e aguarda aprovação da organização.
					Redirecionando...
				</p>
			</div>
		{/if}

		<!-- Error Message -->
		{#if formError && !submitSuccess}
			<div
				class="bg-red-500/10 text-red-200 px-6 py-4 mb-6"
				style="border-radius: var(--radius-standard);"
			>
				{formError}
			</div>
		{/if}

		<!-- Form -->
		<form onsubmit={handleSubmit} class="w-full">
			<div
				class="user-card p-6 space-y-6"
				style="border-radius: var(--radius-standard);"
			>
				<!-- Personal Information -->
				<div>
					<h3
						class="text-sm font-semibold uppercase text-white/70 tracking-wide mb-4"
					>
						Informações Pessoais
					</h3>

					<div class="space-y-4">
						<!-- Full Name -->
						<div>
							<label
								for="full_name"
								class="block text-sm text-white/70 mb-2"
							>
								Nome Completo <span class="text-red-400">*</span
								>
							</label>
							<input
								id="full_name"
								type="text"
								bind:value={full_name}
								required
								placeholder="Nome completo do usuário"
								class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							/>
							{#if fullNameError}
								<p class="text-red-400 text-sm mt-1">
									{fullNameError}
								</p>
							{/if}
						</div>

						<!-- Email -->
						<div>
							<label
								for="email"
								class="block text-sm text-white/70 mb-2"
							>
								Email <span class="text-red-400">*</span>
							</label>
							<input
								id="email"
								type="email"
								bind:value={email}
								required
								placeholder="email@exemplo.com"
								class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							/>
							{#if emailError}
								<p class="text-red-400 text-sm mt-1">
									{emailError}
								</p>
							{/if}
						</div>

						<!-- Birth Date -->
						<div>
							<label
								for="birth_date"
								class="block text-sm text-white/70 mb-2"
							>
								Data de Nascimento <span class="text-red-400"
									>*</span
								>
							</label>
							<input
								id="birth_date"
								type="date"
								bind:value={birth_date}
								required
								max={new Date().toISOString().split("T")[0]}
								class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							/>
							{#if birthDateError}
								<p class="text-red-400 text-sm mt-1">
									{birthDateError}
								</p>
							{/if}
							<p class="text-white/50 text-xs mt-1">
								Idade mínima: 13 anos (LGPD Art. 14, §1º)
							</p>
						</div>

						<!-- Password fields -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Password -->
							<div>
								<label
									for="password"
									class="block text-sm text-white/70 mb-2"
								>
									Senha <span class="text-red-400">*</span>
								</label>
								<input
									id="password"
									type="password"
									bind:value={password}
									required
									placeholder="Mínimo 6 caracteres"
									class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
									style="border-radius: var(--radius-standard);"
									disabled={isSubmitting}
								/>
								{#if passwordError}
									<p class="text-red-400 text-sm mt-1">
										{passwordError}
									</p>
								{/if}
							</div>

							<!-- Confirm Password -->
							<div>
								<label
									for="confirmPassword"
									class="block text-sm text-white/70 mb-2"
								>
									Confirmar Senha <span class="text-red-400"
										>*</span
									>
								</label>
								<input
									id="confirmPassword"
									type="password"
									bind:value={confirmPassword}
									required
									placeholder="Confirme a senha"
									class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
									style="border-radius: var(--radius-standard);"
									disabled={isSubmitting}
								/>
								{#if confirmPasswordError}
									<p class="text-red-400 text-sm mt-1">
										{confirmPasswordError}
									</p>
								{/if}
							</div>
						</div>

						<!-- Locale -->
						<div>
							<label
								for="locale"
								class="block text-sm text-white/70 mb-2"
							>
								Idioma Preferido
							</label>
							<select
								id="locale"
								bind:value={locale}
								class="w-full px-6 py-3 bg-white/5 text-white focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							>
								<option value="pt-BR">Português (Brasil)</option
								>
								<option value="en-US">English (US)</option>
								<option value="es-ES">Español</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Biometric Data (Optional) -->
				<div class="pt-6 border-t border-white/10">
					<h3
						class="text-sm font-semibold uppercase text-white/70 tracking-wide mb-4"
					>
						Dados Biométricos (Opcional)
					</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Height -->
						<div>
							<label
								for="height_cm"
								class="block text-sm text-white/70 mb-2"
							>
								Altura (cm)
							</label>
							<input
								id="height_cm"
								type="number"
								bind:value={height_cm}
								min="50"
								max="300"
								step="1"
								placeholder="ex: 175"
								inputmode="numeric"
								class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							/>
							{#if heightError}
								<p class="text-red-400 text-sm mt-1">
									{heightError}
								</p>
							{/if}
						</div>

						<!-- Weight -->
						<div>
							<label
								for="weight_kg"
								class="block text-sm text-white/70 mb-2"
							>
								Peso (kg)
							</label>
							<input
								id="weight_kg"
								type="number"
								bind:value={weight_kg}
								min="20"
								max="500"
								step="0.1"
								placeholder="ex: 70.5"
								inputmode="decimal"
								class="w-full px-6 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:bg-white/10 transition-colors"
								style="border-radius: var(--radius-standard);"
								disabled={isSubmitting}
							/>
							{#if weightError}
								<p class="text-red-400 text-sm mt-1">
									{weightError}
								</p>
							{/if}
						</div>
					</div>

					<p class="text-white/50 text-xs mt-3">
						Estes dados são opcionais e podem ser preenchidos
						posteriormente
					</p>
				</div>

				<!-- Marketing Consent -->
				<div class="pt-6 border-t border-white/10">
					<label class="flex items-start gap-3 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={marketing_consent}
							class="mt-1 w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-2 focus:ring-primary-500"
							disabled={isSubmitting}
						/>
						<span class="text-sm text-white/70">
							Aceito receber comunicações de marketing (opcional)
						</span>
					</label>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-4 pt-6">
					<button
						type="button"
						onclick={handleCancel}
						disabled={isSubmitting}
						class="flex-1 px-6 py-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 font-medium transition-all disabled:opacity-50"
						style="border-radius: var(--radius-standard);"
					>
						Cancelar
					</button>

					<button
						type="submit"
						disabled={isSubmitting || submitSuccess}
						class="flex-1 px-6 py-3 bg-primary-500 text-white font-medium hover:bg-primary-600 active:bg-primary-700 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
						style="border-radius: var(--radius-standard);"
					>
						{#if isSubmitting}
							Cadastrando...
						{:else if submitSuccess}
							Cadastrado!
						{:else}
							Cadastrar Usuário
						{/if}
					</button>
				</div>
			</div>
		</form>
	</main>
</div>

<style>
	.user-card {
		background: var(--color-bg-dark-secondary);
	}

	input[type="date"]::-webkit-calendar-picker-indicator {
		filter: invert(1);
		opacity: 0.5;
		cursor: pointer;
	}

	input[type="date"]::-webkit-calendar-picker-indicator:hover {
		opacity: 0.8;
	}

	select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' opacity='0.5' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1.5rem center;
		padding-right: 3rem;
	}
</style>
