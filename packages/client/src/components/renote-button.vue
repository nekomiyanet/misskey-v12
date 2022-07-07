<template>
<button v-if="canRenote"
	ref="buttonRef"
	class="eddddedb _button canRenote"
	@click="renote(false, $event)"
>
	<i class="fas fa-retweet"></i>
	<p v-if="count > 0" class="count">{{ count }}</p>
</button>
<button v-else class="eddddedb _button">
	<i class="fas fa-ban"></i>
</button>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import Ripple from '@/components/ripple.vue';
import XDetails from '@/components/users-tooltip.vue';
import { pleaseLogin } from '@/scripts/please-login';
import * as os from '@/os';
import { $i } from '@/account';
import { useTooltip } from '@/scripts/use-tooltip';
import { i18n } from '@/i18n';
import { defaultStore } from "@/store";

export default defineComponent({
	props: {
		count: {
			type: Number,
			required: true,
		},
		note: {
			type: Object,
			required: true,
		},
	},

	setup(props) {
		const buttonRef = ref<HTMLElement>();

		const canRenote = computed(() => ['public', 'home'].includes(props.note.visibility) || props.note.userId === $i.id);

		useTooltip(buttonRef, async (showing) => {
			const renotes = await os.api('notes/renotes', {
				noteId: props.note.id,
				limit: 11
			});

			const users = renotes.map(x => x.user);

			if (users.length < 1) return;

			os.popup(XDetails, {
				showing,
				users,
				count: props.count,
				targetElement: buttonRef.value
			}, {}, 'closed');
		});

		const renote = async (viaKeyboard = false, ev?: MouseEvent) => {
			pleaseLogin();

			const renotes = await os.api("notes/renotes", {
				noteId: props.note.id,
				userId: $i.id,
				limit: 1,
			});

			const hasRenotedBefore = renotes.length > 0;

			const visibility = defaultStore.state.useDefaultNoteVisibilityOnRenote ? (
				defaultStore.state.rememberNoteVisibility ? defaultStore.state.visibility : defaultStore.state.defaultNoteVisibility
			) : defaultStore.state.defaultRenoteVisibility;

			const localOnly = defaultStore.state.useDefaultNoteVisibilityOnRenote ? (
				defaultStore.state.rememberNoteVisibility ? defaultStore.state.localOnly : defaultStore.state.defaultNoteLocalOnly
			) : defaultStore.state.defaultRenoteLocalOnly;

			if (!defaultStore.state.approveSeperateRenoteButton && defaultStore.state.seperateRenoteQuote) {
				os.confirm({
					type: 'info',
					text: i18n.ts.approveSeperateRenoteButton,
				}).then(({ canceled }) => {
				if (canceled) {
					defaultStore.set('seperateRenoteQuote', false);
					defaultStore.set('approveSeperateRenoteButton', true);
					os.popupMenu([{
						text: i18n.ts.renote,
						icon: 'fas fa-retweet',
						action: () => {
							const el =
								ev &&
								((ev.currentTarget ?? ev.target) as
									| HTMLElement
									| null
									| undefined);
							if (el) {
								const rect = el.getBoundingClientRect();
								const x = rect.left + el.offsetWidth / 2;
								const y = rect.top + el.offsetHeight / 2;
								os.popup(Ripple, { x, y }, {}, "end");
							}
							os.api('notes/create', {
								renoteId: props.note.id,
								visibility: visibility as never,
								localOnly,
							});
						}
					}, {
						text: i18n.ts.quote,
						icon: 'fas fa-quote-right',
						action: () => {
							os.post({
								renote: props.note,
							});
						}
					}], buttonRef.value, {
						viaKeyboard
					});
				} else {
					defaultStore.set('seperateRenoteQuote', true);
					defaultStore.set('approveSeperateRenoteButton', true);
					if (hasRenotedBefore) {
						os.api('notes/unrenote', {
							noteId: props.note.id,
						});
					} else {
						const el =
							ev &&
							((ev.currentTarget ?? ev.target) as
								| HTMLElement
								| null
								| undefined);
						if (el) {
							const rect = el.getBoundingClientRect();
							const x = rect.left + el.offsetWidth / 2;
							const y = rect.top + el.offsetHeight / 2;
							os.popup(Ripple, { x, y }, {}, "end");
						}
						os.api('notes/create', {
							renoteId: props.note.id,
							visibility: visibility as never,
							localOnly,
						});
					}
				}
			} else if (defaultStore.state.seperateRenoteQuote && hasRenotedBefore) {
				os.api('notes/unrenote', {
					noteId: props.note.id,
				});
			} else if (defaultStore.state.seperateRenoteQuote) {
				const el =
					ev &&
					((ev.currentTarget ?? ev.target) as
						| HTMLElement
						| null
						| undefined);
				if (el) {
					const rect = el.getBoundingClientRect();
					const x = rect.left + el.offsetWidth / 2;
					const y = rect.top + el.offsetHeight / 2;
					os.popup(Ripple, { x, y }, {}, "end");
				}
				os.api('notes/create', {
					renoteId: props.note.id,
					visibility: visibility as never,
					localOnly,
				});
			} else {
			os.popupMenu([{
				text: i18n.ts.renote,
				icon: 'fas fa-retweet',
				action: () => {
					const el =
						ev &&
						((ev.currentTarget ?? ev.target) as
							| HTMLElement
							| null
							| undefined);
					if (el) {
						const rect = el.getBoundingClientRect();
						const x = rect.left + el.offsetWidth / 2;
						const y = rect.top + el.offsetHeight / 2;
						os.popup(Ripple, { x, y }, {}, "end");
					}
					os.api('notes/create', {
						renoteId: props.note.id,
						visibility: visibility as never,
						localOnly,
					});
				}
			}, {
				text: i18n.ts.quote,
				icon: 'fas fa-quote-right',
				action: () => {
					os.post({
						renote: props.note,
					});
				}
			}], buttonRef.value, {
				viaKeyboard
			});
		}
		};

		return {
			buttonRef,
			canRenote,
			renote,
		};
	},
});
</script>

<style lang="scss" scoped>
.eddddedb {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&:not(.canRenote) {
		cursor: default;
	}

	&.renoted {
		background: var(--accent);
	}

	> .count {
		display: inline;
		margin-left: 8px;
		opacity: 0.7;
	}
}
</style>
