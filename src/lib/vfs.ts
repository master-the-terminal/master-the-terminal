/* ── Virtual File System for Interactive Terminals ── */

export interface VFSNode {
  type: 'file' | 'dir'
  content: string
  children: Map<string, VFSNode>
  mtime: Date
}

function makeDir(): VFSNode {
  return { type: 'dir', content: '', children: new Map(), mtime: new Date() }
}
function makeFile(content = ''): VFSNode {
  return { type: 'file', content, children: new Map(), mtime: new Date() }
}

export class VFS {
  root: VFSNode
  cwd: string
  user: string
  hostname: string
  env: Record<string, string>
  history: string[] = []

  constructor(hostname: string, user = 'user', files: Record<string, string> = {}) {
    this.hostname = hostname
    this.user = user
    this.env = { USER: user, HOME: '/home/' + user, PATH: '/usr/local/bin:/usr/bin:/bin' }
    this.root = makeDir()
    this.cwd = '/home/' + user
    this.ensureDir('/')
    this.ensureDir('/home')
    this.ensureDir('/home/' + user)
    this.ensureDir('/tmp')
    this.ensureDir('/usr')
    this.ensureDir('/usr/local')
    this.ensureDir('/usr/local/bin')
    for (const [path, content] of Object.entries(files)) {
      const name = path.split('/').pop() || ''
      if (content === '' && !name.includes('.')) {
        this.ensureDir(path)
      } else {
        this.writeFileRaw(path, content)
      }
    }
  }

  /* internal helpers */
  ensureDir(path: string) {
    const parts = path.split('/').filter(Boolean)
    let cur = this.root
    for (const p of parts) {
      if (!cur.children.has(p)) {
        cur.children.set(p, makeDir())
      }
      const n = cur.children.get(p)!
      if (n.type !== 'dir') throw new Error('not a directory')
      cur = n
    }
  }

  writeFileRaw(path: string, content: string) {
    const [parent, name] = this.getParent(path)
    if (!parent) return
    parent.children.set(name, makeFile(content))
  }

  resolve(path: string): VFSNode | null {
    const p = path.startsWith('/') ? path : this.cwd + '/' + path
    const parts = this.normalize(p).split('/').filter(Boolean)
    let cur = this.root
    for (const part of parts) {
      if (!cur.children.has(part)) return null
      cur = cur.children.get(part)!
    }
    return cur
  }

  resolveParent(path: string): [VFSNode, string] | [null, string] {
    const p = path.startsWith('/') ? path : this.cwd + '/' + path
    const norm = this.normalize(p)
    const parts = norm.split('/').filter(Boolean)
    const name = parts.pop() || ''
    let cur = this.root
    for (const part of parts) {
      if (!cur.children.has(part)) return [null, name]
      cur = cur.children.get(part)!
      if (cur.type !== 'dir') return [null, name]
    }
    return [cur, name]
  }

  getParent(path: string): [VFSNode, string] | [null, string] {
    return this.resolveParent(path)
  }

  normalize(path: string): string {
    const parts = path.split('/').filter(Boolean)
    const stack: string[] = []
    for (const p of parts) {
      if (p === '..') stack.pop()
      else if (p !== '.' && p !== '') stack.push(p)
    }
    return '/' + stack.join('/')
  }

  formatNode(name: string, node: VFSNode): string {
    const mode = node.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'
    const size = node.type === 'dir' ? '4096' : String(node.content.length)
    const mtime = node.mtime.toISOString().slice(0, 10) + ' ' + node.mtime.toISOString().slice(11, 16)
    return `${mode}  1 ${this.user.padEnd(6)} ${this.user.padEnd(6)} ${size.padStart(6)} ${mtime} ${name}`
  }

  copyTree(node: VFSNode): VFSNode {
    const copy: VFSNode = {
      type: node.type,
      content: node.content,
      children: new Map(),
      mtime: new Date(node.mtime),
    }
    for (const [k, v] of node.children) {
      copy.children.set(k, this.copyTree(v))
    }
    return copy
  }

  /* public commands */
  cd(path: string): string {
    if (!path || path === '~') path = this.env.HOME
    const target = this.resolve(path)
    if (!target) return `cd: ${path}: No such file or directory`
    if (target.type !== 'dir') return `cd: ${path}: Not a directory`
    const p = path.startsWith('/') ? path : this.cwd + '/' + path
    this.cwd = this.normalize(p)
    return ''
  }

  pwd(): string {
    return this.cwd
  }

  mkdir(path: string): string {
    if (!path) return 'mkdir: missing operand'
    const [parent, name] = this.getParent(path)
    if (!parent) return `mkdir: cannot create directory '${path}': No such file or directory`
    if (parent.children.has(name)) return `mkdir: cannot create directory '${name}': File exists`
    parent.children.set(name, makeDir())
    return ''
  }

  touch(path: string): string {
    if (!path) return 'touch: missing file operand'
    const node = this.resolve(path)
    if (node) {
      node.mtime = new Date()
      return ''
    }
    const [parent, name] = this.getParent(path)
    if (!parent) return `touch: cannot touch '${path}': No such file or directory`
    parent.children.set(name, makeFile(''))
    return ''
  }

  writeFile(path: string, content: string): string {
    const [parent, name] = this.getParent(path)
    if (!parent) return `write: ${path}: No such file or directory`
    parent.children.set(name, makeFile(content))
    return ''
  }

  cat(path: string): string {
    if (!path) return 'cat: missing operand'
    const node = this.resolve(path)
    if (!node) return `cat: ${path}: No such file or directory`
    if (node.type === 'dir') return `cat: ${path}: Is a directory`
    return node.content || '(empty file)'
  }

  rm(path: string, recursive = false): string {
    if (!path) return 'rm: missing operand'
    const [parent, name] = this.getParent(path)
    if (!parent || !parent.children.has(name)) return `rm: cannot remove '${path}': No such file or directory`
    const node = parent.children.get(name)!
    if (node.type === 'dir' && !recursive) return `rm: cannot remove '${path}': Is a directory`
    parent.children.delete(name)
    return ''
  }

