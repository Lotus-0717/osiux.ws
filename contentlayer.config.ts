import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import { createApi } from 'unsplash-js';
import type { ComputedFields } from 'contentlayer/source-files';
import readingTime from 'reading-time';
import slug from 'rehype-slug';
import headings from 'rehype-autolink-headings';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import { h, s } from 'hastscript';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import { remarkCodeHike } from '@code-hike/mdx';
import ImgixClient from '@imgix/js-core';

import theme from './code-hike-theme';
import Cache from './src/utils/cache';

const cache = new Cache();

const unsplash = createApi({
	accessKey: process.env.UNSPLASH_ACCESS_KEY as string,
});

const imgix = new ImgixClient({
	domain: 'osiuxws.imgix.net',
	secureURLToken: process.env.IMGIX_SECURE_TOKEN as string,
	useHTTPS: true,
});

const defaultImgixParams = {
	w: 500,
	h: 350,
	fit: 'crop',
	crop: 'faces,focalpoint,entropy',
};

const computedFields: ComputedFields = {
	slug: {
		type: 'string',
		resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ''),
	},
	readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
	unsplash: {
		type: 'json',
		resolve: async (doc) => {
			let image = null;
			if (doc.image && !doc.image.startsWith('imgix:')) {
				image = await cache.get(doc.image);

				if (!image) {
					const response = (
						await unsplash.photos.get({ photoId: doc.image })
					)?.response;

					image = {
						description:
							response?.description || response?.alt_description,
						url: response?.urls.raw,
						blur_hash: response?.blur_hash,
						attributionLink: response?.links.html,
						width: response?.width,
						height: response?.height,
						user: {
							name: response?.user.name,
							link: response?.user.links.html,
						},
					};

					await cache.set(doc.image, image);
				}

				return image;
			}

			return null;
		},
	},
	imgix: {
		type: 'json',
		resolve: async (doc) => {
			let image = null;
			if (doc.image && doc.image.startsWith('imgix:')) {
				image = await cache.get(doc.image);

				if (!image) {
					const [imagePath, params] = doc.image
						.replace('imgix:', '')
						.split('?');

					let imgParams = defaultImgixParams;
					if (params) {
						const searchParams = new URLSearchParams(params);
						const tmpParams: Record<string, string> = {};
						searchParams.forEach((v, k) => (tmpParams[k] = v));

						imgParams = { ...defaultImgixParams, ...tmpParams };
					}

					const url = imgix.buildURL(imagePath, imgParams);

					image = {
						url,
					};

					await cache.set(doc.image, image);
				}

				return image;
			}

			return null;
		},
	},
};

export const Post = defineDocumentType(() => ({
	name: 'Post',
	filePathPattern: 'posts/*.mdx',
	contentType: 'mdx',
	fields: {
		title: { type: 'string', required: true },
		date: { type: 'date', required: true },
		tags: { type: 'list', of: { type: 'string' } },
		image: { type: 'string' },
		excerpt: { type: 'string' },
	},
	computedFields,
}));

const contentLayerConfig = makeSource(async () => {
	return {
		contentDirPath: 'content',
		documentTypes: [Post],
		mdx: {
			remarkPlugins: [remarkGfm, [remarkCodeHike, { theme }]],
			rehypePlugins: [
				slug,
				[
					headings,
					{
						behavior: 'after',
						group: h('div.heading-container'),
						properties: {
							ariaHidden: true,
							tabIndex: -1,
						},
						content: (node: Element) => {
							return [
								h(
									'span.visually-hidden',
									`Read the "${toString(
										node.children,
									)}" section`,
								),
								h(
									'span.icon.icon-link',
									{ ariaHidden: true },
									s(
										'svg',
										{
											'aria-hidden': true,
											focusable: false,
											height: 30,
											width: 30,
											version: '1.1',
											viewBox: '0 0 16 16',
										},
										[
											s('path', {
												'fill-rule': 'evenodd',
												d: 'M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z',
											}),
										],
									),
								),
							];
						},
					},
				],
				rehypeAccessibleEmojis,
			],
		},
	};
});

export default contentLayerConfig;
