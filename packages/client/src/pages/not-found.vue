<template>
<div class="ipledcug">
	<div class="_fullinfo">
		<img src="https://portal.nekomiya.net/assets/error.gif" class="_ghost"/>
		<div>{{ $ts.notFoundDescription }}</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.notFound,
		icon: 'fas fa-exclamation-triangle',
		bg: 'var(--bg)',
	},
});
</script>
