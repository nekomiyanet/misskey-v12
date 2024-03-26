<template>
<MkSpacer :content-max="600" :margin-min="16" :margin-max="32">
	<div v-if="instance" class="_formRoot">
		<div class="fnfelxur">
			<img :src="instance.iconUrl || instance.faviconUrl" alt="" class="icon"/>
		</div>
		<MkKeyValue :copy="host" oneline style="margin: 1em 0;">
			<template #key>Host</template>
			<template #value><span class="_monospace"><MkLink :url="`https://${host}`">{{ host }}</MkLink></span></template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>Name</template>
			<template #value>{{ instance.name || `(${$ts.unknown})` }}</template>
		</MkKeyValue>
		<MkKeyValue>
			<template #key>{{ $ts.description }}</template>
			<template #value>{{ instance.description }}</template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ $ts.software }}</template>
			<template #value><span class="_monospace">{{ instance.softwareName || `(${$ts.unknown})` }} / {{ instance.softwareVersion || `(${$ts.unknown})` }}</span></template>
		</MkKeyValue>
		<MkKeyValue oneline style="margin: 1em 0;">
			<template #key>{{ $ts.administrator }}</template>
			<template #value>{{ instance.maintainerName || `(${$ts.unknown})` }} ({{ instance.maintainerEmail || `(${$ts.unknown})` }})</template>
		</MkKeyValue>

		<FormSection v-if="iAmModerator">
			<template #label>Moderation</template>
			<FormSwitch v-model="suspended" class="_formBlock" @update:modelValue="toggleSuspend">{{ $ts.stopActivityDelivery }}</FormSwitch>
			<FormSwitch v-if="$i" :disabled="!$i.isAdmin || (isBlocked && !isExactlyBlocked)" v-model="isBlocked" class="_formBlock" @update:modelValue="toggleBlock">{{ $ts.blockThisInstance }}</FormSwitch>
			<FormSwitch v-if="$i" :disabled="!$i.isAdmin || (selfsilenced && !isExactlySelfSilenced)" v-model="selfsilenced" class="_formBlock" @update:modelValue="toggleSelfSilence">{{ $ts.selfSilencing }}</FormSwitch>
			<FormSwitch v-if="$i" :disabled="!$i.isAdmin || (silenced && !isExactlySilenced)" v-model="silenced" class="_formBlock" @update:modelValue="toggleSilence">{{ $ts.instanceSilencing }}</FormSwitch>
			<MkButton v-if="(!suspended && !isBlocked) && $i && $i.isAdmin" inline danger @click="deleteFollowing"><i class="fas fa-minus"></i> Unfollow All Instance Users</MkButton>
			<MkButton v-if="(suspended || isBlocked) && $i && $i.isAdmin" inline danger @click="deleteInstanceUsers"><i class="fas fa-trash-alt"></i> Delete All Instance Users</MkButton>
			<MkButton @click="refreshMetadata">Refresh metadata</MkButton>
		</FormSection>

		<FormSection>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>{{ $ts.registeredAt }}</template>
				<template #value><MkTime mode="detail" :time="instance.caughtAt"/></template>
			</MkKeyValue>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>{{ $ts.updatedAt }}</template>
				<template #value><MkTime mode="detail" :time="instance.infoUpdatedAt"/></template>
			</MkKeyValue>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>{{ $ts.latestRequestSentAt }}</template>
				<template #value><MkTime v-if="instance.latestRequestSentAt" :time="instance.latestRequestSentAt"/><span v-else>N/A</span></template>
			</MkKeyValue>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>{{ $ts.latestStatus }}</template>
				<template #value>{{ instance.latestStatus ? instance.latestStatus : 'N/A' }}</template>
			</MkKeyValue>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>{{ $ts.latestRequestReceivedAt }}</template>
				<template #value><MkTime v-if="instance.latestRequestReceivedAt" :time="instance.latestRequestReceivedAt"/><span v-else>N/A</span></template>
			</MkKeyValue>
		</FormSection>

		<FormSection>
			<MkKeyValue oneline style="margin: 1em 0;">
				<template #key>Open Registrations</template>
				<template #value>{{ instance.openRegistrations ? $ts.yes : $ts.no }}</template>
			</MkKeyValue>
		</FormSection>

		<FormSection>
			<template #label>{{ $ts.statistics }}</template>
			<div class="cmhjzshl">
				<div class="selects">
					<MkSelect v-model="chartSrc" style="margin: 0 10px 0 0; flex: 1;">
						<option value="instance-requests">{{ $ts._instanceCharts.requests }}</option>
						<option value="instance-users">{{ $ts._instanceCharts.users }}</option>
						<option value="instance-users-total">{{ $ts._instanceCharts.usersTotal }}</option>
						<option value="instance-notes">{{ $ts._instanceCharts.notes }}</option>
						<option value="instance-notes-total">{{ $ts._instanceCharts.notesTotal }}</option>
						<option value="instance-ff">{{ $ts._instanceCharts.ff }}</option>
						<option value="instance-ff-total">{{ $ts._instanceCharts.ffTotal }}</option>
						<option value="instance-drive-usage">{{ $ts._instanceCharts.cacheSize }}</option>
						<option value="instance-drive-usage-total">{{ $ts._instanceCharts.cacheSizeTotal }}</option>
						<option value="instance-drive-files">{{ $ts._instanceCharts.files }}</option>
						<option value="instance-drive-files-total">{{ $ts._instanceCharts.filesTotal }}</option>
					</MkSelect>
					<MkSelect v-model="chartSpan" style="margin: 0;">
						<option value="hour">{{ $ts.perHour }}</option>
						<option value="day">{{ $ts.perDay }}</option>
					</MkSelect>
				</div>
				<div class="chart">
					<MkChart :src="chartSrc" :span="chartSpan" :limit="90" :args="{ host: host }" :detailed="true"></MkChart>
				</div>
			</div>
		</FormSection>

		<MkObjectView tall :value="instance">
		</MkObjectView>

		<FormSection>
			<template #label>Well-known resources</template>
			<FormLink :to="`https://${host}/.well-known/host-meta`" external style="margin-bottom: 8px;">host-meta</FormLink>
			<FormLink :to="`https://${host}/.well-known/host-meta.json`" external style="margin-bottom: 8px;">host-meta.json</FormLink>
			<FormLink :to="`https://${host}/.well-known/nodeinfo`" external style="margin-bottom: 8px;">nodeinfo</FormLink>
			<FormLink :to="`https://${host}/robots.txt`" external style="margin-bottom: 8px;">robots.txt</FormLink>
			<FormLink :to="`https://${host}/manifest.json`" external style="margin-bottom: 8px;">manifest.json</FormLink>
		</FormSection>
	</div>
