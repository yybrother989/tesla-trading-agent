'use client';

import React from 'react';

interface FormattedReportProps {
  content: string;
  reportType?: 'market' | 'sentiment' | 'news' | 'fundamental';
}

/**
 * FormattedReport Component
 * 
 * Transforms raw report text into a beautifully formatted, reader-friendly display.
 * Handles:
 * - Headers (###, ####)
 * - Lists (bullets, numbered)
 * - Tables (markdown format)
 * - Key-value pairs
 * - Paragraphs
 * - Emphasis and highlights
 */
export const FormattedReport: React.FC<FormattedReportProps> = ({ content, reportType = 'fundamental' }) => {
  if (!content || content.trim().length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p>No content available</p>
      </div>
    );
  }

  // Parse content into structured elements
  const elements = parseContent(content);

  return (
    <div className="formatted-report space-y-4 max-w-none">
      {elements.map((element, index) => {
        const rendered = renderElement(element);
        return rendered ? (
          <React.Fragment key={index}>
            {rendered}
          </React.Fragment>
        ) : null;
      })}
    </div>
  );
};

interface ContentElement {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'paragraph' | 'list' | 'table' | 'divider' | 'highlight';
  content: string;
  items?: string[];
  rows?: string[][];
  level?: number;
}

function parseContent(content: string): ContentElement[] {
  const elements: ContentElement[] = [];
  const lines = content.split('\n');
  
  let currentParagraph: string[] = [];
  let currentList: string[] = [];
  let currentTable: string[][] = [];
  let inTable = false;
  let tableHeaders: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text.length > 0) {
        elements.push({ type: 'paragraph', content: text });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push({ type: 'list', items: [...currentList] });
      currentList = [];
    }
  };

  const flushTable = () => {
    if (currentTable.length > 0 && tableHeaders.length > 0) {
      elements.push({ type: 'table', rows: [tableHeaders, ...currentTable] });
      currentTable = [];
      tableHeaders = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // Headers (### Header or #### Header)
    if (line.match(/^#{1,6}\s+/)) {
      flushParagraph();
      flushList();
      flushTable();
      const match = line.match(/^(#{1,6})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        elements.push({
          type: level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4',
          content: text,
          level,
        });
      }
      continue;
    }

    // Tables (markdown format: | col1 | col2 |)
    if (line.includes('|') && line.split('|').length >= 3) {
      flushParagraph();
      flushList();
      
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);

      // Check if this is a separator row (|---|)
      if (cells.every(cell => /^-+$/.test(cell))) {
        continue; // Skip separator rows
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        currentTable.push(cells);
      }
      continue;
    }

    // If we were in a table but this line isn't a table row, flush it
    if (inTable && !line.includes('|')) {
      flushTable();
    }

    // Lists (starting with -, *, •, or numbers, or ** for bold items)
    if (
      line.match(/^[-*•]\s+/) || 
      line.match(/^\d+[.)]\s+/) || 
      line.match(/^[a-z]\)\s+/i) ||
      (line.match(/^\*\*/) && line.length < 100) // Short bold lines are often list items
    ) {
      flushParagraph();
      flushTable();
      
      // Handle **bold** list items specially
      let listItem = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .replace(/^[a-z]\)\s+/i, '')
        .trim();
      
      // If it starts with ** but doesn't end with **, it might be a continuation
      if (listItem.startsWith('**') && !listItem.endsWith('**') && !listItem.includes('**:')) {
        // Treat as list item anyway
      }
      
      if (listItem.length > 0) {
        currentList.push(listItem);
      }
      continue;
    }

    // If we have a list but this line isn't a list item, flush it
    if (currentList.length > 0 && !line.match(/^[-*•\d]/)) {
      flushList();
    }

    // Regular paragraph content
    currentParagraph.push(line);
  }

  // Flush remaining content
  flushParagraph();
  flushList();
  flushTable();

  return elements;
}

