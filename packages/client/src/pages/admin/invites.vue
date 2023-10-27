<template>
<div class="ztgjmzrw">
	<section v-for="invite in invites" class="_card _gap invites">
		<div class="_content invite">
      <MkInput v-model="invite.code" readonly>
			</MkInput>
			<div class="buttons">
				<MkButton class="button" inline @click="remove(invite)"><i class="fas fa-trash-alt"></i> {{ $ts.remove }}</MkButton>
			</div>
		</div>
	</section>
	<MkButton class="button" @click="more()">
		<i class="fas fa-rotate-right"></i>{{ $ts.more }}
	</MkButton>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@/components/ui/button.vue';
import MkInput from '@/components/form/input.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';

export default defineComponent({
	components: {
		MkButton,
		MkInput,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.invite,
				icon: 'fas fa-user',
				bg: 'var(--bg)',
				actions: [{
					asFullButton: true,
					icon: 'fas fa-plus',
					text: this.$ts.add,
					handler: this.create,
				}],
			},
			invites: [],
		}
	},

	created() {
		os.api('admin/invite/list').then(invites => {
			this.invites = invites;
		});
	},

	methods: {
		remove(invite) {
			this.invites = this.invites.filter(x => x != invite);
			os.api('admin/invite/delete', invite).then(x => {
				this.refresh();
			}).catch(e => {
				os.alert({
					type: 'error',
					text: e
				});
			});
		},

		refresh() {
			os.api('admin/invite/list').then(invites => {
				this.invites = invites;
			});
		},

		create() {
			os.api('admin/invite').then(x => {
				os.alert({
					type: 'info',
					text: x.code
				});
				this.refresh();
			}).catch(e => {
				os.alert({
					type: 'error',
					text: e
				});
			});
		},

		more() {
			const invites = this.invites;

			os.api('admin/invite/list', { untilId: invites.reduce((acc, invite) => invite.id != null ? invite : acc).id }).then(invites => {
				this.invites = this.invites.concat(invites);
			});
		}

	}
});
</script>

<style lang="scss" scoped>
.ztgjmzrw {
	margin: var(--margin);
}
</style>
