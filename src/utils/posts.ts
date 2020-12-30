import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import s from 'hastscript/svg';
// @ts-ignore
import renderToString from 'next-mdx-remote/render-to-string';
// @ts-ignore
import slug from 'rehype-slug';
// @ts-ignore
import headings from 'rehype-autolink-headings';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
// @ts-ignore
import highlight from 'rehype-highlight';

import embedder from './embedder';

export const POSTS_PATH = path.join(process.cwd(), 'content/posts');

export const components = {};

type PostMeta = {
    title: string;
    date: string;
    tags: string[];
    slug: string;
};

export type PostData = {
    source: string;
    meta: PostMeta;
};

export const getPostsSlug = () =>
    fs.readdirSync(POSTS_PATH).map((file) => file.replace('.mdx', ''));

export const getPostData = async (postSlug: string) => {
    const filePath = path.join(POSTS_PATH, `${postSlug}.mdx`);
    const source = fs.readFileSync(filePath);

    const { content, data } = matter(source);

    const mdxSource = await renderToString(content, {
        components,
        mdxOptions: {
            remarkPlugins: [embedder],
            rehypePlugins: [
                slug,
                [
                    headings,
                    {
                        properties: {
                            class: 'anchor before',
                            ariaHidden: true,
                            tabIndex: -1,
                        },
                        content: (node: any) => {
                            return s(
                                'svg',
                                {
                                    'aria-hidden': true,
                                    focusable: false,
                                    height: 16,
                                    width: 16,
                                    version: '1.1',
                                    viewBox: '0 0 16 16',
                                },
                                [
                                    s('path', {
                                        'fill-rule': 'evenodd',
                                        d:
                                            'M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z',
                                    }),
                                ],
                            );
                        },
                    },
                ],
                rehypeAccessibleEmojis,
                highlight,
            ],
        },
        scope: data,
    });

    return {
        source: mdxSource,
        meta: {
            ...data,
            slug: postSlug,
        },
    } as PostData;
};

export const getPosts = async () => {
    const slugs = getPostsSlug();

    const postsPromises = slugs.map(getPostData);

    return await Promise.all(postsPromises);
};
