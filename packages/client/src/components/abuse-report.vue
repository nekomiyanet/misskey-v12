<template>
<div class="bcekxzvu _card _gap">
	<div class="_content target">
		<MkAvatar class="avatar" :user="report.targetUser" :show-indicator="true"/>
		<MkA class="info" :to="userPage(report.targetUser)" v-user-preview="report.targetUserId">
			<MkUserName class="name" :user="report.targetUser"/>
			<MkAcct class="acct" :user="report.targetUser" style="display: block;"/>
		</MkA>
	</div>
	<div class="_content">
		<div>
			<Mfm :text="report.comment"/>
		</div>
		<hr/>
		<div>{{ $ts.reporter }}: <MkAcct :user="report.reporter"/></div>
		<div v-if="report.assignee">
			{{ $ts.moderator }}:
			<MkAcct :user="report.assignee"/>
		</div>
		<div><MkTime :time="report.createdAt"/></div>
	</div>
	<div class="_footer">
		<MkSwitch v-model="forward" :disabled="report.targetUser.host == null || report.resolved">
			{{ $ts.forwardReport }}
			<template #caption>{{ $ts.forwardReportIsAnonymous }}</template>
		</MkSwitch>
		<MkButton v-if="!report.resolved" primary @click="resolve">{{ $ts.abuseMarkAsResolved }}</MkButton>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/form/switch.vue';
import { acct, userPage } from '@/filters/user';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkSwitch,
	},

	emits: ['resolved'],

	props: {
		report: {
			type: Object,
			required: true,
		}
	}

	data() {
		return {
			forward: this.report.forwarded,
		};
	}

	methods: {
		acct,
		userPage,

		resolve() {
			os.confirm({
				type: 'warning',
				text: this.$t('resolveAreYouSure', { x: this.report.comment }),
			}).then(({ canceled }) => {
				if (canceled) return;
				os.apiWithDialog('admin/resolve-abuse-user-report', {
					forward: this.forward,
					reportId: this.report.id,
				}).then(() => {
					this.$emit('resolved', this.report.id);
				});
			}
		}
	}
});
</script>

<style lang="scss" scoped>
.bcekxzvu {
	> .target {
		display: flex;
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		align-items: center;

		> .avatar {
			width: 42px;
			height: 42px;
		}

		> .info {
			margin-left: 0.3em;
			padding: 0 8px;
			flex: 1;

			> .name {
				font-weight: bold;
			}
		}
	}
}
</style>
