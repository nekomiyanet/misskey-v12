<template>
<div class="ztgjmzrw">
	<div class="inputs" style="display: flex; padding-top: 1.2em;">
		<MkInput v-model="searchUser" :debounce="true" type="search" style="margin: 0; flex: 1;">
			<template #label>UserId</template>
		</MkInput>
		<MkInput v-model="type" :debounce="true" type="search" style="margin: 0; flex: 1;">
			<template #label>Type</template>
		</MkInput>
	</div>
	<MkPagination v-slot="{items : logs}" :pagination="pagination" class="ruryvtyk _content">
	<section v-for="log in logs" class="_card _gap logs">
		<div class="_content log">
			<MkInput v-model="log.user.username" readonly>
				<template #label>{{ $ts.username }}</template>
			</MkInput>
			<MkInput v-model="log.type" readonly>
				<template #label>{{ $ts.value }}</template>
			</MkInput>
			<MkTextarea :modelValue="JSON.stringify(log.info, null, 2)" readonly code tall>
				<template #label>{{ $ts.details }}</template>
			</MkTextarea>
			<p v-if="log.createdAt"><i class="far fa-clock"></i> {{ $ts.createdAt }} <MkTime :time="log.createdAt" mode="detail"/></p>
		</div>
	</section>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkInput from '@/components/form/input.vue';
import MkTextarea from '@/components/form/textarea.vue';
import MkPagination from '@/components/ui/pagination.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';

let type = $ref(null);
let searchUser = $ref('');
const pagination = {
	endpoint: 'admin/show-moderation-logs' as const,
	limit: 10,
	params: computed(() => ({
		type: (type && type !== '') ? type : null,
		userId: (searchUser && searchUser !== '') ? searchUser : null,
	})),
};

defineExpose({
	[symbols.PAGE_INFO]: computed(() => ({
		title: i18n.ts.moderationlogs,
		icon: 'fas fa-clock-rotate-left',
		bg: 'var(--bg)',
	})),
});
</script>

<style lang="scss" scoped>
.ztgjmzrw {
	margin: var(--margin);
}
</style>
