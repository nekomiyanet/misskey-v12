<template>
<transition :name="$store.state.animation ? 'zoom' : ''" appear>
	<div class="mjndxjcg">
		<img src="https://portal.nekomiya.net/assets/error.gif" class="_ghost"/>
		<p><i class="fas fa-exclamation-triangle"></i> {{ $ts.somethingHappened }}</p>
		<MkButton class="button" @click="() => $emit('retry')">{{ $ts.retry }}</MkButton>
	</div>
</transition>
</template>

<script lang="ts" setup>
import MkButton from '@/components/ui/button.vue';
</script>

<style lang="scss" scoped>
.mjndxjcg {
	padding: 32px;
	text-align: center;

	> p {
		margin: 0 0 8px 0;
	}

	> .button {
		margin: 0 auto;
	}

	> img {
		vertical-align: bottom;
		height: 128px;
		margin-bottom: 16px;
		border-radius: 16px;
	}
}
</style>
