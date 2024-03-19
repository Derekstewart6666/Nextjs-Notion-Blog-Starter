import { Fragment } from 'react';
import Link from 'next/link';
import { getAllArticles, getArticlePage, getArticlePageData } from 'utils/notion';
import { Layout } from 'layouts/Layout';
import Image from 'next/image';
import { renderBlocks } from 'components/blocks/renderBlocks';
import getLocalizedDate from 'utils/getLocalizedDate';
import Container from 'components/Container';
import slugify from 'slugify';
import siteData from 'siteData';
import ArticleCard from 'components/ArticleCard';

const ArticlePage = ({
  content,
  title,
  thumbnail,
  publishedDate,
  lastEditedAt,
  summary,
  moreArticles
}) => {
  const publishedOn = getLocalizedDate(publishedDate);
  const modifiedDate = getLocalizedDate(lastEditedAt);

  const slug = slugify(title).toLowerCase();

  // const ogImage = `https://www.phung.io/api/og-image?title=${encodeURIComponent(
  //   title
  // )}&date=${encodeURIComponent(publishedOn)}`;

  const ogImage = `${siteData.websiteUrl}/api/og-image?title=${encodeURIComponent(
    title
  )}&date=${encodeURIComponent(publishedOn)}`;

  return (
    <>
      <Layout
        title={title}
        description={summary}
        imageUrl={ogImage}
        date={new Date(publishedDate).toISOString()}
        ogUrl={`/blog/${slug}`}
      >
        <div>
          <div className="px-6 py-16 pt-16 pb-48 mx-auto -mb-48 text-center bg-gray-100 md:pb-96 md:-mb-96">
            <div className="max-w-3xl mx-auto">
              <div className="sm:flex items-center justify-center mb-2 space-x-2 text-sm text-gray-500">
                <div className="">{publishedOn}</div>
                {publishedOn !== modifiedDate && (
                  <>
                    <span className="sm:block hidden">•</span>
                    <span className="0">Updated on {modifiedDate}</span>
                  </>
                )}
              </div>
              <div className="font-extrabold tracking-tight text-gray-900 text-w-4xl sm:text-4xl text-2xl">
                {title}
              </div>
              <div className="max-w-3xl mx-auto mt-3 text-xl leading-8 text-gray-500 sm:mt-4">
                {summary}
              </div>
            </div>
          </div>

          <div className="max-w-5xl px-6 mx-auto my-16 md:px-8">
            <Image
              className="rounded-lg aspect-video"
              objectFit="cover"
              src={thumbnail}
              placeholder="blur"
              blurDataURL={thumbnail}
              layout="intrinsic"
              width={1200}
              height={684}
              alt={'article cover'}
              priority
            />
          </div>
          <div className="max-w-4xl px-6 mx-auto mb-24 space-y-8 md:px-8">
            {content.map(block => (
              <Fragment key={block.id}>{renderBlocks(block)}</Fragment>
            ))}
          </div>
          <div className="py-12 border-t">
            <Container>
              <div className="flex items-center justify-between my-8">
                <div className="text-3xl font-bold text-gray-900">Latest articles</div>
                <Link href="/">
                  <span className="font-semibold text-gray-900 cursor-pointer">
                    More articles ➜
                  </span>
                </Link>
              </div>
              <div className="grid gap-10 lg:gap-12 sm:grid-cols-2">
                {moreArticles.map(article => (
                  <ArticleCard article={article} key={article.id} />
                ))}
              </div>
            </Container>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticPaths = async () => {
  const paths = [];
  const data: any = await getAllArticles(process.env.BLOG_DATABASE_ID);

  data.forEach(result => {
    if (result.object === 'page') {
      paths.push({
        params: {
          slug: slugify(result.properties.title.title[0].plain_text).toLowerCase()
        }
      });
    }
  });

  return {
    paths,
    fallback: 'blocking'
  };
};

export const getStaticProps = async ({ params: { slug } }) => {
  const data = await getAllArticles(process.env.BLOG_DATABASE_ID);

  const page = getArticlePage(data, slug);
  const result = await getArticlePageData(page, slug, process.env.BLOG_DATABASE_ID);

  return {
    props: result,
    revalidate: 60 * 60
  };
};

export default ArticlePage;
