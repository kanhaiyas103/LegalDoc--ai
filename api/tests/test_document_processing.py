from app.services.document_processing import chunk_text


def test_chunk_text_preserves_order_and_overlap() -> None:
    text = " ".join(f"clause-{index}" for index in range(500))
    chunks = chunk_text(text, chunk_size=300, overlap=40)

    assert len(chunks) > 1
    assert chunks[0]["chunk_index"] == 0
    assert chunks[1]["chunk_index"] == 1
    assert "clause-0" in chunks[0]["content"]
