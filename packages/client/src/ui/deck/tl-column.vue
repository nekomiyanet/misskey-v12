<template>
<XColumn :func="{ handler: setType, title: $ts.timeline }" :column="column" :is-stacked="isStacked" :indicated="indicated" @change-active-state="onChangeActiveState">
	<template #header>
		<i v-if="column.tl === 'home'" class="fas fa-home"></i>
		<i v-else-if="column.tl === 'local'" class="fas fa-comments"></i>
		<i v-else-if="column.tl === 'social'" class="fas fa-share-alt"></i>
		<i v-else-if="column.tl === 'cat'" class="fas fa-paw"></i>
		<i v-else-if="column.tl === 'mod'" class="fas fa-bookmark"></i>
		<i v-else-if="column.tl === 'limited'" class="fas fa-unlock"></i>
		<i v-else-if="column.tl === 'global'" class="fas fa-globe"></i>
		<span style="margin-left: 8px;">{{ column.name }}</span>
	</template>

	<div v-if="disabled || ((column.tl === 'local' || column.tl === 'social') && !this.enableLTL) || (column.tl === 'cat' && (!this.enableCTL || !this.$i.isCat)) || (column.tl === 'mod' && !this.enableMTL) || (column.tl === 'limited' && !this.enableLimitedTL) || (column.tl === 'global' && !this.enableGTL)" class="iwaalbte">
		<p>
			<i class="fas fa-minus-circle"></i>
			{{ $ts.disabledTimelineTitle }}
		</p>
		<p class="desc">{{ $ts.disabledTimelineDescription }}</p>
	</div>
	<XTimeline v-else-if="column.tl" ref="timeline" :key="column.tl" :src="column.tl" @after="() => $emit('loaded')" @queue="queueUpdated" @note="onNote"/>
</XColumn>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XColumn from './column.vue';
import XTimeline from '@/components/timeline.vue';
import * as os from '@/os';
import { removeColumn, updateColumn } from './deck-store';
import { defaultStore } from '@/store';
import { $i } from '@/account';

export default defineComponent({
	components: {
		XColumn,
		XTimeline,
	},

	props: {
		column: {
			type: Object,
			required: true
		},
		isStacked: {
			type: Boolean,
			required: true
		}
	},

	data() {
		return {
			disabled: false,
			indicated: false,
			columnActive: true,
			enableCTL: false,
			enableLimitedTL: false,
			enableMTL: false,
			enableGTL: false,
			enableLTL: false,
		};
	},

	watch: {
		mediaOnly() {
			(this.$refs.timeline as any).reload();
		}
	},

	mounted() {
		if (this.column.tl == null) {
			this.setType();
		} else {
			this.disabled = !this.$i.isModerator && !this.$i.isAdmin && (
				this.$instance.disableLocalTimeline && ['local', 'social'].includes(this.column.tl) ||
				this.$instance.disableGlobalTimeline && ['global'].includes(this.column.tl) ||
				['mod'].includes(this.column.tl));
		}
		this.enableLTL = defaultStore.state.enableLTL;
		this.enableLimitedTL = defaultStore.state.enableLimitedTL;
		this.enableCTL = defaultStore.state.enableCTL;
		this.enableMTL = defaultStore.state.enableMTL;
		this.enableGTL = defaultStore.state.enableGTL;
	},

	methods: {
		async setType() {
			const { canceled, result: src } = await os.select({
				title: this.$ts.timeline,
				items: [{
					value: 'home', text: this.$ts._timelines.home
				}, {
					value: 'local', text: this.$ts._timelines.local
				}, {
					value: 'social', text: this.$ts._timelines.social
				}, {
					value: 'cat', text: this.$ts._timelines.cat
				}, {
					value: 'mod', text: this.$ts._timelines.mod
				}, {
					value: 'limited', text: this.$ts._timelines.limited
				}, {
					value: 'global', text: this.$ts._timelines.global
				}]
			});
			if (canceled) {
				if (this.column.tl == null) {
					removeColumn(this.column.id);
				}
				return;
			}
			updateColumn(this.column.id, {
				tl: src
			});
		},

		queueUpdated(q) {
			if (this.columnActive) {
				this.indicated = q !== 0;
			}
		},

		onNote() {
			if (!this.columnActive) {
				this.indicated = true;
			}
		},

		onChangeActiveState(state) {
			this.columnActive = state;

			if (this.columnActive) {
				this.indicated = false;
			}
		},

		focus() {
			(this.$refs.timeline as any).focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.iwaalbte {
	text-align: center;

	> p {
		margin: 16px;

		&.desc {
			font-size: 14px;
		}
	}
}
</style>
