import json
from typing import Any

from openai import OpenAI

from app.core.config import get_settings
from app.schemas import ToolId


TOOL_SCHEMAS: dict[ToolId, str] = {
    "document-analyzer": "Return executive_summary, key_parties, obligations, risks, missing_protections, negotiation_suggestions, citations.",
    "clause-extractor": "Return clauses for Payment, Termination, Confidentiality, IP, Indemnity, Governing Law, Jurisdiction.",
    "risk-scorer": "Return risk_score 0-100, risk_level, risk_factors, recommendations.",
    "plain-english": "Return simplified_summary, practical_effect, watch_outs.",
    "nda-generator": "Return complete_nda with Indian-law clauses and negotiation notes.",
    "contract-drafter": "Return complete_contract with Indian-law boilerplate and schedules.",
    "legal-qa": "Return answer, reasoning, citations, confidence.",
}


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    def _fallback(self, tool: ToolId, text: str) -> dict[str, Any]:
        return {
            "summary": "OpenAI is not configured. Add OPENAI_API_KEY to enable production AI output.",
            "tool": tool,
            "preview": text[:1200],
            "citations": ["Indian Contract Act, 1872", "Arbitration and Conciliation Act, 1996"],
            "confidence": "low",
        }

    def generate_tool_result(self, *, tool: ToolId, text: str, prompt: str | None = None, context: str | None = None) -> dict[str, Any]:
        if not self.client:
            return self._fallback(tool, text)

        system = (
            "You are LegalDoc, an AI legal document analysis assistant for Indian law. "
            "You are not a lawyer and must not provide legal advice. "
            "Return strict JSON only. Be specific, practical, and cite source snippets when context is provided."
        )
        user = {
            "tool": tool,
            "required_schema": TOOL_SCHEMAS[tool],
            "instructions": prompt,
            "document_or_brief": text[:80_000],
            "retrieved_context": context,
        }
        response = self.client.chat.completions.create(
            model=self.settings.openai_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user)},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        return json.loads(raw)

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not self.client:
            return [[] for _ in texts]
        response = self.client.embeddings.create(model=self.settings.openai_embedding_model, input=texts)
        return [item.embedding for item in response.data]

    def answer_with_context(self, *, question: str, context: list[dict[str, Any]]) -> dict[str, Any]:
        if not self.client:
            return {
                "answer": "OpenAI is not configured. Once OPENAI_API_KEY is set, LegalDoc will answer using retrieved document chunks.",
                "confidence": 0.1,
            }
        response = self.client.chat.completions.create(
            model=self.settings.openai_model,
            temperature=0.1,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Answer questions about uploaded legal documents under Indian-law context. Use only retrieved context. Return JSON with answer and confidence.",
                },
                {"role": "user", "content": json.dumps({"question": question, "context": context})},
            ],
        )
        return json.loads(response.choices[0].message.content or "{}")

    def answer_legal_question(self, *, question: str) -> dict[str, Any]:
        if not self.client:
            return {
                "answer": "OpenAI is not configured. Add OPENAI_API_KEY to enable general Indian-law Q&A.",
                "confidence": 0.1,
            }
        response = self.client.chat.completions.create(
            model=self.settings.openai_model,
            temperature=0.15,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are LegalDoc, an Indian-law legal information assistant. "
                        "Answer general legal questions clearly and practically. "
                        "Do not claim to be a lawyer, do not provide legal advice, and recommend consulting counsel for high-stakes decisions. "
                        "Return strict JSON with answer and confidence."
                    ),
                },
                {"role": "user", "content": json.dumps({"question": question})},
            ],
        )
        return json.loads(response.choices[0].message.content or "{}")


def to_markdown(tool: ToolId, result: dict[str, Any]) -> str:
    title = tool.replace("-", " ").title()
    lines = [f"# {title}"]
    for key, value in result.items():
        heading = key.replace("_", " ").title()
        lines.append(f"\n## {heading}")
        if isinstance(value, list):
            lines.extend(f"- {item}" if not isinstance(item, dict) else f"- {json.dumps(item, ensure_ascii=False)}" for item in value)
        elif isinstance(value, dict):
            lines.append(json.dumps(value, indent=2, ensure_ascii=False))
        else:
            lines.append(str(value))
    return "\n".join(lines)
