'use strict';

export type vAlign = 'top' | 'center' | 'bottom';
export type hAlign = 'left' | 'center' | 'right';
export type wrapping = 'none' | 'word' | 'character';

export interface IStringTMap<T> { [key: string]: T; };
export interface INumberTMap<T> { [key: number]: T; };

export interface IStringAnyMap extends IStringTMap<any> {};
export interface INumberAnyMap extends INumberTMap<any> {};

export interface IStringStringMap extends IStringTMap<string> {};
export interface INumberStringMap extends INumberTMap<string> {};

export interface IStringNumberMap extends IStringTMap<number> {};
export interface INumberNumberMap extends INumberTMap<number> {};

export interface IStringBooleanMap extends IStringTMap<boolean> {};
export interface INumberBooleanMap extends INumberTMap<boolean> {};

export interface ITopLeftPos {
	left: number;
	top: number;
}

export enum AnimationType {
	Opacity,
	Position
}

export let Easing = {
	Linear: (t: number) => t
}

export function pointInRect(px: number, py: number, x: number, y: number, w: number, h: number) {
	if (px < x ||
		px >= x + w ||
		py < y ||
		py >= y + h) {
		return false;
	}
	return true;
}

export function isFunction(prop: any) {
	return typeof (prop) === 'function';
}

export function randBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
