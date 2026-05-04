import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Search, FileText, Wrench, BookOpen, ChevronDown, Hash, ArrowLeft } from 'lucide-react'

function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(' ') }

/* ── render HTML content with terminal styling ── */
function KBContent({ html }: { html: string }) {
  const doc = new DOMParser().parseFromString(`<r>${html}</r>`, 'text/html')
  const root = doc.querySelector('r')
  if (!root) return null
  return <>{walk(root.childNodes)}</>
}
function walk(nodes: NodeListOf<ChildNode>): React.ReactNode[] {
  return Array.from(nodes).map((n, i) => nodeToEl(n, i)).filter(Boolean)
}
function nodeToEl(n: Node, k: number): React.ReactNode {
  if (n.nodeType === Node.TEXT_NODE) return n.textContent?.trim() || null
  if (n.nodeType !== Node.ELEMENT_NODE) return null
  const e = n as HTMLElement, tag = e.tagName.toLowerCase(), kids = walk(e.childNodes)
  switch (tag) {
    case 'h2': return <h2 key={k} className="text-base sm:text-lg font-bold text-white mt-7 mb-2 tracking-tight">{kids}</h2>
    case 'h3': return <h3 key={k} className="text-sm font-semibold text-white/80 mt-5 mb-2 flex items-center gap-2"><span className="w-1 h-3.5 bg-emerald-500/40 rounded-full inline-block shrink-0" />{kids}</h3>
    case 'p': return <p key={k} className="text-white/50 leading-[1.7] mb-3 text-[13px] sm:text-sm">{kids}</p>
    case 'ul': return <ul key={k} className="space-y-1 mb-4 ml-0.5">{kids}</ul>
    case 'li': return <li key={k} className="text-white/45 text-[13px] leading-[1.7] flex items-start gap-2"><span className="text-emerald-500/30 mt-1.5 shrink-0 text-[9px]">&gt;</span><span>{kids}</span></li>
    case 'ol': { let idx = 0; return <ol key={k} className="space-y-1 mb-4 ml-0.5">{Array.from(e.childNodes).map((c, ci) => { if (c.nodeType !== Node.ELEMENT_NODE || (c as HTMLElement).tagName.toLowerCase() !== 'li') return null; idx++; return <li key={ci} className="text-white/45 text-[13px] leading-[1.7] flex items-start gap-2"><span className="text-emerald-500/20 font-mono text-[9px] mt-1 shrink-0 w-4">{String(idx).padStart(2,'0')}</span><span>{walk(c.childNodes)}</span></li> })}</ol> }
    case 'pre': return <CodeBlock key={k} text={e.textContent || ''} />
    case 'code': return <code key={k} className="text-emerald-400/70 bg-emerald-500/[0.06] px-1 py-0.5 rounded text-[11px] sm:text-[13px] font-mono break-words">{e.textContent}</code>
    case 'strong': return <strong key={k} className="text-white/80 font-semibold">{kids}</strong>
    case 'em': return <em key={k} className="text-white/60 italic">{kids}</em>
    case 'a': return <a key={k} href={e.getAttribute('href')||'#'} className="text-emerald-400/60 hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/15">{kids}</a>
    case 'blockquote': return <blockquote key={k} className="border-l-2 border-emerald-500/15 pl-3 my-3 text-white/35 italic text-[13px]">{kids}</blockquote>
    case 'br': return <br key={k} />
    case 'hr': return <hr key={k} className="border-white/[0.04] my-5" />
    default: return <span key={k}>{kids}</span>
  }
}

