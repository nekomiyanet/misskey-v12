<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>

	<MkSpacer :content-max="500">
		<div class="_gaps">
			<MkAd v-for="ad in instance.ads" :key="ad.id" :specify="ad"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import * as symbols from '@/symbols';

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.ads,
		icon: 'fas fa-audio-description',
		bg: 'var(--bg)',
	}
});
</script>
