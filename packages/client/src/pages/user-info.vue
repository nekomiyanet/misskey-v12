<template>
<MkSpacer :content-max="500" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<div class="_formRoot">
			<div class="_formBlock aeakzknw">
				<MkAvatar class="avatar" :user="user" :show-indicator="true"/>
			</div>

			<FormLink :to="userPage(user)">Profile</FormLink>

			<div class="_formBlock">
				<MkKeyValue :copy="acct(user)" oneline style="margin: 1em 0;">
					<template #key>Acct</template>
					<template #value><span class="_monospace">{{ acct(user) }}</span></template>
				</MkKeyValue>

				<MkKeyValue :copy="user.id" oneline style="margin: 1em 0;">
					<template #key>ID</template>
					<template #value><span class="_monospace">{{ user.id }}</span></template>
				</MkKeyValue>

				<MkKeyValue :copy="info.email" v-if="info && $i.isAdmin" oneline style="margin: 1em 0;">
					<template #key>Email</template>
					<template #value><span class="_monospace">{{ info.email }}</span></template>
				</MkKeyValue>

				<MkKeyValue v-if="info" oneline style="margin: 1em 0;">
					<template #key>Email Status</template>
					<template v-if="$i.isAdmin && info.email && info.emailVerified" #value><span class="_monospace">Verified</span></template>
					<template v-if="$i.isAdmin && info.email && !info.emailVerified" #value><span class="_monospace">Not Verified</span></template>
					<template v-if="$i.isAdmin && !info.email" #value><span class="_monospace">Not Registered</span></template>
					<template v-if="!$i.isAdmin && info.emailVerified" #value><span class="_monospace">Verified</span></template>
					<template v-if="!$i.isAdmin && !info.emailVerified" #value><span class="_monospace">Not Verified / Not Registered</span></template>
				</MkKeyValue>

			</div>

			<FormSection v-if="iAmModerator">
				<template #label>Moderation</template>
				<FormSwitch v-if="user.host == null && $i.isAdmin && (moderator || !user.isAdmin)" v-model="moderator" class="_formBlock" @update:modelValue="toggleModerator">{{ $ts.moderator }}</FormSwitch>
				<FormSwitch v-model="silenced" class="_formBlock" @update:modelValue="toggleSilence">{{ $ts.silence }}</FormSwitch>
				<FormSwitch v-if="user.host == null && iAmModerator" v-model="localsilenced" class="_formBlock" @update:modelValue="toggleLocalSilence">{{ $ts.localsilence }}</FormSwitch>
				<FormSwitch v-if="user.host != null && iAmModerator" v-model="privatesilenced" class="_formBlock" @update:modelValue="toggleprivatesilence">{{ $ts.privatesilence }}</FormSwitch>
				<FormSwitch v-model="forcesensitive" class="_formBlock" @update:modelValue="toggleForceSensitive">{{ $ts.forcesensitive }}</FormSwitch>
				<FormSwitch v-if="user.host == null && iAmModerator" v-model="disabled" class="_formBlock" @update:modelValue="toggleDisable">{{ $ts.accountdisable }}</FormSwitch>
				<FormSwitch v-if="iAmModerator" v-model="hidden" class="_formBlock" @update:modelValue="toggleHide">{{ $ts.accounthide }}</FormSwitch>
				<FormSwitch v-model="suspended" class="_formBlock" @update:modelValue="toggleSuspend">{{ $ts.suspend }}</FormSwitch>
				<FormButton v-if="user.host == null && iAmModerator" class="_formBlock" @click="resetPassword"><i class="fas fa-key"></i> {{ $ts.resetPassword }}</FormButton>
				<FormButton v-if="iAmModerator" class="_formBlock" @click="deleteAllFiles"><i class="fas fa-trash-alt"></i> {{ $ts.deleteAllFiles }}</FormButton>
			</FormSection>

			<FormSection>
				<template #label>ActivityPub</template>

				<div class="_formBlock">
					<MkKeyValue v-if="user.host" oneline style="margin: 1em 0;">
						<template #key>{{ $ts.instanceInfo }}</template>
						<template #value><MkA :to="`/instance-info/${user.host}`" class="_link">{{ user.host }} <i class="fas fa-angle-right"></i></MkA></template>
					</MkKeyValue>
					<MkKeyValue v-else oneline style="margin: 1em 0;">
						<template #key>{{ $ts.instanceInfo }}</template>
						<template #value>(Local user)</template>
					</MkKeyValue>
					<MkKeyValue oneline style="margin: 1em 0;">
						<template #key>{{ $ts.updatedAt }}</template>
						<template #value><MkTime v-if="user.lastFetchedAt" mode="detail" :time="user.lastFetchedAt"/><span v-else>N/A</span></template>
					</MkKeyValue>
					<MkKeyValue v-if="ap" oneline style="margin: 1em 0;">
						<template #key>Type</template>
						<template #value><span class="_monospace">{{ ap.type }}</span></template>
					</MkKeyValue>
				</div>

				<FormButton v-if="user.host != null" class="_formBlock" @click="updateRemoteUser"><i class="fas fa-sync"></i> {{ $ts.updateRemoteUser }}</FormButton>
			</FormSection>
				<FormSection>
					<template #label>ActivityPub</template>

					<div class="_formBlock">
						<MkKeyValue v-if="user.host" oneline style="margin: 1em 0;">
							<template #key>{{ i18n.ts.instanceInfo }}</template>
							<template #value><MkA :to="`/instance-info/${user.host}`" class="_link">{{ user.host }} <i class="fas fa-angle-right"></i></MkA></template>
						</MkKeyValue>
						<MkKeyValue v-else oneline style="margin: 1em 0;">
							<template #key>{{ i18n.ts.instanceInfo }}</template>
							<template #value>(Local user)</template>
						</MkKeyValue>
						<MkKeyValue oneline style="margin: 1em 0;">
							<template #key>{{ i18n.ts.updatedAt }}</template>
							<template #value><MkTime v-if="user.lastFetchedAt" mode="detail" :time="user.lastFetchedAt"/><span v-else>N/A</span></template>
						</MkKeyValue>
						<MkKeyValue v-if="ap" oneline style="margin: 1em 0;">
							<template #key>Type</template>
							<template #value><span class="_monospace">{{ ap.type }}</span></template>
						</MkKeyValue>
					</div>

					<FormButton v-if="user.host != null" class="_formBlock" @click="updateRemoteUser"><i class="fas fa-sync"></i> {{ i18n.ts.updateRemoteUser }}</FormButton>

					<FormFolder class="_formBlock">
						<template #label>Raw</template>

						<MkObjectView v-if="ap" tall :value="ap">
						</MkObjectView>
					</FormFolder>
				</FormSection>
			</div>
			<div v-else-if="tab === 'moderation'" class="_formRoot">
				<FormSwitch v-if="user.host == null && $i.isAdmin && (moderator || !user.isAdmin)" v-model="moderator" class="_formBlock" @update:modelValue="toggleModerator">{{ i18n.ts.moderator }}</FormSwitch>
				<FormSwitch v-if="user.host == null && $i.isAdmin && (admin || !user.isModerator)" v-model="admin" class="_formBlock" @update:modelValue="toggleAdmin">{{ i18n.ts.administrator }}</FormSwitch>
				<FormSwitch v-model="silenced" class="_formBlock" @update:modelValue="toggleSilence">{{ i18n.ts.silence }}</FormSwitch>
				<FormSwitch v-model="suspended" class="_formBlock" @update:modelValue="toggleSuspend">{{ i18n.ts.suspend }}</FormSwitch>
				{{ i18n.ts.reflectMayTakeTime }}
				<div class="_formBlock">
					<FormButton v-if="user.host == null && iAmModerator" inline style="margin-right: 8px;" @click="resetPassword"><i class="fas fa-key"></i> {{ i18n.ts.resetPassword }}</FormButton>
					<FormButton v-if="$i.isAdmin" inline danger @click="deleteAccount">{{ i18n.ts.deleteAccount }}</FormButton>
				</div>
				<FormTextarea v-model="moderationNote" manual-save class="_formBlock">
					<template #label>Moderation note</template>
				</FormTextarea>
				<FormFolder class="_formBlock">
					<template #label>IP</template>
					<MkInfo v-if="!iAmAdmin" warn>{{ i18n.ts.requireAdminForView }}</MkInfo>
					<MkInfo v-else>The date is the IP address was first acknowledged.</MkInfo>
					<template v-if="iAmAdmin && ips">
						<div v-for="record in ips" :key="record.ip" class="_monospace" :class="$style.ip" style="margin: 1em 0;">
							<span class="date">{{ record.createdAt }}</span>
							<span class="ip">{{ record.ip }}</span>
						</div>
					</template>
				</FormFolder>
				<FormFolder class="_formBlock">
					<template #label>{{ i18n.ts.files }}</template>

					<MkFileListForAdmin :pagination="filesPagination" view-mode="grid"/>
				</FormFolder>
				<FormSection>
					<template #label>Drive Capacity Override</template>

					<FormInput v-if="user.host == null" v-model="driveCapacityOverrideMb" inline :manual-save="true" type="number" :placeholder="i18n.t('defaultValueIs', { value: instance.driveCapacityPerLocalUserMb })" @update:model-value="applyDriveCapacityOverride">
						<template #label>{{ i18n.ts.driveCapOverrideLabel }}</template>
						<template #suffix>MB</template>
						<template #caption>
							{{ i18n.ts.driveCapOverrideCaption }}
						</template>
					</FormInput>
				</FormSection>
			</div>
			<div v-else-if="tab === 'chart'" class="_formRoot">
				<div class="cmhjzshm">
					<div class="selects">
						<MkSelect v-model="chartSrc" style="margin: 0 10px 0 0; flex: 1;">
							<option value="per-user-notes">{{ i18n.ts.notes }}</option>
						</MkSelect>
					</div>
					<div class="charts">
						<div class="label">{{ i18n.t('recentNHours', { n: 90 }) }}</div>
						<MkChart class="chart" :src="chartSrc" span="hour" :limit="90" :args="{ user, withoutAll: true }" :detailed="true"></MkChart>
						<div class="label">{{ i18n.t('recentNDays', { n: 90 }) }}</div>
						<MkChart class="chart" :src="chartSrc" span="day" :limit="90" :args="{ user, withoutAll: true }" :detailed="true"></MkChart>
					</div>
				</div>
			</div>
			<div v-else-if="tab === 'raw'" class="_formRoot">
				<MkObjectView v-if="info && $i.isAdmin" tall :value="info">
				</MkObjectView>

			<MkObjectView tall :value="user">
			</MkObjectView>
		</div>
	</FormSuspense>