/* ── terminal code block ── */
function CodeBlock({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  return (
    <div className="my-3 rounded-md overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.05]">
        <div className="w-2 h-2 rounded-full bg-red-500/30" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
        <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
      </div>
      <div className="p-3 sm:p-3.5 font-mono text-[11px] sm:text-[12px] leading-[1.85] overflow-x-auto">
        {lines.map((line, i) => {
          const t = line.trimStart()
          if (t.startsWith('$ ')) return <div key={i} className="flex items-start gap-2 min-w-max"><span className="text-emerald-500/45 shrink-0 select-none">$</span><span className="text-white/70">{t.slice(2)}</span></div>
          if (t.startsWith('#')) return <div key={i} className="text-white/18 min-w-max">{line}</div>
          if (line.includes('#')) { const x = line.indexOf('#'); return <div key={i} className="min-w-max"><span className="text-white/50 whitespace-pre">{line.slice(0,x)}</span><span className="text-white/18 whitespace-pre">{line.slice(x)}</span></div> }
          return <div key={i} className="text-white/40 whitespace-pre min-w-max">{line}</div>
        })}
      </div>
    </div>
  )
}

/* ── main ── */
export default function Knowledgebase() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: items } = trpc.knowledgebase.list.useQuery()
  const { data: searchResults } = trpc.knowledgebase.search.useQuery({ query }, { enabled: query.length > 0 })

  const displayItems = query.length > 0 ? searchResults : items

  const categories = [
    { key: 'cheatsheet', label: 'Cheatsheets', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    { key: 'troubleshooting', label: 'Troubleshooting', icon: Wrench, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { key: 'glossary', label: 'Glossary', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  ]

  const filteredByCategory = useMemo(() => {
    let f = displayItems ?? []
    if (activeCategory) f = f.filter(i => i.category === activeCategory)
    return f
  }, [displayItems, activeCategory])

  /* auto-expand on search */
  const firstMatchId = filteredByCategory.length === 1 && query.length > 0 ? filteredByCategory[0].id : null
  const effectiveExpandedId = expandedId ?? firstMatchId

  const toggleItem = (id: number) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Header */}
      <Link to="/" className="text-white/20 hover:text-white/45 text-[10px] font-mono flex items-center gap-1 mb-5 transition-colors">
        <ArrowLeft className="w-3 h-3" /> cd ~
      </Link>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
          <Hash className="w-4 h-4 text-emerald-400/70" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Knowledgebase</h1>
      </div>
      <p className="text-white/20 font-mono text-[11px] mb-8">
        $ man mastertheterminal <span className="text-emerald-400/40">--always-free</span>
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <Search className="w-3 h-3 text-white/15" />
          <span className="text-white/12 font-mono text-[10px]">$</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveCategory(null); setExpandedId(null) }}
          placeholder={`grep -r "query" /knowledgebase/`}
          className="w-full bg-[#080808] border border-white/[0.06] rounded-md pl-9 pr-4 py-2 text-white placeholder:text-white/15 focus:outline-none focus:border-emerald-500/25 transition-all font-mono text-[11px] sm:text-xs"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn('px-3 py-1.5 rounded-md text-[11px] font-mono transition-all border',
            activeCategory === null ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/[0.02] text-white/35 border-white/[0.05] hover:bg-white/[0.04]'
          )}
        >all</button>
        {categories.map(cat => {
          const count = (displayItems?.filter(i => i.category === cat.key) ?? []).length
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
              className={cn('px-3 py-1.5 rounded-md text-[11px] font-mono transition-all border flex items-center gap-1.5',
                activeCategory === cat.key ? `${cat.bg} ${cat.color} ${cat.border}` : 'bg-white/[0.02] text-white/35 border-white/[0.05] hover:bg-white/[0.04]'
              )}
            >
              <cat.icon className="w-3 h-3" />{cat.label}<span className="text-[9px] text-white/15">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filteredByCategory.length === 0 && (
          <div className="rounded-md border border-white/[0.05] bg-[#080808] p-8 text-center">
            <p className="text-white/15 font-mono text-xs">$ grep: no matches</p>
          </div>
        )}
        {filteredByCategory.map(item => {
          const isOpen = effectiveExpandedId === item.id
          const catMeta = categories.find(c => c.key === item.category)
          return (
            <div
              key={item.id}
              className={cn('rounded-md border overflow-hidden transition-all bg-[#080808]',
                isOpen ? 'border-white/[0.08]' : 'border-white/[0.04] hover:border-white/[0.07]'
              )}
            >
              {/* Header row */}
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.015] transition-colors"
              >
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0 border', catMeta?.bg ?? 'bg-white/[0.02]', catMeta?.border ?? 'border-white/[0.06]')}>
                  {catMeta ? <catMeta.icon className={cn('w-3.5 h-3.5', catMeta.color)} /> : <Hash className="w-3.5 h-3.5 text-white/25" />}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-[13px] font-medium text-white truncate">{item.title}</h3>
                </div>
                <span className={cn('text-[9px] font-mono uppercase tracking-wider shrink-0', catMeta?.color ?? 'text-white/15')}>
                  {catMeta?.label ?? item.category}
                </span>
                <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform ml-1', isOpen ? 'rotate-180 text-white/30' : 'text-white/15')} />
              </button>

              {/* Expanded content */}
              {isOpen && item.content && (
                <div className="px-4 pb-4 pt-1 border-t border-white/[0.03]">
                  <div className="max-w-2xl">
                    <KBContent html={item.content} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
