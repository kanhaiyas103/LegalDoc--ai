import { cn } from "@/lib/utils"

function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

export function MarkdownView({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n")
  const nodes = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line.trim()) {
      nodes.push(<div key={index} className="h-3" />)
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={index} className="mt-5 text-base font-semibold text-cyan-100">
          {renderInline(line.slice(4))}
        </h3>,
      )
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={index} className="mt-6 text-lg font-semibold text-white">
          {renderInline(line.slice(3))}
        </h2>,
      )
    } else if (line.startsWith("# ")) {
      nodes.push(
        <h1 key={index} className="text-2xl font-semibold text-white">
          {renderInline(line.slice(2))}
        </h1>,
      )
    } else if (line.startsWith("- ")) {
      nodes.push(
        <p key={index} className="pl-4 text-sm leading-6 text-zinc-300 before:mr-2 before:text-amber-300 before:content-['*']">
          {renderInline(line.slice(2))}
        </p>,
      )
    } else if (line.includes("|")) {
      nodes.push(
        <pre key={index} className="overflow-x-auto rounded-md border border-white/10 bg-black/30 p-3 text-xs text-zinc-300">
          {line}
        </pre>,
      )
    } else {
      nodes.push(
        <p key={index} className="text-sm leading-6 text-zinc-300">
          {renderInline(line)}
        </p>,
      )
    }
  }

  return <div className={cn("space-y-1", className)}>{nodes}</div>
}
