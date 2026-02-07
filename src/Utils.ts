import { Meta, WithDescription, WithTitle } from './SettingHandlers';
import { lang, t } from './lang/helpers';
import Pickr from '@simonwep/pickr';

export const settingRegExp = /\/\*!?\s*@settings[\r\n]+?([\s\S]+?)\*\//g;
export const nameRegExp = /^name:\s*(.+)$/m;
export type ErrorList = Array<{ name: string; error: string }>;

/**
 * i18n+ Global API interface for theme/snippet translation support
 */
interface I18nPlusGlobalAPI {
	getTranslation(themeId: string, key: string): string | undefined;
}

declare global {
	interface Window {
		i18nPlus?: I18nPlusGlobalAPI;
	}
}

/**
 * Get title for a setting, with i18n+ translation support
 * Priority: i18n+ external > CSS inline (title.{lang}) > original
 */
export function getTitle<T extends Meta>(config: T, sectionId?: string): string {
	// 1. Try i18n+ external translation
	if (window.i18nPlus?.getTranslation && sectionId && config.title) {
		const key = config.title; // Use original English title as key
		const translation = window.i18nPlus.getTranslation(sectionId, key);

		console.log(`[Style Settings Debug] getTitle: sectionId='${sectionId}', key='${key}', result='${translation}'`);
		if (translation) return translation;
		// console.log(`[Style Settings Debug] MISSING Translation: sectionId='${sectionId}', key='${key}'`);
	}

	// 2. Try CSS inline translation (title.{lang})
	if (lang) {
		const inlineTranslation = config[`title.${lang}` as keyof WithTitle];
		if (inlineTranslation) return inlineTranslation as string;
	}

	// 3. Return original
	return config.title;
}

/**
 * Get description for a setting, with i18n+ translation support
 * Priority: i18n+ external > CSS inline (description.{lang}) > original
 */
export function getDescription<T extends Meta>(config: T, sectionId?: string): string | undefined {
	// 1. Try i18n+ external translation
	if (window.i18nPlus?.getTranslation && sectionId && config.description) {
		const key = config.description; // Use original English description as key
		const translation = window.i18nPlus.getTranslation(sectionId, key);
		if (translation) return translation;
	}

	// 2. Try CSS inline translation (description.{lang})
	if (lang) {
		const inlineTranslation = config[`description.${lang}` as keyof WithDescription];
		if (inlineTranslation) return inlineTranslation as string;
	}

	// 3. Return original
	return config.description;
}


export function isValidDefaultColor(color: string) {
	return /^(#|rgb|hsl)/.test(color);
}

export function getPickrSettings(opts: {
	isView: boolean;
	el: HTMLElement;
	containerEl: HTMLElement;
	swatches: string[];
	opacity: boolean | undefined;
	defaultColor: string;
}): Pickr.Options {
	const { el, isView, containerEl, swatches, opacity, defaultColor } = opts;

	return {
		el,
		container: isView ? document.body : containerEl,
		theme: 'nano',
		swatches,
		lockOpacity: !opacity,
		default: defaultColor,
		position: 'left-middle',
		components: {
			preview: true,
			hue: true,
			opacity: !!opacity,
			interaction: {
				hex: true,
				rgba: true,
				hsla: true,
				input: true,
				cancel: true,
				save: true,
			},
		},
	};
}

export function onPickrCancel(instance: Pickr) {
	instance.hide();
}

export function sanitizeText(str: string): string {
	if (str === '') {
		return `""`;
	}

	return str.replace(/[;<>]/g, '');
}

export function createDescription(
	description: string | undefined,
	def: string,
	defLabel?: string
): DocumentFragment {
	const fragment = createFragment();

	if (description) {
		fragment.appendChild(document.createTextNode(description));
	}

	if (def) {
		const small = createEl('small');
		small.appendChild(createEl('strong', { text: `${t('Default:')} ` }));
		small.appendChild(document.createTextNode(defLabel || def));

		const div = createEl('div');

		div.appendChild(small);

		fragment.appendChild(div);
	}

	return fragment;
}

/*
 * compatability with Settings Search Plugin
 */
export interface SettingsSeachResource {
	//Id of your settings tab. This is usually the ID of your plugin as defined in the manifest.
	tab: string;
	//Name of your settings tab. This is usually the name of your plugin as defined in the manifest. This is used to organize the settings under headers when searching.
	name: string;
	//The name of the setting to add.
	text: string;
	//An optional description string to add to the setting.
	desc: string;
}
