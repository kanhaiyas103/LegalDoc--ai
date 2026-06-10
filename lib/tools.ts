import {
  BadgeCheck,
  ClipboardCheck,
  FileQuestion,
  FileSearch,
  FileText,
  Gavel,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export type ToolId =
  | "document-analyzer"
  | "risk-scorer"
  | "clause-extractor"
  | "contract-drafter"
  | "nda-generator"
  | "legal-qa"
  | "plain-english"

export type ToolConfig = {
  id: ToolId
  name: string
  category: "Analyze" | "Draft" | "Understand"
  description: string
  placeholder: string
  action: string
  icon: typeof FileSearch
  needsDocument: boolean
}

export const tools: ToolConfig[] = [
  {
    id: "document-analyzer",
    name: "Document Analyzer",
    category: "Analyze",
    description: "Key facts, obligations, risks, missing protections, and negotiation leverage.",
    placeholder: "Paste a contract, notice, policy, term sheet, or uploaded document text.",
    action: "Analyze document",
    icon: FileSearch,
    needsDocument: true,
  },
  {
    id: "risk-scorer",
    name: "Risk Scorer",
    category: "Analyze",
    description: "Clause-by-clause risk score with contribution percentages and mitigation notes.",
    placeholder: "Paste the contract text to score.",
    action: "Score risk",
    icon: ShieldCheck,
    needsDocument: true,
  },
  {
    id: "clause-extractor",
    name: "Clause Extractor",
    category: "Analyze",
    description: "Extracts and explains termination, indemnity, payment, IP, jurisdiction, and more.",
    placeholder: "Paste a legal document to classify its clauses.",
    action: "Extract clauses",
    icon: ClipboardCheck,
    needsDocument: true,
  },
  {
    id: "contract-drafter",
    name: "Contract Drafter",
    category: "Draft",
    description: "Generates a jurisdiction-aware contract from a short commercial brief.",
    placeholder: "Example: Draft a service agreement between an Indian SaaS company and a client for a 12-month support contract.",
    action: "Draft contract",
    icon: PenLine,
    needsDocument: false,
  },
  {
    id: "nda-generator",
    name: "NDA Generator",
    category: "Draft",
    description: "Creates one-way or mutual NDAs with Indian-law dispute resolution.",
    placeholder: "Party A, Party B, purpose, duration, confidentiality period, mutual or one-way.",
    action: "Generate NDA",
    icon: FileText,
    needsDocument: false,
  },
  {
    id: "legal-qa",
    name: "Legal Q&A",
    category: "Understand",
    description: "Answers Indian-law questions with confidence and citation-style grounding.",
    placeholder: "Ask a question about Indian law or the loaded document.",
    action: "Ask question",
    icon: FileQuestion,
    needsDocument: false,
  },
  {
    id: "plain-english",
    name: "Plain English",
    category: "Understand",
    description: "Turns dense legal text into plain-English meaning, impact, and watch-outs.",
    placeholder: "Paste a clause or legal paragraph to explain.",
    action: "Simplify text",
    icon: Sparkles,
    needsDocument: false,
  },
]

export const categoryIcons = {
  Analyze: BadgeCheck,
  Draft: PenLine,
  Understand: Gavel,
}

export function getTool(id: string) {
  return tools.find((tool) => tool.id === id)
}