function renderElement(element: ContentElement): React.ReactNode {
  switch (element.type) {
    case 'h1':
      return (
        <h1 className="text-3xl font-bold text-foreground mt-8 mb-4 pb-2 border-b border-border">
          {element.content}
        </h1>
      );

    case 'h2':
      return (
        <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3">
          {element.content}
        </h2>
      );

    case 'h3':
      return (
        <h3 className="text-xl font-semibold text-foreground mt-5 mb-2 text-tesla-red">
          {element.content}
        </h3>
      );

    case 'h4':
      return (
        <h4 className="text-lg font-medium text-foreground mt-4 mb-2">
          {element.content}
        </h4>
      );

    case 'paragraph':
      // Skip paragraphs that are just whitespace or very short
      if (element.content.trim().length < 3) {
        return null;
      }
      
      // Check if paragraph contains key-value pattern (Key: Value)
      const kvMatch = element.content.match(/^([^:]+):\s*(.+)$/);
      if (kvMatch && kvMatch[1].length < 50 && kvMatch[1].trim().split(' ').length <= 5) {
        return (
          <div className="flex items-start space-x-4 py-2">
            <span className="font-semibold text-foreground min-w-[150px] flex-shrink-0">
              {kvMatch[1].trim()}:
            </span>
            <span className="text-foreground leading-relaxed flex-1">
              {formatInlineText(kvMatch[2].trim())}
            </span>
          </div>
        );
      }
      
      return (
        <p className="text-foreground leading-relaxed">
          {formatInlineText(element.content)}
        </p>
      );

    case 'list':
      return (
        <ul className="list-disc list-outside space-y-2 ml-6 text-foreground">
          {element.items?.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );

    case 'table':
      if (!element.rows || element.rows.length === 0) return null;
      
      const [headers, ...rows] = element.rows;
      
      // Filter out empty rows
      const validRows = rows.filter(row => row.some(cell => cell.trim().length > 0));
      
      if (validRows.length === 0) return null;
      
      return (
        <div className="overflow-x-auto my-6 rounded-lg border border-border">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-card border-b-2 border-border">
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border/50 last:border-r-0"
                  >
                    {formatInlineText(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-border/50 transition-colors ${
                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-card/30'
                  } hover:bg-card/60`}
                >
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="px-4 py-3 text-sm text-foreground border-r border-border/30 last:border-r-0"
                    >
                      {formatInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'divider':
      return <hr className="my-6 border-border" />;

    case 'highlight':
      return (
        <div className="bg-info/10 border-l-4 border-tesla-red p-4 my-4 rounded-r">
          <p className="text-foreground leading-relaxed">
            {formatInlineText(element.content)}
          </p>
        </div>
      );

    default:
      return null;
  }
}

/**
 * Format inline text (bold, emphasis, etc.)
 */
function formatInlineText(text: string): React.ReactNode {
  // Split by markdown patterns and create React elements
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Pattern for **bold**
  const boldPattern = /\*\*(.+?)\*\*/g;
  // Pattern for *italic*
  const italicPattern = /\*(.+?)\*/g;
  // Pattern for `code`
  const codePattern = /`(.+?)`/g;

  const allMatches: Array<{ index: number; length: number; type: 'bold' | 'italic' | 'code'; content: string }> = [];

  // Find all matches
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'bold',
      content: match[1],
    });
  }

  while ((match = italicPattern.exec(text)) !== null) {
    // Skip if it's already part of a bold match
    const isInBold = allMatches.some(m => m.type === 'bold' && match.index >= m.index && match.index < m.index + m.length);
    if (!isInBold) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'italic',
        content: match[1],
      });
    }
  }

  while ((match = codePattern.exec(text)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'code',
      content: match[1],
    });
  }

  // Sort by index
  allMatches.sort((a, b) => a.index - b.index);

  // Build React elements
  let lastEnd = 0;
  
  allMatches.forEach((match, idx) => {
    // Add text before match
    if (match.index > lastEnd) {
      parts.push(text.substring(lastEnd, match.index));
    }

    // Add matched element
    switch (match.type) {
      case 'bold':
        parts.push(
          <strong key={`bold-${idx}`} className="font-semibold text-foreground">
            {match.content}
          </strong>
        );
        break;
      case 'italic':
        parts.push(
          <em key={`italic-${idx}`} className="italic text-foreground">
            {match.content}
          </em>
        );
        break;
      case 'code':
        parts.push(
          <code key={`code-${idx}`} className="bg-card px-1.5 py-0.5 rounded text-sm font-mono text-foreground border border-border">
            {match.content}
          </code>
        );
        break;
    }

    lastEnd = match.index + match.length;
  });

  // Add remaining text
  if (lastEnd < text.length) {
    parts.push(text.substring(lastEnd));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

