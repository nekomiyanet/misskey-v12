<template>
<MkSpacer :content-max="700" :margin-min="16" :margin-max="32">
	<FormSuspense :p="init">
		<div class="_formRoot">
			<FormFolder class="_formBlock">
				<template #icon><i class="fas fa-shield-alt"></i></template>
				<template #label>{{ $ts.botProtection }}</template>
				<template v-if="enableHcaptcha" #suffix>hCaptcha</template>
				<template v-else-if="enableRecaptcha" #suffix>reCAPTCHA</template>
				<template v-else #suffix>{{ $ts.none }} ({{ $ts.notRecommended }})</template>

				<XBotProtection/>
			</FormFolder>

			<FormFolder class="_formBlock">
				<template #label>Summaly Proxy</template>

				<div class="_formRoot">
					<FormInput v-model="summalyProxy" class="_formBlock">
						<template #prefix><i class="fas fa-link"></i></template>
						<template #label>Summaly Proxy URL</template>
					</FormInput>

					<FormButton primary class="_formBlock" @click="save"><i class="fas fa-save"></i> {{ $ts.save }}</FormButton>
				</div>
			</FormFolder>

			<FormFolder class="_formBlock">
				<template #label>{{ $ts.instanceSecurity }}</template>

				<div class="_formRoot">
					<FormSwitch v-if="!privateMode" v-model="secureMode">
						<template #label>{{ $ts.secureMode }}</template>
						<template #caption>{{ $ts.secureModeInfo }}</template>
					</FormSwitch>
					<FormSwitch v-model="privateMode">
						<template #label>{{ $ts.privateMode }}</template>
						<template #caption>{{ $ts.privateModeInfo }}</template>
					</FormSwitch>
					<FormTextarea v-if="privateMode" v-model="allowedHosts">
						<template #label>{{ $ts.allowedInstances }}</template>
						<template #caption>{{ $ts.allowedInstancesDescription }}</template>
					</FormTextarea>
					<FormButton primary class="_formBlock" @click="saveInstance"><i class="fas fa-save"></i> {{ $ts.save }}</FormButton>
				</div>

			</FormFolder>
		</div>
	</FormSuspense>
</MkSpacer>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import FormFolder from '@/components/form/folder.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormInfo from '@/components/ui/info.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSection from '@/components/form/section.vue';
import FormInput from '@/components/form/input.vue';
import FormButton from '@/components/ui/button.vue';
import XBotProtection from './bot-protection.vue';
import FormTextarea from '@/components/form/textarea.vue';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { fetchInstance } from '@/instance';

export default defineComponent({
	components: {
		FormFolder,
		FormSwitch,
		FormInfo,
		FormSection,
		FormSuspense,
		FormButton,
		FormInput,
		XBotProtection,
		FormTextarea,
	},

	emits: ['info'],

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.security,
				icon: 'fas fa-lock',
				bg: 'var(--bg)',
			},
			summalyProxy: '',
			enableHcaptcha: false,
			enableRecaptcha: false,
			secureMode: false,
			privateMode: false,
			allowedHosts: '',
		}
	},

	methods: {
		async init() {
			const meta = await os.api('meta', { detail: true });
			this.summalyProxy = meta.summalyProxy;
			this.enableHcaptcha = meta.enableHcaptcha;
			this.enableRecaptcha = meta.enableRecaptcha;
			this.secureMode = meta.secureMode;
			this.privateMode = meta.privateMode;
			this.allowedHosts = meta.allowedHosts.join('\n');;
		},

		save() {
			os.apiWithDialog('admin/update-meta', {
				summalyProxy: this.summalyProxy,
			}).then(() => {
				fetchInstance();
			});
		},

		saveInstance() {
			os.apiWithDialog('admin/update-meta', {
				secureMode: this.secureMode,
				privateMode: this.privateMode,
				allowedHosts: this.allowedHosts.split('\n') || [],
			}).then(() => {
				fetchInstance();
			});
		}
	}
});
</script>
