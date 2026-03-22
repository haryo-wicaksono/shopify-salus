import os
import re
from datetime import datetime

# Global results
unused_snippets = []
unused_sections = []
unused_assets = []

search_dirs = ['layout', 'templates', 'sections', 'snippets', 'assets', 'config']

def get_files(directory, ext=None):
    if not os.path.exists(directory): return []
    res = []
    for f in os.listdir(directory):
        if ext and not f.endswith(ext): continue
        if os.path.isfile(os.path.join(directory, f)):
            res.append(f)
    return res

def search_codebase(pattern, directories, extensions=None, exclude_path=None):
    if extensions is None:
        extensions = ('.liquid', '.json', '.js', '.css', '.md')
    compiled = re.compile(pattern)
    for d in directories:
        if not os.path.exists(d): continue
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith(extensions):
                    path = os.path.join(root, f)
                    if exclude_path and os.path.abspath(path) == os.path.abspath(exclude_path):
                        continue
                    try:
                        with open(path, 'r', encoding='utf-8') as file:
                            content = file.read()
                            if compiled.search(content):
                                return True
                    except:
                        pass
    return False

def analyze_snippets():
    print("Analyzing snippets...")
    snippets = get_files('snippets', '.liquid')
    for s in snippets:
        name = s[:-7]
        # Exact render/include regex
        pattern = r"(render|include)\s+['\"]" + re.escape(name) + r"['\"]"
        if not search_codebase(pattern, search_dirs):
            unused_snippets.append('snippets/' + s)

def analyze_sections():
    print("Analyzing sections...")
    sections = get_files('sections', '.liquid')
    for s in sections:
        name = s[:-7]
        is_used = False
        
        # 1. JSON templates, section groups, settings_data
        name_underscore = name.replace('-', '_')
        pattern_json = r"[\"'](" + re.escape(name) + r"|" + re.escape(name_underscore) + r")[\"']"
        if search_codebase(pattern_json, ['templates', 'sections', 'config']):
            is_used = True
            
        # 2. Static section tag in layout
        if not is_used:
            pattern_static = r"section\s+['\"]" + re.escape(name) + r"['\"]"
            if search_codebase(pattern_static, ['layout']):
                is_used = True
                
        # 3. Render/include as snippet (section-as-snippet pattern)
        if not is_used:
            pattern_render = r"(render|include)\s+['\"]" + re.escape(name) + r"['\"]"
            if search_codebase(pattern_render, search_dirs):
                is_used = True
                
        # 4. Web Components or dynamic JS references
        # Loosening this to match the bash script's conservative approach
        if not is_used:
            # Check for the name as a string literal in JS or Liquid
            # Use word boundaries to avoid partial matches
            pattern_string = r"['\"]" + re.escape(name) + r"['\"]"
            if search_codebase(pattern_string, search_dirs):
                is_used = True

        if not is_used:
            unused_sections.append('sections/' + s)

def analyze_assets():
    print("Analyzing assets...")
    assets = get_files('assets')
    for a in assets:
        # Exact match of the filename
        pattern = re.escape(a)
        asset_path = os.path.join('assets', a)
        # Exclude self-references!
        # Restrict to liquid, js, css to avoid documentation false positives
        if not search_codebase(pattern, search_dirs, extensions=('.liquid', '.js', '.css'), exclude_path=asset_path):
            unused_assets.append(asset_path)

def write_report():
    out_path = 'scripts/analysis_results.md'
    timestamp = datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")

    report = "# Codebase Analysis Report\n"
    report += f"Generated: {timestamp}\n\n"
    report += f"## Unused Snippets ({len(unused_snippets)})\n"
    for f in unused_snippets: report += f"- `{f}`\n"
    report += f"\n## Unused Sections ({len(unused_sections)})\n"
    for f in unused_sections: report += f"- `{f}`\n"
    report += f"\n## Unused Assets ({len(unused_assets)})\n"
    for f in unused_assets: report += f"- `{f}`\n"
    report += f"\nDone! Report generated at {out_path}\n"

    with open(out_path, 'w') as f:
        f.write(report)
    print("Done. Report saved to", out_path)

def main():
    analyze_snippets()
    analyze_sections()
    analyze_assets()
    write_report()

if __name__ == "__main__":
    main()