"""Document parsing utilities for CV import."""

from io import BytesIO
from typing import Optional
import PyPDF2


def parse_pdf(file_bytes: bytes) -> str:
    """Extract text content from a PDF file."""
    reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    text_parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_parts.append(text.strip())
    return "\n\n".join(text_parts)


def parse_docx(file_bytes: bytes) -> str:
    """Extract text content from a DOCX file."""
    from docx import Document

    doc = Document(BytesIO(file_bytes))
    text_parts = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text.strip())
    return "\n\n".join(text_parts)


def parse_document(file_bytes: bytes, filename: str) -> Optional[str]:
    """Parse a document based on its file extension."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif lower.endswith(".docx"):
        return parse_docx(file_bytes)
    elif lower.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")
    return None
