<template>
<MkModal ref="modal" :z-priority="'middle'" @click="$refs.modal.close()" @closed="$emit('closed')">
	<div class="ewlycnyt">
		<div class="title"><MkSparkle>{{ $ts.misskeyUpdated }}</MkSparkle></div>
		<div class="version">✨{{ version }}🚀</div>
		<MkButton full @click="whatIsNew">{{ $ts.whatIsNew }}</MkButton>
		<MkButton class="gotIt" primary full @click="$refs.modal.close()">{{ $ts.gotIt }}</MkButton>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MkModal from '@/components/ui/modal.vue';
import MkButton from '@/components/ui/button.vue';
import MkSparkle from '@/components/sparkle.vue';
import { version } from '@/config';

const modal = ref();

const whatIsNew = () => {
	modal.value.close();
	window.open(`https://github.com/nekomiyanet/misskey-v12/releases/tag/${version}`, '_blank');
};
</script>

<style lang="scss" scoped>
.ewlycnyt {
	position: relative;
	padding: 32px;
	min-width: 320px;
	max-width: 480px;
	box-sizing: border-box;
	text-align: center;
	background: var(--panel);
	border-radius: var(--radius);

	> .title {
		font-weight: bold;
	}

	> .version {
		margin: 1em 0;
	}

	> .gotIt {
		margin: 8px 0 0 0;
	}
}
</style>
