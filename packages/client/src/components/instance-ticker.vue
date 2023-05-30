<template>
<div class="hpaizdrt" :style="bg" v-if="tickerOriginalStyle">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<span class="name">{{ instance.name }}</span>
	<span v-if="instance.softwareVersion && showTickerSoftWareVersion" class="software">{{ instance.softwareVersion }}</span>
	<span v-if="instance.softwareName && showTickerSoftWareName" class="software">{{ instance.softwareName }}</span>
</div>
<div class="mk-instance-ticker" :class="position" :style="tickerColor" v-if="tickerTaiyStyle">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<span class="name">{{ instance.name }}</span>
	<span v-if="instance.softwareVersion && showTickerSoftWareVersion && ableToShowInstanceDetails" class="software">{{ instance.softwareVersion }}</span>
	<span v-if="instance.softwareName && showTickerSoftWareName && ableToShowInstanceDetails" class="software">{{ instance.softwareName }}</span>
</div>
<div class="root" :style="bg" v-if="tickerCalckeyStyle">
	<img v-if="instance.faviconUrl" class="icon" :src="instance.faviconUrl"/>
	<div class="name">{{ instance.name }}</div>
</div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, unref } from 'vue';
import { instanceName, version, software } from '@/config';
import { instance as Instance } from '@/instance';
import { defaultStore } from '@/store';

const props = defineProps<{
	instance?: {
		faviconUrl?: string | null;
		name: string | null;
		themeColor?: string | null;
		softwareName?: string | null;
		softwareVersion?: string | null;
	};
	forceType?: typeof defaultStore.state.instanceTickerPosition | ComputedRef<typeof defaultStore.state.instanceTickerPosition>;
}>();

// if no instance data is given, this is for the local instance
const instance = props.instance ?? {
	faviconUrl: Instance.iconUrl || (Instance as { faviconUrl?: string | null }).faviconUrl || '/favicon.ico',
	name: instanceName,
	themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color-orig"]')?.content,
	softwareName: software,
	softwareVersion: version,
};

const position = computed(() => unref(props.forceType) ?? defaultStore.state.instanceTickerPosition);

const hexToRgb = (hex: string): {
	r: number;
	g: number;
	b: number;
} => {
	const [r, g, b] = Array.from(hex.slice(1).match(/.{2}/g) ?? [], n => parseInt(n, 16));
	return { r, g, b };
};

const getTickerFgColor = (hex: string): string => {
	const { r, g, b } = hexToRgb(hex);
	const yuv = 0.299 * r + 0.587 * g + 0.114 * b;

	return yuv > 191 ? '#2f2f2fcc' : '#ffffff';
};

const tickerBgColor = instance.themeColor ?? '#777777';
const tickerFgColor = getTickerFgColor(tickerBgColor);

const tickerColor = {
	'--ticker-bg': tickerBgColor,
	'--ticker-fg': tickerFgColor,
	'--ticker-bg-rgb': (({ r, g, b }): string => `${r}, ${g}, ${b}`)(hexToRgb(tickerBgColor)),
};

const themeColor = instance.themeColor ?? '#777777';
const bg = {
	background: `linear-gradient(90deg, ${themeColor}, ${themeColor}11)`,
};
const tickerOriginalStyle = defaultStore.state.instanceTickerStyle === 'original';
const tickerTaiyStyle = defaultStore.state.instanceTickerStyle === 'taiy';
const tickerCalckeyStyle = defaultStore.state.instanceTickerStyle === 'calckey';
const showTickerSoftWareName = defaultStore.state.showTickerSoftWareName;
const showTickerSoftWareVersion = defaultStore.state.showTickerSoftWareVersion;
const ableToShowInstanceDetails = (defaultStore.state.instanceTickerPosition === 'normal') || (defaultStore.state.instanceTickerPosition === 'bottomleft') || (defaultStore.state.instanceTickerPosition === 'bottomright');
</script>

<style lang="scss" scoped>
.hpaizdrt {
	$height: 1.1rem;

	height: $height;
	border-radius: 4px 0 0 4px;
	overflow: hidden;
	color: #fff;
	text-shadow: /* .866 ≈ sin(60deg) */
		1px 0 1px #000,
		.866px .5px 1px #000,
		.5px .866px 1px #000,
		0 1px 1px #000,
		-.5px .866px 1px #000,
		-.866px .5px 1px #000,
		-1px 0 1px #000,
		-.866px -.5px 1px #000,
		-.5px -.866px 1px #000,
		0 -1px 1px #000,
		.5px -.866px 1px #000,
		.866px -.5px 1px #000;

	> .icon {
		height: 100%;
	}

	> .name {
		margin-left: 4px;
		line-height: $height;
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
	}

	> .software {
		float: right;
		margin-right: .3em;
		line-height: $height;
		font-size: 0.9em;
		vertical-align: top;

		color: var(--fg);
		text-shadow: none;

		text-transform: capitalize;
	}
}

