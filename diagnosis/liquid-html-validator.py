#!/usr/bin/env python3
"""
Liquid-Conditional-Aware HTML Tag Balance Checker

This script analyzes Shopify Liquid files and simulates both branches
of conditionals to find HTML tags that may be unclosed in one branch.

Usage: python3 liquid-html-validator.py <liquid-file>
"""

import sys
import re
from pathlib import Path

VOID_ELEMENTS = {
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
}

class LiquidBranch:
    def __init__(self, name="main"):
        self.name = name
        self.stack = []
        self.errors = []
        self.line_num = 0
    
    def open_tag(self, tag_name, line_num, full_tag):
        if tag_name in VOID_ELEMENTS:
            return
        self.stack.append({
            'tag': tag_name,
            'line': line_num,
            'full': full_tag[:60]
        })
    
    def close_tag(self, tag_name, line_num):
        if tag_name in VOID_ELEMENTS:
            return
        # Find matching opener
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]['tag'] == tag_name:
                self.stack.pop(i)
                return
        self.errors.append({
            'type': 'ORPHAN_CLOSE',
            'tag': tag_name,
            'line': line_num,
            'branch': self.name
        })
    
    def finalize(self):
        for tag in self.stack:
            self.errors.append({
                'type': 'UNCLOSED',
                'tag': tag['tag'],
                'line': tag['line'],
                'branch': self.name,
                'context': tag['full']
            })

def parse_liquid(content):
    """
    Parse Liquid file and return a structure representing all possible render paths.
    For conditionals, we create branches.
    """
    lines = content.split('\n')
    
    # Stack of active branches
    branch_stack = [LiquidBranch("main")]
    conditional_stack = []  # Track if/else/endif
    
    # Regex patterns
    tag_pattern = re.compile(r'<(/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*?\/?>')
    liquid_tag_pattern = re.compile(r'\{%-?\s*(if|else|elsif|endif|unless|endunless|for|endfor)\s+.*?-?%\}')
    liquid_open_pattern = re.compile(r'\{%-?\s*(if|unless)\s+([^%]+)-?%\}')
    liquid_close_pattern = re.compile(r'\{%-?\s*(endif|endunless|endfor)\s*-?%\}')
    liquid_else_pattern = re.compile(r'\{%-?\s*(else|elsif)\s+[^%]*-?%\}')
    
    for line_idx, line in enumerate(lines):
        line_num = line_idx + 1
        
        # Check for Liquid control flow
        if_match = liquid_open_pattern.search(line)
        else_match = liquid_else_pattern.search(line)
        close_match = liquid_close_pattern.search(line)
        
        if if_match:
            cond_type = if_match.group(1)  # 'if' or 'unless'
            cond_expr = if_match.group(2).strip()
            
            # When we hit an if, create two branches: true and false
            # For now, just track that we're entering a conditional
            conditional_stack.append({
                'type': cond_type,
                'expr': cond_expr,
                'line': line_num,
                'branches': []
            })
            
            # Create a new branch for the "true" path
            true_branch = LiquidBranch(f"if_true_{line_num}")
            branch_stack.append(true_branch)
            
        elif else_match:
            # End the true branch and start false branch
            if conditional_stack:
                cond = conditional_stack[-1]
                cond['branches'].append(branch_stack.pop())
                
                false_branch = LiquidBranch(f"if_false_{line_num}")
                branch_stack.append(false_branch)
                
        elif close_match:
            # End the current branch
            if conditional_stack and len(branch_stack) > 1:
                cond = conditional_stack.pop()
                cond['branches'].append(branch_stack.pop())
                
                # Merge errors back to parent
                parent = branch_stack[-1]
                for branch in cond['branches']:
                    parent.errors.extend(branch.errors)
                    # For unclosed tags in branches, we need to be smarter
                    # Tags opened before the if and closed inside are OK
                    # Tags opened inside and not closed are problems
                    for tag in branch.stack:
                        parent.errors.append({
                            'type': 'CONDITIONAL_UNCLOSED',
                            'tag': tag['tag'],
                            'line': tag['line'],
                            'branch': branch.name,
                            'context': tag['full'],
                            'conditional_line': cond['line'],
                            'message': f"Tag <{tag['tag']}> opened inside conditional (line {tag['line']}) but never closed in branch '{branch.name}'"
                        })
        
        # Parse HTML tags on this line
        for match in tag_pattern.finditer(line):
            is_close = match.group(1) == '/'
            tag_name = match.group(2).lower()
            full_tag = match.group(0)
            
            current_branch = branch_stack[-1]
            if is_close:
                current_branch.close_tag(tag_name, line_num)
            else:
                current_branch.open_tag(tag_name, line_num, full_tag)
    
    # Finalize main branch
    main_branch = branch_stack[0]
    main_branch.finalize()
    
    return main_branch

def analyze_file(filepath):
    content = Path(filepath).read_text(encoding='utf-8')
    result = parse_liquid(content)
    
    # Filter to show only meaningful errors
    # (ignore errors inside script/style tags in the source)
    meaningful_errors = []
    in_script_or_style = False
    lines = content.split('\n')
    
    for err in result.errors:
        line_idx = err.get('line', 1) - 1
        if line_idx < 0 or line_idx >= len(lines):
            continue
        line = lines[line_idx]
        
        # Skip if inside script/style
        if '<script' in line or '<style' in line:
            in_script_or_style = True
        if '</script>' in line or '</style>' in line:
            in_script_or_style = False
        if in_script_or_style:
            continue
        
        meaningful_errors.append(err)
    
    return meaningful_errors

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 liquid-html-validator.py <liquid-file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    errors = analyze_file(filepath)
    
    output_lines = []
    output_lines.append("=" * 70)
    output_lines.append("LIQUID-HTML VALIDATION REPORT")
    output_lines.append(f"File: {filepath}")
    output_lines.append(f"Timestamp: {__import__('datetime').datetime.now().isoformat()}")
    output_lines.append(f"Errors found: {len(errors)}")
    output_lines.append("=" * 70)
    
    if not errors:
        output_lines.append("\n✅ No structural HTML issues found in Liquid source!")
    else:
        output_lines.append("\n❌ POTENTIAL ISSUES:")
        output_lines.append("(These are tags opened inside conditionals that may not close)")
        output_lines.append("")
        
        for i, err in enumerate(errors, 1):
            output_lines.append(f"[{i}] {err.get('type', 'ERROR')}")
            if 'message' in err:
                output_lines.append(f"    {err['message']}")
            else:
                output_lines.append(f"    Tag <{err['tag']}> at line {err['line']}")
            if 'context' in err:
                output_lines.append(f"    Context: {err['context']}")
            output_lines.append("")
    
    report = '\n'.join(output_lines)
    print(report)
    
    # Save report
    out_path = filepath.replace('.liquid', '-liquid-validation.txt')
    with open(out_path, 'w') as f:
        f.write(report)
    print(f"\nReport saved to: {out_path}")

if __name__ == '__main__':
    main()
