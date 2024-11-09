<template>
<div class="ztgjmzrw">
	<section v-for="resolver in resolvers" class="_card _gap resolvers">
		<div class="_content resolver">
			<MkInput v-model="resolver.name">
				<template #label>{{ $ts.name }}</template>
			</MkInput>
			<div>
				<div class="label">{{ $ts._abuse._resolver.targetUserPattern }}</div>
				<PrismEditor v-model="resolver.targetUserPattern" placeholder="^(LocalUser|RemoteUser@RemoteHost)$" class="_code code" :highlight="highlighter" :ignoreTabKey="true" :line-numbers="false"/>
			</div>
			<div>
				<div class="label">{{ $ts._abuse._resolver.reporterPattern }}</div>
				<PrismEditor v-model="resolver.reporterPattern" placeholder="^(LocalUser|RemoteUser@RemoteHost)$" class="_code code" :highlight="highlighter" :ignoreTabKey="true" :line-numbers="false"/>
			</div>
			<div>
				<div class="label">{{ $ts._abuse._resolver.reportContentPattern }}</div>
				<PrismEditor v-model="resolver.reportContentPattern" placeholder=".*" class="_code code" :highlight="highlighter" :ignoreTabKey="true" :line-numbers="false"/>
			</div>
			<FormSwitch v-model="resolver.forward" class="_formBlock">
				<template #label>{{ $ts.forwardReport }}</template>
			</FormSwitch>
			<div class="buttons">
				<MkButton class="button" inline primary @click="save(resolver)"><i class="fas fa-save"></i> {{ $ts.save }}</MkButton>
				<MkButton class="button" inline @click="remove(resolver)"><i class="fas fa-trash-alt"></i> {{ $ts.remove }}</MkButton>
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
import MkTextarea from '@/components/form/textarea.vue';
import FormSwitch from '@/components/form/switch.vue';
import { PrismEditor } from 'vue-prism-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import * as os from '@/os';
import * as symbols from '@/symbols';
import 'vue-prism-editor/dist/prismeditor.min.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-regex';

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkTextarea,
		PrismEditor,
		FormSwitch,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.abuseReportResolvers,
				icon: 'fas fa-exclamation-circle',
				bg: 'var(--bg)',
				actions: [{
					asFullButton: true,
					icon: 'fas fa-plus',
					text: this.$ts.add,
					handler: this.add,
				}],
			},
			resolvers: [],
		}
	},

	created() {
		os.api('admin/abuse-report-resolver/list').then(resolvers => {
			this.resolvers = resolvers;
		});
	},

	methods: {
		add() {
			this.resolvers.unshift({
				id: null,
				name: null,
				targetUserPattern: null,
				reporterPattern: null,
				reportContentPattern: null,
				forward: false
			});
		},

		remove(resolver) {
			os.confirm({
				type: 'warning',
				text: this.$t('removeAreYouSure', { x: resolver.name }),
			}).then(({ canceled }) => {
				if (canceled) return;
				this.resolvers = this.resolvers.filter(x => x != resolver);
				os.api('admin/abuse-report-resolver/delete', {
					resolverId: resolver.id,
				});
			});
		},

		save(resolver) {
			if (resolver.id == null) {
				os.api('admin/abuse-report-resolver/create', {
					name: resolver.name,
					targetUserPattern: resolver.targetUserPattern || null,
					reporterPattern: resolver.reporterPattern || null,
					reportContentPattern: resolver.reportContentPattern || null,
					forward: resolver.forward,
				}).then(() => {
					os.alert({
						type: 'success',
						text: this.$ts.saved
					});
					this.refresh();
				}).catch(e => {
					os.alert({
						type: 'error',
						text: e
					});
				});
			} else {
				os.api('admin/abuse-report-resolver/update', {
					resolverId: resolver.id,
					name: resolver.name,
					targetUserPattern: resolver.targetUserPattern || null,
					reporterPattern: resolver.reporterPattern || null,
					reportContentPattern: resolver.reportContentPattern || null,
					forward: resolver.forward,
				}).then(() => {
					os.alert({
						type: 'success',
						text: this.$ts.saved
					});
				}).catch(e => {
					os.alert({
						type: 'error',
						text: e
					});
				});
			}
		},

		refresh() {
			os.api('admin/abuse-report-resolver/list').then(resolvers => {
				this.resolvers = resolvers;
			});
		},

		more() {
			const resolvers = this.resolvers;

			os.api('admin/abuse-report-resolver/list', { untilId: resolvers.reduce((acc, resolver) => resolver.id != null ? resolver : acc).id }).then(resolvers => {
				this.resolvers = this.resolvers.concat(resolvers);
			});
		},

		highlighter(code) {
			return highlight(code, languages.regex);
		},

	}
});
</script>

<style lang="scss" scoped>
.ztgjmzrw {
	margin: var(--margin);
}
</style>