</MkSpacer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import * as misskey from 'misskey-js';
import MkChart from '@/components/chart.vue';
import MkObjectView from '@/components/object-view.vue';
import FormLink from '@/components/form/link.vue';
import MkLink from '@/components/link.vue';
import MkButton from '@/components/ui/button.vue';
import FormSection from '@/components/form/section.vue';
import MkKeyValue from '@/components/key-value.vue';
import MkSelect from '@/components/form/select.vue';
import FormSwitch from '@/components/form/switch.vue';
import * as os from '@/os';
import number from '@/filters/number';
import bytes from '@/filters/bytes';
import * as symbols from '@/symbols';
import { iAmModerator, $i } from '@/account';
import { i18n } from '@/i18n';

const props = defineProps<{
	host: string;
}>();

let meta = $ref<misskey.entities.DetailedInstanceMetadata | null>(null);
let instance = $ref<misskey.entities.Instance | null>(null);
let suspended = $ref(false);
let isBlocked = $ref(false);
let isExactlyBlocked = $ref(false);
let silenced = $ref(false);
let isExactlySilenced = $ref(false);
let selfsilenced = $ref(false);
let isExactlySelfSilenced = $ref(false);
let chartSrc = $ref('instance-requests');
let chartSpan = $ref('hour');

async function fetch() {
	meta = await os.api('meta', { detail: true });
	instance = await os.api('federation/show-instance', {
		host: props.host,
	});
	suspended = instance.isSuspended;
	isBlocked = instance.isBlocked;
	isExactlyBlocked = meta.blockedHosts.includes(instance.host);
	silenced = instance.isSilenced;
	isExactlySilenced = meta.silencedHosts.includes(instance.host);
	selfsilenced = instance.isSelfSilenced;
	isExactlySelfSilenced = meta.selfSilencedHosts.includes(instance.host);
}

