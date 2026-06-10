import { notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { ToolWorkbench } from "@/components/tools/tool-workbench"
import { getTool, tools, ToolId } from "@/lib/tools"

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.id }))
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: toolId } = await params
  const tool = getTool(toolId)
  if (!tool) notFound()

  return (
    <>
      <Navbar />
      <ToolWorkbench toolId={tool.id as ToolId} />
    </>
  )
}
