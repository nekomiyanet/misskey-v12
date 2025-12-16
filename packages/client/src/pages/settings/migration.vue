<template>
	<div class="_formRoot">
		<FormSection>
			<template #label>{{ i18n.ts.moveTo }}</template>
			<FormInfo warn class="_formBlock">{{
				i18n.ts.moveAccountDescription
			}}</FormInfo>
			<FormInput v-if="!$i?.movedToUri" v-model="moveToAccount" class="_formBlock">
				<template #prefix
					><i class="fas fa-plane-departure"></i
				></template>
				<template #label>{{ i18n.ts.moveToLabel }}</template>
			</FormInput>
			<FormButton v-if="!$i?.movedToUri" primary danger @click="move(moveToAccount)">
				{{ i18n.ts.moveAccount }}
			</FormButton>
			<FormInfo v-if="$i?.movedToUri" warn class="_formBlock">{{
				i18n.ts.movedAccountDescription
			}}</FormInfo>
			<FormButton v-if="$i?.movedToUri" primary @click="cancelRedirect">
				{{ i18n.ts.cancelMoveAccount }}
			</FormButton>
		</FormSection>
	</div>
</template>

<script lang="ts" setup>
import FormSection from "@/components/form/section.vue";
import FormInput from "@/components/form/input.vue";
import FormButton from "@/components/ui/button.vue";
import FormInfo from "@/components/ui/info.vue";
import * as symbols from '@/symbols';
import * as os from "@/os";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { $i } from "@/account";

let moveToAccount = $ref("");

async function move(account): Promise<void> {
	const confirm = await os.confirm({
		type: "warning",
		text: i18n.t("migrationConfirm", { account: account.toString() }),
	});
	if (confirm.canceled) return;
  const { canceled, result: password } = await os.inputText({
    title: i18n.ts.password,
    type: 'password'
  });
  if (canceled) return;
	os.apiWithDialog("i/redirect", {
    password: password,
		moveToAccount: account
	});
}

async function cancelRedirect() {
	const { canceled, result: password } = await os.inputText({
		title: i18n.ts.password,
		type: 'password'
	});
	if (canceled) return;
	os.apiWithDialog("i/unredirect", {
    password: password
	});
}

defineExpose({
	[symbols.PAGE_INFO]: {
		title: i18n.ts.migration,
		icon: 'fas fa-plane-departure',
		bg: 'var(--bg)',
	},
});
</script>
