<template>
<button
	v-if="canRenote && $store.state.seperateRenoteQuote"
	class="eddddedb _button"
	@click="quote()"
>
	<i class="fas fa-quote-right"></i>
</button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { $i } from '@/account';

const props = defineProps<{
	note: misskey.entities.Note;
}>();

const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || (props.note.visibility === 'followers' && props.note.userId === $i?.id));

function quote(): void {
	pleaseLogin();
	os.post({
		renote: props.note,
	});
}
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&.renoted {
		background: var(--accent);
	}

	> .count {
		display: inline;
		margin-left: 8px;
		opacity: 0.7;
	}
}
</style>