.mk-instance-ticker {
	background: var(--ticker-bg, #777777);
	color: var(--ticker-fg, #ffffff);
	overflow: hidden;

	> .icon {
		aspect-ratio: 1 / 1;
	}

	> .name {
		font-size: 0.9em;
		vertical-align: top;
		font-weight: bold;
	}

	> .software {
		float: right;
		margin-right: .3em;
		font-size: 0.9em;
		vertical-align: top;

		color: var(--fg);
		text-shadow: none;

		text-transform: capitalize;
	}

	&.normal {
		width: auto;
		height: 1.1rem;
		border-radius: 4px;
		overflow: hidden;

		> .icon {
			width: auto;
			height: 100%;
		}

		> .name {
			margin-left: 4px;
			line-height: 1.1rem;
		}
	}

	&.leftedge {
		position: absolute;
		top: 0;
		left: 0;
		display: grid;
		gap: 4px;
		grid-template-rows: auto 1fr;
		width: 14px;
		height: 100%;

		> .icon {
			display: block;
			width: 100%;
		}

		> .name {
			display: block;
			width: 100%;
			height: 100%;
			line-height: 14px;
			writing-mode: vertical-lr;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}

	&.rightedge {
		@extend .leftedge;
		left: auto;
		right: 0;
	}

	&.bottomright {
		--ticker-bg-deg: 135deg;
		pointer-events: none;
		user-select: none;
		position: absolute;
		z-index: -1;
		inset: 0;
		padding: 6px;
		display: flex;
		gap: 4px;
		flex-direction: column;
		justify-content: flex-end;
		align-items: flex-end;
		background: linear-gradient(
			var(--ticker-bg-deg),
			rgba(var(--ticker-bg-rgb), 0.35),
			rgba(var(--ticker-bg-rgb), 0.35) 3em,
			rgba(0, 0, 0, 0) 3em,
			rgba(0, 0, 0, 0) calc(100% - 3em),
			rgba(var(--ticker-bg-rgb), 0.35) calc(100% - 3em),
			rgba(var(--ticker-bg-rgb), 0.35) 100%
		);
		color: #fff;
		text-shadow: /* 0.866 ≈ sin(60deg) */
			1px 0 1px #000,
			0.866px 0.5px 1px #000,
			0.5px 0.866px 1px #000,
			0 1px 1px #000,
			-0.5px 0.866px 1px #000,
			-0.866px 0.5px 1px #000,
			-1px 0 1px #000,
			-0.866px -0.5px 1px #000,
			-0.5px -0.866px 1px #000,
			0 -1px 1px #000,
			0.5px -0.866px 1px #000,
			0.866px -0.5px 1px #000;

		> .icon {
			display: block;
			height: 1.5em;
			opacity: 0.8;
		}

		> .name {
			display: block;
			max-width: 100%;
			margin: -4px; // text-shadow
			padding: 4px; // text-shadow
			line-height: 1;
			opacity: 0.7;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			text-align: end;
		}
	}

	&.bottomleft {
		@extend .bottomright;
		--ticker-bg-deg: -135deg;
		align-items: flex-start;

		> .name {
			text-align: start;
		}
	}
}

.root {
	$height: 1.1rem;
	position: static;
	margin-left: 70%;
	margin-right: 0;
	display: flex;
	height: $height;
	padding: .1em .7em;
	border-radius: 100px;
	overflow: hidden;
	color: #fff;
	text-shadow: /* .866 ≈ sin(60deg) */
		1px 0 1px #000,
		.866px .5px 1px #000,
		.5px .866px 1px #000,
		0 1px 1px #000,
		-.5px .866px 1px #000,
		-.866px .5px 1px #000,
		-1px 0 1px #000,
		-.866px -.5px 1px #000,
		-.5px -.866px 1px #000,
		0 -1px 1px #000,
		.5px -.866px 1px #000,
		.866px -.5px 1px #000;
	mask-image: linear-gradient(90deg,
		rgb(0,0,0),
		rgb(0,0,0) calc(100% - 16px),
		rgba(0,0,0,0) 100%
	);

	.icon {
		height: 100%;
		flex-shrink: 0;
	}

	.name {
		margin-left: 4px;
		line-height: $height;
		vertical-align: top;
		font-weight: bold;
		text-overflow: ellipsis;
		flex-grow: 1;
		white-space: nowrap;
		oberflow: hidden;
		text-size-adjust: auto;
		width: 100%;
		height: 100%;
	}
}
</style>
