import tw from 'twin.macro';
import Link from 'next/link';

import { formatDate } from '@app/utils/dates';
import type { PostMeta } from '@app/utils/posts';

const Article = tw.article`py-8 flex flex-wrap md:flex-nowrap w-full`;
const Meta = tw.p`text-gray-500 text-sm mb-2 mt-2 md:mt-0`;
const Title = tw.h2`text-2xl font-bold text-gray-900 mb-2 font-heading`;
const ArticleLink = tw.a`hover:underline`;
const Excerpt = tw.p`leading-relaxed mt-2 prose max-w-full!`;
const TagList = tw.ul`list-none flex mt-2`;
const Tag = tw.li`mr-2 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-400`;

const SimplePost = ({
    title,
    slug,
    date,
    tags = [],
    image,
    excerpt,
    readingTime,
}: PostMeta) => {
    const formattedDate = formatDate(date);

    return (
        <Article>
            {image && (
                <Link href={`/blog/${slug}`} passHref>
                    <a tw="mr-3">
                        <img
                            tw="w-full md:max-w-full rounded-md"
                            src={`${image.url}&w=500&h=350&fit=clamp`}
                            alt={`${image.description} by ${image.user.name} @ unsplash`}
                        />
                    </a>
                </Link>
            )}
            <div tw="w-full md:flex-grow">
                <Meta>
                    <abbr title={date}>{formattedDate}</abbr> - {readingTime?.text}
                </Meta>
                <Title>
                    <Link href={`/blog/${slug}`} passHref>
                        <ArticleLink>{title}</ArticleLink>
                    </Link>
                </Title>
                {excerpt && <Excerpt>{excerpt}</Excerpt>}
                {tags.length > 0 && (
                    <TagList>
                        {tags.map((tag) => (
                            <Tag key={tag}>
                                <Link href={`/blog/tag/${tag}`} passHref>
                                    {tag}
                                </Link>
                            </Tag>
                        ))}
                    </TagList>
                )}
            </div>
        </Article>
    );
};

export default SimplePost;
