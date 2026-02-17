"""PDF generation utilities for CVs and cover letters."""

from io import BytesIO
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.colors import HexColor


def generate_cv_pdf(cv_data: dict, template_id: str = "olive", page_size: str = "a4") -> bytes:
    """Generate a PDF from CV data."""
    buffer = BytesIO()
    size = A4 if page_size == "a4" else letter

    doc = SimpleDocTemplate(
        buffer,
        pagesize=size,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # Contact info
    contact = cv_data.get("contact_info", {})
    if contact.get("name"):
        name_style = ParagraphStyle(
            "Name",
            parent=styles["Heading1"],
            fontSize=22,
            spaceAfter=6,
        )
        story.append(Paragraph(contact["name"], name_style))

    contact_parts = []
    if contact.get("email"):
        contact_parts.append(contact["email"])
    if contact.get("phone"):
        contact_parts.append(contact["phone"])
    if contact.get("location"):
        contact_parts.append(contact["location"])
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), styles["Normal"]))
        story.append(Spacer(1, 12))

    # Summary
    summary = cv_data.get("summary")
    if summary:
        story.append(Paragraph("Professional Summary", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        story.append(Paragraph(summary, styles["Normal"]))
        story.append(Spacer(1, 12))

    # Experience
    experiences = cv_data.get("experience", [])
    if experiences:
        story.append(Paragraph("Experience", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        for exp in experiences:
            title_line = f"<b>{exp.get('job_title', '')}</b>"
            if exp.get("company"):
                title_line += f" — {exp['company']}"
            story.append(Paragraph(title_line, styles["Normal"]))

            date_line = ""
            if exp.get("start_date"):
                date_line = exp["start_date"]
                if exp.get("end_date"):
                    date_line += f" – {exp['end_date']}"
                elif exp.get("current"):
                    date_line += " – Present"
            if exp.get("location"):
                date_line += f" | {exp['location']}"
            if date_line:
                date_style = ParagraphStyle("Date", parent=styles["Normal"], textColor=HexColor("#666666"), fontSize=9)
                story.append(Paragraph(date_line, date_style))

            for bullet in exp.get("bullets", []):
                story.append(Paragraph(f"• {bullet}", styles["Normal"]))
            story.append(Spacer(1, 8))

    # Education
    education = cv_data.get("education", [])
    if education:
        story.append(Paragraph("Education", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        for edu in education:
            edu_line = f"<b>{edu.get('degree', '')}</b>"
            if edu.get("field"):
                edu_line += f" in {edu['field']}"
            if edu.get("school"):
                edu_line += f" — {edu['school']}"
            story.append(Paragraph(edu_line, styles["Normal"]))
            if edu.get("graduation_date"):
                date_style = ParagraphStyle("Date", parent=styles["Normal"], textColor=HexColor("#666666"), fontSize=9)
                story.append(Paragraph(edu["graduation_date"], date_style))
            story.append(Spacer(1, 6))

    # Skills
    skills = cv_data.get("skills", [])
    if skills:
        story.append(Paragraph("Skills", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        story.append(Paragraph(" • ".join(skills), styles["Normal"]))
        story.append(Spacer(1, 12))

    # Languages
    languages = cv_data.get("languages", [])
    if languages:
        story.append(Paragraph("Languages", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        story.append(Paragraph(" • ".join(languages), styles["Normal"]))
        story.append(Spacer(1, 12))

    # Certifications
    certifications = cv_data.get("certifications", [])
    if certifications:
        story.append(Paragraph("Certifications", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
        story.append(Spacer(1, 6))
        for cert in certifications:
            story.append(Paragraph(f"• {cert}", styles["Normal"]))
        story.append(Spacer(1, 12))

    doc.build(story)
    return buffer.getvalue()


def generate_cover_letter_pdf(paragraphs: list, letter_format: str = "us") -> bytes:
    """Generate a PDF from cover letter paragraphs."""
    buffer = BytesIO()
    size = letter if letter_format == "us" else A4

    doc = SimpleDocTemplate(
        buffer,
        pagesize=size,
        rightMargin=2.5 * cm,
        leftMargin=2.5 * cm,
        topMargin=3 * cm,
        bottomMargin=3 * cm,
    )

    styles = getSampleStyleSheet()
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=11,
        leading=16,
        spaceBefore=12,
    )

    story = []
    for paragraph in paragraphs:
        story.append(Paragraph(paragraph, body_style))

    doc.build(story)
    return buffer.getvalue()
