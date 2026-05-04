import { useParams, Link } from 'react-router'
import { FolderGit2, Clock, ArrowLeft, CheckCircle, BookOpen, Lightbulb, Terminal, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const projects = [
  {
    slug: 'terminal-cheatsheet-app',
    title: 'Terminal Cheatsheet CLI App',
    description: 'Build a command-line tool that stores terminal commands, lets you search them, and exports a markdown cheat sheet. You will write real JavaScript, install packages from npm, and run your tool from the terminal.',
    difficulty: 'Beginner',
    time: '2-3 hours',
    courseSlug: 'terminal-mastery',
    courseTitle: 'Terminal Mastery',
    tags: ['Node.js', 'CLI', 'Commander.js'],
    steps: [
      {
        title: 'Create a folder for your project',
        blocks: [
          { type: 'text', content: 'Every project lives in its own folder. This keeps your files organised and makes it easy to move or share the project later. Open your real terminal (not the practice one above) and run the commands below.' },
          { type: 'code', content: 'cd ~\nmkdir terminal-cheatsheet\ncd terminal-cheatsheet', lang: 'bash' },
          { type: 'tip', content: 'cd ~ takes you to your home directory no matter where you are. mkdir creates a new folder. cd changes into that folder.' },
          { type: 'verify', content: 'Run pwd to confirm you are in /home/yourname/terminal-cheatsheet (or similar).' },
        ]
      },
      {
        title: 'Turn the folder into a Node.js project',
        blocks: [
          { type: 'text', content: 'Node.js is a program that runs JavaScript outside of a web browser. npm (Node Package Manager) comes with Node and helps you install tools other people have built. Running npm init creates a package.json file — think of it as a recipe card that lists what your project needs.' },
          { type: 'code', content: 'npm init -y', lang: 'bash' },
          { type: 'text', content: 'The -y flag means "yes to all default questions". You will now have a package.json file in your folder.' },
          { type: 'verify', content: 'Run ls to see package.json listed. Run cat package.json to peek inside.' },
        ]
      },
      {
        title: 'Install your first npm package',
        blocks: [
          { type: 'text', content: 'Commander.js is a popular library for building command-line interfaces. Instead of writing all the argument-parsing logic yourself, you can use Commander and focus on what your tool actually does.' },
          { type: 'code', content: 'npm install commander', lang: 'bash' },
          { text: 'npm downloads Commander from the internet and places it in a node_modules folder. It also records the dependency in package.json so anyone else who clones your project knows what to install.', type: 'text' },
          { type: 'verify', content: 'Run ls node_modules to see the commander folder inside.' },
        ]
      },
      {
        title: 'Create the entry-point file',
        blocks: [
          { type: 'text', content: 'Every Node.js program needs a starting file. Conventionally this is called index.js, but you can name it anything. We will create src/cli.js as our entry point.' },
          { type: 'code', content: 'mkdir src\ntouch src/cli.js', lang: 'bash' },
          { type: 'text', content: 'Now open src/cli.js in your editor and add this bare-bones program. It imports Commander, creates a program object, and prints a welcome message when you run it.' },
          { type: 'code', content: '#!/usr/bin/env node\nconst { Command } = require("commander");\n\nconst program = new Command();\n\nprogram\n  .name("cheatsheet")\n  .description("A CLI for storing terminal commands")\n  .version("1.0.0");\n\nprogram\n  .command("hello")\n  .description("Say hello")\n  .action(() => {\n    console.log("Hello from your CLI!");\n  });\n\nprogram.parse();', lang: 'javascript' },
          { type: 'tip', content: '#!/usr/bin/env node at the very top is called a "shebang". It tells your operating system that this file should be run with Node.js, not opened as a text document.' },
        ]
      },
      {
        title: 'Make the file executable and test it',
        blocks: [
          { type: 'text', content: 'By default, new files are not allowed to run as programs. chmod +x gives the file "execute" permission. After that, you can run it directly.' },
          { type: 'code', content: 'chmod +x src/cli.js\nnode src/cli.js hello', lang: 'bash' },
          { type: 'verify', content: 'You should see Hello from your CLI! printed in the terminal.' },
          { type: 'warn', content: 'If you see "Error: Cannot find module commander", you probably skipped the npm install step. Run npm install commander and try again.' },
        ]
      },
      {
        title: 'Create a data file with sample commands',
        blocks: [
          { type: 'text', content: 'Your cheat sheet needs actual commands to display. Instead of hard-coding them inside cli.js, you will store them in a separate file. This separation of concerns is a habit every good developer builds early: keep data in one place and logic in another.' },
          { type: 'code', content: 'touch src/data.js', lang: 'bash' },
          { type: 'text', content: 'Open src/data.js and add a simple array of command objects. Each object has a category (like "Navigation"), the command text, and a one-line description of what it does.' },
          { type: 'code', content: 'const commands = [\n  { category: "Navigation", cmd: "pwd", desc: "Print working directory" },\n  { category: "Navigation", cmd: "cd ~", desc: "Go to home directory" },\n  { category: "Navigation", cmd: "ls -la", desc: "List all files with details" },\n  { category: "Git", cmd: "git status", desc: "Show working tree status" },\n  { category: "Git", cmd: "git add .", desc: "Stage all changes" },\n  { category: "Git", cmd: "git commit -m msg", desc: "Commit with a message" },\n  { category: "File Ops", cmd: "mkdir dirname", desc: "Create a directory" },\n  { category: "File Ops", cmd: "touch file.txt", desc: "Create an empty file" },\n];\n\nmodule.exports = { commands };', lang: 'javascript' },
          { type: 'tip', content: 'module.exports is how Node.js shares values between files. When another file says require("./data"), it receives whatever you put in module.exports.' },
        ]
      },
      {
        title: 'Add a command that lists all commands',
        blocks: [
          { type: 'text', content: 'Now you will wire the data file into the CLI. Import the commands array and loop over it, printing each one in a clean format.' },
          { type: 'code', content: 'const { commands } = require("./data");\n\nprogram\n  .command("list")\n  .description("List every command in the cheat sheet")\n  .action(() => {\n    console.log("\\n  Terminal Cheatsheet\\n  ===================\\n");\n    let currentCategory = "";\n    for (const c of commands) {\n      if (c.category !== currentCategory) {\n        currentCategory = c.category;\n        console.log(`\\n  ${currentCategory}:`);\n      }\n      console.log(`    ${c.cmd.padEnd(20)} ${c.desc}`);\n    }\n    console.log("");\n  });', lang: 'javascript' },
          { type: 'text', content: 'Add this code inside src/cli.js, just before the program.parse() line. Do not delete the existing hello command — you can keep both commands in the same file.' },
          { type: 'verify', content: 'Run node src/cli.js list. You should see a neatly grouped list of all eight commands, sorted by category.' },
        ]
      },
      {
        title: 'Add a search command',
        blocks: [
          { type: 'text', content: 'A cheat sheet you cannot search is just a wall of text. Let users type a keyword and see only the commands that match. The search will look at both the command text and its description.' },
          { type: 'code', content: 'program\n  .command("search <query>")\n  .description("Search commands by keyword")\n  .action((query) => {\n    const q = query.toLowerCase();\n    const matches = commands.filter(c =>\n      c.cmd.toLowerCase().includes(q) ||\n      c.desc.toLowerCase().includes(q)\n    );\n\n    if (matches.length === 0) {\n      console.log(`No commands found for "${query}".`);\n      return;\n    }\n\n    console.log(`\\n  Found ${matches.length} match(es):\\n`);\n    for (const c of matches) {\n      console.log(`  ${c.cmd.padEnd(20)} ${c.desc}`);\n    }\n    console.log("");\n  });', lang: 'javascript' },
          { type: 'text', content: 'Place this block right after the list command in cli.js. Commander automatically turns <query> into a function argument.' },
          { type: 'verify', content: 'Run node src/cli.js search git to see git commands. Run node src/cli.js search directory to see pwd and mkdir.' },
          { type: 'tip', content: 'filter() is a built-in JavaScript method. It walks through every item in an array and keeps only the ones where your test returns true. includes() checks if a string contains another string.' },
        ]
      },
      {
        title: 'Add an export-to-markdown command',
        blocks: [
          { type: 'text', content: 'Sometimes you want to share your cheat sheet as a document. Markdown is the perfect format because it renders nicely on GitHub, in VS Code previews, and on any documentation site. You will loop through the commands and build a markdown string, then write it to a file.' },
          { type: 'code', content: 'const fs = require("fs");\n\nprogram\n  .command("export")\n  .description("Export cheat sheet to cheatsheet.md")\n  .action(() => {\n    let md = "# Terminal Cheatsheet\\n\\n";\n    let currentCategory = "";\n    for (const c of commands) {\n      if (c.category !== currentCategory) {\n        currentCategory = c.category;\n        md += `## ${currentCategory}\\n\\n`;\n      }\n      md += `- \`${c.cmd}\` — ${c.desc}\\n`;\n    }\n    fs.writeFileSync("cheatsheet.md", md);\n    console.log("Exported to cheatsheet.md");\n  });', lang: 'javascript' },
          { type: 'text', content: 'fs is Node.js built-in "file system" module. writeFileSync creates (or overwrites) a file with the text you give it. Synchronous means it waits until the file is written before moving on — fine for a small CLI tool.' },
          { type: 'verify', content: 'Run node src/cli.js export, then run cat cheatsheet.md to see the generated markdown.' },
        ]
      },
      {
        title: 'Make your CLI installable globally',
        blocks: [
          { type: 'text', content: 'Right now you have to type node src/cli.js every time. Would not it be nicer to just type cheatsheet? You can make your CLI globally available with npm link, which creates a shortcut in your system PATH.' },
          { type: 'code', content: 'npm link', lang: 'bash' },
          { type: 'text', content: 'Before npm link works, you need to tell package.json which file is the main entry point. Open package.json and add a "bin" field:' },
          { type: 'code', content: '"name": "terminal-cheatsheet",\n"version": "1.0.0",\n"bin": {\n  "cheatsheet": "src/cli.js"\n},\n"main": "src/cli.js",', lang: 'json' },
          { type: 'warn', content: 'Be careful with commas in JSON. Every property except the last one needs a comma at the end. If you see "Unexpected token" errors, you probably missed or added an extra comma.' },
          { type: 'verify', content: 'Run npm link again, then type cheatsheet list anywhere in your terminal. It should work from any directory.' },
        ]
      },
      {
        title: 'Add a command to add new entries',
        blocks: [
          { type: 'text', content: 'A static list is useful, but a cheat sheet you can grow is better. Let users add their own commands at runtime. The new command will append to the data file so it persists between sessions.' },
          { type: 'code', content: 'program\n  .command("add <category> <cmd> <desc>")\n  .description("Add a new command to the cheat sheet")\n  .action((category, cmd, desc) => {\n    commands.push({ category, cmd, desc });\n    const data = `const commands = ${JSON.stringify(commands, null, 2)};\\n\\nmodule.exports = { commands };\\n`;\n    fs.writeFileSync("src/data.js", data);\n    console.log(`Added "${cmd}" to ${category}`);\n  });', lang: 'javascript' },
          { type: 'text', content: 'JSON.stringify(commands, null, 2) turns the JavaScript array into a pretty-printed string with 2-space indentation. We then rebuild the entire data.js file from scratch. This is simple but effective for a learning project.' },
          { type: 'verify', content: 'Run cheatsheet add Docker "docker ps" "List running containers". Then run cheatsheet list to see the new entry. Check cat src/data.js to confirm it was saved.' },
        ]
      },
      {
        title: 'Test everything end-to-end',
        blocks: [
          { type: 'text', content: 'Run through every command to make sure they all work together. This is called "smoke testing" — if anything is broken, you will see smoke.' },
          { type: 'code', content: 'cheatsheet hello\ncheatsheet list\ncheatsheet search git\ncheatsheet export\ncheatsheet add Docker "docker compose up" "Start all services"\ncheatsheet list', lang: 'bash' },
          { type: 'verify', content: 'Each command should produce sensible output with no error messages. If you see an error, read it carefully — JavaScript errors usually tell you exactly which line broke.' },
          { type: 'tip', content: 'You have now built a real, working CLI tool. You installed npm packages, required modules, wrote conditional logic, read and wrote files, and made your program globally executable. These are the exact skills you use every day as a developer.' },
        ]
      },
    ]
  },
  {
    slug: 'git-history-visualizer',
    title: 'Git History Visualizer',
    description: 'Build a web page that turns git log output into a visual commit graph. You will read Git data, parse text with JavaScript, draw SVG graphics, and make them interactive. No prior D3.js knowledge required — you will learn as you go.',
    difficulty: 'Intermediate',
    time: '4-5 hours',
    courseSlug: 'git-github',
    courseTitle: 'Git & GitHub',
    tags: ['Git', 'SVG', 'D3.js'],
    steps: [
      {
        title: 'Create a sample Git repository to visualize',
        blocks: [
          { type: 'text', content: 'Before you can visualize Git history, you need a repository with some history. You will create a fresh repo, make a few commits on the main branch, then create a feature branch with more commits. This gives you branches and merges to draw.' },
          { type: 'code', content: 'cd ~\nmkdir git-viz-demo\ncd git-viz-demo\ngit init', lang: 'bash' },
          { type: 'text', content: 'Create a simple file and make your first commit.' },
          { type: 'code', content: 'echo "Hello world" > readme.txt\ngit add readme.txt\ngit commit -m "Initial commit"', lang: 'bash' },
          { type: 'verify', content: 'Run git log --oneline. You should see one commit with a hash and the message "Initial commit".' },
        ]
      },
      {
        title: 'Add more commits and a feature branch',
        blocks: [
          { type: 'text', content: 'Make two more commits on main, then create a feature branch with its own commits. This creates the branching structure you will draw later.' },
          { type: 'code', content: 'echo "Feature A" >> readme.txt\ngit add readme.txt\ngit commit -m "Add feature A"\n\necho "Feature B" >> readme.txt\ngit add readme.txt\ngit commit -m "Add feature B"\n\ngit checkout -b feature-auth\necho "Auth logic" > auth.js\ngit add auth.js\ngit commit -m "Add auth module"\n\necho "Login form" > login.html\ngit add login.html\ngit commit -m "Add login form"', lang: 'bash' },
          { type: 'text', content: 'git checkout -b feature-auth creates a new branch called feature-auth and switches to it in one command. The commits on this branch will appear on a separate line in your visualizer.' },
          { type: 'verify', content: 'Run git log --oneline --all --graph. You should see a branching structure with two parallel lines of commits.' },
        ]
      },
      {
        title: 'Scaffold a Vite project for the visualizer',
        blocks: [
          { type: 'text', content: 'Vite is a modern build tool that gives you a development server and hot module reloading out of the box. You will use it to create a simple React app that renders your Git graph.' },
          { type: 'code', content: 'cd ~\nnpm create vite@latest git-viz -- --template react\ncd git-viz\nnpm install', lang: 'bash' },
          { type: 'text', content: 'The --template react flag tells Vite to set up a React project with JSX support and a proper folder structure.' },
          { type: 'verify', content: 'Run ls src/ to see main.jsx and App.jsx. Run npm run dev to start the dev server (press Ctrl+C to stop later).' },
        ]
      },
      {
        title: 'Install D3.js for drawing',
        blocks: [
          { type: 'text', content: 'D3.js is a library for data-driven documents. It helps you turn data (like a list of commits) into visual elements (like SVG circles and lines). You only need the selection and shape modules for this project.' },
          { type: 'code', content: 'npm install d3', lang: 'bash' },
          { type: 'text', content: 'After installation, you can import D3 functions in any JavaScript file. D3 works by selecting an HTML element (like a div), appending an SVG canvas to it, and then drawing shapes based on your data.' },
        ]
      },
      {
        title: 'Write a parser for git log output',
        blocks: [
          { type: 'text', content: 'Git can output commits in a machine-readable format. You will use git log --format="%H|%s|%p" which prints hash, subject, and parent hashes separated by pipes. Then you will parse that string into JavaScript objects.' },
          { type: 'code', content: 'touch src/parser.js', lang: 'bash' },
          { type: 'code', content: 'export function parseGitLog(rawOutput) {\n  const lines = rawOutput.trim().split("\\n");\n  const commits = [];\n\n  for (const line of lines) {\n    const [hash, subject, parents] = line.split("|");\n    if (!hash) continue;\n\n    commits.push({\n      hash: hash.slice(0, 7),\n      message: subject,\n      parents: parents ? parents.split(" ") : [],\n      branch: "main",\n    });\n  }\n\n  return commits.reverse();\n}', lang: 'javascript' },
          { type: 'text', content: 'The reverse() at the end puts the oldest commit first. This matters for layout: we will draw commits from top to bottom in chronological order.' },
          { type: 'tip', content: 'slice(0, 7) shortens the full 40-character SHA to a readable 7-character hash, which is what GitHub shows by default.' },
        ]
      },
      {
        title: 'Fetch real Git data from your demo repo',
        blocks: [
          { type: 'text', content: 'You need to run git log inside your demo repository and pass the output into your parser. For this learning project, you will read the output in the browser console. In production, you might call a backend API that runs git commands server-side.' },
          { type: 'code', content: 'touch src/git-loader.js', lang: 'bash' },
          { type: 'code', content: 'export async function loadCommits() {\n  // For this demo, paste the output of:\n  //   git log --all --format="%H|%s|%p"\n  // into the variable below.\n\n  const raw = `\nPASTE_GIT_LOG_OUTPUT_HERE\n`;\n\n  const { parseGitLog } = await import("./parser.js");\n  return parseGitLog(raw);\n}', lang: 'javascript' },
          { type: 'text', content: 'To get the raw data, open a terminal in your git-viz-demo folder and run the git log command. Copy the entire output and paste it into the raw template literal, replacing PASTE_GIT_LOG_OUTPUT_HERE.' },
          { type: 'code', content: 'cd ~/git-viz-demo\ngit log --all --format="%H|%s|%p"', lang: 'bash' },
          { type: 'tip', content: 'In a real app you would call an API endpoint like /api/commits that runs git log on the server and returns JSON. For this project, manual copy-paste keeps things simple and avoids CORS issues.' },
        ]
      },
      {
        title: 'Draw commits as SVG circles',
        blocks: [
          { type: 'text', content: 'An SVG (Scalable Vector Graphic) is an image made of shapes, not pixels. You create an SVG element, then append circles for commits and lines for parent-child relationships. Each commit gets a y position based on its index (0, 80, 160...).' },
          { type: 'code', content: 'import { useEffect, useRef } from "react";\nimport * as d3 from "d3";\n\nexport default function CommitGraph({ commits }) {\n  const svgRef = useRef(null);\n\n  useEffect(() => {\n    if (!commits.length) return;\n\n    const svg = d3.select(svgRef.current)\n      .attr("width", 600)\n      .attr("height", commits.length * 80 + 40);\n\n    // Clear previous render\n    svg.selectAll("*").remove();\n\n    const nodes = commits.map((c, i) => ({\n      id: c.hash,\n      x: 100,\n      y: i * 80 + 40,\n      message: c.message,\n    }));\n\n    // Draw circles\n    svg.selectAll("circle")\n      .data(nodes)\n      .join("circle")\n      .attr("cx", d => d.x)\n      .attr("cy", d => d.y)\n      .attr("r", 12)\n      .attr("fill", "#34D399")\n      .attr("stroke", "#111")\n      .attr("stroke-width", 2);\n\n    // Draw labels\n    svg.selectAll("text.label")\n      .data(nodes)\n      .join("text")\n      .attr("class", "label")\n      .attr("x", d => d.x + 20)\n      .attr("y", d => d.y + 4)\n      .text(d => d.message)\n      .attr("fill", "#ccc")\n      .attr("font-family", "monospace")\n      .attr("font-size", "12px");\n  }, [commits]);\n\n  return <svg ref={svgRef} className="w-full" />;\n}', lang: 'javascript' },
          { type: 'text', content: 'useEffect runs this drawing code every time the commits array changes. selectAll("*").remove() clears the previous frame so you do not get duplicate circles when re-rendering.' },
        ]
      },
      {
        title: 'Draw lines between commits and their parents',
        blocks: [
          { type: 'text', content: 'A commit graph without connecting lines is just a column of dots. You need to find each commit in the nodes array, look up its parents, and draw a curved SVG path from child to parent. D3 join helps you pair data with DOM elements.' },
          { type: 'code', content: '    // Inside the useEffect, after drawing circles:\n    const hashToNode = new Map(nodes.map(n => [n.id, n]));\n\n    const links = [];\n    for (const c of commits) {\n      const child = hashToNode.get(c.hash);\n      for (const parentHash of c.parents) {\n        const parent = hashToNode.get(parentHash.slice(0, 7));\n        if (parent && child) {\n          links.push({ source: parent, target: child });\n        }\n      }\n    }\n\n    svg.selectAll("path.link")\n      .data(links)\n      .join("path")\n      .attr("class", "link")\n      .attr("d", d => {\n        return `M${d.source.x},${d.source.y}` +\n               `C${d.source.x},${(d.source.y + d.target.y) / 2}` +\n               ` ${d.target.x},${(d.source.y + d.target.y) / 2}` +\n               ` ${d.target.x},${d.target.y}`;\n      })\n      .attr("fill", "none")\n      .attr("stroke", "#555")\n      .attr("stroke-width", 2);', lang: 'javascript' },
          { type: 'text', content: 'The d attribute draws a cubic Bezier curve. It starts at the parent, curves gently halfway between them, and ends at the child. This is the same technique used by GitHub\'s commit graph.' },
          { type: 'verify', content: 'Open your browser at the Vite dev server URL (usually http://localhost:5173). You should see green circles connected by gray curved lines.' },
        ]
      },
      {
        title: 'Detect and colour branches differently',
        blocks: [
          { type: 'text', content: 'Right now every commit is green. In a real Git graph, different branches have different colours. You will detect which commits belong to which branch by walking backwards from branch tips (the latest commit on each branch).' },
          { type: 'code', content: 'function assignBranches(commits, branches) {\n  const hashMap = new Map(commits.map(c => [c.hash, c]));\n\n  for (const { name, tip } of branches) {\n    let current = hashMap.get(tip);\n    while (current) {\n      current.branch = name;\n      current = current.parents.length\n        ? hashMap.get(current.parents[0].slice(0, 7))\n        : null;\n    }\n  }\n\n  return commits;\n}', lang: 'javascript' },
          { type: 'text', content: 'A branch "tip" is the most recent commit on that branch. By walking backwards through parent pointers, you can mark every commit that belongs to that branch. Add this to your parser.js and call it before rendering.' },
          { type: 'code', content: 'const branches = [\n  { name: "main", tip: "abc1234" },   // replace with your actual hashes\n  { name: "feature-auth", tip: "def5678" },\n];\n\nconst commitsWithBranches = assignBranches(parsedCommits, branches);', lang: 'javascript' },
          { type: 'tip', content: 'In a real app you would get branch tips from git branch -v. For this project, you can hard-code the two most recent hashes from your git log output.' },
        ]
      },
      {
        title: 'Add hover tooltips on commits',
        blocks: [
          { type: 'text', content: 'Tooltips give users extra context without cluttering the main view. When you hover over a commit circle, a small box appears showing the full hash, message, and branch name.' },
          { type: 'code', content: '    // Add this inside the circle join chain:\n    .on("mouseenter", function(event, d) {\n      d3.select(this).attr("r", 16).attr("fill", "#4ade80");\n\n      svg.append("rect")\n        .attr("class", "tooltip-bg")\n        .attr("x", d.x + 20)\n        .attr("y", d.y - 40)\n        .attr("width", 220)\n        .attr("height", 50)\n        .attr("fill", "#1a1a1a")\n        .attr("stroke", "#333")\n        .attr("rx", 4);\n\n      svg.append("text")\n        .attr("class", "tooltip-text")\n        .attr("x", d.x + 30)\n        .attr("y", d.y - 22)\n        .text(`${d.id} — ${d.message}`)\n        .attr("fill", "#fff")\n        .attr("font-family", "monospace")\n        .attr("font-size", "11px");\n    })\n    .on("mouseleave", function() {\n      d3.select(this).attr("r", 12).attr("fill", "#34D399");\n      svg.selectAll(".tooltip-bg, .tooltip-text").remove();\n    });', lang: 'javascript' },
          { type: 'text', content: 'The mouseenter event enlarges the circle and draws a tooltip. mouseleave shrinks it back and removes the tooltip. Using class selectors makes cleanup easy: one remove() call deletes both the background rect and the text.' },
        ]
      },
      {
        title: 'Fetch real repos from the GitHub API',
        blocks: [
          { type: 'text', content: 'Instead of copy-pasting git log output, you can fetch commit data from any public GitHub repository. The GitHub API returns JSON, which is much easier to parse than plain text.' },
          { type: 'code', content: 'export async function fetchGitHubCommits(owner, repo) {\n  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`;\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);\n\n  const data = await res.json();\n  return data.map(c => ({\n    hash: c.sha.slice(0, 7),\n    message: c.commit.message.split("\\n")[0],\n    parents: c.parents.map(p => p.sha.slice(0, 7)),\n    branch: "main",\n  }));\n}', lang: 'javascript' },
          { type: 'text', content: 'The GitHub API is public for read operations, so you do not need an API key for basic usage. c.commit.message.split("\\n")[0] takes only the first line of multi-line commit messages.' },
          { type: 'verify', content: 'Call fetchGitHubCommits("facebook", "react") in your browser console or inside a useEffect. You should get an array of 20 commit objects.' },
          { type: 'tip', content: 'If you see a CORS error, it is because the browser blocks direct API calls. In a real app, you would call this from a backend server that proxies the request.' },
        ]
      },
      {
        title: 'Add zoom and pan to the SVG',
        blocks: [
          { type: 'text', content: 'Large repositories have hundreds of commits. Zoom and pan let users explore the graph without it overflowing the screen. D3 has built-in zoom behavior that handles mouse wheel and drag events.' },
          { type: 'code', content: '    // Add this inside useEffect, before drawing anything:\n    const g = svg.append("g");\n\n    const zoom = d3.zoom()\n      .scaleExtent([0.3, 3])\n      .on("zoom", (event) => {\n        g.attr("transform", event.transform);\n      });\n\n    svg.call(zoom);\n\n    // Then draw circles and lines inside g instead of svg\n    g.selectAll("circle")...\n    g.selectAll("path.link")...', lang: 'javascript' },
          { type: 'text', content: 'scaleExtent([0.3, 3]) means the user can zoom out to 30% or zoom in to 300%. The zoom event updates a transform on the group element g, which moves and scales everything inside it together.' },
          { type: 'verify', content: 'Open the graph in your browser. Scroll the mouse wheel to zoom in and out. Click and drag to pan around.' },
        ]
      },
    ]
  },
  {
    slug: 'hono-api-boilerplate',
    title: 'Production Hono API Boilerplate',
    description: 'Build a complete backend API from scratch using Hono, Zod validation, Drizzle ORM, JWT authentication, rate limiting, and Docker. Every step explains what the tool does before you use it.',
    difficulty: 'Advanced',
    time: '6-8 hours',
    courseSlug: 'backend-hono',
    courseTitle: 'Backend Hono',
    tags: ['Hono', 'Drizzle', 'Docker'],
    steps: [
      {
        title: 'Create the project folder and install Hono',
        blocks: [
          { type: 'text', content: 'Hono is a lightweight web framework for JavaScript runtimes. It works on Node.js, Deno, Bun, and even Cloudflare Workers. You will use it to build a REST API with typed routes and middleware support.' },
          { type: 'code', content: 'cd ~\nmkdir hono-api-boilerplate\ncd hono-api-boilerplate\nnpm init -y\nnpm install hono', lang: 'bash' },
          { type: 'text', content: 'Hono is smaller than Express but just as capable. It supports routers, middleware, CORS, caching, and more — all in a single dependency with no sub-dependencies.' },
          { type: 'verify', content: 'Run cat package.json | grep hono to confirm Hono is in your dependencies.' },
        ]
      },
      {
        title: 'Write your first Hono server',
        blocks: [
          { type: 'text', content: 'Every Hono app starts with a single file that creates the app, adds routes, and starts the server. You will write src/index.ts and run it with tsx, a TypeScript executor that does not need a separate compilation step.' },
          { type: 'code', content: 'npm install -D typescript tsx @types/node', lang: 'bash' },
          { type: 'text', content: 'Create src/index.ts with a health check route. A health check is a simple endpoint that confirms the server is running. It is the first thing monitoring tools hit.' },
          { type: 'code', content: 'import { Hono } from "hono";\n\nconst app = new Hono();\n\napp.get("/health", (c) => {\n  return c.json({ status: "ok", uptime: process.uptime() });\n});\n\napp.get("/", (c) => {\n  return c.text("Hono API Boilerplate");\n});\n\nconst port = 3000;\nconsole.log(`Server running on http://localhost:${port}`);\n\nexport default {\n  port,\n  fetch: app.fetch,\n};', lang: 'typescript' },
          { type: 'verify', content: 'Run npx tsx src/index.ts and visit http://localhost:3000/health in your browser or with curl. You should see a JSON response.' },
        ]
      },
      {
        title: 'Set up Drizzle ORM with SQLite',
        blocks: [
          { type: 'text', content: 'Drizzle ORM is a TypeScript-first SQL-like ORM. Unlike Prisma, Drizzle does not hide SQL from you — you write queries that look almost exactly like SQL, but with full type safety. For this boilerplate, you will use SQLite so there is no separate database server to install.' },
          { type: 'code', content: 'npm install drizzle-orm better-sqlite3\nnpm install -D drizzle-kit @types/better-sqlite3', lang: 'bash' },
          { type: 'text', content: 'Create a drizzle.config.ts file. This tells Drizzle where your schema lives and how to connect to the database.' },
          { type: 'code', content: 'import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  schema: "./src/db/schema.ts",\n  out: "./drizzle",\n  dialect: "sqlite",\n  dbCredentials: {\n    url: "sqlite.db",\n  },\n});', lang: 'typescript' },
          { type: 'text', content: 'better-sqlite3 is a native Node.js module that talks directly to SQLite files. It is faster than pure-JavaScript alternatives because it uses the actual SQLite C library under the hood.' },
        ]
      },
      {
        title: 'Define your first database table',
        blocks: [
          { type: 'text', content: 'A schema file describes the shape of your database tables using TypeScript. Drizzle reads this file to generate migrations and to give you type-safe queries. You will start with a users table.' },
          { type: 'code', content: 'mkdir src/db\ntouch src/db/schema.ts', lang: 'bash' },
          { type: 'code', content: 'import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";\n\nexport const users = sqliteTable("users", {\n  id: integer("id").primaryKey({ autoIncrement: true }),\n  email: text("email").notNull().unique(),\n  password: text("password").notNull(),\n  createdAt: integer("created_at", { mode: "timestamp" })\n    .notNull()\n    .$defaultFn(() => new Date()),\n});\n\nexport type User = typeof users.$inferSelect;', lang: 'typescript' },
          { type: 'text', content: '$inferSelect is a Drizzle magic type. It automatically creates a TypeScript interface that matches your table columns. When you query users, TypeScript knows the result has id, email, password, and createdAt fields.' },
          { type: 'verify', content: 'Run npx drizzle-kit generate to generate a migration SQL file. Check the drizzle/ folder for a new .sql file.' },
        ]
      },
      {
        title: 'Connect the database to your Hono app',
        blocks: [
          { type: 'text', content: 'You need a database client that Hono routes can use to run queries. Create a singleton client in a separate file, then import it wherever you need database access. This pattern avoids creating multiple connections.' },
          { type: 'code', content: 'touch src/db/client.ts', lang: 'bash' },
          { type: 'code', content: 'import { drizzle } from "drizzle-orm/better-sqlite3";\nimport Database from "better-sqlite3";\nimport * as schema from "./schema";\n\nconst sqlite = new Database("sqlite.db");\nexport const db = drizzle(sqlite, { schema });', lang: 'typescript' },
          { type: 'text', content: 'Passing { schema } to drizzle enables relational queries. Without it, you can only do basic selects and inserts. With it, you can write queries like db.query.users.findMany({ with: { posts: true } }).' },
          { type: 'verify', content: 'Add import { db } from "./db/client" to src/index.ts. Run the server with npx tsx src/index.ts. If it starts without errors, the database connection works.' },
        ]
      },
      {
        title: 'Add Zod validation for incoming data',
        blocks: [
          { type: 'text', content: 'Zod is a schema validation library. You define what valid data looks like, and Zod checks every request against that definition. If someone sends an invalid email or a password that is too short, Zod rejects the request before your business logic ever sees it.' },
          { type: 'code', content: 'npm install zod', lang: 'bash' },
          { type: 'code', content: 'mkdir src/validators\ntouch src/validators/user.ts', lang: 'bash' },
          { type: 'code', content: 'import { z } from "zod";\n\nexport const createUserSchema = z.object({\n  email: z.string().email("Please provide a valid email address"),\n  password: z.string().min(8, "Password must be at least 8 characters"),\n});\n\nexport const loginSchema = z.object({\n  email: z.string().email(),\n  password: z.string(),\n});\n\nexport type CreateUserInput = z.infer<typeof createUserSchema>;', lang: 'typescript' },
          { type: 'text', content: 'z.infer extracts the TypeScript type from a Zod schema. This means CreateUserInput is automatically { email: string; password: string } — no need to write the interface by hand and risk it getting out of sync with the validator.' },
        ]
      },
      {
        title: 'Build a registration route with validation',
        blocks: [
          { type: 'text', content: 'Now you will combine Hono, Zod, and Drizzle into a single endpoint. The route receives a JSON body, validates it with Zod, hashes the password, inserts a user into SQLite, and returns the new user (without the password).' },
          { type: 'code', content: 'import { zValidator } from "@hono/zod-validator";\nimport { createUserSchema } from "../validators/user";\nimport { db } from "../db/client";\nimport { users } from "../db/schema";\n\napp.post("/auth/register", zValidator("json", createUserSchema), async (c) => {\n  const body = c.req.valid("json");\n\n  // In production, hash the password with bcrypt\n  const hashed = `hashed_${body.password}`;\n\n  const [user] = await db\n    .insert(users)\n    .values({ email: body.email, password: hashed })\n    .returning();\n\n  return c.json({\n    id: user.id,\n    email: user.email,\n    createdAt: user.createdAt,\n  }, 201);\n});', lang: 'typescript' },
          { type: 'warn', content: 'The hashed password above is fake. In a real app, install bcrypt and use await bcrypt.hash(body.password, 10). Never store plain-text passwords. This boilerplate uses a placeholder so you can test the API without installing native bcrypt dependencies.' },
          { type: 'verify', content: 'Test the route with curl:\ncurl -X POST http://localhost:3000/auth/register \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"test@example.com","password":"secret123"}\'' },
        ]
      },
      {
        title: 'Add JWT authentication middleware',
        blocks: [
          { type: 'text', content: 'JSON Web Tokens (JWT) are signed strings that prove a user is logged in. After registration, the server creates a JWT containing the user ID. On future requests, the client sends this token in an Authorization header. The server verifies the signature and knows who is asking.' },
          { type: 'code', content: 'npm install jsonwebtoken\nnpm install -D @types/jsonwebtoken', lang: 'bash' },
          { type: 'code', content: 'import jwt from "jsonwebtoken";\n\nconst JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";\n\nexport function createToken(userId: number) {\n  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });\n}\n\nexport function verifyToken(token: string) {\n  return jwt.verify(token, JWT_SECRET) as { sub: number };\n}', lang: 'typescript' },
          { type: 'text', content: 'The sub (subject) claim holds the user ID. expiresIn: "7d" means the token is valid for 7 days. After that, the client must log in again. In production, you would also store the token in a database so you can revoke it on logout.' },
        ]
      },
      {
        title: 'Protect routes with auth middleware',
        blocks: [
          { type: 'text', content: 'Middleware in Hono is a function that runs before your route handler. It can read headers, check tokens, attach data to the context, or reject the request entirely. You will build auth middleware that guards sensitive routes.' },
          { type: 'code', content: 'import { createMiddleware } from "hono/factory";\nimport { verifyToken } from "../utils/jwt";\n\nexport const authMiddleware = createMiddleware(async (c, next) => {\n  const auth = c.req.header("Authorization");\n  if (!auth || !auth.startsWith("Bearer ")) {\n    return c.json({ error: "Missing or invalid token" }, 401);\n  }\n\n  const token = auth.slice(7);\n  try {\n    const payload = verifyToken(token);\n    c.set("userId", payload.sub);\n    await next();\n  } catch {\n    return c.json({ error: "Invalid or expired token" }, 401);\n  }\n});', lang: 'typescript' },
          { type: 'text', content: 'c.set("userId", payload.sub) attaches the user ID to the Hono context. Any route that runs after this middleware can read it with c.get("userId"). This is how you know which user is making the request.' },
          { type: 'verify', content: 'Create a test route:\napp.get("/me", authMiddleware, (c) => {\n  return c.json({ userId: c.get("userId") });\n});\n\nTest with curl using a valid token from /auth/register.' },
        ]
      },
      {
        title: 'Implement rate limiting',
        blocks: [
          { type: 'text', content: 'Rate limiting prevents abuse. Without it, someone could write a script that hammers your login endpoint thousands of times per second. You will build a simple in-memory limiter that tracks requests per IP address in a sliding time window.' },
          { type: 'code', content: 'const requests = new Map<string, number[]>();\n\nexport function rateLimit(limit = 100, windowMs = 60000) {\n  return async (c, next) => {\n    const ip = c.req.header("x-forwarded-for") ||\n               c.req.header("x-real-ip") ||\n               "unknown";\n    const now = Date.now();\n    const windowStart = now - windowMs;\n\n    const history = requests.get(ip) || [];\n    const recent = history.filter(t => t > windowStart);\n\n    if (recent.length >= limit) {\n      return c.json(\n        { error: "Too many requests. Please slow down." },\n        429\n      );\n    }\n\n    recent.push(now);\n    requests.set(ip, recent);\n    await next();\n  };\n}', lang: 'typescript' },
          { type: 'text', content: 'A sliding window means old requests expire automatically. If the limit is 100 requests per minute, each request only counts for 60 seconds. This is fairer than a fixed window that resets on the minute boundary.' },
          { type: 'verify', content: 'Apply the middleware to your auth routes:\napp.use("/auth/*", rateLimit(5, 60000));\n\nTry registering 6 times in under a minute. The 6th request should return 429 Too Many Requests.' },
        ]
      },
      {
        title: 'Write your first test with Vitest',
        blocks: [
          { type: 'text', content: 'Testing is not optional for production code. Vitest is a fast test runner that uses the same API as Jest but is built on top of Vite. It supports TypeScript out of the box and has excellent watch mode for development.' },
          { type: 'code', content: 'npm install -D vitest supertest @types/supertest', lang: 'bash' },
          { type: 'code', content: 'touch vitest.config.ts', lang: 'bash' },
          { type: 'code', content: 'import { defineConfig } from "vitest/config";\n\nexport default defineConfig({\n  test: {\n    globals: true,\n    environment: "node",\n  },\n});', lang: 'typescript' },
          { type: 'text', content: 'globals: true lets you use test() and expect() without importing them. environment: "node" tells Vitest to run tests in a Node.js context, which is what you want for backend APIs.' },
          { type: 'verify', content: 'Create src/index.test.ts with a simple test:\nimport { test, expect } from "vitest";\ntest("1 + 1", () => {\n  expect(1 + 1).toBe(2);\n});\n\nRun npx vitest. It should pass instantly.' },
        ]
      },
      {
        title: 'Containerize with Docker',
        blocks: [
          { type: 'text', content: 'Docker packages your entire application — code, dependencies, and runtime — into a single image. Anyone with Docker can run your app without installing Node.js or any other tools. A multi-stage build keeps the final image small by discarding build tools after compilation.' },
          { type: 'code', content: 'touch Dockerfile', lang: 'bash' },
          { type: 'code', content: '# Build stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Production stage\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/sqlite.db ./sqlite.db\nCOPY package.json .\nEXPOSE 3000\nENV NODE_ENV=production\nCMD ["node", "dist/index.js"]', lang: 'dockerfile' },
          { type: 'text', content: 'alpine is a tiny Linux distribution. The final image is usually under 150MB. AS builder creates a named stage. COPY --from=builder copies only the built files from that stage, leaving behind TypeScript compiler, dev dependencies, and source maps.' },
          { type: 'verify', content: 'Build the image: docker build -t hono-api .\nRun it: docker run -p 3000:3000 hono-api\nVisit http://localhost:3000/health to confirm it works inside the container.' },
        ]
      },
      {
        title: 'Smoke-test everything end-to-end',
        blocks: [
          { type: 'text', content: 'A smoke test is a quick check that the whole system works together. You will hit every major endpoint and confirm they return the expected status codes and shapes. If everything passes, your boilerplate is ready for real projects.' },
          { type: 'code', content: '# 1. Health check\ncurl http://localhost:3000/health\n\n# 2. Register a user\ncurl -X POST http://localhost:3000/auth/register \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"demo@example.com","password":"password123"}\'\n\n# 3. Login (add this route if you have not yet)\n# 4. Access protected route with token\n# 5. Confirm rate limit after 5+ register attempts\n# 6. Check Docker container is running\ndocker ps', lang: 'bash' },
          { type: 'tip', content: 'Congratulations — you have built a production-grade API boilerplate. It has typed routes, validated inputs, a real database, user authentication, rate limiting, automated tests, and a Docker container. This is the foundation of almost every modern web application.' },
        ]
      },
    ]
  },
  {
    slug: 'personal-devops-dashboard',
    title: 'Personal DevOps Dashboard',
    description: 'Deploy a real fullstack application to a VPS with automated CI/CD, SSL, process management, and monitoring. Every command is explained before you run it. No prior server administration experience required.',
    difficulty: 'Advanced',
    time: '8-10 hours',
    courseSlug: 'deployment-devops',
    courseTitle: 'Deployment & DevOps',
    tags: ['DevOps', 'CI/CD', 'Nginx'],
    steps: [
      {
        title: 'Build a simple fullstack application',
        blocks: [
          { type: 'text', content: 'Before you can deploy anything, you need something to deploy. You will build a tiny React frontend and a Hono backend that serves it. The frontend shows server status. The backend provides a /health endpoint.' },
          { type: 'code', content: 'cd ~\nmkdir devops-dashboard\ncd devops-dashboard\n\n# Frontend\nnpm create vite@latest client -- --template react\ncd client && npm install && cd ..\n\n# Backend\nmkdir server\ncd server\nnpm init -y\nnpm install hono', lang: 'bash' },
          { type: 'text', content: 'Separating frontend and backend into different folders makes it easier to manage dependencies and deploy them independently later. The client folder contains everything the browser sees. The server folder contains everything that runs on the VPS.' },
          { type: 'verify', content: 'Run ls to confirm both client/ and server/ folders exist. Run ls client/src to see App.jsx and main.jsx.' },
        ]
      },
      {
        title: 'Create a health-check endpoint in the backend',
        blocks: [
          { type: 'text', content: 'A health endpoint returns basic server stats: uptime, memory usage, and a status string. Monitoring tools and load balancers hit this endpoint to decide if the server is healthy enough to receive traffic.' },
          { type: 'code', content: 'touch server/src/index.ts', lang: 'bash' },
          { type: 'code', content: 'import { Hono } from "hono";\n\nconst app = new Hono();\n\napp.get("/health", (c) => {\n  const mem = process.memoryUsage();\n  return c.json({\n    status: "healthy",\n    uptime: Math.floor(process.uptime()),\n    memory: {\n      used: Math.round(mem.heapUsed / 1024 / 1024),\n      total: Math.round(mem.heapTotal / 1024 / 1024),\n    },\n  });\n});\n\napp.get("/", (c) => c.text("DevOps Dashboard API"));\n\nexport default app;', lang: 'typescript' },
          { type: 'text', content: 'process.memoryUsage() returns bytes, so dividing by 1024 twice converts to megabytes. Uptime is the number of seconds since the server started. If this number resets unexpectedly, your server crashed and restarted.' },
          { type: 'verify', content: 'Run npx tsx server/src/index.ts. Visit http://localhost:3000/health and confirm you see a JSON object with status, uptime, and memory fields.' },
        ]
      },
      {
        title: 'Create a status dashboard UI',
        blocks: [
          { type: 'text', content: 'The frontend is a simple React component that fetches /health every 5 seconds and displays the results. It uses the browser\'s fetch API and basic useState / useEffect hooks.' },
          { type: 'code', content: 'touch client/src/Dashboard.jsx', lang: 'bash' },
          { type: 'code', content: 'import { useState, useEffect } from "react";\n\nexport default function Dashboard() {\n  const [status, setStatus] = useState(null);\n\n  useEffect(() => {\n    async function fetchHealth() {\n      try {\n        const res = await fetch("/api/health");\n        const data = await res.json();\n        setStatus(data);\n      } catch {\n        setStatus({ status: "offline" });\n      }\n    }\n\n    fetchHealth();\n    const interval = setInterval(fetchHealth, 5000);\n    return () => clearInterval(interval);\n  }, []);\n\n  if (!status) return <p>Loading...</p>;\n\n  return (\n    <div className="p-6">\n      <h1 className="text-xl font-bold mb-4">Server Status</h1>\n      <div className="space-y-2">\n        <p>Status: {status.status}</p>\n        <p>Uptime: {status.uptime}s</p>\n        <p>Memory: {status.memory?.used}MB / {status.memory?.total}MB</p>\n      </div>\n    </div>\n  );\n}', lang: 'javascript' },
          { type: 'text', content: 'The cleanup function clearInterval(interval) runs when the component unmounts. This prevents memory leaks — without it, React would keep calling fetchHealth even after the user navigated away.' },
        ]
      },
      {
        title: 'Push the project to GitHub',
        blocks: [
          { type: 'text', content: 'GitHub is where your code lives. Later, GitHub Actions will watch this repository and automatically deploy changes. First, create a new empty repository on GitHub (do not initialise it with a README).' },
          { type: 'code', content: 'cd ~/devops-dashboard\ngit init\ngit add .\ngit commit -m "Initial commit"\n\n# Replace with your actual GitHub username and repo name\ngit remote add origin https://github.com/YOURNAME/devops-dashboard.git\ngit branch -M main\ngit push -u origin main', lang: 'bash' },
          { type: 'text', content: 'The -u flag links your local main branch to the remote main branch. After this first push, you can simply run git push without arguments.' },
          { type: 'verify', content: 'Open your GitHub repository in a browser. You should see client/, server/, and other files listed.' },
        ]
      },
      {
        title: 'Provision a VPS and SSH into it',
        blocks: [
          { type: 'text', content: 'A VPS (Virtual Private Server) is a remote computer you rent by the hour. Popular providers include DigitalOcean, Linode, and Hetzner. For learning, a $5/month Ubuntu 22.04 instance is plenty. After creating it, you will receive an IP address and a root password.' },
          { type: 'code', content: '# On your local machine\nssh root@YOUR_SERVER_IP', lang: 'bash' },
          { type: 'text', content: 'The first time you SSH to a new server, you will see a warning about host authenticity. Type yes — this simply means your computer has not seen this server before.' },
          { type: 'warn', content: 'Never develop or deploy as root long-term. Root has unlimited power and mistakes are irreversible. In the next step you will create a dedicated deploy user.' },
        ]
      },
      {
        title: 'Create a deploy user and configure SSH keys',
        blocks: [
          { type: 'text', content: 'A deploy user is a regular account with just enough permissions to run your app. This limits the damage if someone compromises the account. You will also add your SSH public key so you can log in without typing a password.' },
          { type: 'code', content: '# On the server\nadduser deployer --disabled-password\nusermod -aG sudo deployer\nmkdir -p /home/deployer/.ssh\n\n# Copy your public key from your local machine\n# On your local machine, run:\ncat ~/.ssh/id_rsa.pub', lang: 'bash' },
          { type: 'text', content: 'Paste the output into /home/deployer/.ssh/authorized_keys on the server. Then set correct permissions so SSH accepts the key.' },
          { type: 'code', content: 'chmod 700 /home/deployer/.ssh\nchmod 600 /home/deployer/.ssh/authorized_keys\nchown -R deployer:deployer /home/deployer/.ssh', lang: 'bash' },
          { type: 'verify', content: 'From your local machine, run ssh deployer@YOUR_SERVER_IP. You should log in without a password prompt.' },
        ]
      },
      {
        title: 'Install Node.js and PM2 on the server',
        blocks: [
          { type: 'text', content: 'Node.js runs your backend. PM2 is a process manager that keeps your app running 24/7, restarts it if it crashes, and handles clustering. You will install both on the VPS.' },
          { type: 'code', content: '# On the server as deployer\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs\n\nsudo npm install -g pm2', lang: 'bash' },
          { type: 'text', content: 'NodeSource provides official Node.js binaries for Ubuntu. The setup script adds their apt repository, then apt-get installs Node. The -g flag installs PM2 globally so it is available as a system command.' },
          { type: 'verify', content: 'Run node --version to see v20.x. Run pm2 --version to see PM2\'s version number.' },
        ]
      },
      {
        title: 'Clone your project on the server',
        blocks: [
          { type: 'text', content: 'The deploy user needs a copy of your code. You will clone the GitHub repository into /home/deployer/app and install dependencies. Later, GitHub Actions will automate this step.' },
          { type: 'code', content: 'cd ~\ngit clone https://github.com/YOURNAME/devops-dashboard.git app\ncd app/server\nnpm install\ncd ../client\nnpm install\nnpm run build', lang: 'bash' },
          { type: 'text', content: 'npm run build in the client folder creates a dist/ folder with optimised static files. These are the HTML, CSS, and JS files that the browser will download. The build step is necessary because browsers cannot read JSX directly.' },
        ]
      },
      {
        title: 'Start the backend with PM2',
        blocks: [
          { type: 'text', content: 'PM2 manages your Node.js process. It handles crashes, restarts, logging, and clustering. You start the app with pm2 start, then save the process list so it auto-restarts after a server reboot.' },
          { type: 'code', content: 'cd ~/app/server\npm2 start src/index.ts --name dashboard --interpreter npx tsx\npm2 save\nsudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deployer --hp /home/deployer', lang: 'bash' },
          { type: 'text', content: '--name dashboard gives the process a readable name. --interpreter npx tsx tells PM2 to run the file through tsx instead of plain Node.js, since the file uses TypeScript. pm2 startup generates a systemd service that starts PM2 on boot.' },
          { type: 'verify', content: 'Run pm2 status. You should see dashboard listed with status online. Run pm2 logs dashboard to see the server output.' },
        ]
      },
      {
        title: 'Configure Nginx as a reverse proxy',
        blocks: [
          { type: 'text', content: 'Nginx is a web server that listens on port 80/443 and forwards requests to your Node.js app on port 3000. It also serves static files, handles SSL certificates, and can block malicious traffic. You will install it and write a site configuration.' },
          { type: 'code', content: 'sudo apt-get install -y nginx', lang: 'bash' },
          { type: 'code', content: 'sudo tee /etc/nginx/sites-available/dashboard << \'EOF\'\nserver {\n  listen 80;\n  server_name YOUR_DOMAIN_OR_IP;\n\n  location /api/ {\n    proxy_pass http://localhost:3000/;\n    proxy_http_version 1.1;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n  }\n\n  location / {\n    root /home/deployer/app/client/dist;\n    try_files $uri $uri/ /index.html;\n  }\n}\nEOF', lang: 'bash' },
          { type: 'text', content: 'proxy_pass forwards requests to your Hono backend. The /api/ location handles API calls. The / location serves the built React files. try_files tells Nginx to serve index.html for any route — this is needed because React Router handles client-side routing.' },
          { type: 'verify', content: 'Enable the site and restart Nginx:\nsudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/\nsudo nginx -t\nsudo systemctl restart nginx\n\nVisit http://YOUR_DOMAIN_OR_IP in a browser. You should see your React app.' },
        ]
      },
      {
        title: 'Add SSL with Certbot',
        blocks: [
          { type: 'text', content: 'HTTPS encrypts data between the browser and your server. Without it, passwords and tokens travel in plain text. Certbot is a free tool from Let\'s Encrypt that automatically issues and renews SSL certificates.' },
          { type: 'code', content: 'sudo apt-get install -y certbot python3-certbot-nginx\nsudo certbot --nginx -d YOUR_DOMAIN', lang: 'bash' },
          { type: 'text', content: 'Certbot reads your Nginx config, requests a certificate for the domain, updates the config to use it, and sets up automatic renewal. The certificate is valid for 90 days, but Certbot installs a cron job that renews it before expiry.' },
          { type: 'verify', content: 'Visit https://YOUR_DOMAIN. You should see a green lock icon in the browser address bar. Run sudo certbot certificates to see the installed certificate details.' },
        ]
      },
      {
        title: 'Set up GitHub Actions for automated deployment',
        blocks: [
          { type: 'text', content: 'Right now every deploy requires you to SSH into the server, pull code, install dependencies, and restart PM2. GitHub Actions automates this: every time you push to main, GitHub runs a workflow that deploys for you.' },
          { type: 'code', content: 'mkdir -p .github/workflows\ntouch .github/workflows/deploy.yml', lang: 'bash' },
          { type: 'code', content: 'name: Deploy to VPS\n\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Setup SSH\n        run: |\n          mkdir -p ~/.ssh\n          echo "${{ secrets.SSH_KEY }}" > ~/.ssh/deploy_key\n          chmod 600 ~/.ssh/deploy_key\n\n      - name: Deploy\n        run: |\n          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no \\\n            deployer@YOUR_SERVER_IP \\\n            "cd ~/app && git pull && cd server && npm install && pm2 restart dashboard"', lang: 'yaml' },
          { type: 'text', content: 'secrets.SSH_KEY is a private SSH key stored in your GitHub repository settings. Never commit private keys to Git. Go to Settings > Secrets and variables > Actions, and add a new secret named SSH_KEY with the contents of your deploy private key.' },
          { type: 'verify', content: 'Push a small change to main. Go to GitHub > Actions and watch the workflow run. If it succeeds, your server should have the new code within a minute.' },
        ]
      },
      {
        title: 'Add a rollback script',
        blocks: [
          { type: 'text', content: 'Deployments sometimes break. A rollback script lets you revert to the previous working version quickly. It reads the previous Git commit hash, checks it out, reinstalls dependencies, and restarts the app.' },
          { type: 'code', content: 'touch scripts/rollback.sh\nchmod +x scripts/rollback.sh', lang: 'bash' },
          { type: 'code', content: '#!/bin/bash\nset -e\n\nPREVIOUS=$(git rev-parse HEAD~1)\necho "Rolling back from $(git rev-parse HEAD) to $PREVIOUS..."\n\ngit checkout $PREVIOUS\ncd server && npm install\npm2 restart dashboard\n\necho "Rollback complete. Dashboard is running at $PREVIOUS"', lang: 'bash' },
          { type: 'text', content: 'set -e means "exit immediately if any command fails". This prevents the script from claiming success when something went wrong halfway through. HEAD~1 means "the commit just before the current one".' },
          { type: 'verify', content: 'Run ./scripts/rollback.sh on the server. Then run pm2 logs dashboard to confirm the app restarted. Run git log --oneline -n 2 to verify you are on the previous commit.' },
        ]
      },
      {
        title: 'Verify the complete pipeline',
        blocks: [
          { type: 'text', content: 'You now have a fully automated deployment pipeline. Let us walk through the entire flow end-to-end to prove everything works together.' },
          { type: 'code', content: '# 1. Make a change locally\necho "// Deployed via CI/CD" >> server/src/index.ts\ngit add .\ngit commit -m "feat: add deployment marker"\ngit push origin main\n\n# 2. Watch GitHub Actions deploy it automatically\n# 3. Visit https://YOUR_DOMAIN and confirm the change\n# 4. Check PM2 status on the server\nssh deployer@YOUR_SERVER_IP "pm2 status"\n\n# 5. Check SSL certificate\ncurl -I https://YOUR_DOMAIN/health\n\n# 6. Test rollback\nssh deployer@YOUR_SERVER_IP "cd ~/app && ./scripts/rollback.sh"', lang: 'bash' },
          { type: 'tip', content: 'You have built and deployed a real fullstack application with automated CI/CD, SSL, process management, and rollback capability. This is the exact stack used by startups and enterprise teams worldwide. Every command you learned is transferable to any Node.js project.' },
        ]
      },
    ]
  },
  {
    slug: 'deploy-hostinger-cloud',
    title: 'Deploy to Hostinger Cloud Startup',
    description: 'Deploy your fullstack Node.js application to Hostinger Cloud Startup using the built-in GitHub integration, MySQL databases, and hPanel environment variables. Covers PayFast payment gateway and Google OAuth configuration step by step. No prior server administration experience required.',
    difficulty: 'Intermediate',
    time: '3-4 hours',
    courseSlug: 'deployment-devops',
    courseTitle: 'Deployment & DevOps',
    tags: ['Hostinger', 'Cloud Startup', 'DevOps'],
    steps: [
      {
        title: 'Understand what Hostinger Cloud Startup gives you',
        blocks: [
          { type: 'text', content: 'Hostinger Cloud Startup is a shared hosting plan that includes Node.js support through hPanel, Hostinger\'s custom control panel. Unlike a raw VPS where you install everything yourself, Hostinger provides a managed environment: they keep the operating system updated, the web server running, and the firewall configured. You focus on your code.' },
          { type: 'text', content: 'The Cloud Startup plan includes: up to 300 websites, 200 GB NVMe SSD storage, free domain (first year), free SSL certificates, daily backups, and a built-in Node.js application manager. You also get GitHub integration that pulls your code automatically when you push.' },
          { type: 'tip', content: 'NVMe SSD is faster than regular SSD. For a Node.js app, this means quicker npm install and faster database queries. The daily backup feature is critical — if a deployment goes wrong, you can restore yesterday\'s version with one click in hPanel.' },
          { type: 'text', content: 'This guide assumes you already have a fullstack application built with a Hono backend, a React frontend, MySQL database, PayFast payments, and Google OAuth login. If you are following this course, that is exactly what you built in the previous lessons.' },
        ]
      },
      {
        title: 'Prepare your application for production',
        blocks: [
          { type: 'text', content: 'Before you deploy, your application needs a few changes to work in Hostinger\'s environment. The backend must listen on a dynamic port (Hostinger assigns one), serve the built frontend files, and connect to a MySQL database instead of SQLite.' },
          { type: 'code', content: '# In your backend entry file (e.g., api/src/index.ts or server/src/index.ts),\n# make sure the port comes from the environment:\n\nconst port = process.env.PORT ? parseInt(process.env.PORT) : 3000;\n\n# Also ensure your app serves static files from the dist folder:\napp.use("/*", serveStatic({ root: "./dist" }));\n\n# And make sure you have a catch-all route for React Router:\napp.get("*", (c) => {\n  return c.text("Fallback — ensure this serves index.html for client-side routing");\n});', lang: 'typescript' },
          { type: 'text', content: 'process.env.PORT is an environment variable that Hostinger sets automatically. You must not hard-code port 3000 in production. The serveStatic middleware tells Hono to look for files in the dist folder whenever a request does not match an API route.' },
          { type: 'warn', content: 'If you forget the catch-all route, refreshing a page like /dashboard on your live site will return a 404. This is because the browser asks the server for /dashboard, but that route only exists in React Router on the client. The server must serve index.html so React Router can handle the path.' },
        ]
      },
      {
        title: 'Set up your GitHub repository',
        blocks: [
          { type: 'text', content: 'Hostinger deploys directly from GitHub. Every time you push changes to your main branch, Hostinger can automatically pull and rebuild your application. This means your repository must be clean, committed, and pushed before you start the deployment setup.' },
          { type: 'code', content: 'cd /path/to/your/project\n\n# Make sure everything is committed\ngit status\n\n# If you see modified files, commit them:\ngit add .\ngit commit -m "Prepare for Hostinger deployment"\n\n# Push to GitHub:\ngit push origin main', lang: 'bash' },
          { type: 'text', content: 'Your repository should contain both the frontend and backend code. Hostinger will run npm install and build commands from the root of the repository, so make sure your package.json is at the top level or that you know the relative path to your backend folder.' },
          { type: 'verify', content: 'Open your GitHub repository in a browser. Confirm that the latest commit is "Prepare for Hostinger deployment" and that all files are present.' },
        ]
      },
      {
        title: 'Purchase Hostinger Cloud Startup and access hPanel',
        blocks: [
          { type: 'text', content: 'Go to hostinger.com and select the Cloud Startup plan. During checkout you can register a new domain or use an existing one. After payment, Hostinger sends you an email with a link to hPanel — their custom control panel where you manage everything.' },
          { type: 'text', content: 'Once inside hPanel, look for the Websites section on the left sidebar. Click on Manage next to your domain. This opens the website management dashboard where you will create databases, configure Node.js, and set environment variables.' },
          { type: 'tip', content: 'If this is your first time using Hostinger, take a moment to explore hPanel. The interface is organised into sections: Dashboard, Websites, Domains, Emails, Databases, Advanced, and Files. Everything you need for this deployment lives under Websites > Manage.' },
          { type: 'warn', content: 'Do not close the initial setup wizard until you have noted your hPanel login URL, username, and password. Store these in a password manager. You will need them every time you change environment variables or check deployment logs.' },
        ]
      },
      {
        title: 'Create a MySQL database in hPanel',
        blocks: [
          { type: 'text', content: 'Your application needs a database to store user accounts, lesson progress, payments, and course data. Hostinger Cloud Startup includes MySQL databases that you create and manage directly inside hPanel. No command-line installation is required.' },
          { type: 'text', content: 'In hPanel, navigate to Websites > Manage > Databases > Management. Click Create Database. You will need to choose a name and create a user with a password. Hostinger will prefix both the database name and username with your account identifier (for example, u123456789_database_name).' },
          { type: 'code', content: '# Example database credentials (yours will be different):\n# Database name: u123456789_mastertheterminal\n# Database user: u123456789_dbadmin\n# Database password: YourStrongPassword123!\n# Database host: localhost\n# Database port: 3306\n\n# Connection string format (you will need this later):\nmysql://u123456789_dbadmin:YourStrongPassword123!@localhost:3306/u123456789_mastertheterminal', lang: 'bash' },
          { type: 'text', content: 'Write these credentials down in a text file on your computer. You will need the database name, username, password, host, and port when you configure environment variables. The host is always localhost on shared hosting because the database server runs on the same machine as your website.' },
          { type: 'verify', content: 'After creating the database, click the phpMyAdmin button next to it. This opens a web-based database manager. If phpMyAdmin loads without errors, your database is ready to accept connections.' },
          { type: 'tip', content: 'phpMyAdmin is useful for inspecting your data after deployment. You can view tables, run queries, and export backups without touching the command line. Bookmark the phpMyAdmin URL for quick access.' },
        ]
      },
      {
        title: 'Run your database migrations',
        blocks: [
          { type: 'text', content: 'Your application uses Drizzle ORM, which means your tables are defined in TypeScript schema files. Before the app can store any data, these tables must exist in the MySQL database. You will run a migration command that reads your schema and creates the corresponding tables.' },
          { type: 'text', content: 'On your local development machine, make sure your .env file points to the Hostinger MySQL database. Then run the Drizzle Kit migrate command. This sends CREATE TABLE statements to the live database.' },
          { type: 'code', content: '# In your local project root, temporarily update .env:\nDATABASE_URL="mysql://u123456789_dbadmin:YourStrongPassword123!@localhost:3306/u123456789_mastertheterminal"\n\n# Run the migration:\nnpx drizzle-kit migrate\n\n# Or if you use a push workflow:\nnpx drizzle-kit push', lang: 'bash' },
          { type: 'text', content: 'drizzle-kit migrate applies migration files from your drizzle folder. drizzle-kit push compares your schema file directly against the database and creates or alters tables to match. Push is convenient for learning; migrate is better for production teams because it is more controlled.' },
          { type: 'verify', content: 'Open phpMyAdmin in hPanel. You should see tables like users, courses, lessons, progress, and payments. If the tables are there, the migration succeeded.' },
          { type: 'warn', content: 'Only run migrations from your local machine or a secure environment. Never commit a .env file containing live database credentials to GitHub. After migrating, remove the DATABASE_URL from your local .env or switch it back to your development database.' },
        ]
      },
      {
        title: 'Open the Node.js application manager',
        blocks: [
          { type: 'text', content: 'Hostinger provides a dedicated Node.js section inside hPanel. This tool lets you choose your Node.js version, pick a framework, connect a GitHub repository, and define how your application starts. It removes the need for manual Nginx configuration or process managers like PM2.' },
          { type: 'text', content: 'In hPanel, go to Websites > Manage > Node.js. If you do not see a Node.js option, check that your hosting plan supports it (Cloud Startup, Cloud Professional, and Cloud Enterprise all do). Click Setup Application or Create Application.' },
          { type: 'text', content: 'You will see a form with several fields. Here is what each one means before you fill them in:' },
          { type: 'tip', content: 'Node.js version: Choose 20.x for maximum stability, or 22.x if you want newer features. Avoid 18.x if your code uses modern syntax. Avoid 24.x unless you specifically need it, as it may not be fully supported yet on shared hosting.' },
          { type: 'tip', content: 'Application root: This is the folder where Hostinger runs npm install and your start command. If your backend is at the root of the repo, leave it as the default. If it is in a subfolder like api/ or server/, enter that path.' },
          { type: 'tip', content: 'Application startup file: This is the file Hostinger runs to start your server. For a Hono app using tsx, this might be src/index.ts. If you pre-compile to JavaScript, it might be dist/index.js. We will cover this in detail in the next step.' },
        ]
      },
      {
        title: 'Configure the Node.js app for a Hono project',
        blocks: [
          { type: 'text', content: 'Hono is not listed as a preset framework in Hostinger\'s dropdown (which shows Express.js, Next.js, NestJS, Fastify, and so on). You must select Other and configure the start command manually. This is completely normal and works perfectly well.' },
          { type: 'text', content: 'Fill in the Node.js application form with these settings. Adjust paths to match your actual project structure:' },
          { type: 'code', content: '# Node.js Application Configuration (Hostinger hPanel):\n\nNode.js version: 20.x\nApplication mode: Production\nApplication root: / (or /api if your backend is in a subfolder)\nApplication URL: yourdomain.com\nApplication startup file: src/index.ts\n\n# If your project pre-builds TypeScript to JavaScript:\nApplication startup file: dist/index.js\n\n# NPM start command (this is what Hostinger runs to boot your app):\nnpm start\n\n# Or if you need tsx in production:\nnpx tsx src/index.ts', lang: 'bash' },
          { type: 'text', content: 'Application mode should be Production. This tells Node.js to skip development-only behaviours like detailed error stacks and hot reloading. The Application URL is the domain where your app will be accessible. The startup file is the entry point that Hostinger executes.' },
          { type: 'warn', content: 'If you select a preset framework like Express.js but your app is actually Hono, Hostinger may inject Express-specific settings that conflict with your code. Always select Other for Hono, Fastify, or any framework not on the preset list.' },
          { type: 'verify', content: 'Before saving, double-check that your package.json has a "start" script defined. Open your package.json and look for: "scripts": { "start": "node dist/index.js" } or similar. If it is missing, Hostinger will not know how to boot your app.' },
        ]
      },
      {
        title: 'Connect your GitHub repository',
        blocks: [
          { type: 'text', content: 'Hostinger has a built-in Git integration that clones your repository onto the server. This is much simpler than manually uploading files via FTP. When you push changes to GitHub, Hostinger can pull them automatically and restart your application.' },
          { type: 'text', content: 'In the Node.js application screen, look for a Git Repository or Source Code section. Click Connect Repository. Authorise Hostinger to access your GitHub account (you will be redirected to GitHub for OAuth approval). Select the repository that contains your application.' },
          { type: 'text', content: 'After connecting, you will see options for the branch (choose main or master) and whether to enable automatic deployment. Turn automatic deployment on. This means every git push to main triggers a new build on Hostinger within a few minutes.' },
          { type: 'tip', content: 'If you do not want to grant Hostinger full GitHub access, you can manually upload your code instead. Go to Files > File Manager, navigate to your application root, and upload a ZIP file of your project. Then extract it. This is less convenient but more paranoid.' },
          { type: 'verify', content: 'After connecting the repository, click Pull or Deploy Now. Then open the Deployment Logs tab. You should see output showing git clone, npm install, and eventually a success message. If you see errors, read the log carefully — they usually tell you exactly what is wrong.' },
          { type: 'warn', content: 'The first deployment often fails because environment variables are not set yet. That is expected. We will configure those in the next steps, then redeploy. Do not panic if you see "DATABASE_URL is not defined" in the logs at this stage.' },
        ]
      },
      {
        title: 'Configure build commands for a fullstack project',
        blocks: [
          { type: 'text', content: 'Your project has two parts: a React frontend that must be built into static files, and a Hono backend that serves those files. Hostinger runs your start command after every deployment, but you also need a build command that compiles the frontend before the server starts.' },
          { type: 'text', content: 'In hPanel, look for a Build Command or Pre-start Command field. This command runs before your application boots. You want it to install dependencies for both frontend and backend, then build the frontend into a dist folder that your Hono app can serve.' },
          { type: 'code', content: '# Build command for a monorepo-style project:\ncd client && npm install && npm run build && cd ../api && npm install && npm run build\n\n# Or if your frontend and backend share a root package.json:\nnpm install && npm run build\n\n# Make sure your backend package.json "start" script serves the dist folder:\n# "start": "NODE_ENV=production node dist/index.js"', lang: 'bash' },
          { type: 'text', content: 'The exact command depends on your folder structure. If frontend and backend are separate folders, you need two npm install commands. If they share a workspace or a single package.json with multiple scripts, one command may be enough. The critical thing is that dist/ (or wherever your build output goes) exists before the server starts.' },
          { type: 'verify', content: 'Run the build command locally first to confirm it works: cd client && npm install && npm run build. Check that a dist/ folder appears with index.html inside. If the local build works, the same command will work on Hostinger.' },
          { type: 'tip', content: 'Hostinger caches node_modules between deployments. This makes subsequent builds much faster because npm install only downloads new dependencies. However, if you see strange errors after changing packages, try adding rm -rf node_modules to the start of your build command to force a clean install.' },
        ]
      },
      {
        title: 'Set database environment variables',
        blocks: [
          { type: 'text', content: 'Environment variables are how you pass secrets and configuration to your application without hard-coding them in your source code. Hostinger hPanel has a dedicated Environment Variables section inside the Node.js application manager. This is where you store credentials safely.' },
          { type: 'text', content: 'Open your Node.js application in hPanel and click Environment Variables. Add the following variables. Replace the example values with your actual database credentials from step 5:' },
          { type: 'code', content: '# Database environment variables (Hostinger hPanel):\n\nDATABASE_URL=mysql://u123456789_dbadmin:YourStrongPassword123!@localhost:3306/u123456789_mastertheterminal\n\n# Or if your app splits the connection string into parts:\nDB_HOST=localhost\nDB_PORT=3306\nDB_USER=u123456789_dbadmin\nDB_PASSWORD=YourStrongPassword123!\nDB_NAME=u123456789_mastertheterminal', lang: 'bash' },
          { type: 'text', content: 'The DATABASE_URL format is the most common for Node.js frameworks. It contains the protocol (mysql://), username, password, host, port, and database name in a single string. Drizzle ORM and most connection libraries can parse this format directly.' },
          { type: 'tip', content: 'If your password contains special characters like @, #, or !, you may need to URL-encode them in the DATABASE_URL. For example, @ becomes %40 and # becomes %23. If you get connection errors despite correct credentials, try the split-variable approach instead of a single connection string.' },
          { type: 'verify', content: 'After adding the variables, click Save. Then restart your Node.js application (look for a Restart button). Check the Deployment Logs. If the database connection is working, you will see your normal server startup message. If not, you will see an ECONNREFUSED or authentication error.' },
          { type: 'warn', content: 'Never commit .env files to GitHub. Hostinger\'s environment variable manager is the safest place for production secrets. If someone gains access to your GitHub repository, they should not find any passwords or API keys in the code.' },
        ]
      },
      {
        title: 'Configure PayFast environment variables',
        blocks: [
          { type: 'text', content: 'PayFast is a South African payment gateway that handles credit cards, Instant EFT, and other local payment methods. Your application uses it to process course purchases. PayFast requires several credentials and configuration values to work securely.' },
          { type: 'text', content: 'You need two sets of credentials: sandbox (test) credentials for development, and live credentials for real transactions. Always test with sandbox first. The sandbox environment lets you simulate payments without real money changing hands.' },
          { type: 'code', content: '# Sign up for a PayFast sandbox account at:\n# https://sandbox.payfast.co.za\n\n# After registration, go to Settings > Integration.\n# You will find:\n# - Merchant ID (8 digits)\n# - Merchant Key (32-character string)\n# - Passphrase (optional but highly recommended for security)', lang: 'bash' },
          { type: 'text', content: 'The passphrase is a secret string you create yourself. It is used to sign payment requests so PayFast can verify they came from your server and were not tampered with. Choose a long random string and store it in your password manager.' },
          { type: 'code', content: '# PayFast environment variables to add in Hostinger hPanel:\n\n# Sandbox / Testing mode (use these while learning):\nPAYFAST_MERCHANT_ID=10000100\nPAYFAST_MERCHANT_KEY=46f0cd694581a\nPAYFAST_PASSPHRASE=your_custom_passphrase_here\nPAYFAST_RETURN_URL=https://yourdomain.com/payment/success\nPAYFAST_CANCEL_URL=https://yourdomain.com/payment/cancel\nPAYFAST_NOTIFY_URL=https://yourdomain.com/api/payments/notify\nTESTING_MODE=true\n\n# Live credentials (only after testing is complete):\n# PAYFAST_MERCHANT_ID=your_live_merchant_id\n# PAYFAST_MERCHANT_KEY=your_live_merchant_key\n# PAYFAST_PASSPHRASE=your_live_passphrase\n# TESTING_MODE=false', lang: 'bash' },
          { type: 'text', content: 'The return URL is where customers land after a successful payment. The cancel URL is where they land if they click cancel. The notify URL (also called ITN — Instant Transaction Notification) is a server-to-server webhook that PayFast calls to confirm the payment really happened. This is critical because users can fake a return URL visit.' },
          { type: 'tip', content: 'The notify URL must be publicly accessible. PayFast\'s servers send a POST request to it from outside your network. If you are using Hostinger\'s built-in SSL (which we will set up soon), the webhook will work immediately because your domain is already public.' },
          { type: 'verify', content: 'Add the sandbox variables to hPanel, save, and restart your app. Then visit your site and try a test purchase. You should be redirected to PayFast\'s sandbox checkout page. Use the sandbox card number 4111111111111111 with any future expiry and CVV.' },
          { type: 'warn', content: 'The default sandbox credentials (10000100 / 46f0cd694581a) are public and shared by all developers. Never use them for real transactions. They are only for testing the integration flow. Switch to live credentials before accepting real customers.' },
        ]
      },
      {
        title: 'Configure Google OAuth environment variables',
        blocks: [
          { type: 'text', content: 'Google OAuth lets users log in with their Google account instead of creating a password. This increases conversion rates because users trust Google and do not need to remember another password. It requires a Google Cloud project and three configuration values.' },
          { type: 'text', content: 'If you have not already set up Google OAuth, go to console.cloud.google.com and create a new project. Then navigate to APIs & Services > Credentials > Create Credentials > OAuth client ID. Choose Web application as the type.' },
          { type: 'code', content: '# In the Google Cloud Console, under Authorized redirect URIs, add:\nhttps://yourdomain.com/api/auth/google/callback\n\n# Also add your domain to Authorized JavaScript origins:\nhttps://yourdomain.com\n\n# After creating the credential, Google shows you:\n# - Client ID (looks like 123456789012-abcdefg123456789.apps.googleusercontent.com)\n# - Client Secret (a 24-character string)', lang: 'bash' },
          { type: 'text', content: 'The redirect URI is the most important field. When a user clicks "Sign in with Google", Google sends them back to this URL with a temporary code. Your backend receives that code, exchanges it for an access token, and creates a session. If this URI does not match exactly what your backend expects, Google will reject the login.' },
          { type: 'code', content: '# Google OAuth environment variables for Hostinger hPanel:\n\nGOOGLE_CLIENT_ID=123456789012-abcdefg123456789.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here\nGOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback\n\n# Also ensure your backend has these (they are not secrets, but required):\nGOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth\nGOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token', lang: 'bash' },
          { type: 'tip', content: 'The client ID is safe to expose in frontend code. The client secret must never leave your server. In hPanel, the environment variables are only visible to your application process and to you when logged into hPanel. They are not exposed to website visitors.' },
          { type: 'verify', content: 'Add the Google variables to hPanel, save, and restart your app. Visit your website, click "Sign in with Google", and complete the OAuth flow. You should be logged in and redirected to the dashboard. Check your database users table — a new row should appear with a Google ID.' },
          { type: 'warn', content: 'Google OAuth requires a real domain with HTTPS. Localhost development uses a different client ID and different redirect URIs. Make sure your production Google credential uses your live domain, not http://localhost:5173. If you see redirect_uri_mismatch errors, this is almost certainly the cause.' },
        ]
      },
      {
        title: 'Add remaining environment variables',
        blocks: [
          { type: 'text', content: 'Your application likely needs a few more environment variables to run correctly in production. These are not tied to external services, but they control how your app behaves: session secrets, JWT signing keys, and whether to show verbose errors.' },
          { type: 'code', content: '# Additional production environment variables for hPanel:\n\nNODE_ENV=production\nJWT_SECRET=a_random_string_at_least_32_characters_long\nSESSION_SECRET=another_random_string_at_least_32_characters_long\nAPP_URL=https://yourdomain.com\nFRONTEND_URL=https://yourdomain.com\n\n# If you use email sending (optional):\n# SMTP_HOST=smtp.hostinger.com\n# SMTP_PORT=587\n# SMTP_USER=noreply@yourdomain.com\n# SMTP_PASSWORD=your_email_password', lang: 'bash' },
          { type: 'text', content: 'JWT_SECRET is used to sign JSON Web Tokens. If someone learns this secret, they can forge login tokens and impersonate any user. SESSION_SECRET is used to encrypt browser session cookies. Both should be long random strings generated by a password manager or with openssl rand -base64 32 on your local machine.' },
          { type: 'tip', content: 'NODE_ENV=production is a signal to many libraries to enable optimisations and disable development features. Express, Hono, React, and Drizzle all behave differently in production mode. Without this variable, your app may leak stack traces to users or run slowly.' },
          { type: 'verify', content: 'Generate strong secrets locally:\nopenssl rand -base64 32\n\nCopy the output and paste it into hPanel as JWT_SECRET and SESSION_SECRET. Save and restart. Your app should now boot without any "missing environment variable" warnings in the logs.' },
        ]
      },
      {
        title: 'Configure your domain and enable SSL',
        blocks: [
          { type: 'text', content: 'Hostinger provides free SSL certificates for all domains. SSL encrypts traffic between your users and your server, which is required for Google OAuth, PayFast, and for ranking well in search engines. Modern browsers mark HTTP sites as "Not Secure".' },
          { type: 'text', content: 'In hPanel, go to Websites > Manage > SSL. Click Install SSL. Hostinger will automatically request a certificate from Let\'s Encrypt, validate your domain ownership, and install it. This usually takes under 5 minutes.' },
          { type: 'code', content: '# After SSL is installed, force HTTPS by ensuring your app:\n# 1. Listens on the port Hostinger assigns (via process.env.PORT)\n# 2. Does not try to handle SSL itself — Hostinger\'s reverse proxy does this\n# 3. Trusts the X-Forwarded-Proto header to detect HTTPS\n\n# In your Hono app, add:\napp.use("*", async (c, next) => {\n  const proto = c.req.header("x-forwarded-proto");\n  if (proto === "http" && c.req.url.startsWith("http://")) {\n    return c.redirect(c.req.url.replace("http://", "https://"), 301);\n  }\n  await next();\n});', lang: 'typescript' },
          { type: 'text', content: 'On shared hosting, you do not manage SSL certificates in your code. Hostinger\'s front-end web server (Nginx) terminates SSL and forwards plain HTTP to your Node.js app. The x-forwarded-proto header tells your app whether the original request was HTTP or HTTPS. You should redirect HTTP to HTTPS for security.' },
          { type: 'verify', content: 'Visit http://yourdomain.com. You should be automatically redirected to https://yourdomain.com. The browser should show a padlock icon. Click the padlock and inspect the certificate — it should be issued by Let\'s Encrypt and valid for 90 days with automatic renewal.' },
          { type: 'tip', content: 'If SSL installation fails, the most common cause is that your domain\'s DNS is not yet pointing to Hostinger. This can take up to 24 hours after changing nameservers. You can check propagation with online tools like whatsmydns.net.' },
        ]
      },
      {
        title: 'Monitor logs and fix common errors',
        blocks: [
          { type: 'text', content: 'The first few deployments rarely work perfectly. When something breaks, logs are your best friend. Hostinger hPanel shows real-time application logs that capture everything your Node.js process prints to stdout or stderr.' },
          { type: 'text', content: 'In hPanel, go to Websites > Manage > Node.js > Logs. You will see two types: Access Logs (who visited your site) and Error Logs (what went wrong). Focus on Error Logs first. Look for lines that say Error:, Failed:, or Cannot find module.' },
          { type: 'code', content: '# Common errors and their fixes:\n\n# Error: Cannot find module \'hono\'\n# Fix: Your node_modules are missing. Add npm install to your build command.\n\n# Error: connect ECONNREFUSED 127.0.0.1:3306\n# Fix: Database credentials are wrong, or the database server is down.\n#      Double-check DB_HOST is localhost (not 127.0.0.1 on some hosts).\n\n# Error: secretOrPrivateKey must have a value\n# Fix: JWT_SECRET is not set in environment variables.\n\n# Error: listen EADDRINUSE: address already in use\n# Fix: You hard-coded a port. Use process.env.PORT instead.\n\n# Error: Cannot GET /dashboard\n# Fix: Missing catch-all route to serve index.html for React Router.', lang: 'bash' },
          { type: 'text', content: 'When you see an error, read the entire stack trace from top to bottom. The first line usually tells you exactly what went wrong. The lines below show which files and functions were involved. Do not panic if you see a long trace — focus on the first error message.' },
          { type: 'tip', content: 'If logs are not updating, try clicking the Restart button in hPanel. This kills the old process and starts a fresh one. Sometimes Node.js hangs without printing new output, and a restart forces it to flush the log buffer.' },
          { type: 'warn', content: 'Do not expose stack traces to your users in production. In your Hono error handler, check if NODE_ENV is production and return a generic "Internal server error" message instead of the full error object. Full traces reveal your file structure and can help attackers.' },
        ]
      },
      {
        title: 'Test the complete application end-to-end',
        blocks: [
          { type: 'text', content: 'You have configured the server, the database, the payment gateway, and the authentication system. Now it is time to verify that everything works together as a single product. Run through this checklist in order.' },
          { type: 'code', content: '# End-to-end deployment verification checklist:\n\n# 1. Homepage loads over HTTPS\n#    Visit https://yourdomain.com/\n#    Expect: React app loads, no console errors.\n\n# 2. Google OAuth login works\n#    Click "Sign in with Google"\n#    Expect: Redirected to Google, then back to dashboard.\n#    Verify: Check users table in phpMyAdmin.\n\n# 3. Course browsing works\n#    Navigate to /courses\n#    Expect: Course list loads from database.\n\n# 4. PayFast test purchase works\n#    Click "Buy" on a course.\n#    Expect: Redirected to PayFast sandbox checkout.\n#    Use card: 4111111111111111, any future expiry, any CVV.\n#    Expect: Redirected to /payment/success.\n\n# 5. Webhook (ITN) fires\n#    Check your backend logs for POST /api/payments/notify.\n#    Expect: 200 OK response. Enrollment created in database.\n\n# 6. Admin dashboard (if applicable)\n#    Log in as superadmin.\n#    Expect: Admin routes load, user data visible.', lang: 'bash' },
          { type: 'text', content: 'If any step fails, stop and fix it before moving on. A common mistake is to skip the webhook test because the user interface looks fine. But if PayFast\'s ITN does not reach your server, the payment was not actually verified. An attacker could visit /payment/success directly and get free access.' },
          { type: 'tip', content: 'Create a test user account with a fake email specifically for this testing. That way your real admin dashboard stays clean. After testing is complete, you can delete the test user from phpMyAdmin or keep it as a permanent test account.' },
        ]
      },
      {
        title: 'Set up automatic deployments',
        blocks: [
          { type: 'text', content: 'Right now every deploy requires you to click buttons in hPanel. Hostinger\'s Git integration can watch your repository and automatically deploy when you push to the main branch. This is Continuous Deployment (CD) — a core DevOps practice.' },
          { type: 'text', content: 'In hPanel, go to your Node.js application settings. Find the Git Integration or Automatic Deployment toggle. Turn it on. Select the main branch. Now, every time you run git push origin main on your local machine, Hostinger will pull, build, and restart within 2-3 minutes.' },
          { type: 'code', content: '# Typical developer workflow after auto-deploy is enabled:\n\n# 1. Make changes locally\ngit checkout -b feature/new-lesson\n\n# 2. Edit files, test locally\nnpm run dev\n\n# 3. Commit and push the branch\ngit add .\ngit commit -m "feat: add new lesson on shell scripting"\ngit push origin feature/new-lesson\n\n# 4. Open a pull request on GitHub (optional but recommended)\n# 5. Merge to main\n# 6. Hostinger automatically deploys the merged code', lang: 'bash' },
          { type: 'text', content: 'Pull requests are a safety net. They let you review code changes before they go live. Even if you are the only developer on the project, opening a pull request forces you to read your own diff, which catches many mistakes. GitHub\'s merge button then triggers the automatic deployment.' },
          { type: 'verify', content: 'Make a small visible change to your app (for example, change a heading text). Push to main. Wait 2-3 minutes. Refresh your live site. The change should appear automatically without you touching hPanel.' },
          { type: 'tip', content: 'If automatic deployment fails, check the Deployment Logs first. A common cause is a merge conflict or a broken package.json. You can always fall back to manual deployment by clicking Pull or Deploy Now in hPanel while you fix the underlying issue.' },
        ]
      },
      {
        title: 'Create a rollback plan',
        blocks: [
          { type: 'text', content: 'Things break in production. A rollback plan lets you revert to a known working version quickly. Hostinger does not have a one-click rollback button, but you can create one using Git tags and manual deployment.' },
          { type: 'code', content: '# Before every major release, tag the working version:\ngit tag -a v1.0.0 -m "Stable release before adding payments"\ngit push origin v1.0.0\n\n# If a deployment breaks, revert in Git:\ngit revert HEAD\n# Or checkout the tag:\ngit checkout v1.0.0\n\n# Then push the revert:\ngit push origin main\n\n# Hostinger will auto-deploy the reverted code.', lang: 'bash' },
          { type: 'text', content: 'git revert creates a new commit that undoes the previous one. This is safer than git reset because it preserves history. If you need to undo a revert later, you can simply revert the revert commit. Hostinger sees every push to main as a deployment trigger, so the revert will go live automatically.' },
          { type: 'warn', content: 'Database migrations are the hardest part of rollbacks. If a deployment included a migration that altered your schema (for example, deleting a column), reverting the code will not restore the column. Always back up your database before running migrations in production. Hostinger\'s daily backups help, but an manual export before deploy is even safer.' },
          { type: 'tip', content: 'For critical applications, consider a blue-green deployment strategy: run two identical environments and switch traffic between them. This is overkill for a learning project, but worth knowing about as you grow. Cloud providers like AWS and DigitalOcean make this easier than shared hosting does.' },
        ]
      },
      {
        title: 'Document your deployment for future you',
        blocks: [
          { type: 'text', content: 'Six months from now, you will forget which environment variables you set and why. Write a README section or a DEPLOY.md file that documents your production setup. This is a gift to your future self and to any teammate who joins the project.' },
          { type: 'code', content: '# Example DEPLOY.md:\n\n## Production Deployment (Hostinger Cloud Startup)\n\n### Node.js App Settings\n- Version: 20.x\n- Framework: Other (Hono)\n- Startup file: dist/index.js\n- Build command: npm install && npm run build\n- Start command: npm start\n\n### Environment Variables\n- DATABASE_URL (from hPanel Databases)\n- PAYFAST_MERCHANT_ID, KEY, PASSPHRASE (sandbox for testing)\n- GOOGLE_CLIENT_ID, SECRET, REDIRECT_URI\n- JWT_SECRET, SESSION_SECRET (generated with openssl)\n\n### Domain\n- Primary: https://yourdomain.com\n- SSL: Enabled via hPanel Let\'s Encrypt\n- Auto-renewal: Enabled\n\n### Database\n- Type: MySQL (Hostinger managed)\n- phpMyAdmin: Available in hPanel\n- Backups: Daily (Hostinger), manual before migrations', lang: 'markdown' },
          { type: 'text', content: 'Good documentation does not need to be long. It just needs to answer the question "How do I get this running from scratch?" in plain language. Include the exact values that are hard to guess, like framework type and startup file path. Store this file in your repository where it is version-controlled but not containing actual secrets.' },
          { type: 'tip', content: 'You have now deployed a real fullstack application with user authentication, payment processing, database persistence, SSL encryption, and automatic deployments. This is a professional-grade setup that many working developers use daily. Every skill in this guide transfers to other hosting providers and larger projects.' },
        ]
      },
    ]
  },
]

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-white/40 text-sm mb-4">Project not found</p>
        <Link to="/projects">
          <Button variant="outline" className="border-white/[0.12] text-white/70 bg-transparent hover:bg-white/[0.04]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const allDone = completedSteps.size === project.steps.length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/30 font-mono mb-6">
        <Link to="/projects" className="hover:text-emerald-400 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-white/50">{project.slug}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
          </div>
          <span className={`text-xs font-mono px-2 py-1 rounded ${
            project.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
            project.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {project.difficulty}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{project.title}</h1>
        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">{project.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 font-mono">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.time}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {project.courseTitle}</span>
          {project.tags.map(tag => (
            <span key={tag} className="bg-white/5 px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex-grow h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400/60 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / project.steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-white/40 shrink-0">
          {completedSteps.size} / {project.steps.length}
        </span>
        {allDone && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" /> Done
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {project.steps.map((step, i) => {
          const done = completedSteps.has(i)
          return (
            <div
              key={i}
              className={`rounded-lg border transition-all duration-300 overflow-hidden ${
                done
                  ? 'border-emerald-500/15 bg-emerald-500/[0.03]'
                  : 'border-white/[0.06] bg-[#080808] hover:border-white/[0.10]'
              }`}
            >
              <button
                onClick={() => toggleStep(i)}
                className="w-full flex items-start gap-3 px-5 py-4 text-left"
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  done ? 'bg-emerald-500/20 border-emerald-500/40' : 'border-white/20'
                }`}>
                  {done ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <span className="text-[10px] text-white/40">{i + 1}</span>}
                </div>
                <div className="flex-grow">
                  <h3 className={`text-sm font-semibold transition-colors ${done ? 'text-emerald-400/70 line-through' : 'text-white'}`}>
                    {step.title}
                  </h3>
                </div>
              </button>
              <div className={`px-5 pb-5 pl-[52px] transition-all ${done ? 'opacity-60' : ''}`}>
                <div className="space-y-3">
                  {step.blocks.map((block, bi) => {
                    if (block.type === 'text') {
                      return <p key={bi} className="text-white/50 text-sm leading-relaxed">{block.content}</p>
                    }
                    if (block.type === 'code') {
                      return (
                        <div key={bi} className="rounded-md border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.05]">
                            <div className="w-2 h-2 rounded-full bg-red-500/30" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                            <span className="ml-2 text-[10px] text-white/20 font-mono uppercase">{block.lang || 'bash'}</span>
                          </div>
                          <pre className="p-3 font-mono text-[11px] sm:text-[13px] text-emerald-400/85 leading-[1.8] overflow-x-auto">
                            <code>{block.content}</code>
                          </pre>
                        </div>
                      )
                    }
                    if (block.type === 'tip') {
                      return (
                        <div key={bi} className="flex items-start gap-2.5 rounded-md bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-2.5">
                          <Lightbulb className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
                          <p className="text-emerald-400/60 text-xs sm:text-sm leading-relaxed">{block.content}</p>
                        </div>
                      )
                    }
                    if (block.type === 'verify') {
                      return (
                        <div key={bi} className="flex items-start gap-2.5 rounded-md bg-white/[0.02] border border-white/[0.06] px-3 py-2.5">
                          <Terminal className="w-4 h-4 text-emerald-500/50 shrink-0 mt-0.5" />
                          <p className="text-white/40 text-xs sm:text-sm leading-relaxed font-mono">{block.content}</p>
                        </div>
                      )
                    }
                    if (block.type === 'warn') {
                      return (
                        <div key={bi} className="flex items-start gap-2.5 rounded-md bg-yellow-500/[0.04] border border-yellow-500/10 px-3 py-2.5">
                          <AlertTriangle className="w-4 h-4 text-yellow-400/60 shrink-0 mt-0.5" />
                          <p className="text-yellow-400/60 text-xs sm:text-sm leading-relaxed">{block.content}</p>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion */}
      {allDone && (
        <div className="mt-8 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-6 py-5 text-center">
          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-emerald-400 font-semibold mb-1">Project Complete</h3>
          <p className="text-emerald-400/50 text-sm">You finished all {project.steps.length} steps. Great work!</p>
        </div>
      )}

      {/* Back link */}
      <div className="mt-10">
        <Link to="/projects">
          <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.04]">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Projects
          </Button>
        </Link>
      </div>
    </div>
  )
}
