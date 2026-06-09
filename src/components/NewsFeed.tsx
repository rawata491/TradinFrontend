import { ExternalLink, Clock, ThumbsUp, ThumbsDown, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react'
import type { NewsArticle } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function kindLabel(kind: string) {
  const map: Record<string, string> = {
    news: 'News',
    media: 'Media',
    blog: 'Blog',
    twitter: 'Twitter',
    reddit: 'Reddit',
  }
  return map[kind] ?? 'News'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="flex gap-3 py-3.5 animate-pulse">
      <div className="h-14 w-20 rounded-lg bg-dark-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-full rounded bg-dark-700" />
        <div className="h-4 w-3/4 rounded bg-dark-700" />
        <div className="h-3 w-1/2 rounded bg-dark-700" />
      </div>
    </div>
  )
}

function ArticleItem({ article }: { article: NewsArticle }) {
  const votes = article.votes_positive - article.votes_negative

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 py-3.5 hover:bg-dark-800/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="h-14 w-20 rounded-lg bg-dark-800 flex-shrink-0 overflow-hidden">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Newspaper className="h-5 w-5 text-dark-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-dark-100 group-hover:text-dark-50 line-clamp-2 leading-snug transition-colors">
          {article.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {article.source_name && (
            <span className="text-xs text-dark-400">{article.source_name}</span>
          )}
          <span className="text-xs text-dark-600">·</span>
          <span className="flex items-center gap-1 text-xs text-dark-500">
            <Clock className="h-3 w-3" />
            {timeAgo(article.published_at)}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-400">
            {kindLabel(article.kind)}
          </span>
          {votes !== 0 && (
            <span
              className={`flex items-center gap-1 text-xs ${
                votes > 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {votes > 0 ? (
                <ThumbsUp className="h-3 w-3" />
              ) : (
                <ThumbsDown className="h-3 w-3" />
              )}
              {Math.abs(votes)}
            </span>
          )}
          <ExternalLink className="h-3 w-3 text-dark-600 ml-auto flex-shrink-0 group-hover:text-dark-400 transition-colors" />
        </div>
      </div>
    </a>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface NewsFeedProps {
  articles: NewsArticle[]
  total?: number
  page?: number
  pageSize?: number
  loading?: boolean
  error?: string | null
  onPageChange?: (page: number) => void
  /** compact = max 5 items, no pagination (sidebar mode) */
  compact?: boolean
}

export function NewsFeed({
  articles,
  total = 0,
  page = 1,
  pageSize = 10,
  loading = false,
  error = null,
  onPageChange,
  compact = false,
}: NewsFeedProps) {
  const totalPages = Math.ceil(total / pageSize)
  const displayArticles = compact ? articles.slice(0, 5) : articles

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-dark-400" />
          <h3 className="text-sm font-semibold text-dark-50">Latest News</h3>
          {total > 0 && !compact && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-700 text-dark-400">
              {total}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 py-3">Failed to load news. Please try again.</p>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="divide-y divide-dark-800/50">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Articles */}
      {!loading && !error && (
        <>
          {displayArticles.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-dark-500">
              <Newspaper className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No news articles available yet.</p>
              <p className="text-xs mt-1">Check back after the next news fetch.</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-800/50">
              {displayArticles.map((article) => (
                <ArticleItem key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!compact && totalPages > 1 && onPageChange && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-800/50">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="btn-ghost flex items-center gap-1 text-xs py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <span className="text-xs text-dark-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="btn-ghost flex items-center gap-1 text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
