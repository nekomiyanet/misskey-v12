<template>
<div class="geegznzt">
	<XAntenna :antenna="draft" @created="onAntennaCreated"/>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import XAntenna from './editor.vue';
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';
import { router } from '@/router';

let draft = $ref({
	name: '',
	src: 'all',
	userListId: null,
	userGroupId: null,
	users: [],
	keywords: [],
	excludeKeywords: [],
	withReplies: false,
	caseSensitive: false,
	withFile: false,
	notify: false,
	local: false
});

function onAntennaCreated() {
	router.push('/my/antennas');
}

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.manageAntennas,
		icon: 'fas fa-satellite',
		bg: 'var(--bg)',
	},
});
</script>

<style lang="scss" scoped>

</style>
