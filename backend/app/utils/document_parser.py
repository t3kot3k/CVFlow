import io
from typing import Optional
from PyPDF2 import PdfReader
from docx import Document


def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text content from a PDF file.

    Args:
        file_content: The PDF file content as bytes.

    Returns:
        Extracted text from all pages.
    """
    pdf_file = io.BytesIO(file_content)
    reader = PdfReader(pdf_file)

    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    return "\n\n".join(text_parts)


def extract_text_from_docx(file_content: bytes) -> str:
    """
    Extract text content from a DOCX file.

    Args:
        file_content: The DOCX file content as bytes.

    Returns:
        Extracted text from all paragraphs.
    """
    docx_file = io.BytesIO(file_content)
    doc = Document(docx_file)

    text_parts = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    # Also extract text from tables
    for table in doc.tables:
        for row in table.rows:
            row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_text:
                text_parts.append(" | ".join(row_text))

    return "\n".join(text_parts)


def extract_text_from_file(
    file_content: bytes,
    content_type: str,
    filename: Optional[str] = None,
) -> str:
    """
    Extract text from a file based on its content type.

    Args:
        file_content: The file content as bytes.
        content_type: The MIME type of the file.
        filename: Optional filename for additional type detection.

    Returns:
        Extracted text content.

    Raises:
        ValueError: If the file type is not supported.
    """
    # Determine file type
    is_pdf = (
        content_type == "application/pdf"
        or (filename and filename.lower().endswith(".pdf"))
    )
    is_docx = (
        content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        or (filename and filename.lower().endswith(".docx"))
    )

    if is_pdf:
        return extract_text_from_pdf(file_content)
    elif is_docx:
        return extract_text_from_docx(file_content)
    else:
        raise ValueError(
            f"Unsupported file type: {content_type}. "
            "Please upload a PDF or DOCX file."
        )


def validate_file(
    file_content: bytes,
    content_type: str,
    max_size_mb: int = 10,
) -> tuple[bool, Optional[str]]:
    """
    Validate a file for CV upload.

    Args:
        file_content: The file content as bytes.
        content_type: The MIME type of the file.
        max_size_mb: Maximum allowed file size in MB.

    Returns:
        Tuple of (is_valid, error_message).
    """
    # Check file size
    size_mb = len(file_content) / (1024 * 1024)
    if size_mb > max_size_mb:
        return False, f"File too large. Maximum size is {max_size_mb}MB."

    # Check file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if content_type not in allowed_types:
        return False, "Invalid file type. Please upload a PDF or DOCX file."

    # Check if file is empty
    if len(file_content) == 0:
        return False, "File is empty."

    return True, None
