<template>
<div class="ztgjmzrw">
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

<script lang="ts">
import { defineComponent } from 'vue';
import MkInput from '@/components/form/input.vue';
import MkTextarea from '@/components/form/textarea.vue';
import MkPagination from '@/components/ui/pagination.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';

export default defineComponent({
	components: {
		MkInput,
		MkTextarea,
		MkPagination,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.moderationlogs,
				icon: 'fas fa-clock-rotate-left',
				bg: 'var(--bg)',
			},
			logs: [],
			pagination: {
				endpoint: 'admin/show-moderation-logs' as const,
				limit: 10,
			},
		}
	},

	created() {
		os.api('admin/show-moderation-logs').then(logs => {
			this.logs = logs;
		});
	},
});
</script>

<style lang="scss" scoped>
.ztgjmzrw {
	margin: var(--margin);
}
</style>
