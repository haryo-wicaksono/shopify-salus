#!/usr/bin/env node
/**
 * HTML Tag Balance Checker
 * 
 * This script parses an HTML file and reports unclosed/mismatched tags.
 * It ignores void elements (self-closing tags) and HTML comments.
 * 
 * Usage: node tag-balance-checker.js <html-file>
 */

const fs = require('fs');
const path = require('path');

// Void elements in HTML5 that don't need closing tags
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
  'command', 'keygen', 'menuitem'
]);

// Elements that are typically self-closing in Shopify/Liquid contexts
const OPTIONAL_VOID = new Set([
  'script', 'style', 'svg', 'path', 'rect', 'circle', 'line',
  'polyline', 'polygon', 'ellipse', 'g', 'defs', 'use', 'symbol',
  'stop', 'linearGradient', 'radialGradient', 'clipPath', 'mask',
  'pattern', 'image', 'text', 'tspan', 'textPath'
]);

function parseTag(line, lineNum) {
  const tags = [];
  const regex = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*?\/?\s*>/g;
  let match;
  
  while ((match = regex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || VOID_ELEMENTS.has(tagName);
    
    tags.push({
      tag: tagName,
      isClosing,
      isSelfClosing,
      line: lineNum,
      column: match.index + 1,
      full: fullTag.trim()
    });
  }
  
  return tags;
}

function checkBalance(htmlContent, sourceName = 'HTML') {
  const lines = htmlContent.split('\n');
  const stack = [];
  const errors = [];
  const allTags = [];
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const tags = parseTag(line, lineNum);
    
    tags.forEach(tag => {
      allTags.push(tag);
      
      if (VOID_ELEMENTS.has(tag.tag)) {
        return; // Skip void elements
      }
      
      if (tag.isSelfClosing && !tag.isClosing) {
        return; // Skip self-closing tags
      }
      
      if (tag.isClosing) {
        // Find matching opening tag
        let found = false;
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].tag === tag.tag) {
            // Remove everything from this tag to top (auto-close unclosed)
            const popped = stack.splice(i);
            if (popped.length > 1) {
              // There were unclosed tags in between
              popped.slice(0, -1).forEach(unclosed => {
                errors.push({
                  type: 'UNCLOSED_TAG',
                  tag: unclosed.tag,
                  openedAt: `${unclosed.line}:${unclosed.column}`,
                  closedBy: `${tag.tag} at ${tag.line}:${tag.column}`,
                  message: `Tag <${unclosed.tag}> opened at line ${unclosed.line} was never closed before </${tag.tag}> at line ${tag.line}`
                });
              });
            }
            found = true;
            break;
          }
        }
        
        if (!found) {
          errors.push({
            type: 'ORPHAN_CLOSE',
            tag: tag.tag,
            location: `${tag.line}:${tag.column}`,
            message: `Orphan closing tag </${tag.tag}> at line ${tag.line} (no matching opener)`
          });
        }
      } else {
        // Opening tag
        stack.push(tag);
      }
    });
  });
  
  // Any remaining tags in stack are unclosed
  stack.forEach(tag => {
    errors.push({
      type: 'UNCLOSED_AT_EOF',
      tag: tag.tag,
      openedAt: `${tag.line}:${tag.column}`,
      message: `Tag <${tag.tag}> opened at line ${tag.line} was never closed by end of file`
    });
  });
  
  return { errors, allTags, stack };
}

function main() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node tag-balance-checker.js <html-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const html = fs.readFileSync(filePath, 'utf-8');
  const { errors, allTags } = checkBalance(html, path.basename(filePath));
  
  const timestamp = new Date().toISOString();
  
  let output = `HTML Tag Balance Report\n`;
  output += `========================\n`;
  output += `File: ${path.resolve(filePath)}\n`;
  output += `Timestamp: ${timestamp}\n`;
  output += `Total tags found: ${allTags.length}\n`;
  output += `Errors found: ${errors.length}\n`;
  output += `========================\n\n`;
  
  if (errors.length === 0) {
    output += `✅ All tags are properly balanced!\n`;
  } else {
    output += `❌ ERRORS:\n`;
    errors.forEach((err, idx) => {
      output += `\n[${idx + 1}] ${err.type}\n`;
      output += `    ${err.message}\n`;
      if (err.openedAt) output += `    Opened at: ${err.openedAt}\n`;
      if (err.location) output += `    Location: ${err.location}\n`;
      if (err.closedBy) output += `    Closed by: ${err.closedBy}\n`;
    });
  }
  
  output += `\n========================\n`;
  output += `Tag Summary (top-level only):\n`;
  
  // Count tag occurrences
  const tagCounts = {};
  allTags.forEach(t => {
    if (!tagCounts[t.tag]) tagCounts[t.tag] = { open: 0, close: 0 };
    if (t.isClosing) {
      tagCounts[t.tag].close++;
    } else if (!t.isSelfClosing) {
      tagCounts[t.tag].open++;
    }
  });
  
  Object.entries(tagCounts)
    .filter(([_, counts]) => counts.open !== counts.close)
    .sort((a, b) => Math.abs(b[1].open - b[1].close) - Math.abs(a[1].open - a[1].close))
    .forEach(([tag, counts]) => {
      const diff = counts.open - counts.close;
      output += `  <${tag}>  opened: ${counts.open}, closed: ${counts.close}, diff: ${diff > 0 ? '+' : ''}${diff}\n`;
    });
  
  console.log(output);
  
  // Save to file
  const outputPath = filePath.replace(/\.html$/, '-tag-balance-report.txt');
  fs.writeFileSync(outputPath, output);
  console.log(`\nReport saved to: ${outputPath}`);
  
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
