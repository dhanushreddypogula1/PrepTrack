"""
src/rag/retriever.py
RAG-based chat assistant for placement questions.

On first call, loads documents from rag_data/, chunks them, embeds with
sentence-transformers, and stores a FAISS index. Cached to disk so
subsequent starts are instant.

Public API: answer_with_rag(question, history)
"""
import os
import pickle
from typing import List

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

from src.gemini_advisor import _safe_generate

# ── Paths ─────────────────────────────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAG_DATA_DIR = os.path.join(ROOT, "rag_data")
INDEX_PATH = os.path.join(RAG_DATA_DIR, "faiss.index")
CHUNKS_PATH = os.path.join(RAG_DATA_DIR, "chunks.pkl")
KNOWLEDGE_FILE = os.path.join(RAG_DATA_DIR, "knowledge.md")

# ── Config ────────────────────────────────────────────────────────────
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # 80MB, fast, decent quality
CHUNK_SIZE = 500                        # chars
CHUNK_OVERLAP = 80
TOP_K = 4

os.makedirs(RAG_DATA_DIR, exist_ok=True)

# ── Lazy-loaded singletons ────────────────────────────────────────────
_embedder: SentenceTransformer | None = None
_index: faiss.Index | None = None
_chunks: List[str] = []


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        print("📦 Loading sentence-transformer (one-time download ~80MB)...")
        _embedder = SentenceTransformer(EMBEDDING_MODEL)
    return _embedder


# ── Chunking ──────────────────────────────────────────────────────────
def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split into overlapping fixed-size chunks (preserves paragraph boundaries when possible)."""
    text = text.strip()
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        # Try to break at last paragraph/sentence boundary inside the window
        if end < len(text):
            last_para = text.rfind("\n\n", start, end)
            last_period = text.rfind(". ", start, end)
            cut = max(last_para, last_period)
            if cut > start + size // 2:
                end = cut + 1
        chunks.append(text[start:end].strip())
        start = end - overlap
    return [c for c in chunks if len(c) > 50]


def _load_documents() -> List[str]:
    """Read all .md and .txt files from rag_data/ as one corpus, then chunk."""
    all_chunks = []
    for fname in os.listdir(RAG_DATA_DIR):
        if fname.endswith((".md", ".txt")):
            path = os.path.join(RAG_DATA_DIR, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                all_chunks.extend(_chunk_text(content))
            except Exception as e:
                print(f"  Could not read {fname}: {e}")
    return all_chunks


# ── Index build / load ────────────────────────────────────────────────
def _build_index() -> tuple[faiss.Index, List[str]]:
    print("🛠️  Building FAISS index from rag_data/...")
    chunks = _load_documents()
    if not chunks:
        # Fallback chunk so the chat still works
        chunks = ["No knowledge base loaded yet. Add markdown files to rag_data/."]

    embedder = _get_embedder()
    embeddings = embedder.encode(chunks, show_progress_bar=False, convert_to_numpy=True)
    embeddings = embeddings.astype(np.float32)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # inner product = cosine similarity (after normalization)
    faiss.normalize_L2(embeddings)
    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks, f)
    print(f"✅ Indexed {len(chunks)} chunks → {INDEX_PATH}")
    return index, chunks


def _load_or_build():
    global _index, _chunks
    if _index is not None and _chunks:
        return _index, _chunks
    if os.path.exists(INDEX_PATH) and os.path.exists(CHUNKS_PATH):
        try:
            _index = faiss.read_index(INDEX_PATH)
            with open(CHUNKS_PATH, "rb") as f:
                _chunks = pickle.load(f)
            return _index, _chunks
        except Exception as e:
            print(f"  Failed to load cached index: {e}. Rebuilding...")
    _index, _chunks = _build_index()
    return _index, _chunks


def rebuild_index():
    """Force a rebuild — call after editing rag_data/ files."""
    global _index, _chunks
    _index, _chunks = _build_index()


# ── Retrieval ─────────────────────────────────────────────────────────
def _retrieve(query: str, k: int = TOP_K) -> List[str]:
    index, chunks = _load_or_build()
    if not chunks:
        return []
    embedder = _get_embedder()
    q_emb = embedder.encode([query], convert_to_numpy=True).astype(np.float32)
    faiss.normalize_L2(q_emb)
    scores, ids = index.search(q_emb, min(k, len(chunks)))
    return [chunks[i] for i in ids[0] if 0 <= i < len(chunks)]


# ── Public API ────────────────────────────────────────────────────────
def answer_with_rag(question: str, history: List[dict] | None = None) -> str:
    """
    Answer a question using RAG.
    `history` is a list of {"role": "user"|"assistant", "content": "..."}.
    """
    context_chunks = _retrieve(question, k=TOP_K)
    context = "\n\n---\n\n".join(context_chunks) if context_chunks else "(no relevant context found)"

    history_str = ""
    if history:
        last_msgs = history[-6:]   # keep last 3 turns
        history_str = "\n".join(f"{m['role'].capitalize()}: {m['content']}" for m in last_msgs)

    prompt = f"""You are PrepTrack — an AI mentor for Indian engineering students preparing for campus placements.
Answer the user's question using the context below. If the context doesn't contain the answer, use your general knowledge but say so honestly.
Be concise, encouraging, and practical. Use markdown for formatting.

=== Retrieved Context ===
{context}

=== Conversation History ===
{history_str if history_str else "(no prior messages)"}

=== Current Question ===
{question}

Answer:"""
    return _safe_generate(prompt, "Could not generate an answer right now.")


if __name__ == "__main__":
    # Smoke test
    print(answer_with_rag("How should I prepare for Google interviews?")[:600])
    print("\n---\n")
    print(answer_with_rag("What is the difference between TCS Prime and TCS Ninja?")[:400])