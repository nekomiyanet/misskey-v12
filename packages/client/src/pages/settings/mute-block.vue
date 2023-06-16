<template>
<div class="_formRoot">
	<MkTab v-model="tab" style="margin-bottom: var(--margin);">
		<option value="mute">{{ $ts.mutedUsers }}</option>
		<option value="block">{{ $ts.blockedUsers }}</option>
		<option value="renotemute">{{ $ts.renotemutedUsers }}</option>
	</MkTab>
	<div v-if="tab === 'mute'">
		<MkPagination :pagination="mutingPagination" class="muting">
			<template #empty><FormInfo>{{ $ts.noUsers }}</FormInfo></template>
			<template v-slot="{items}">
				<FormLink v-for="mute in items" :key="mute.id" :to="userPage(mute.mutee)">
					<MkAcct :user="mute.mutee"/>
					<div v-if="mute.expiresAt" class="clock-container">
						<i class="fas fa-hourglass"></i><MkTime :time="mute.expiresAt" mode="detail"/>
					</div>
				</FormLink>
				<MkButton class="unmute" danger @click="unmute()"><i class="fas fa-trash-alt"></i>{{ $ts.unmuteAll }}</MkButton>
			</template>
		</MkPagination>
	</div>
	<div v-if="tab === 'block'">
		<MkPagination :pagination="blockingPagination" class="blocking">
			<template #empty><FormInfo>{{ $ts.noUsers }}</FormInfo></template>
			<template v-slot="{items}">
				<FormLink v-for="block in items" :key="block.id" :to="userPage(block.blockee)">
					<MkAcct :user="block.blockee"/>
				</FormLink>
				<MkButton class="unblock" danger @click="unblock()"><i class="fas fa-trash-alt"></i>{{ $ts.unblockAll }}</MkButton>
			</template>
		</MkPagination>
	</div>
	<div v-if="tab === 'renotemute'">
		<MkPagination :pagination="renotemutingPagination" class="renotemuting">
			<template #empty><FormInfo>{{ $ts.noUsers }}</FormInfo></template>
			<template v-slot="{items}">
				<FormLink v-for="renotemute in items" :key="renotemute.id" :to="userPage(renotemute.mutee)">
					<MkAcct :user="renotemute.mutee"/>
				</FormLink>
				<MkButton class="renoteunmute" danger @click="renoteunmute()"><i class="fas fa-trash-alt"></i>{{ $ts.renoteUnmuteAll }}</MkButton>
			</template>
		</MkPagination>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkPagination from '@/components/ui/pagination.vue';
import MkTab from '@/components/tab.vue';
import FormInfo from '@/components/ui/info.vue';
import FormLink from '@/components/form/link.vue';
import { userPage } from '@/filters/user';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';
import MkButton from '@/components/ui/button.vue';

let tab = $ref('mute');

const mutingPagination = {
	endpoint: 'mute/list' as const,
	limit: 10,
};

const blockingPagination = {
	endpoint: 'blocking/list' as const,
	limit: 10,
};

const renotemutingPagination = {
	endpoint: 'renote-mute/list' as const,
	limit: 10,
};

async function unmute(): Promise<void> {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteConfirm,
	});

	if (canceled) return;

	const mutes = await os.api('mute/list', {
		limit: 100,
	});

	for (const mute of mutes) {
		await os.api('mute/delete', {
			userId: mute.muteeId,
		});
	}
}

async function unblock(): Promise<void> {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteConfirm,
	});

	if (canceled) return;

	const blocks = await os.api('blocking/list', {
		limit: 100,
	});

	for (const block of blocks) {
		await os.api('blocking/delete', {
			userId: block.blockeeId,
		});
	}
}

async function renoteunmute(): Promise<void> {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteConfirm,
	});

	if (canceled) return;

	const renotemutes = await os.api('renote-mute/list', {
		limit: 100,
	});

	for (const renotemute of renotemutes) {
		await os.api('renote-mute/delete', {
			userId: renotemute.muteeId,
		});
	}
}

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.muteAndBlock,
		icon: 'fas fa-ban',
		bg: 'var(--bg)',
	},
});
</script>

<style>
.clock-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
