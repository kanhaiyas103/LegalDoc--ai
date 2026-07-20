"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart3, FileText, Gauge, Scale } from "lucide-react"
import { AnimatedContainer, MetricCard } from "@/components/ui/premium"
import { backendFetch } from "@/lib/backend-api"

type DocumentRow = {
  id: string
}

type AnalysisRow = {
  id: string
  risk_score?: number
}

export function DashboardMetrics() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      const [documentsResponse, analysesResponse] = await Promise.all([backendFetch("/documents"), backendFetch("/analyses/recent")])
      if (!mounted) return
      setDocuments(documentsResponse.ok ? await documentsResponse.json() : [])
      setAnalyses(analysesResponse.ok ? await analysesResponse.json() : [])
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const averageRisk = useMemo(() => {
    const scores = analyses.map((analysis) => analysis.risk_score).filter((score): score is number => typeof score === "number")
    if (!scores.length) return "Not scored"
    return String(Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length))
  }, [analyses])

  const stats = [
    { label: "Documents analyzed", value: String(documents.length), detail: "Stored documents available for review.", icon: <FileText className="size-5" /> },
    { label: "Average risk score", value: averageRisk, detail: "Calculated from generated risk reports.", icon: <Gauge className="size-5" /> },
    { label: "Recent analyses", value: String(analyses.length), detail: "Latest saved AI review outputs.", icon: <BarChart3 className="size-5" /> },
    { label: "Jurisdiction", value: "India", detail: "Indian contract review and drafting context.", icon: <Scale className="size-5" /> },
  ]

  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <AnimatedContainer key={stat.label} delay={0.05 * index}>
          <MetricCard {...stat} />
        </AnimatedContainer>
      ))}
    </section>
  )
}
