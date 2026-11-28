import { longDate, newestFirst, type PostMeta } from '../blog/post';
import { useRoute } from '../site/RouteContext';
import { postPath } from '../site/routes';

/**
 * The blog index (`/blog/`): every post, newest first, each with its title as a link, its
 * published date and its description. `posts` is `POSTS` (src/blog/posts.ts), built from the
 * post files, so nothing here is edited when a post is added.
 */
export function BlogPage({ posts }: { posts: readonly PostMeta[] }) {
  const { href } = useRoute();
  return (
    <section className="ph" aria-labelledby="blog-title">
      <p className="eyebrow">Blog</p>
      <h1 id="blog-title">Across the criteria</h1>
      <p className="lede">
        Articles on what no single criterion page covers: subjects that span several criteria,
        what changed between versions of WCAG, the law, and ways of testing. Each one links to
        the criterion pages it discusses.
      </p>
      {posts.length ? (
        <ul className="posts">
          {newestFirst(posts).map((post) => (
            <li key={post.slug}>
              <h2>
                <a href={href(postPath(post.slug))}>{post.title}</a>
              </h2>
              <p className="posts__date">
                <time dateTime={post.published}>{longDate(post.published)}</time>
              </p>
              <p>{post.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="prose">No posts yet. The first ones are being written.</p>
      )}
    </section>
  );
}
