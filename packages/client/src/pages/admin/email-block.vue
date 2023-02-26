<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<FormTextarea v-model="blockedEmailDomains" class="_formBlock">
			<span>{{ $ts.blockedEmailDomains }}</span>
			<template #caption>{{ $ts.blockedEmailDomainsDescription }}</template>
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
				title: this.$ts.emailDomainBlocking,
				icon: 'fas fa-ban',
				bg: 'var(--bg)',
			},
			blockedEmailDomains: '',
		}
	},

	methods: {
		async init() {
			const meta = await os.api('meta', { detail: true });
			this.blockedEmailDomains = meta.blockedEmailDomains.join('\n');
		},

		save() {
			os.apiWithDialog('admin/update-meta', {
				blockedEmailDomains: this.blockedEmailDomains.split('\n') || [],
			}).then(() => {
				fetchInstance();
			});
		}
	}
});
</script>
