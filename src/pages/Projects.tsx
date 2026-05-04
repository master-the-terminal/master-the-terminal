import { FolderGit2, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

const projects = [
  {
    slug: 'terminal-cheatsheet-app',
    title: 'Terminal Cheatsheet CLI App',
    description: 'Build a cross-platform CLI tool that stores, searches, and displays terminal commands with categories. Supports fuzzy search and export to markdown.',
    difficulty: 'Beginner',
    time: '2-3 hours',
    courseSlug: 'terminal-mastery',
    tags: ['Node.js', 'CLI', ' Commander.js'],
  },
  {
    slug: 'git-history-visualizer',
    title: 'Git History Visualizer',
    description: 'Create a web-based Git log visualizer that renders commit history as an interactive graph. Supports branching, merging, and rebasing visualization.',
    difficulty: 'Intermediate',
    time: '4-5 hours',
    courseSlug: 'git-github',
    tags: ['Git', 'SVG', 'D3.js'],
  },
  {
    slug: 'hono-api-boilerplate',
    title: 'Production Hono API Boilerplate',
    description: 'Build a production-ready API boilerplate with Hono, Zod validation, Drizzle ORM, auth middleware, rate limiting, and Docker support.',
    difficulty: 'Advanced',
    time: '6-8 hours',
    courseSlug: 'backend-hono',
    tags: ['Hono', 'Drizzle', 'Docker'],
  },
  {
    slug: 'personal-devops-dashboard',
    title: 'Personal DevOps Dashboard',
    description: 'Deploy a full-stack application with automated CI/CD, SSL, PM2 process management, and monitoring. Include rollback capabilities.',
    difficulty: 'Advanced',
    time: '8-10 hours',
    courseSlug: 'deployment-devops',
    tags: ['DevOps', 'CI/CD', 'Nginx'],
  },
  {
    slug: 'deploy-hostinger-cloud',
    title: 'Deploy to Hostinger Cloud Startup',
    description: 'Deploy your fullstack Node.js application to Hostinger Cloud Startup using the built-in GitHub integration, MySQL databases, and hPanel environment variables. Includes PayFast and Google OAuth configuration.',
    difficulty: 'Intermediate',
    time: '3-4 hours',
    courseSlug: 'deployment-devops',
    tags: ['Hostinger', 'Cloud Startup', 'DevOps'],
  },
]

export default function Projects() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? projects : projects.filter(p => p.difficulty.toLowerCase() === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Projects</h1>
        <p className="text-white/50 font-mono">$ ls -la /projects/ <span className="text-emerald-400">total {projects.length}</span></p>
      </div>

      <div className="flex gap-2 mb-8">
        {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono capitalize transition-all ${
              filter === f 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((project) => (
          <Link key={project.slug} to={`/projects/${project.slug}`} className="group">
            <div className="rounded-md border border-white/[0.06] bg-[#080808] p-6 hover:bg-white/[0.02] hover:border-white/[0.10] transition-all duration-300 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FolderGit2 className="w-6 h-6 text-emerald-400" />
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${
                  project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                  project.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {project.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{project.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                <span>Time: {project.time}</span>
                <span className="text-emerald-400 flex items-center gap-1">Start project <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
