import { longDate, type Post } from '../blog/post';
import { PostBody } from '../blog/PostBody';
import { Breadcrumb } from '../components/Breadcrumb';
import { trailFor } from '../site/breadcrumbs';
import { useRoute } from '../site/RouteContext';

/**
 * A post page (`/blog/<slug>/`): breadcrumb, the title as the page's one h1, the published
 * date and the updated date when there is one, then the body, whose headings start at h2.
 * No byline (docs/PRD-seo.md, Decisions).
 */
export function PostPage({ post }: { post: Post }) {
  const { route } = useRoute();
  return (
    <>
      <Breadcrumb trail={trailFor(route, post.title)} />
      <article className="ph post" aria-labelledby="post-title">
        <h1 id="post-title">{post.title}</h1>
        <p className="post__dates">
          Published <time dateTime={post.published}>{longDate(post.published)}</time>.
          {post.updated ? (
            <>
              {' '}
              Updated <time dateTime={post.updated}>{longDate(post.updated)}</time>.
            </>
          ) : null}
        </p>
        <div className="post__body">
          <PostBody slug={post.slug} nodes={post.body} />
        </div>
      </article>
    </>
  );
}
