const fs = require('fs');
const path = require('path');

const CONFIG = {
  manifestDir: 'docs/manifest',
  manifestFile: 'exhaustive-graph.json',
  folders: {
    layout: 'layout',
    templates: 'templates',
    sections: 'sections',
    snippets: 'snippets',
    assets: 'assets'
  }
};

/**
 * STRIP COMMENTS FROM JSON
 */
function stripJsonComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
}

/**
 * THEME AUDIT UTILITY
 * -------------------
 * Generates an exhaustive 8-layer dependency manifest.
 */

const manifest = {
  timestamp: new Date().toISOString(),
  structural: {},
  liquid: {},
  assets: {},
  webComponents: {},
  dynamic: {},
  conditional: {},
  dataCoupling: {},
  persistence: {},
  zombies: {
    templates: [],
    sections: [],
    snippets: [],
    assets: []
  }
};

async function run() {
  console.log('🚀 Starting Exhaustive Theme Audit...');
  
  // Phase 1: Setup
  if (!fs.existsSync(CONFIG.manifestDir)) {
    fs.mkdirSync(CONFIG.manifestDir, { recursive: true });
  }

  // Phase 2: Structural Layer (templates and section groups)
  const templateFiles = fs.readdirSync(CONFIG.folders.templates).filter(file => file.endsWith('.json'));
  templateFiles.forEach(file => {
    try {
      const rawContent = fs.readFileSync(path.join(CONFIG.folders.templates, file), 'utf8');
      const content = JSON.parse(stripJsonComments(rawContent));
      manifest.structural[file] = {
        type: 'template',
        sections: Object.keys(content.sections || {}).map(id => ({
          id,
          type: content.sections[id].type
        }))
      };
    } catch (e) {
      console.warn(`⚠️ Failed to parse template ${file}: ${e.message}`);
    }
  });

  const sectionFiles = fs.readdirSync(CONFIG.folders.sections);
  sectionFiles.forEach(file => {
    if (file.endsWith('.json')) {
      // Section Groups
      try {
        const rawContent = fs.readFileSync(path.join(CONFIG.folders.sections, file), 'utf8');
        const content = JSON.parse(stripJsonComments(rawContent));
        manifest.structural[file] = {
          type: 'section-group',
          sections: Object.keys(content.sections || {}).map(id => ({
            id,
            type: content.sections[id].type
          }))
        };
      } catch (e) {
        console.warn(`⚠️ Failed to parse section group ${file}: ${e.message}`);
      }
    }
  });

  const layoutFiles = fs.readdirSync(CONFIG.folders.layout).filter(file => file.endsWith('.liquid'));
  layoutFiles.forEach(file => {
    manifest.structural[file] = {
      type: 'layout',
      sections: [] // To be populated by Liquid Layer
    };
  });

  // Phase 3: Liquid Layer (Liquid includes and sections)
  const allLiquidFiles = [];
  ['layout', 'sections', 'snippets'].forEach(folder => {
    const files = fs.readdirSync(CONFIG.folders[folder]).filter(f => f.endsWith('.liquid'));
    files.forEach(f => allLiquidFiles.push({ folder, file: f }));
  });

  const RENDER_REGEX = /\{%\s*(?:render|include|section)\s+['"]([^'"]+)['"]/g;
  
  allLiquidFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    const key = `${folder}/${file}`;
    manifest.liquid[key] = {
      renders: [],
      includes: [],
      sections: []
    };

    let match;
    while ((match = RENDER_REGEX.exec(content)) !== null) {
      const type = match[0].includes('render') ? 'render' : match[0].includes('include') ? 'include' : 'section';
      if (type === 'render') manifest.liquid[key].renders.push(match[1]);
      else if (type === 'include') manifest.liquid[key].includes.push(match[1]);
      else if (type === 'section') manifest.liquid[key].sections.push(match[1]);
      
      // Also populate layout sections if it's a layout file
      if (folder === 'layout' && type === 'section') {
        manifest.structural[file].sections.push({ id: match[1], type: match[1] });
      }
    }
  });

  // Phase 4: Asset Layer (asset_url filters and script/link tags)
  const ASSET_URL_REGEX = /['"]([^'"]+\.(?:css|js|svg|png|jpg|webp))['"]\s*\|\s*asset_url/g;
  const SCRIPT_LINK_REGEX = /<(?:script|link)[^>]+(?:src|href)=['"]([^'"]+)['"]/g;

  allLiquidFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    const key = `${folder}/${file}`;
    manifest.assets[key] = {
      assetUrls: [],
      tags: []
    };

    let match;
    while ((match = ASSET_URL_REGEX.exec(content)) !== null) {
      manifest.assets[key].assetUrls.push(match[1]);
    }

    while ((match = SCRIPT_LINK_REGEX.exec(content)) !== null) {
      // Only keep it if it's likely a local asset (doesn't start with http/https/double-slash)
      if (!match[1].startsWith('http') && !match[1].startsWith('//')) {
        manifest.assets[key].tags.push(match[1]);
      }
    }
  });

  // Phase 5: Web Component Layer (customElements.define and usage)
  const CUSTOM_ELEMENT_DEF_REGEX = /customElements\.define\(\s*['"]([^'"]+)['"]/g;
  const assetFiles = fs.readdirSync(CONFIG.folders.assets).filter(f => f.endsWith('.js'));
  
  assetFiles.forEach(file => {
    const content = fs.readFileSync(path.join(CONFIG.folders.assets, file), 'utf8');
    let match;
    while ((match = CUSTOM_ELEMENT_DEF_REGEX.exec(content)) !== null) {
      const tag = match[1];
      manifest.webComponents[tag] = {
        definedIn: file,
        usedIn: []
      };
    }
  });

  // Check where these tags are used in Liquid files
  allLiquidFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    Object.keys(manifest.webComponents).forEach(tag => {
      if (content.includes(`<${tag}`) || content.includes(`</${tag}>`)) {
        manifest.webComponents[tag].usedIn.push(`${folder}/${file}`);
      }
    });
  });

  // Phase 6: Dynamic AJAX Layer (JS fetches)
  const AJAX_SECTION_REGEX = /section_id=([^&'"]+)/g;
  const AJAX_SNIPPET_REGEX = /fetch\(['"]\/snippets\/([^'"]+)\.liquid['"]\)/g;
  const SECTION_BUNDLE_REGEX = /sections=([^&'"]+)/g;

  assetFiles.forEach(file => {
    const content = fs.readFileSync(path.join(CONFIG.folders.assets, file), 'utf8');
    const key = `assets/${file}`;
    manifest.dynamic[key] = {
      sections: [],
      snippets: []
    };

    let match;
    while ((match = AJAX_SECTION_REGEX.exec(content)) !== null) {
      manifest.dynamic[key].sections.push(match[1]);
    }

    while ((match = AJAX_SNIPPET_REGEX.exec(content)) !== null) {
      manifest.dynamic[key].snippets.push(match[1]);
    }

    while ((match = SECTION_BUNDLE_REGEX.exec(content)) !== null) {
      // Handles both direct IDs and response.join(',') logic if static
      manifest.dynamic[key].sections.push(...match[1].split(','));
    }
  });

  // Phase 7: Conditional Layer (Dependencies wrapped in {% if %})
  const CONDITIONAL_WRAP_REGEX = /\{%\s*if\s+([^%]+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g;

  allLiquidFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    const key = `${folder}/${file}`;
    manifest.conditional[key] = [];

    let match;
    while ((match = CONDITIONAL_WRAP_REGEX.exec(content)) !== null) {
      const condition = match[1].trim();
      const body = match[2];
      
      // Look for nested renders/includes in the body
      const innerMatch = RENDER_REGEX.exec(body);
      if (innerMatch) {
        manifest.conditional[key].push({
          condition,
          dependency: innerMatch[1],
          type: innerMatch[0].includes('render') ? 'render' : innerMatch[0].includes('include') ? 'include' : 'section'
        });
      }
      // Reset regex state for next inner match check if needed
      RENDER_REGEX.lastIndex = 0;
    }
  });

  // Phase 8: Data & App Layer (Collections, Metafields, App Selectors)
  const COLLECTION_REGEX = /collections\.([a-zA-Z0-9_\-]+)/g;
  const METAFIELD_REGEX = /metafields\.([a-zA-Z0-9_\-]+)\.([a-zA-Z0-9_\-]+)/g;
  const APP_SELECTOR_REGEX = /['"]\.((?:gpo|globo|judgeme|cc)-[a-zA-Z0-9_\-]+)['"]/g;

  const allRelevantFiles = [...allLiquidFiles, ...assetFiles.map(f => ({ folder: 'assets', file: f }))];

  allRelevantFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    const key = `${folder}/${file}`;
    manifest.dataCoupling[key] = {
      collections: [],
      metafields: [],
      appSelectors: []
    };

    let match;
    while ((match = COLLECTION_REGEX.exec(content)) !== null) {
      if (!manifest.dataCoupling[key].collections.includes(match[1])) {
        manifest.dataCoupling[key].collections.push(match[1]);
      }
    }

    while ((match = METAFIELD_REGEX.exec(content)) !== null) {
      const field = `${match[1]}.${match[2]}`;
      if (!manifest.dataCoupling[key].metafields.includes(field)) {
        manifest.dataCoupling[key].metafields.push(field);
      }
    }

    while ((match = APP_SELECTOR_REGEX.exec(content)) !== null) {
      if (!manifest.dataCoupling[key].appSelectors.includes(match[1])) {
        manifest.dataCoupling[key].appSelectors.push(match[1]);
      }
    }
  });

  // Phase 9: Persistence Layer (localStorage and sessionStorage keys)
  const STORAGE_REGEX = /(?:local|session)Storage\.(?:getItem|setItem|removeItem)\(\s*['"]([^'"]+)['"]/g;

  allRelevantFiles.forEach(({ folder, file }) => {
    const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
    const key = `${folder}/${file}`;
    manifest.persistence[key] = [];

    let match;
    while ((match = STORAGE_REGEX.exec(content)) !== null) {
      if (!manifest.persistence[key].includes(match[1])) {
        manifest.persistence[key].push(match[1]);
      }
    }
  });

  // Phase 10: Mermaid Visualization Generator
  function generateMermaid() {
    let mermaid = 'graph TD\n';
    
    // Add structural dependencies (templates -> sections)
    Object.keys(manifest.structural).forEach(template => {
      manifest.structural[template].sections.forEach(section => {
        mermaid += `  ${template.replace(/\./g, '_')} --> ${section.type.replace(/\./g, '_')}\n`;
      });
    });

    // Add Liquid dependencies (section -> snippet)
    Object.keys(manifest.liquid).forEach(file => {
      const fileName = file.split('/').pop().replace(/\./g, '_');
      manifest.liquid[file].renders.forEach(snippet => {
        mermaid += `  ${fileName} --> ${snippet.replace(/\./g, '_')}\n`;
      });
      manifest.liquid[file].sections.forEach(section => {
        mermaid += `  ${fileName} --> ${section.replace(/\./g, '_')}\n`;
      });
    });

    return mermaid;
  }

  // Phase 11: Settings Audit Logic
  const settingsSchemaPath = 'config/settings_schema.json';
  if (fs.existsSync(settingsSchemaPath)) {
    try {
      const schema = JSON.parse(fs.readFileSync(settingsSchemaPath, 'utf8'));
      const allSettingsKeys = [];
      schema.forEach(category => {
        (category.settings || []).forEach(setting => {
          if (setting.id) allSettingsKeys.push(setting.id);
        });
      });

      manifest.settingsUsage = {};
      allSettingsKeys.forEach(id => {
        manifest.settingsUsage[id] = [];
        allLiquidFiles.forEach(({ folder, file }) => {
          const content = fs.readFileSync(path.join(CONFIG.folders[folder], file), 'utf8');
          if (content.includes(`settings.${id}`)) {
            manifest.settingsUsage[id].push(`${folder}/${file}`);
          }
        });
      });
    } catch (e) {
      console.warn(`⚠️ Failed to parse settings_schema.json: ${e.message}`);
    }
  }

  // Phase 12: Zombie Report Generation
  function generateZombieReport() {
    const activeSnippets = new Set();
    const activeSections = new Set();
    
    // Collect from templates
    Object.values(manifest.structural).forEach(s => {
      s.sections.forEach(sec => activeSections.add(sec.type));
    });

    // Collect from Liquid renders
    Object.values(manifest.liquid).forEach(l => {
      l.renders.forEach(s => activeSnippets.add(s));
      l.sections.forEach(s => activeSections.add(s));
    });

    // Collect from Dynamic (JS fetches)
    Object.values(manifest.dynamic).forEach(d => {
      d.snippets.forEach(s => activeSnippets.add(s));
      d.sections.forEach(s => activeSections.add(s));
    });

    const allSnippets = fs.readdirSync(CONFIG.folders.snippets).filter(f => f.endsWith('.liquid')).map(f => f.replace('.liquid', ''));
    const allSections = fs.readdirSync(CONFIG.folders.sections).filter(f => f.endsWith('.liquid')).map(f => f.replace('.liquid', ''));

    manifest.zombies.snippets = allSnippets.filter(s => !activeSnippets.has(s));
    manifest.zombies.sections = allSections.filter(s => !activeSections.has(s));
  }

  generateZombieReport();

  const mermaidChart = generateMermaid();
  const visualPath = path.join('docs', 'THEME-STRUCTURE.md');
  const visualContent = `# Theme Structure (Static Analysis)\n\n\`\`\`mermaid\n${mermaidChart}\n\`\`\`\n`;
  fs.writeFileSync(visualPath, visualContent);
  console.log(`✅ Visualization generated at ${visualPath}`);

  const outputPath = path.join(CONFIG.manifestDir, CONFIG.manifestFile);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest generated at ${outputPath}`);
}

run().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
