# Documentation Organization

## Overview
This document explains how documentation is organized in this project and the rules for maintaining it.

## Rule: All .md Files in documentation/ Folder

### The Rule
**All markdown (`.md`) documentation files MUST be placed in the `documentation/` folder.**

### Why This Rule?
1. **Centralized Documentation**: Easy to find all project documentation in one place
2. **Clean Root Directory**: Keeps the project root clean and organized
3. **Better Navigation**: Developers know exactly where to look for docs
4. **Version Control**: Easier to track documentation changes
5. **Scalability**: As the project grows, documentation remains organized

### Exception
- `README.md` in the project root is allowed as it's the main entry point for the project

## Current Documentation Structure

```
documentation/
├── PROJECT_RULES.md                    # Project-wide rules and guidelines
├── DOCUMENTATION_ORGANIZATION.md       # This file
│
├── Setup & Installation
│   ├── QUICKSTART.md
│   ├── QUICK_START.md
│   ├── SETUP.md
│   ├── SUPABASE_SETUP.md
│   └── CONVERTAPI_SETUP.md
│
├── Features
│   ├── ADD_KELURAHAN_FEATURE.md
│   ├── ADMIN_PAGES.md
│   ├── AUTHENTICATION_PROTECTION.md
│   ├── DAFTAR_SURAT_FEATURE.md
│   ├── FITUR_AUTO_KELURAHAN.md
│   ├── FORM_SURAT_SUMMARY.md
│   ├── KELURAHAN_FEATURE.md
│   ├── NOTIFICATION_SYSTEM.md
│   ├── ROLE_BASED_ACCESS.md
│   ├── SETTINGS_MANAGEMENT.md
│   └── USER_MANAGEMENT.md
│
├── Database
│   ├── DATABASE_IMPLEMENTATION.md
│   ├── DATABASE_NOTIFICATION_SETUP.md
│   └── USER_MANAGEMENT_DATABASE.md
│
├── Integration & Storage
│   ├── GOOGLE_DRIVE_SHARED_DRIVE_SETUP.md
│   ├── INTEGRASI_SUPABASE_COMPLETE.md
│   ├── LOCAL_STORAGE_SETUP.md
│   ├── SUPABASE_STORAGE_SETUP.md
│   └── HYBRID_APPROACH_CONVERTAPI_PUPPETEER.md
│
├── Migration & Updates
│   ├── MIGRASI_SEKARANG.md
│   ├── MIGRATION_GUIDE.md
│   ├── UPDATE_ENV.md
│   └── LAYOUT_UPDATE.md
│
├── Troubleshooting
│   ├── FIX_ERROR_KELURAHAN.md
│   ├── FIX_AMBIGUOUS_COLUMN_ERROR.md
│   ├── FIX_SUPABASE_DOWNLOAD_ERROR.md
│   ├── TROUBLESHOOTING_DAFTAR_SURAT.md
│   └── TROUBLESHOOTING_LOGIN.md
│
├── Technical Guides
│   ├── CARA_SESUAIKAN_FORM_DENGAN_TEMPLATE.md
│   ├── MAPPING_FIELD_SKTM.md
│   ├── PUPPETEER_QUICK_START.md
│   ├── PUPPETEER_VS_CONVERTAPI.md
│   ├── SETUP_SKTM_PREVIEW.md
│   └── SKTM_PREVIEW_WORKFLOW.md
│
├── UI & Design
│   ├── A4_SIZE_CONFIGURATION.md
│   ├── ADD_LOGO_TO_PDF.md
│   ├── CONDITIONAL_PENGANTAR_RT.md
│   ├── LOGO_SETUP.md
│   ├── NAVIGATION_UPDATE.md
│   └── TWO_PRINT_OPTIONS_UI.md
│
└── Project Info
    ├── PROJECT_SUMMARY.md
    ├── MOCK_DATA.md
    └── MOCK_DATA_BELUM_RUMAH.md
```

## How to Add New Documentation

### Step 1: Create the File
Create your `.md` file in the `documentation/` folder:

```bash
# Windows PowerShell
New-Item -Path "documentation\YOUR_DOC_NAME.md" -ItemType File

# Or use your IDE to create the file directly in documentation/
```

### Step 2: Use Proper Naming
- **UPPERCASE**: For major documentation (e.g., `SETUP.md`, `API_GUIDE.md`)
- **kebab-case**: For feature-specific docs (e.g., `user-management.md`, `api-integration.md`)

### Step 3: Follow Documentation Template

```markdown
# Title

## Overview
Brief description of what this document covers.

## Prerequisites
- List any requirements
- Dependencies needed
- Prior knowledge required

## Main Content
Detailed information, steps, or explanations.

### Subsection 1
Content here...

### Subsection 2
Content here...

## Examples
Code examples or usage examples.

## Troubleshooting
Common issues and solutions.

## Related Documentation
- Link to related docs
- Link to external resources

---
**Last Updated**: [Date]
**Author**: [Name]
```

## Maintenance Guidelines

### Regular Reviews
- Review documentation quarterly
- Update outdated information
- Remove obsolete documentation
- Consolidate duplicate content

### Version Control
- Commit documentation changes with clear messages
- Use conventional commit format: `docs: description`
- Keep documentation in sync with code changes

### Quality Standards
- Use clear, concise language
- Include code examples where applicable
- Add screenshots for UI-related docs
- Keep formatting consistent
- Use proper markdown syntax

## Finding Documentation

### By Topic
Use the structure above to navigate by category.

### By Search
Use your IDE's search functionality:
```
Ctrl+Shift+F (Windows/Linux)
Cmd+Shift+F (Mac)
```

Search within `documentation/` folder for keywords.

### By File List
View all documentation files:
```bash
# Windows PowerShell
Get-ChildItem -Path documentation -Filter *.md | Select-Object Name

# Or use File Explorer to browse documentation/ folder
```

## Migration of Existing .md Files

If you find any `.md` files outside the `documentation/` folder (except `README.md` in root):

1. **Move the file**:
   ```bash
   Move-Item -Path "FILE_NAME.md" -Destination "documentation\" -Force
   ```

2. **Update any references**:
   - Check for links to the old location
   - Update import statements if applicable
   - Update README or other docs that reference it

3. **Commit the change**:
   ```bash
   git add .
   git commit -m "docs: move FILE_NAME.md to documentation folder"
   ```

## Tools & Automation

### EditorConfig
The project includes `.editorconfig` to maintain consistent formatting across documentation files.

### Git Hooks (Optional)
Consider adding a pre-commit hook to check for `.md` files outside `documentation/`:

```bash
# .git/hooks/pre-commit
#!/bin/sh
MD_FILES=$(git diff --cached --name-only --diff-filter=A | grep '\.md$' | grep -v '^documentation/' | grep -v '^README\.md$')
if [ -n "$MD_FILES" ]; then
    echo "Error: Markdown files must be in documentation/ folder:"
    echo "$MD_FILES"
    exit 1
fi
```

## Questions?

If you have questions about documentation organization:
1. Check [PROJECT_RULES.md](./PROJECT_RULES.md)
2. Review existing documentation for examples
3. Ask the development team

---

**Last Updated**: October 15, 2025
**Maintained By**: Development Team