  cp(src: string, dst: string): string {
    if (!src || !dst) return 'cp: missing operand'
    const snode = this.resolve(src)
    if (!snode) return `cp: cannot stat '${src}': No such file or directory`
    const [dparent, dname] = this.getParent(dst)
    if (!dparent) return `cp: cannot create regular file '${dst}': No such file or directory`
    if (snode.type === 'dir') return `cp: -r not specified; omitting directory '${src}'`
    dparent.children.set(dname, makeFile(snode.content))
    return ''
  }

  mv(src: string, dst: string): string {
    if (!src || !dst) return 'mv: missing operand'
    const [sparent, sname] = this.getParent(src)
    if (!sparent || !sparent.children.has(sname)) return `mv: cannot stat '${src}': No such file or directory`
    const node = sparent.children.get(sname)!
    const [dparent, dname] = this.getParent(dst)
    if (!dparent) return `mv: failed to access '${dst}': No such file or directory`
    sparent.children.delete(sname)
    dparent.children.set(dname, node)
    return ''
  }

  ls(path = '.', flags = ''): string {
    const target = this.resolve(path)
    if (!target) return `ls: cannot access '${path}': No such file or directory`
    if (target.type === 'file') return path
    const showAll = flags.includes('a')
    const long = flags.includes('l')
    const names = Array.from(target.children.keys())
    if (showAll) {
      if (long) {
        return ['.', '..', ...names].map(n => {
          if (n === '.' || n === '..') return `drwxr-xr-x  1 root   root   4096 Jan 01 00:00 ${n}`
          return this.formatNode(n, target.children.get(n)!)
        }).join('\n')
      }
      return ['.', '..', ...names].join('  ')
    }
    if (long) {
      return names.map(n => this.formatNode(n, target.children.get(n)!)).join('\n')
    }
    return names.join('  ')
  }

  tree(path = '.'): string {
    const target = this.resolve(path)
    if (!target) return `tree: '${path}': No such file or directory`
    if (target.type !== 'dir') return path
    const out: string[] = [path]
    const walk = (node: VFSNode, prefix: string) => {
      const entries = Array.from(node.children.entries())
      entries.forEach(([name, child], i) => {
        const isLast = i === entries.length - 1
        const branch = isLast ? '└── ' : '├── '
        out.push(prefix + branch + name)
        if (child.type === 'dir') {
          walk(child, prefix + (isLast ? '    ' : '│   '))
        }
      })
    }
    walk(target, '')
    return out.join('\n')
  }

  echo(args: string[]): string {
    return args.join(' ')
  }

  clear(): string {
    return '__CLEAR__'
  }

  help(): string {
    return [
      'Available commands:',
      '  pwd        Print working directory',
      '  ls [-la]   List directory contents',
      '  tree       Show directory tree',
      '  cd <dir>   Change directory',
      '  mkdir <d>  Create directory',
      '  touch <f>  Create empty file',
      '  rm [-r] <f> Remove file or directory',
      '  cp <s> <d> Copy file',
      '  mv <s> <d> Move file',
      '  cat <file> Display file contents',
      '  echo <msg> Print message',
      '  whoami     Print current user',
      '  date       Print current date',
      '  env        Print environment variables',
      '  clear      Clear terminal',
      '  help       Show this help',
    ].join('\n')
  }

  whoami(): string {
    return this.user
  }

  date(): string {
    return new Date().toString()
  }

  envCmd(): string {
    return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n')
  }

  exec(cmdline: string): string {
    const trimmed = cmdline.trim()
    if (!trimmed) return ''
    this.history.push(trimmed)
    const tokens = trimmed.split(/\s+/)
    const cmd = tokens[0]
    const args = tokens.slice(1)
    const flags = args.filter(a => a.startsWith('-')).join('')
    const realArgs = args.filter(a => !a.startsWith('-'))

    switch (cmd) {
      case 'help': return this.help()
      case 'pwd': return this.pwd()
      case 'ls': return this.ls(realArgs[0] || '.', flags)
      case 'tree': return this.tree(realArgs[0] || '.')
      case 'cd': return this.cd(realArgs[0] || '')
      case 'mkdir': return realArgs.map(a => this.mkdir(a)).filter(Boolean).join('\n') || ''
      case 'touch': return realArgs.map(a => this.touch(a)).filter(Boolean).join('\n') || ''
      case 'rm': return realArgs.map(a => this.rm(a, flags.includes('r'))).filter(Boolean).join('\n') || ''
      case 'cp': return realArgs.length >= 2 ? this.cp(realArgs[0], realArgs[1]) : 'cp: missing destination'
      case 'mv': return realArgs.length >= 2 ? this.mv(realArgs[0], realArgs[1]) : 'mv: missing destination'
      case 'cat': return realArgs.map(a => this.cat(a)).join('\n') || 'cat: missing operand'
      case 'echo': return this.echo(args)
      case 'clear': return this.clear()
      case 'whoami': return this.whoami()
      case 'date': return this.date()
      case 'env': return this.envCmd()
      case 'hostname': return this.hostname
      case 'history': return this.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join('\n')
      case 'exit': return ''
      default: return `${cmd}: command not found`
    }
  }
}


/* ── Lesson-specific presets ── */

export interface Task {
  description: string
  check: (vfs: VFS) => boolean
}

export interface TerminalPreset {
  hostname: string
  objective: string
  tasks: Task[]
  files: Record<string, string>
}

/* task checker helpers */
const hasRun = (cmd: string) => (vfs: VFS) => vfs.history.some(h => h.trim().startsWith(cmd))
const fileExists = (path: string) => (vfs: VFS) => !!vfs.resolve(path)
const dirExists = (path: string) => (vfs: VFS) => { const n = vfs.resolve(path); return !!n && n.type === 'dir' }
const cwdIs = (path: string) => (vfs: VFS) => vfs.cwd === path || vfs.cwd.replace('/home/user', '~') === path

