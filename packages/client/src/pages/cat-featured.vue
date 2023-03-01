<template>
<MkSpacer :content-max="800">
	<XNotes ref="notes" :pagination="pagination"/>
</MkSpacer>
</template>

<script lang="ts" setup>
import XNotes from '@/components/notes.vue';
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';

const pagination = {
	endpoint: 'notes/cat-featured' as const,
	limit: 10,
	offsetMode: true,
};

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.catfeatured,
		icon: 'fas fa-paw',
		bg: 'var(--bg)',
	},
});
</script>
