import { cn } from "@/lib/utils"

export function reportSectionId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

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
      const heading = line.slice(4)
      nodes.push(
        <h3 id={reportSectionId(heading)} key={index} className="scroll-mt-24 mt-5 font-display text-base font-semibold text-[#7CE8B8]">
          {renderInline(heading)}
        </h3>,
      )
    } else if (line.startsWith("## ")) {
      const heading = line.slice(3)
      nodes.push(
        <h2 id={reportSectionId(heading)} key={index} className="scroll-mt-24 mt-6 border-t border-white/8 pt-5 font-display text-lg font-semibold text-white">
          {renderInline(heading)}
        </h2>,
      )
    } else if (line.startsWith("# ")) {
      const heading = line.slice(2)
      nodes.push(
        <h1 id={reportSectionId(heading)} key={index} className="scroll-mt-24 font-display text-2xl font-semibold text-white">
          {renderInline(heading)}
        </h1>,
      )
    } else if (line.startsWith("- ")) {
      nodes.push(
        <p key={index} className="pl-4 text-sm leading-6 text-[#C7CBD1] before:mr-2 before:text-[#D4AF37] before:content-['*']">
          {renderInline(line.slice(2))}
        </p>,
      )
    } else if (line.includes("|")) {
      nodes.push(
        <pre key={index} className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-[#C7CBD1]">
          {line}
        </pre>,
      )
    } else {
      nodes.push(
        <p key={index} className="text-sm leading-6 text-[#C7CBD1]">
          {renderInline(line)}
        </p>,
      )
    }
  }

  return <div className={cn("space-y-1", className)}>{nodes}</div>
}