export function getTerminalPreset(lessonSlug: string): TerminalPreset {
  switch (lessonSlug) {
    /* ── Terminal Mastery ── */
    case 'terminal-basics': return {
      hostname: 'basics-vm',
      objective: 'Learn to navigate the filesystem and inspect files.',
      tasks: [
        { description: 'Run pwd to see your current directory', check: hasRun('pwd') },
        { description: 'Run ls to list files in your home folder', check: hasRun('ls') },
        { description: 'Read README.txt with cat README.txt', check: hasRun('cat README') },
        { description: 'Navigate up with cd .. then run pwd again', check: (vfs) => hasRun('cd ..')(vfs) && hasRun('pwd')(vfs) },
      ],
      files: {
        '/home/user/README.txt': 'Welcome to Terminal Basics!\n\nTry these commands:\n  ls        - list files\n  pwd       - show current directory\n  cd ..     - go up one level\n  echo hi   - print text\n  cat README.txt - read this file',
        '/home/user/projects': '',
        '/home/user/notes': '',
        '/home/user/cheatsheet.txt': 'pwd  - print working directory\nls   - list files\ncd   - change directory\necho - print text',
      }
    }
    case 'file-operations': return {
      hostname: 'file-ops-lab',
      objective: 'Create, copy, move, and remove files and directories.',
      tasks: [
        { description: 'List all files with ls -la', check: hasRun('ls -la') },
        { description: 'Create a directory called temp', check: dirExists('/home/user/temp') },
        { description: 'Copy documents/report.txt into temp/', check: fileExists('/home/user/temp/report.txt') },
        { description: 'Remove the archive directory', check: (vfs) => !vfs.resolve('/home/user/archive') },
      ],
      files: {
        '/home/user/documents': '',
        '/home/user/documents/report.txt': 'Q1 Sales Report\n================\nRevenue: $120,000\nGrowth: +12%',
        '/home/user/scripts': '',
        '/home/user/scripts/backup.sh': '#!/bin/bash\necho "Backing up..."',
        '/home/user/archive': '',
        '/home/user/archive/old_data.csv': 'id,name,amount\n1,Alice,100\n2,Bob,200',
      }
    }
    case 'power-tools': return {
      hostname: 'power-tools',
      objective: 'Inspect logs and data files like a systems engineer.',
      tasks: [
        { description: 'List the contents of the logs/ directory', check: hasRun('ls logs') },
        { description: 'Read server.log with cat', check: hasRun('cat logs/server.log') },
        { description: 'View the directory tree', check: hasRun('tree') },
        { description: 'Create a new file scripts/filter.sh', check: fileExists('/home/user/scripts/filter.sh') },
      ],
      files: {
        '/home/user/logs': '',
        '/home/user/logs/server.log': '2024-01-15 09:23:01 INFO Server started\n2024-01-15 09:23:05 WARN High memory usage\n2024-01-15 09:23:12 ERROR Connection timeout\n2024-01-15 09:24:00 INFO Daily backup complete',
        '/home/user/logs/access.log': '192.168.1.1 - GET /index.html\n192.168.1.2 - POST /api/login\n192.168.1.3 - GET /dashboard',
        '/home/user/data': '',
        '/home/user/data/users.csv': 'id,username,role\n1,admin,root\n2,jdoe,user\n3,asmith,admin',
        '/home/user/data/orders.json': '{"orders": [{"id": 1, "total": 99.99}]}',
        '/home/user/scripts': '',
        '/home/user/scripts/parse.sh': '#!/bin/bash\necho "Parsing logs..."',
      }
    }
    case 'shell-scripting': return {
      hostname: 'scripting-station',
      objective: 'Explore existing scripts and create your own shell files.',
      tasks: [
        { description: 'List files in the scripts/ directory', check: hasRun('ls scripts') },
        { description: 'Read countdown.sh with cat', check: hasRun('cat scripts/countdown.sh') },
        { description: 'Create a new script scripts/greet.sh', check: fileExists('/home/user/scripts/greet.sh') },
        { description: 'View the full directory tree with tree', check: hasRun('tree') },
      ],
      files: {
        '/home/user/scripts': '',
        '/home/user/scripts/hello.sh': '#!/bin/bash\necho "Hello, $USER!"',
        '/home/user/scripts/countdown.sh': '#!/bin/bash\nfor i in 3 2 1; do\n  echo "Countdown: $i"\ndone\necho "Launch!"',
        '/home/user/scripts/backup.sh': '#!/bin/bash\n# TODO: implement backup logic',
        '/home/user/data': '',
        '/home/user/data/numbers.txt': '1\n2\n3\n5\n8\n13\n21',
        '/home/user/README.txt': 'Shell Scripting Lab\n\nCreate scripts in the scripts/ folder.\nTry: touch scripts/myscript.sh',
      }
    }
    case 'advanced-terminal': return {
      hostname: 'advanced-shell',
      objective: 'Inspect configs, system files, and remote settings.',
      tasks: [
        { description: 'Read the bash config .bashrc', check: hasRun('cat config/.bashrc') },
        { description: 'Navigate into system/ and list files', check: (vfs) => cwdIs('/home/user/system')(vfs) && hasRun('ls')(vfs) },
        { description: 'Read processes.txt with cat', check: hasRun('cat system/processes.txt') },
        { description: 'Create a new config file .aliases', check: fileExists('/home/user/config/.aliases') },
      ],
      files: {
        '/home/user/config': '',
        '/home/user/config/.bashrc': '# ~/.bashrc\nalias ll="ls -la"\nalias gs="git status"\nexport EDITOR=vim',
        '/home/user/config/.vimrc': 'set number\nset expandtab\nset shiftwidth=2',
        '/home/user/system': '',
        '/home/user/system/processes.txt': 'PID  CMD\n1    systemd\n234  nginx\n567  node server.js',
        '/home/user/remote': '',
        '/home/user/remote/servers.txt': 'web-01  192.168.1.10\nweb-02  192.168.1.11\ndb-01   192.168.1.20',
      }
    }

    /* ── Git & GitHub ── */
    case 'git-fundamentals': return {
      hostname: 'git-workstation',
      objective: 'Practice repository inspection and file staging concepts.',
      tasks: [
        { description: 'List files in the my-project/ directory', check: hasRun('ls my-project') },
        { description: 'Read the project README.md', check: hasRun('cat my-project/README.md') },
        { description: 'Inspect .gitconfig', check: hasRun('cat .gitconfig') },
        { description: 'Create a new file my-project/LICENSE', check: fileExists('/home/user/my-project/LICENSE') },
      ],
      files: {
        '/home/user/.gitconfig': '[user]\n  name = Developer\n  email = dev@example.com\n[core]\n  editor = vim',
        '/home/user/my-project': '',
        '/home/user/my-project/index.html': '<!DOCTYPE html>\n<html><body>Hello</body></html>',
        '/home/user/my-project/style.css': 'body { background: #111; color: #eee; }',
        '/home/user/my-project/README.md': '# My Project\n\nA sample project for git practice.',
        '/home/user/exercises': '',
        '/home/user/exercises/commit-msg.txt': 'feat: add initial project files',
      }
    }
    case 'git-branching': return {
      hostname: 'branch-lab',
      objective: 'Explore branches, feature folders, and merge concepts.',
      tasks: [
        { description: 'Read BRANCHES.txt to see the branch structure', check: hasRun('cat BRANCHES.txt') },
        { description: 'List the feature-auth/ directory', check: hasRun('ls feature-auth') },
        { description: 'Read app/main.js with cat', check: hasRun('cat app/main.js') },
        { description: 'Create a new branch folder feature-ui', check: dirExists('/home/user/feature-ui') },
      ],
      files: {
        '/home/user/feature-auth': '',
        '/home/user/feature-auth/login.js': 'function login() { return true; }',
        '/home/user/feature-auth/logout.js': 'function logout() { return true; }',
        '/home/user/app': '',
        '/home/user/app/main.js': 'console.log("main app");',
        '/home/user/app/config.js': 'module.exports = { port: 3000 };',
        '/home/user/BRANCHES.txt': 'main\n  feature-auth\n  hotfix-cors',
      }
    }
    case 'git-advanced': return {
      hostname: 'git-advanced',
      objective: 'Inspect commit history and identify problematic changes.',
      tasks: [
        { description: 'Read the commit history', check: hasRun('cat history/commits.txt') },
        { description: 'Read bad-commit.txt for the bug clue', check: hasRun('cat history/bad-commit.txt') },
        { description: 'List the repo/ directory', check: hasRun('ls repo') },
        { description: 'Create a fix file repo/fix.patch', check: fileExists('/home/user/repo/fix.patch') },
      ],
      files: {
        '/home/user/history': '',
        '/home/user/history/commits.txt': 'a1b2c3d feat: initial setup\ne4f5g6h fix: resolve cors bug\ni7j8k9l refactor: extract utils',
        '/home/user/history/bad-commit.txt': 'This commit introduced the bug.\nFind it with git bisect.',
        '/home/user/repo': '',
        '/home/user/repo/utils.js': 'export function helper() { return 42; }',
      }
    }
    case 'github-actions': return {
      hostname: 'ci-runner',
      objective: 'Explore CI/CD workflow files and pipeline configs.',
      tasks: [
        { description: 'List the .github/workflows/ directory', check: hasRun('ls .github/workflows') },
        { description: 'Read test.yml with cat', check: hasRun('cat .github/workflows/test.yml') },
        { description: 'Read deploy.yml with cat', check: hasRun('cat .github/workflows/deploy.yml') },
        { description: 'Create a new workflow file lint.yml', check: fileExists('/home/user/.github/workflows/lint.yml') },
      ],
      files: {
        '/home/user/.github': '',
        '/home/user/.github/workflows': '',
        '/home/user/.github/workflows/test.yml': 'name: Tests\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test',
        '/home/user/.github/workflows/deploy.yml': 'name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "Deploying..."',
        '/home/project': '',
        '/home/project/package.json': '{"name": "my-app", "scripts": {"test": "vitest"}}',
      }
    }
    case 'git-workflows': return {
      hostname: 'team-workflow',
      objective: 'Compare branching strategies and team configuration.',
      tasks: [
        { description: 'Read the trunk strategy trunk.md', check: hasRun('cat strategies/trunk.md') },
        { description: 'Inspect team/CODEOWNERS', check: hasRun('cat team/CODEOWNERS') },
        { description: 'List all strategies', check: hasRun('ls strategies') },
        { description: 'Create a new strategy doc shipit.md', check: fileExists('/home/user/strategies/shipit.md') },
      ],
      files: {
        '/home/user/strategies': '',
        '/home/user/strategies/trunk.md': '# Trunk-Based Development\n\n- Short-lived branches\n- Feature flags\n- Continuous integration',
        '/home/user/strategies/gitflow.md': '# GitFlow\n\n- main, develop, feature/*, release/*, hotfix/*',
        '/home/user/strategies/github-flow.md': '# GitHub Flow\n\n- Branch -> PR -> Merge -> Deploy',
        '/home/user/team': '',
        '/home/user/team/CODEOWNERS': '* @lead-dev\n/src @frontend-team',
        '/home/user/team/PULL_REQUEST_TEMPLATE.md': '## Summary\n## Changes\n## Testing',
      }
    }

    /* ── Backend Hono ── */
    case 'hono-routing': return {
      hostname: 'hono-dev',
      objective: 'Inspect a Hono API project structure and routes.',
      tasks: [
        { description: 'List the project/src/ directory', check: hasRun('ls project/src') },
        { description: 'Read the main entry point index.ts', check: hasRun('cat project/src/index.ts') },
        { description: 'Inspect package.json', check: hasRun('cat project/package.json') },
        { description: 'Create a new route file posts.ts', check: fileExists('/home/user/project/src/routes/posts.ts') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/package.json': '{\n  "name": "hono-api",\n  "dependencies": {\n    "hono": "^4.0"\n  }\n}',
        '/home/user/project/src': '',
        '/home/user/project/src/index.ts': 'import { Hono } from "hono";\nconst app = new Hono();\n\napp.get("/", (c) => c.text("Hello Hono!"));\n\nexport default app;',
        '/home/user/project/src/routes': '',
        '/home/user/project/src/routes/users.ts': 'import { Hono } from "hono";\nconst users = new Hono();\nusers.get("/", (c) => c.json([{id:1,name:"Alice"}]));\nexport default users;',
        '/home/user/project/README.md': '# Hono API\n\nRun with: `npm run dev`',
      }
    }
    case 'hono-validation': return {
      hostname: 'hono-api',
      objective: 'Study validation schemas and error handling patterns.',
      tasks: [
        { description: 'Read the validation schema validate.ts', check: hasRun('cat project/src/middleware/validate.ts') },
        { description: 'Inspect the auth route auth.ts', check: hasRun('cat project/src/routes/auth.ts') },
        { description: 'Read the error classes errors.ts', check: hasRun('cat project/src/errors.ts') },
        { description: 'Create a new middleware file logger.ts', check: fileExists('/home/user/project/src/middleware/logger.ts') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/src': '',
        '/home/user/project/src/middleware': '',
        '/home/user/project/src/middleware/validate.ts': 'import { zValidator } from "@hono/zod-validator";\nimport { z } from "zod";\n\nexport const userSchema = z.object({\n  name: z.string().min(1),\n  email: z.string().email()\n});',
        '/home/user/project/src/routes': '',
        '/home/user/project/src/routes/auth.ts': 'import { Hono } from "hono";\nconst auth = new Hono();\nauth.post("/login", (c) => {\n  return c.json({ token: "abc123" });\n});\nexport default auth;',
        '/home/user/project/src/errors.ts': 'export class AppError extends Error {\n  status = 500;\n}\nexport class BadRequest extends AppError {\n  status = 400;\n}',
      }
    }
    case 'hono-advanced': return {
      hostname: 'hono-prod',
      objective: 'Study CORS, rate limiting, and production configs.',
      tasks: [
        { description: 'Read the CORS middleware cors.ts', check: hasRun('cat project/src/middleware/cors.ts') },
        { description: 'Inspect rate limiting rateLimit.ts', check: hasRun('cat project/src/middleware/rateLimit.ts') },
        { description: 'Read the upload handler handler.ts', check: hasRun('cat project/src/uploads/handler.ts') },
        { description: 'Create a new config file security.ts', check: fileExists('/home/user/project/src/config/security.ts') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/src': '',
        '/home/user/project/src/middleware': '',
        '/home/user/project/src/middleware/cors.ts': 'import { cors } from "hono/cors";\nexport const corsMiddleware = cors({\n  origin: "*",\n  allowMethods: ["GET", "POST"]\n});',
        '/home/user/project/src/middleware/rateLimit.ts': 'let requests = 0;\nexport const rateLimit = () => {\n  requests++;\n  return requests < 100;\n};',
        '/home/user/project/src/uploads': '',
        '/home/user/project/src/uploads/handler.ts': 'import { Hono } from "hono";\nconst upload = new Hono();\nupload.post("/", (c) => c.text("Uploaded"));\nexport default upload;',
        '/home/user/project/config.ts': 'export const config = {\n  maxFileSize: 5 * 1024 * 1024,\n  allowedTypes: ["image/png", "image/jpeg"]\n};',
      }
    }
    case 'hono-database': return {
      hostname: 'db-api',
      objective: 'Inspect Drizzle schemas, database clients, and tests.',
      tasks: [
        { description: 'Read the schema schema.ts', check: hasRun('cat project/src/db/schema.ts') },
        { description: 'Inspect the DB client client.ts', check: hasRun('cat project/src/db/client.ts') },
        { description: 'List the tests directory', check: hasRun('ls project/src/tests') },
        { description: 'Create a new test file posts.test.ts', check: fileExists('/home/user/project/src/tests/posts.test.ts') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/src': '',
        '/home/user/project/src/db': '',
        '/home/user/project/src/db/schema.ts': 'import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";\nexport const users = sqliteTable("users", {\n  id: integer("id").primaryKey(),\n  name: text("name").notNull()\n});',
        '/home/user/project/src/db/client.ts': 'import { drizzle } from "drizzle-orm/better-sqlite3";\nexport const db = drizzle("sqlite.db");',
        '/home/user/project/src/tests': '',
        '/home/user/project/src/tests/users.test.ts': 'import { testClient } from "hono/testing";\n// write your tests here',
      }
    }
    case 'hono-production': return {
      hostname: 'prod-hono',
      objective: 'Study security headers, logging, and environment configs.',
      tasks: [
        { description: 'Read security headers headers.ts', check: hasRun('cat project/src/security/headers.ts') },
        { description: 'Inspect the logger logger.ts', check: hasRun('cat project/src/middleware/logger.ts') },
        { description: 'Read environment config env.ts', check: hasRun('cat project/src/env.ts') },
        { description: 'Create a new security rule rate-limit.ts', check: fileExists('/home/user/project/src/security/rate-limit.ts') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/src': '',
        '/home/user/project/src/security': '',
        '/home/user/project/src/security/headers.ts': 'export const securityHeaders = {\n  "X-Frame-Options": "DENY",\n  "Content-Security-Policy": "default-src \'self\'"\n};',
        '/home/user/project/src/middleware/logger.ts': 'export const logger = () => (c: any, next: any) => {\n  console.log(`${c.req.method} ${c.req.path}`);\n  return next();\n};',
        '/home/user/project/src/env.ts': 'export const env = {\n  NODE_ENV: "production",\n  PORT: 3000\n};',
      }
    }

    /* ── Database Drizzle ── */
    case 'drizzle-schema': return {
      hostname: 'schema-lab',
      objective: 'Design type-safe schemas and table relations.',
      tasks: [
        { description: 'Read the users schema users.ts', check: hasRun('cat schemas/users.ts') },
        { description: 'Inspect relations relations.ts', check: hasRun('cat schemas/relations.ts') },
        { description: 'List all schemas', check: hasRun('ls schemas') },
        { description: 'Create a new table schema comments.ts', check: fileExists('/home/user/schemas/comments.ts') },
      ],
      files: {
        '/home/user/schemas': '',
        '/home/user/schemas/users.ts': 'import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";\nexport const users = pgTable("users", {\n  id: serial("id").primaryKey(),\n  name: varchar("name", { length: 255 }),\n  createdAt: timestamp("createdAt").defaultNow()\n});',
        '/home/user/schemas/posts.ts': 'import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";\nexport const posts = pgTable("posts", {\n  id: serial("id").primaryKey(),\n  title: text("title"),\n  authorId: integer("authorId")\n});',
        '/home/user/schemas/relations.ts': 'import { relations } from "drizzle-orm";\nimport { users } from "./users";\nimport { posts } from "./posts";\n\nexport const usersRelations = relations(users, ({ many }) => ({\n  posts: many(posts)\n}));',
      }
    }
    case 'drizzle-crud': return {
      hostname: 'crud-server',
      objective: 'Study insert, select, update, and delete patterns.',
      tasks: [
        { description: 'Read the insert query insert.ts', check: hasRun('cat queries/insert.ts') },
        { description: 'Inspect the select query select.ts', check: hasRun('cat queries/select.ts') },
        { description: 'Read the update query update.ts', check: hasRun('cat queries/update.ts') },
        { description: 'Create a new query file upsert.ts', check: fileExists('/home/user/queries/upsert.ts') },
      ],
      files: {
        '/home/user/queries': '',
        '/home/user/queries/insert.ts': 'import { db } from "./db";\nimport { users } from "./schema";\n\nawait db.insert(users).values({ name: "Alice" });',
        '/home/user/queries/select.ts': 'import { db } from "./db";\nimport { users } from "./schema";\n\nconst allUsers = await db.select().from(users);',
        '/home/user/queries/update.ts': 'import { db } from "./db";\nimport { users } from "./schema";\nimport { eq } from "drizzle-orm";\n\nawait db.update(users).set({ name: "Bob" }).where(eq(users.id, 1));',
        '/home/user/queries/delete.ts': 'import { db } from "./db";\nimport { users } from "./schema";\nimport { eq } from "drizzle-orm";\n\nawait db.delete(users).where(eq(users.id, 1));',
      }
    }
    case 'drizzle-relations': return {
      hostname: 'relations-db',
      objective: 'Explore one-to-many and many-to-many table designs.',
      tasks: [
        { description: 'Read the users model users.ts', check: hasRun('cat models/users.ts') },
        { description: 'Inspect the join table joins.ts', check: hasRun('cat models/joins.ts') },
        { description: 'List all models', check: hasRun('ls models') },
        { description: 'Create a new model categories.ts', check: fileExists('/home/user/models/categories.ts') },
      ],
      files: {
        '/home/user/models': '',
        '/home/user/models/users.ts': 'export const users = pgTable("users", {\n  id: serial("id").primaryKey(),\n  name: text("name")\n});',
        '/home/user/models/posts.ts': 'export const posts = pgTable("posts", {\n  id: serial("id").primaryKey(),\n  title: text("title"),\n  userId: integer("userId")\n});',
        '/home/user/models/tags.ts': 'export const tags = pgTable("tags", {\n  id: serial("id").primaryKey(),\n  name: text("name")\n});',
        '/home/user/models/joins.ts': 'export const postTags = pgTable("post_tags", {\n  postId: integer("postId"),\n  tagId: integer("tagId")\n});',
      }
    }
    case 'drizzle-migrations': return {
      hostname: 'migrate-vm',
      objective: 'Study migration SQL and journal metadata.',
      tasks: [
        { description: 'Read the first migration 0001_init.sql', check: hasRun('cat migrations/0001_init.sql') },
        { description: 'Inspect the journal _journal.json', check: hasRun('cat migrations/meta/_journal.json') },
        { description: 'List all migrations', check: hasRun('ls migrations') },
        { description: 'Create a new migration 0003_comments.sql', check: fileExists('/home/user/migrations/0003_comments.sql') },
      ],
      files: {
        '/home/user/migrations': '',
        '/home/user/migrations/0001_init.sql': 'CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL\n);',
        '/home/user/migrations/0002_posts.sql': 'CREATE TABLE posts (\n  id SERIAL PRIMARY KEY,\n  title TEXT,\n  user_id INTEGER\n);',
        '/home/user/migrations/meta': '',
        '/home/user/migrations/meta/_journal.json': '{\n  "version": "5",\n  "entries": [\n    { "idx": 0, "tag": "0001_init" }\n  ]\n}',
      }
    }
    case 'drizzle-optimization': return {
      hostname: 'perf-lab',
      objective: 'Compare slow vs indexed queries and schema design.',
      tasks: [
        { description: 'Read the slow query slow.sql', check: hasRun('cat queries/slow.sql') },
        { description: 'Inspect the indexed query indexed.sql', check: hasRun('cat queries/indexed.sql') },
        { description: 'Read the schema definition schema.ts', check: hasRun('cat schema.ts') },
        { description: 'Create a new index file composite.sql', check: fileExists('/home/user/queries/composite.sql') },
      ],
      files: {
        '/home/user/queries': '',
        '/home/user/queries/slow.sql': 'SELECT * FROM users WHERE email LIKE \'%gmail%\';',
        '/home/user/queries/fast.sql': 'SELECT * FROM users WHERE email = \'alice@gmail.com\';',
        '/home/user/queries/indexed.sql': 'CREATE INDEX idx_email ON users(email);\nSELECT * FROM users WHERE email = \'alice@gmail.com\';',
        '/home/user/schema.ts': 'import { pgTable, serial, text, index } from "drizzle-orm/pg-core";\n\nexport const users = pgTable("users", {\n  id: serial("id").primaryKey(),\n  email: text("email")\n}, (t) => ({\n  emailIdx: index("email_idx").on(t.email)\n}));',
      }
    }

    /* ── Deployment & DevOps ── */
    case 'vps-setup': return {
      hostname: 'ubuntu-vps',
      objective: 'Study firewall rules, user scripts, and system logs.',
      tasks: [
        { description: 'List setup scripts', check: hasRun('ls setup') },
        { description: 'Read the firewall script firewall.sh', check: hasRun('cat setup/firewall.sh') },
        { description: 'Inspect auth logs auth.log', check: hasRun('cat logs/auth.log') },
        { description: 'Create a new setup script docker.sh', check: fileExists('/home/user/setup/docker.sh') },
      ],
      files: {
        '/home/user/setup': '',
        '/home/user/setup/firewall.sh': '#!/bin/bash\nufw allow 22\nufw allow 80\nufw allow 443\nufw enable',
        '/home/user/setup/create-user.sh': '#!/bin/bash\nadduser deployer\nusermod -aG sudo deployer',
        '/home/user/setup/update.sh': '#!/bin/bash\napt update && apt upgrade -y',
        '/home/user/logs': '',
        '/home/user/logs/auth.log': 'Jan 15 09:23:01 sshd[123]: Accepted publickey for root',
      }
    }
    case 'nginx-ssl': return {
      hostname: 'nginx-proxy',
      objective: 'Study reverse proxy configs and SSL certificates.',
      tasks: [
        { description: 'Read the default config default.conf', check: hasRun('cat nginx/default.conf') },
        { description: 'Inspect the SSL config ssl.conf', check: hasRun('cat nginx/ssl.conf') },
        { description: 'Read the Certbot script certbot.sh', check: hasRun('cat scripts/certbot.sh') },
        { description: 'Create a new server block api.conf', check: fileExists('/home/user/nginx/api.conf') },
      ],
      files: {
        '/home/user/nginx': '',
        '/home/user/nginx/default.conf': 'server {\n  listen 80;\n  server_name example.com;\n  return 301 https://$server_name$request_uri;\n}',
        '/home/user/nginx/ssl.conf': 'server {\n  listen 443 ssl;\n  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;\n}',
        '/home/user/nginx/proxy.conf': 'location /api {\n  proxy_pass http://localhost:3000;\n}',
        '/home/user/scripts': '',
        '/home/user/scripts/certbot.sh': '#!/bin/bash\ncertbot --nginx -d example.com -d www.example.com',
      }
    }
    case 'pm2-management': return {
      hostname: 'pm2-node',
      objective: 'Study process configs, logs, and ecosystem files.',
      tasks: [
        { description: 'Read the ecosystem config ecosystem.config.js', check: hasRun('cat apps/ecosystem.config.js') },
        { description: 'Inspect the output log out.log', check: hasRun('cat apps/logs/out.log') },
        { description: 'List all apps', check: hasRun('ls apps') },
        { description: 'Create a new app config web.config.js', check: fileExists('/home/user/apps/web.config.js') },
      ],
      files: {
        '/home/user/apps': '',
        '/home/user/apps/server.js': 'const http = require("http");\nhttp.createServer((req, res) => res.end("OK")).listen(3000);',
        '/home/user/apps/ecosystem.config.js': 'module.exports = {\n  apps: [{\n    name: "api",\n    script: "./server.js",\n    instances: 2\n  }]\n};',
        '/home/user/apps/logs': '',
        '/home/user/apps/logs/out.log': 'Server started on port 3000',
        '/home/user/apps/logs/error.log': 'Error: Connection refused',
      }
    }
    case 'docker-basics': return {
      hostname: 'docker-host',
      objective: 'Study Dockerfiles, compose files, and ignore rules.',
      tasks: [
        { description: 'Read the Dockerfile', check: hasRun('cat project/Dockerfile') },
        { description: 'Inspect docker-compose.yml', check: hasRun('cat project/docker-compose.yml') },
        { description: 'Read .dockerignore', check: hasRun('cat project/.dockerignore') },
        { description: 'Create a new compose file docker-compose.prod.yml', check: fileExists('/home/user/project/docker-compose.prod.yml') },
      ],
      files: {
        '/home/user/project': '',
        '/home/user/project/Dockerfile': 'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]',
        '/home/user/project/docker-compose.yml': 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"',
        '/home/user/project/.dockerignore': 'node_modules\n.git\n.env',
        '/home/user/project/server.js': 'const app = require("express")();\napp.listen(3000);',
      }
    }
    case 'cicd-github': return {
      hostname: 'ci-runner-01',
      objective: 'Study GitHub Actions workflows for build, test, and deploy.',
      tasks: [
        { description: 'List all workflows', check: hasRun('ls .github/workflows') },
        { description: 'Read the build workflow build.yml', check: hasRun('cat .github/workflows/build.yml') },
        { description: 'Inspect the deploy workflow deploy.yml', check: hasRun('cat .github/workflows/deploy.yml') },
        { description: 'Create a new workflow audit.yml', check: fileExists('/home/user/.github/workflows/audit.yml') },
      ],
      files: {
        '/home/user/.github': '',
        '/home/user/.github/workflows': '',
        '/home/user/.github/workflows/build.yml': 'name: Build\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: npm ci\n      - run: npm run build',
        '/home/user/.github/workflows/test.yml': 'name: Test\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test',
        '/home/user/.github/workflows/deploy.yml': 'name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "Deploying to production..."',
      }
    }

    /* ── Authentication ── */
    case 'oauth-flows': return {
      hostname: 'oauth-server',
      objective: 'Study authorization flows and client configurations.',
      tasks: [
        { description: 'Read the flow diagram flow.md', check: hasRun('cat oauth/flow.md') },
        { description: 'Inspect the client config client.ts', check: hasRun('cat oauth/client.ts') },
        { description: 'List the keys directory', check: hasRun('ls oauth/keys') },
        { description: 'Create a new grant type file pkce.ts', check: fileExists('/home/user/oauth/pkce.ts') },
      ],
      files: {
        '/home/user/oauth': '',
        '/home/user/oauth/flow.md': '# OAuth 2.0 Flow\n\n1. Client requests authorization\n2. User approves\n3. Client exchanges code for token\n4. Client uses token to access API',
        '/home/user/oauth/client.ts': 'const clientId = "my-app";\nconst redirectUri = "http://localhost:3000/callback";\n// TODO: implement flow',
        '/home/user/oauth/server.ts': '// Authorization server endpoints\n// /authorize\n// /token\n// /userinfo',
        '/home/user/oauth/keys': '',
        '/home/user/oauth/keys/private.pem': '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
      }
    }
    case 'jwt-sessions': return {
      hostname: 'jwt-auth',
      objective: 'Study token signing, cookies, and session stores.',
      tasks: [
        { description: 'Read the JWT helper jwt.ts', check: hasRun('cat auth/jwt.ts') },
        { description: 'Inspect cookie options cookies.ts', check: hasRun('cat auth/cookies.ts') },
        { description: 'Read the session store session.ts', check: hasRun('cat auth/session.ts') },
        { description: 'Create a new auth module refresh.ts', check: fileExists('/home/user/auth/refresh.ts') },
      ],
      files: {
        '/home/user/auth': '',
        '/home/user/auth/jwt.ts': 'import { sign, verify } from "jsonwebtoken";\nconst secret = "super-secret-key";\nexport const createToken = (payload: any) => sign(payload, secret, { expiresIn: "1h" });',
        '/home/user/auth/cookies.ts': 'export const cookieOptions = {\n  httpOnly: true,\n  secure: true,\n  sameSite: "strict"\n};',
        '/home/user/auth/session.ts': 'const sessions = new Map();\nexport const createSession = (userId: string) => {\n  const id = crypto.randomUUID();\n  sessions.set(id, { userId });\n  return id;\n};',
      }
    }
    case 'protected-routes': return {
      hostname: 'guard-server',
      objective: 'Study public routes, private routes, and middleware guards.',
      tasks: [
        { description: 'Read the public routes public.ts', check: hasRun('cat routes/public.ts') },
        { description: 'Inspect the middleware guard middleware.ts', check: hasRun('cat routes/middleware.ts') },
        { description: 'Read the private routes private.ts', check: hasRun('cat routes/private.ts') },
        { description: 'Create a new route guard admin.ts', check: fileExists('/home/user/routes/admin.ts') },
      ],
      files: {
        '/home/user/routes': '',
        '/home/user/routes/public.ts': 'app.get("/", (c) => c.text("Public"));\napp.get("/health", (c) => c.json({ ok: true }));',
        '/home/user/routes/private.ts': 'app.use("/admin", authMiddleware);\napp.get("/admin", (c) => c.text("Admin panel"));',
        '/home/user/routes/middleware.ts': 'export const authMiddleware = (c: any, next: any) => {\n  const token = c.req.header("Authorization");\n  if (!token) return c.json({ error: "Unauthorized" }, 401);\n  return next();\n};',
      }
    }
    case 'refresh-tokens': return {
      hostname: 'token-rotation',
      objective: 'Study token TTLs, rotation logic, and revocation lists.',
      tasks: [
        { description: 'Read the access token TTL access.ts', check: hasRun('cat tokens/access.ts') },
        { description: 'Inspect refresh logic refresh.ts', check: hasRun('cat tokens/refresh.ts') },
        { description: 'Read the rotation helper rotation.ts', check: hasRun('cat tokens/rotation.ts') },
        { description: 'Create a new blacklist file blacklist.ts', check: fileExists('/home/user/tokens/blacklist.ts') },
      ],
      files: {
        '/home/user/tokens': '',
        '/home/user/tokens/access.ts': 'export const ACCESS_TOKEN_TTL = "15m";',
        '/home/user/tokens/refresh.ts': 'export const REFRESH_TOKEN_TTL = "7d";\nconst refreshTokens = new Set();',
        '/home/user/tokens/rotation.ts': 'export const rotateToken = (oldToken: string) => {\n  // revoke old, issue new\n  return crypto.randomUUID();\n};',
        '/home/user/tokens/revoke.ts': 'const blacklist = new Set();\nexport const revoke = (token: string) => blacklist.add(token);',
      }
    }
    case 'role-based-access': return {
      hostname: 'rbac-server',
      objective: 'Study role definitions, permission lists, and access control.',
      tasks: [
        { description: 'Read the role definitions roles.ts', check: hasRun('cat rbac/roles.ts') },
        { description: 'Inspect the middleware middleware.ts', check: hasRun('cat rbac/middleware.ts') },
        { description: 'Read the user list users.csv', check: hasRun('cat rbac/users.csv') },
        { description: 'Create a new permission permissions.ts', check: fileExists('/home/user/rbac/permissions.ts') },
      ],
      files: {
        '/home/user/rbac': '',
        '/home/user/rbac/roles.ts': 'export const roles = {\n  admin: ["read", "write", "delete", "manage"],\n  editor: ["read", "write"],\n  viewer: ["read"]\n};',
        '/home/user/rbac/middleware.ts': 'export const requireRole = (role: string) => (c: any, next: any) => {\n  if (c.get("role") !== role) return c.json({ error: "Forbidden" }, 403);\n  return next();\n};',
        '/home/user/rbac/users.csv': 'id,name,role\n1,alice,admin\n2,bob,editor\n3,charlie,viewer',
      }
    }

    /* fallback */
    default: return {
      hostname: 'practice-vm',
      objective: 'Get comfortable with the command line.',
      tasks: [
        { description: 'Run ls to list files', check: hasRun('ls') },
        { description: 'Run pwd to show current directory', check: hasRun('pwd') },
        { description: 'Create a folder with mkdir sandbox', check: dirExists('/home/user/sandbox') },
        { description: 'Read a file with cat README.txt', check: hasRun('cat README') },
      ],
      files: {
        '/home/user/README.txt': 'Welcome to the practice terminal.\nTry: ls, pwd, mkdir, touch, cat, echo, help',
        '/home/user/projects': '',
        '/home/user/notes': '',
      }
    }
  }
}
