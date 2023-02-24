<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<div class="_formRoot">
			<FormSwitch v-model="enableEmail" class="_formBlock">
				<template #label>{{ $ts.enableEmail }}</template>
				<template #caption>{{ $ts.emailConfigInfo }}</template>
			</FormSwitch>

		</div>
	</FormSuspense>
</MkSpacer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormSwitch from '@/components/form/switch.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { fetchInstance } from '@/instance';

export default defineComponent({
	components: {
		FormSwitch,
		FormSuspense,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.emailServer,
				icon: 'fas fa-envelope',
				bg: 'var(--bg)',
				actions: [{
					asFullButton: true,
					text: this.$ts.testEmail,
					handler: this.testEmail,
				}, {
					asFullButton: true,
					icon: 'fas fa-check',
					text: this.$ts.save,
					handler: this.save,
				}],
			},
			enableEmail: false,
		}
	},

	methods: {
		async init() {
			const meta = await os.api('meta', { detail: true });
			this.enableEmail = meta.enableEmail;
		},

		async testEmail() {
			const { canceled, result: destination } = await os.inputText({
				title: this.$ts.destination,
				type: 'email',
				placeholder: this.$instance.maintainerEmail
			});
			if (canceled) return;
			os.apiWithDialog('admin/send-email', {
				to: destination,
				subject: 'Test email',
				text: 'Yo'
			});
		},

		save() {
			os.apiWithDialog('admin/update-meta', {
				enableEmail: this.enableEmail,
			}).then(() => {
				fetchInstance();
			});
		}
	}
});
</script>
