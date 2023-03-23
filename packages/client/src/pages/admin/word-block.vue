<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<FormTextarea v-model="blockedWords" class="_formBlock">
			<span>{{ $ts.blockedWords }}</span>
			<template #caption>{{ $ts.blockedWordsDescription }}</template>
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
				title: this.$ts.wordBlocking,
				icon: 'fas fa-comment-slash',
				bg: 'var(--bg)',
			},
			blockedWords: '',
		}
	},

	methods: {
		async init() {
			const meta = await os.api('meta', { detail: true });
			this.blockedWords = meta.blockedWords.join('\n');
		},

		save() {
			os.apiWithDialog('admin/update-meta', {
				blockedWords: this.blockedWords.split('\n') || [],
			}).then(() => {
				fetchInstance();
			});
		}
	}
});
</script>
