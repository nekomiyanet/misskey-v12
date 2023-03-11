<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<FormTextarea v-model="silencedHosts" class="_formBlock">
			<span>{{ $ts.silencedInstances }}</span>
			<template #caption>{{ $ts.silencedInstancesDescription }}</template>
		</FormTextarea>

		<FormButton primary class="_formBlock" @click="save"><i class="fas fa-save"></i> {{ $ts.save }}</FormButton>
	</FormSuspense>
</MkSpacer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FormButton from '@/components/ui/button.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { fetchInstance } from '@/instance';

export default defineComponent({
	components: {
		FormButton,
		FormTextarea,
		FormSuspense,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.instanceSilencing,
				icon: 'fas fa-microphone-slash',
				bg: 'var(--bg)',
			},
			silencedHosts: '',
		}
	},

	methods: {
		async init() {
			const meta = await os.api('meta', { detail: true });
			this.silencedHosts = meta.silencedHosts.join('\n');
		},

		save() {
			os.apiWithDialog('admin/update-meta', {
				silencedHosts: this.silencedHosts.split('\n') || [],
			}).then(() => {
				fetchInstance();
			});
		}
	}
});
</script>