async function toggleBlock(ev) {
	if (meta == null) return;
	if (!isBlocked && !isExactlyBlocked) {
		isBlocked = true;
		return;
	}
	await os.api('admin/update-meta', {
		blockedHosts: isBlocked ? meta.blockedHosts.concat([instance.host]) : meta.blockedHosts.filter(x => x !== instance.host)
	});
	fetch();
}

async function toggleSilence(ev) {
	if (meta == null) return;
	if (!silenced && !isExactlySilenced) {
		silenced = true;
		return;
	}
	await os.api('admin/update-meta', {
		silencedHosts: silenced ? meta.silencedHosts.concat([instance.host]) : meta.silencedHosts.filter(x => x !== instance.host)
	});
	fetch();
}

async function toggleSelfSilence(ev) {
	if (meta == null) return;
	if (!selfsilenced && !isExactlySelfSilenced) {
		selfsilenced = true;
		return;
	}
	await os.api('admin/update-meta', {
		selfSilencedHosts: selfsilenced ? meta.selfSilencedHosts.concat([instance.host]) : meta.selfSilencedHosts.filter(x => x !== instance.host)
	});
	fetch();
}

async function toggleSuspend(v) {
	await os.api('admin/federation/update-instance', {
		host: instance.host,
		isSuspended: suspended,
	});
}

function refreshMetadata() {
	os.api('admin/federation/refresh-remote-instance-metadata', {
		host: instance.host,
	});
	os.alert({
		text: 'Refresh requested',
	});
}

async function deleteInstanceUsers() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: instance.host }),
	});
	if (canceled) return;
	const typed = await os.inputText({
		text: i18n.t('typeToConfirm', { x: instance?.host }),
	});
	if (typed.canceled) return;
	if (typed.result === instance?.host) {
		await os.api('admin/delete-instance-users', {
			host: instance.host,
		});
		await os.alert({
			text: 'Account Deletion is in progress',
		});
	} else {
		os.alert({
			type: 'error',
			text: 'input not match',
		});
	}
}

async function deleteFollowing() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("unfollowConfirm", { name: instance.host }),
	});
	if (canceled) return;
	const typed = await os.inputText({
		text: i18n.t('typeToConfirm', { x: instance?.host }),
	});
	if (typed.canceled) return;
	if (typed.result === instance?.host) {
		await os.api('admin/federation/remove-all-following', {
			host: instance.host,
		});
		await os.alert({
			text: 'Unfollowing is in progress',
		});
	} else {
		os.alert({
			type: 'error',
			text: 'input not match',
		});
	}
}

fetch();

defineExpose({
	[symbols.PAGE_INFO]: {
		title: props.host,
		icon: 'fas fa-info-circle',
		bg: 'var(--bg)',
		actions: [{
			text: `https://${props.host}`,
			icon: 'fas fa-external-link-alt',
			handler: () => {
				window.open(`https://${props.host}`, '_blank');
			}
		}],
	},
});
</script>

<style lang="scss" scoped>
.fnfelxur {
	> .icon {
		display: block;
		margin: 0;
		height: 64px;
		border-radius: 8px;
	}
}

.cmhjzshl {
	> .selects {
		display: flex;
		margin: 0 0 16px 0;
	}
}
</style>
