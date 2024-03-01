<template>
<div>
	<MkPagination ref="paginationComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img src="https://portal.nekomiya.net/assets/info.gif" class="_ghost"/>
				<div>{{ $ts.noSentFollowRequests }}</div>
			</div>
		</template>
		<template v-slot="{items}">
			<div class="mk-follow-requests">
				<div v-for="req in items" :key="req.id" class="user _panel">
					<MkAvatar class="avatar" :user="req.followee" :show-indicator="true"/>
					<div class="body">
						<div class="name">
							<MkA v-user-preview="req.followee.id" class="name" :to="userPage(req.followee)"><MkUserName :user="req.followee"/></MkA>
							<p class="acct">@{{ acct(req.followee) }}</p>
						</div>
						<div v-if="req.followee.description" class="description" :title="req.followee.description">
							<Mfm :text="req.followee.description" :is-note="false" :author="req.followee" :i="$i" :custom-emojis="req.followee.emojis" :plain="true" :nowrap="true"/>
						</div>
					</div>
				</div>
			</div>
		</template>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import MkPagination from '@/components/ui/pagination.vue';
import { userPage, acct } from '@/filters/user';
import * as os from '@/os';
import * as symbols from '@/symbols';
import { i18n } from '@/i18n';

const paginationComponent = ref<InstanceType<typeof MkPagination>>();

const pagination = {
	endpoint: 'following/requests/sent' as const,
	limit: 10,
};

defineExpose({
	[symbols.PAGE_INFO]: computed(() => ({
		title: i18n.ts.sentFollowRequests,
		icon: 'fas fa-user-clock',
		bg: 'var(--bg)',
	})),
});
</script>

<style lang="scss" scoped>
.mk-follow-requests {
	> .user {
		display: flex;
		padding: 16px;

		> .avatar {
			display: block;
			flex-shrink: 0;
			margin: 0 12px 0 0;
			width: 42px;
			height: 42px;
			border-radius: 8px;
		}

		> .body {
			display: flex;
			width: calc(100% - 54px);
			position: relative;

			> .name {
				width: 45%;

				@media (max-width: 500px) {
					width: 100%;
				}

				> .name,
				> .acct {
					display: block;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
					margin: 0;
				}

				> .name {
					font-size: 16px;
					line-height: 24px;
				}

				> .acct {
					font-size: 15px;
					line-height: 16px;
					opacity: 0.7;
				}
			}

			> .description {
				width: 55%;
				line-height: 42px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				opacity: 0.7;
				font-size: 14px;
				padding-right: 40px;
				padding-left: 8px;
				box-sizing: border-box;

				@media (max-width: 500px) {
					display: none;
				}
			}
		}
	}
}
</style>
