/**
 * Report Formatter Service
 * 
 * Transforms raw analyst reports into reader-friendly formatted content
 * Handles different report types and structures them for better readability
 */

export interface FormattedSection {
  type: 'header' | 'paragraph' | 'list' | 'keyValue' | 'divider' | 'highlight' | 'metric';
  content: string;
  level?: number; // For headers (1-6)
  items?: string[]; // For lists
  key?: string; // For key-value pairs
  value?: string;
  className?: string;
}

export interface FormattedReport {
  sections: FormattedSection[];
  metadata?: {
    generatedAt?: string;
    agent?: string;
  };
}

/**
 * Format raw report content into structured, readable sections
 */
export function formatReportContent(
  rawContent: string,
  reportType: 'market' | 'sentiment' | 'news' | 'fundamental'
): FormattedReport {
  if (!rawContent || rawContent.trim().length === 0) {
    return { sections: [] };
  }

  const sections: FormattedSection[] = [];
  const lines = rawContent.split('\n').filter(line => line.trim().length > 0);

  let currentParagraph: string[] = [];
  let inList = false;
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const para = currentParagraph.join(' ').trim();
      if (para.length > 0) {
        sections.push({
          type: 'paragraph',
          content: para,
        });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      sections.push({
        type: 'list',
        items: [...currentList],
      });
      currentList = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Detect headers (lines starting with #, ALL CAPS, or numbered sections)
    if (line.match(/^#{1,6}\s+/)) {
      flushParagraph();
      flushList();
      const level = (line.match(/^#+/) || [''])[0].length;
      const headerText = line.replace(/^#+\s+/, '').trim();
      sections.push({
        type: 'header',
        content: headerText,
        level: Math.min(level, 6) as 1 | 2 | 3 | 4 | 5 | 6,
      });
      continue;
    }

    // Detect headers (ALL CAPS lines or numbered sections like "1. ", "I. ", etc.)
    if (
      line === line.toUpperCase() &&
      line.length < 80 &&
      !line.match(/^[A-Z][^A-Z]*$/) && // Not a single word
      line.split(' ').length <= 8
    ) {
      flushParagraph();
      flushList();
      sections.push({
        type: 'header',
        content: line,
        level: 2,
      });
      continue;
    }

    // Detect numbered sections (1., 2., I., II., etc.)
    if (line.match(/^(\d+|[IVX]+)\.?\s+[A-Z]/)) {
      flushParagraph();
      flushList();
      const match = line.match(/^(\d+|[IVX]+)\.?\s+(.+)/);
      if (match) {
        sections.push({
          type: 'header',
          content: match[2],
          level: 3,
        });
      }
      continue;
    }

    // Detect list items (lines starting with -, *, •, or numbered bullets)
    if (line.match(/^[-*•]\s+/) || line.match(/^\d+[.)]\s+/)) {
      flushParagraph();
      if (!inList) {
        inList = true;
      }
      const listItem = line
        .replace(/^[-*•]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (listItem.length > 0) {
        currentList.push(listItem);
      }
      continue;
    }

    // Detect key-value pairs (Key: Value format)
    if (line.match(/^[A-Z][^:]*:\s+[A-Z]/) || line.match(/^[A-Za-z\s]+:\s*.+/)) {
      flushParagraph();
      flushList();
      const kvMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (kvMatch && kvMatch[1].length < 50) {
        sections.push({
          type: 'keyValue',
          key: kvMatch[1].trim(),
          value: kvMatch[2].trim(),
        });
        continue;
      }
    }

    // Detect dividers (lines with ---, ===, etc.)
    if (line.match(/^[-=_]{3,}$/)) {
      flushParagraph();
      flushList();
      sections.push({
        type: 'divider',
        content: '',
      });
      continue;
    }

    // Detect metrics/numbers at start (for financial data)
    if (reportType === 'fundamental' && line.match(/^[$€£¥]\d|^-?\d+\.?\d*%/)) {
      flushParagraph();
      flushList();
      sections.push({
        type: 'metric',
        content: line,
      });
      continue;
    }

    // Regular paragraph content
    flushList();
    currentParagraph.push(line);
  }

  // Flush any remaining content
  flushParagraph();
  flushList();

  // If no sections were created, treat entire content as paragraph
  if (sections.length === 0 && rawContent.trim().length > 0) {
    sections.push({
      type: 'paragraph',
      content: rawContent.trim(),
    });
  }

  return {
    sections,
    metadata: {
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Format report content specifically for each report type
 */
export function formatReportByType(
  rawContent: string,
  reportType: 'market' | 'sentiment' | 'news' | 'fundamental'
): FormattedReport {
  // Apply type-specific formatting
  let processedContent = rawContent;

  // Add type-specific enhancements
  switch (reportType) {
    case 'market':
      processedContent = enhanceMarketReport(processedContent);
      break;
    case 'sentiment':
      processedContent = enhanceSentimentReport(processedContent);
      break;
    case 'news':
      processedContent = enhanceNewsReport(processedContent);
      break;
    case 'fundamental':
      processedContent = enhanceFundamentalReport(processedContent);
      break;
  }

  return formatReportContent(processedContent, reportType);
}

/**
 * Enhance market report formatting
 */
function enhanceMarketReport(content: string): string {
  // Add structure to common market analysis patterns
  return content
    .replace(/(Technical Indicators?:)/gi, '\n## $1\n')
    .replace(/(Chart Pattern[s]?:)/gi, '\n## $1\n')
    .replace(/(Price Action:)/gi, '\n## $1\n')
    .replace(/(Support.*?Resistance)/gi, '\n## Support & Resistance\n');
}

/**
 * Enhance sentiment report formatting
 */
function enhanceSentimentReport(content: string): string {
  // Add structure to sentiment analysis
  return content
    .replace(/(Overall Sentiment:)/gi, '\n## $1\n')
    .replace(/(Social Media:)/gi, '\n## $1\n')
    .replace(/(News Sentiment:)/gi, '\n## $1\n')
    .replace(/(Analyst Consensus:)/gi, '\n## $1\n');
}

/**
 * Enhance news report formatting
 */
function enhanceNewsReport(content: string): string {
  // Add structure to news analysis
  return content
    .replace(/(Key News:)/gi, '\n## $1\n')
    .replace(/(Impact Analysis:)/gi, '\n## $1\n')
    .replace(/(Market Implications:)/gi, '\n## $1\n');
}

/**
 * Enhance fundamental report formatting
 */
function enhanceFundamentalReport(content: string): string {
  // Add structure to fundamental analysis
  return content
    .replace(/(Financial Metrics:)/gi, '\n## $1\n')
    .replace(/(Valuation:)/gi, '\n## $1\n')
    .replace(/(Financial Health:)/gi, '\n## $1\n')
    .replace(/(Key Ratios:)/gi, '\n## $1\n');
}

