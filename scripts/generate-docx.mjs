#!/usr/bin/env node
/**
 * Script que convierte TEAM-05-FULL-DOCUMENTATION.md a un documento .docx
 * con formato profesional (tablas, código, headings, listas).
 * 
 * Salida: C:\Users\saule\OneDrive\Documentos\Programación Web\TEAM-05-TurboPapus-Documentacion-Completa.docx
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, 
         Table, TableRow, TableCell, WidthType, AlignmentType, 
         BorderStyle, ShadingType, convertInchesToTwip } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MD_PATH = path.resolve(__dirname, '..', 'docs', 'TEAM-05-FULL-DOCUMENTATION.md');
const OUTPUT_PATH = 'C:\\Users\\saule\\OneDrive\\Documentos\\Programación Web\\TEAM-05-TurboPapus-Documentacion-Completa.docx';

// ─── Colores corporativos ─────────────────────────────────────
const COLORS = {
  primary: '2B579A',
  secondary: '1A1A2E',
  codeBg: 'F5F5F5',
  tableHeader: '2B579A',
  tableHeaderText: 'FFFFFF',
  text: '333333',
  link: '0066CC',
};

// ─── Parse helpers ────────────────────────────────────────────
function parseMarkdown(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      i++;
      continue;
    }
    
    // Heading
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, content: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, content: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, content: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'heading', level: 4, content: line.slice(5).trim() });
      i++;
      continue;
    }
    
    // Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }
    
    // Horizontal rule
    if (line.trim() === '---') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }
    
    // Empty line
    if (line.trim() === '') {
      blocks.push({ type: 'spacer' });
      i++;
      continue;
    }
    
    // List item
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'list', items: listItems });
      continue;
    }
    
    // Paragraph (with possible bold markers)
    if (line.trim()) {
      blocks.push({ type: 'paragraph', content: line.trim() });
      i++;
      continue;
    }
    
    i++;
  }
  
  return blocks;
}

function parseInlineFormatting(text) {
  // Split by **bold** markers
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return { text: part.slice(2, -2), bold: true };
    }
    return { text: part, bold: false };
  });
}

function parseTable(lines) {
  if (lines.length < 2) return null;
  
  const rows = lines.map(l => 
    l.split('|')
      .slice(1, -1)
      .map(c => c.trim())
  );
  
  // Filter out separator row
  const dataRows = rows.filter(r => !r.some(c => c.includes('---')));
  if (dataRows.length === 0) return null;
  
  const header = dataRows[0];
  const data = dataRows.slice(1);
  
  return { header, data };
}

// ─── Document builder ─────────────────────────────────────────
async function buildDocument(blocks) {
  const children = [];
  
  // Title page
  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      children: [
        new TextRun({ text: 'TEAM-05 "TurboPapus"', bold: true, size: 52, color: COLORS.primary }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Documentación Completa del Proyecto', size: 36, color: COLORS.secondary }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Plataforma de Inversiones con IA — Módulo de Cobertura Institucional', size: 24, color: '666666' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Mayo 2026', size: 22, color: '888888' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
  );
  
  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const headingLevel = block.level;
        let headingSize;
        let headingBefore = 200;
        
        if (headingLevel === 1) { headingSize = 32; headingBefore = 400; }
        else if (headingLevel === 2) { headingSize = 26; headingBefore = 300; }
        else if (headingLevel === 3) { headingSize = 22; headingBefore = 200; }
        else { headingSize = 20; headingBefore = 150; }
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                bold: true,
                size: headingSize,
                color: COLORS.primary,
              }),
            ],
            spacing: { before: headingBefore, after: 120 },
            border: headingLevel <= 2 ? {
              bottom: { color: COLORS.primary, size: 6, style: BorderStyle.SINGLE, space: 4 },
            } : undefined,
          })
        );
        break;
      }
      
      case 'paragraph': {
        const parts = parseInlineFormatting(block.content);
        children.push(
          new Paragraph({
            children: parts.map(p => new TextRun({
              text: p.text,
              bold: p.bold || false,
              size: 22,
              color: COLORS.text,
            })),
            spacing: { after: 100 },
          })
        );
        break;
      }
      
      case 'list': {
        for (const item of block.items) {
          const parts = parseInlineFormatting(item);
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: '•  ', size: 22, color: COLORS.primary }),
                ...parts.map(p => new TextRun({
                  text: p.text,
                  bold: p.bold || false,
                  size: 22,
                  color: COLORS.text,
                })),
              ],
              spacing: { after: 60 },
              indent: { left: convertInchesToTwip(0.3) },
            })
          );
        }
        break;
      }
      
      case 'code': {
        const codeLines = block.content.split('\n');
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: block.lang ? `  ${block.lang}` : '', size: 18, color: '888888', italics: true }),
            ],
            spacing: { before: 120, after: 0 },
            shading: { type: ShadingType.CLEAR, color: COLORS.codeBg },
          })
        );
        
        for (const codeLine of codeLines) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: codeLine || ' ',
                  font: 'Consolas',
                  size: 18,
                  color: COLORS.secondary,
                }),
              ],
              spacing: { after: 0, before: 0 },
              indent: { left: convertInchesToTwip(0.2) },
              shading: { type: ShadingType.CLEAR, color: COLORS.codeBg },
            })
          );
        }
        
        children.push(new Paragraph({ spacing: { after: 120 } }));
        break;
      }
      
      case 'table': {
        const parsed = parseTable(block.lines);
        if (parsed) {
          const colWidths = parsed.header.map(() => WidthType.AUTO);
          
          const tableRows = [];
          
          // Header row
          tableRows.push(
            new TableRow({
              tableHeader: true,
              children: parsed.header.map(h => new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: h, bold: true, size: 20, color: COLORS.tableHeaderText })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: COLORS.tableHeader },
                width: { size: 100 / parsed.header.length, type: WidthType.PERCENTAGE },
              })),
            })
          );
          
          // Data rows
          for (const rowData of parsed.data) {
            while (rowData.length < parsed.header.length) rowData.push('');
            tableRows.push(
              new TableRow({
                children: rowData.map((cell, ci) => new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20, color: COLORS.text })],
                    }),
                  ],
                })),
              })
            );
          }
          
          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ spacing: { after: 120 } })
          );
        }
        break;
      }
      
      case 'hr': {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '____________________________________________________________', size: 16, color: 'CCCCCC' })],
            spacing: { before: 200, after: 200 },
          })
        );
        break;
      }
      
      case 'spacer': {
        children.push(new Paragraph({ spacing: { after: 60 } }));
        break;
      }
    }
  }
  
  return children;
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('📖 Leyendo documentación markdown...');
  const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
  console.log(`   ${(mdContent.length / 1024).toFixed(0)} KB leídos`);
  
  console.log('🔍 Parseando markdown...');
  const blocks = parseMarkdown(mdContent);
  console.log(`   ${blocks.length} bloques identificados`);
  
  console.log('📄 Generando documento Word...');
  const children = await buildDocument(blocks);
  
  const doc = new Document({
    title: 'TEAM-05 TurboPapus - Documentación Completa',
    description: 'Documentación completa del módulo de cobertura institucional',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            right: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.8),
          },
        },
      },
      children,
    }],
  });
  
  console.log('💾 Empaquetando documento...');
  const buffer = await Packer.toBuffer(doc);
  
  console.log(`📁 Escribiendo archivo: ${OUTPUT_PATH}`);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  
  const sizeKB = (buffer.length / 1024).toFixed(1);
  console.log(`✅ Documento generado exitosamente!`);
  console.log(`   Ruta: ${OUTPUT_PATH}`);
  console.log(`   Tamaño: ${sizeKB} KB`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
