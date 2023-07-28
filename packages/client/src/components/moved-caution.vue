<template>
<div class="jmgmzlwq _block"><i class="fas fa-plane-departure" style="margin-right: 8px;"></i>{{ $ts.movedUserCaution }}<a :href="href" rel="nofollow noopener" target="_blank">{{ $ts.showOnRemote }}</a></div>
</template>

<script lang="ts" setup>
defineProps<{
	href: string;
}>();
</script>

<style lang="scss" scoped>
.jmgmzlwq {
	font-size: 0.8em;
	padding: 16px;
	background: var(--infoBg);
	color: var(--infoFg);

	> a {
		margin-left: 4px;
		color: var(--accent);
	}
}
</style>
