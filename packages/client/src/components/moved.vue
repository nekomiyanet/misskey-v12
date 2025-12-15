<template>
	<div class="msjugskd _block">
		<i
			class="fas fa-plane-departure"
			style="margin-right: 8px"
		/>
		{{ i18n.ts.movedUserCaution }}
		<MkMention class="link" :username="acct" :host="movedhost || host" />
	</div>
</template>

<script lang="ts" setup>
import MkMention from "./mention.vue";
import { host } from "@/config";
import { i18n } from "@/i18n";

defineProps<{
	acct: string;
	movedhost: string;
}>();
</script>

<style lang="scss" scoped>
.msjugskd {
	padding: 16px;
	font-size: 90%;
	background: var(--infoBg);
	color: var(--infoFg);
	border-radius: var(--radius);

	> .link {
		margin-left: 4px;
		color: var(--accent);
	}
}
</style>
