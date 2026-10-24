import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../types/resume';

export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  const { personal, experience, education, skills, projects, customSections, style } = data;

  const primaryHex = style.primaryColor || '#2563eb';
  // Strip '#' for docx color format
  const primaryColorClean = primaryHex.replace('#', '');

  const docParagraphs: (Paragraph | Table)[] = [];

  // 1. NAME HEADER
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: personal.fullName || 'Your Name',
          bold: true,
          size: 44, // 22pt
          color: primaryColorClean,
          font: 'Arial',
        }),
      ],
    })
  );

  // JOB TITLE SUBHEADER
  if (personal.jobTitle) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: personal.jobTitle.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            color: '555555',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // CONTACT INFO LINE
  const contactParts: string[] = [];
  if (personal.email) contactParts.push(personal.email);
  if (personal.phone) contactParts.push(personal.phone);
  if (personal.location) contactParts.push(personal.location);
  if (personal.website) contactParts.push(personal.website);
  if (personal.linkedin) contactParts.push(personal.linkedin);
  if (personal.github) contactParts.push(personal.github);

  if (contactParts.length > 0) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 18, // 9pt
            color: '666666',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Helper for Section Headings
  const createSectionHeading = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: primaryColorClean,
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24, // 12pt
          color: primaryColorClean,
          font: 'Arial',
        }),
      ],
    });
  };

  // 2. PROFESSIONAL SUMMARY
  if (personal.summary) {
    docParagraphs.push(createSectionHeading('Professional Summary'));
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: personal.summary,
            size: 20, // 10pt
            font: 'Arial',
            color: '333333',
          }),
        ],
      })
    );
  }

  // 3. WORK EXPERIENCE
  if (experience && experience.length > 0) {
    docParagraphs.push(createSectionHeading('Work Experience'));

    experience.forEach((exp) => {
      // Role & Company Row
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.jobTitle,
              bold: true,
              size: 22,
              font: 'Arial',
              color: '111111',
            }),
            new TextRun({
              text: `  —  ${exp.company}`,
              bold: true,
              size: 22,
              font: 'Arial',
              color: primaryColorClean,
            }),
            new TextRun({
              text: exp.location ? ` (${exp.location})` : '',
              size: 18,
              italics: true,
              font: 'Arial',
              color: '666666',
            }),
          ],
        })
      );

      // Date Range
      const dateText = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`;
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: dateText,
              size: 18,
              italics: true,
              font: 'Arial',
              color: '555555',
            }),
          ],
        })
      );

      // Bullet Highlights
      exp.highlights.forEach((bullet) => {
        if (bullet.trim()) {
          docParagraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 20,
                  font: 'Arial',
                  color: '333333',
                }),
              ],
            })
          );
        }
      });
    });
  }

  // 4. EDUCATION
  if (education && education.length > 0) {
    docParagraphs.push(createSectionHeading('Education'));

    education.forEach((edu) => {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              font: 'Arial',
              color: '111111',
            }),
            new TextRun({
              text: `  —  ${edu.institution}`,
              size: 20,
              font: 'Arial',
              color: '444444',
            }),
          ],
        })
      );

      const eduMeta = [
        edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '',
        edu.location || '',
        edu.gpa ? `GPA: ${edu.gpa}` : '',
      ]
        .filter(Boolean)
        .join('  |  ');

      if (eduMeta) {
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: eduMeta,
                size: 18,
                italics: true,
                font: 'Arial',
                color: '666666',
              }),
            ],
          })
        );
      }

      if (edu.description) {
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: edu.description,
                size: 19,
                font: 'Arial',
                color: '333333',
              }),
            ],
          })
        );
      }
    });
  }

  // 5. SKILLS
  if (skills && skills.length > 0) {
    docParagraphs.push(createSectionHeading('Skills & Technical Expertise'));

    skills.forEach((cat) => {
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${cat.categoryName}: `,
              bold: true,
              size: 20,
              font: 'Arial',
              color: '111111',
            }),
            new TextRun({
              text: cat.skills.join(', '),
              size: 20,
              font: 'Arial',
              color: '333333',
            }),
          ],
        })
      );
    });
  }

  // 6. PROJECTS
  if (projects && projects.length > 0) {
    docParagraphs.push(createSectionHeading('Projects'));

    projects.forEach((proj) => {
      docParagraphs.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 22,
              font: 'Arial',
              color: '111111',
            }),
            proj.techStack && proj.techStack.length > 0
              ? new TextRun({
                  text: `  [${proj.techStack.join(', ')}]`,
                  size: 18,
                  font: 'Arial',
                  color: primaryColorClean,
                })
              : new TextRun({ text: '' }),
          ],
        })
      );

      if (proj.description) {
        docParagraphs.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20,
                font: 'Arial',
                color: '333333',
              }),
            ],
          })
        );
      }

      proj.highlights?.forEach((hl) => {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: hl,
                size: 19,
                font: 'Arial',
                color: '444444',
              }),
            ],
          })
        );
      });
    });
  }

  // 7. CUSTOM SECTIONS
  if (customSections && customSections.length > 0) {
    customSections.forEach((cSection) => {
      if (cSection.items && cSection.items.length > 0) {
        docParagraphs.push(createSectionHeading(cSection.sectionTitle));

        cSection.items.forEach((item) => {
          docParagraphs.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              children: [
                new TextRun({
                  text: item.title,
                  bold: true,
                  size: 21,
                  font: 'Arial',
                  color: '111111',
                }),
                item.subtitle
                  ? new TextRun({
                      text: ` — ${item.subtitle}`,
                      size: 20,
                      font: 'Arial',
                      color: '444444',
                    })
                  : new TextRun({ text: '' }),
                item.date
                  ? new TextRun({
                      text: ` (${item.date})`,
                      size: 18,
                      italics: true,
                      font: 'Arial',
                      color: '666666',
                    })
                  : new TextRun({ text: '' }),
              ],
            })
          );

          if (item.description) {
            docParagraphs.push(
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: item.description,
                    size: 19,
                    font: 'Arial',
                    color: '333333',
                  }),
                ],
              })
            );
          }
        });
      }
    });
  }

  // Create Document object
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  // Pack into Blob and download
  const blob = await Packer.toBlob(doc);
  const fileName = `${personal.fullName.replace(/\s+/g, '_') || 'Resume'}_Document.docx`;
  saveAs(blob, fileName);
}