</MkSpacer>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent } from 'vue';
import MkObjectView from '@/components/object-view.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormLink from '@/components/form/link.vue';
import FormSection from '@/components/form/section.vue';
import FormButton from '@/components/ui/button.vue';
import MkKeyValue from '@/components/key-value.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import number from '@/filters/number';
import bytes from '@/filters/bytes';
import * as symbols from '@/symbols';
import { url } from '@/config';
import { userPage, acct } from '@/filters/user';
<<<<<<< HEAD

export default defineComponent({
	components: {
		FormSection,
		FormTextarea,
		FormSwitch,
		MkObjectView,
		FormButton,
		FormLink,
		MkKeyValue,
		FormSuspense,
	},

	props: {
		userId: {
			type: String,
			required: true
		}
	},

	data() {
		return {
			[symbols.PAGE_INFO]: computed(() => ({
				title: this.user ? acct(this.user) : this.$ts.userInfo,
				icon: 'fas fa-info-circle',
				bg: 'var(--bg)',
				actions: this.user ? [this.user.url ? {
					text: this.user.url,
					icon: 'fas fa-external-link-alt',
					handler: () => {
						window.open(this.user.url, '_blank');
					}
				} : undefined].filter(x => x !== undefined) : [],
			})),
			init: null,
			user: null,
			info: null,
			ap: null,
			moderator: false,
			silenced: false,
			localsilenced: false,
			privatesilenced: false,
			forcesensitive: false,
			disabled: false,
			hidden: false,
			suspended: false,
		};
	},

	computed: {
		iAmModerator(): boolean {
			return this.$i && (this.$i.isAdmin || this.$i.isModerator);
		}
	},

	watch: {
		userId: {
			handler() {
				this.init = this.createFetcher();
			},
			immediate: true
		},
		user() {
			os.api('ap/get', {
				uri: this.user.uri || `${url}/users/${this.user.id}`
			}).then(res => {
				this.ap = res;
=======
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { iAmAdmin, iAmModerator } from '@/account';
import { instance } from '@/instance';

const props = defineProps<{
	userId: string;
}>();

let tab = $ref('overview');
let chartSrc = $ref('per-user-notes');
let user = $ref<null | misskey.entities.UserDetailed>();
let init = $ref<ReturnType<typeof createFetcher>>();
let info = $ref();
let ips = $ref(null);
let ap = $ref(null);
let moderator = $ref(false);
let admin = $ref(false);
let silenced = $ref(false);
let suspended = $ref(false);
let driveCapacityOverrideMb: number | null = $ref(0);
let moderationNote = $ref('');
const filesPagination = {
	endpoint: 'admin/drive/files' as const,
	limit: 10,
	params: computed(() => ({
		userId: props.userId,
	})),
};

function createFetcher() {
	if (iAmModerator) {
		return () => Promise.all([os.api('users/show', {
			userId: props.userId,
		}), os.api('admin/show-user', {
			userId: props.userId,
		}), iAmAdmin ? os.api('admin/get-user-ips', {
			userId: props.userId,
		}) : Promise.resolve(null)]).then(([_user, _info, _ips]) => {
			user = _user;
			info = _info;
			ips = _ips;
			moderator = info.isModerator;
			admin = info.isAdmin;
			silenced = info.isSilenced;
			suspended = info.isSuspended;
			driveCapacityOverrideMb = user.driveCapacityOverrideMb;
			moderationNote = info.moderationNote;

			watch($$(moderationNote), async () => {
				await os.api('admin/update-user-note', { userId: user.id, text: moderationNote });
				await refreshUser();
>>>>>>> cca06e878 (GUIからadminを切り替えれるようにした (#5))
			});
		}
	},

	methods: {
		number,
		bytes,
		userPage,
		acct,

		createFetcher() {
			if (this.iAmModerator) {
				return () => Promise.all([os.api('users/show', {
					userId: this.userId
				}), os.api('admin/show-user', {
					userId: this.userId
				})]).then(([user, info]) => {
					this.user = user;
					this.info = info;
					this.moderator = this.info.isModerator;
					this.silenced = this.info.isSilenced;
					this.localsilenced = this.info.isLocalSilenced;
					this.privatesilenced = this.info.isPrivateSilenced;
					this.forcesensitive = this.info.isForceSensitive;
					this.disabled = this.info.isDisabled;
					this.hidden = this.info.isHidden;
					this.suspended = this.info.isSuspended;
				});
			} else {
				return () => os.api('users/show', {
					userId: this.userId
				}).then((user) => {
					this.user = user;
				});
			}
		},

		refreshUser() {
			this.init = this.createFetcher();
		},

		async updateRemoteUser() {
			await os.apiWithDialog('federation/update-remote-user', { userId: this.user.id });
			this.refreshUser();
		},

		async resetPassword() {
			const confirm = await os.confirm({
				type: 'warning',
				text: this.$ts.resetPasswordConfirm,
			});
			if (confirm.canceled) {
				return;
			} else {
				const { password } = await os.api('admin/reset-password', {
					userId: this.user.id,
				});
				os.alert({
					type: 'success',
					text: this.$t('newPasswordIs', { password })
				});
			}
		},

		async toggleSilence(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.silenceConfirm : this.$ts.unsilenceConfirm,
			});
			if (confirm.canceled) {
				this.silenced = !v;
			} else {
				await os.api(v ? 'admin/silence-user' : 'admin/unsilence-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleLocalSilence(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.silenceConfirm : this.$ts.unsilenceConfirm,
			});
			if (confirm.canceled) {
				this.localsilenced = !v;
			} else {
				await os.api(v ? 'admin/local-silence-user' : 'admin/local-unsilence-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleprivatesilence(z) {
			const confirm = await os.confirm({
				type: 'warning',
				text: z ? this.$ts.silenceConfirm : this.$ts.unsilenceConfirm,
			});
			if (confirm.canceled) {
				this.privatesilenced = !z;
			} else {
				await os.api(z ? 'admin/private-silence-user' : 'admin/private-unsilence-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleForceSensitive(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.forcesensitiveConfirm : this.$ts.unforcesensitiveConfirm,
			});
			if (confirm.canceled) {
				this.forcesensitive = !v;
			} else {
				await os.api(v ? 'admin/force-sensitive-user' : 'admin/unforce-sensitive-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

<<<<<<< HEAD
		async toggleDisable(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.accountdisableConfirm : this.$ts.accountenableConfirm,
			});
			if (confirm.canceled) {
				this.disabled = !v;
			} else {
				await os.api(v ? 'admin/disable-user' : 'admin/enable-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},
=======
async function toggleAdmin(v) {
	await os.api(v ? 'admin/admin/add' : 'admin/admin/remove', { userId: user.id });
	await refreshUser();
}


async function deleteAllFiles() {
	const confirm = await os.confirm({
		type: 'warning',
		text: i18n.ts.deleteAllFilesConfirm,
	});
	if (confirm.canceled) return;
	const process = async () => {
		await os.api('admin/delete-all-files-of-a-user', { userId: user.id });
		os.success();
	};
	await process().catch(err => {
		os.alert({
			type: 'error',
			text: err.toString(),
		});
	});
	await refreshUser();
}
>>>>>>> cca06e878 (GUIからadminを切り替えれるようにした (#5))

		async toggleHide(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.accountHideConfirm : this.$ts.accountUnhideConfirm,
			});
			if (confirm.canceled) {
				this.hidden = !v;
			} else {
				await os.api(v ? 'admin/hide-user' : 'admin/unhide-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleSuspend(v) {
			const confirm = await os.confirm({
				type: 'warning',
				text: v ? this.$ts.suspendConfirm : this.$ts.unsuspendConfirm,
			});
			if (confirm.canceled) {
				this.suspended = !v;
			} else {
				await os.api(v ? 'admin/suspend-user' : 'admin/unsuspend-user', { userId: this.user.id });
				await this.refreshUser();
			}
		},

		async toggleModerator(v) {
			await os.api(v ? 'admin/moderators/add' : 'admin/moderators/remove', { userId: this.user.id });
			await this.refreshUser();
		},

		async deleteAllFiles() {
			const confirm = await os.confirm({
				type: 'warning',
				text: this.$ts.deleteAllFilesConfirm,
			});
			if (confirm.canceled) return;
			const process = async () => {
				await os.api('admin/delete-all-files-of-a-user', { userId: this.user.id });
				os.success();
			};
			await process().catch(e => {
				os.alert({
					type: 'error',
					text: e.toString()
				});
			});
			await this.refreshUser();
		},
	}
});
</script>

<style lang="scss" scoped>
.aeakzknw {
	> .avatar {
		display: block;
		width: 64px;
		height: 64px;
	}
}
</style>
