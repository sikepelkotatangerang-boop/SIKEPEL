# Project Rules & Guidelines

## File Organization Rules

### 1. Documentation Files (.md)
**Rule**: All markdown documentation files MUST be placed in the `documentation/` folder.

**Applies to**:
- Technical documentation
- User guides
- API documentation
- Setup guides
- Migration guides
- Troubleshooting guides
- Feature documentation
- Change logs
- Any other `.md` files

**Exception**: 
- `README.md` in the project root is allowed as it serves as the main project entry point

**Example paths**:
```
✅ CORRECT:
d:\Project\Kelurahan Cibodas\Pelayanan3\documentation\SETUP.md
d:\Project\Kelurahan Cibodas\Pelayanan3\documentation\API_GUIDE.md
d:\Project\Kelurahan Cibodas\Pelayanan3\README.md (exception)

❌ INCORRECT:
d:\Project\Kelurahan Cibodas\Pelayanan3\SETUP.md
d:\Project\Kelurahan Cibodas\Pelayanan3\src\GUIDE.md
```

### 2. Code Organization
- Source code files go in `src/` directory
- Database scripts go in `database/` directory
- Utility scripts go in `scripts/` directory
- Public assets go in `public/` directory

### 3. Form Development Reference
**Rule**: When creating new forms, ALWAYS use Form SKTM as the reference template.

**Reference Files**:
- Form: `src/app/form-surat/sktm/page.tsx`
- Preview: `src/app/preview-sktm/page.tsx`
- Documentation: `documentation/FORM_SKTM_REFERENCE_GUIDE.md`

**What to Follow**:
- Design & UI structure (Card layout, sections, styling)
- Pejabat selection implementation (dropdown with auto-select)
- State management pattern (interfaces, useState, useEffect)
- Form workflow (Form → Preview → Download/Save)
- Validation patterns
- Error handling and loading states
- Grid layouts and responsive design

**Before Creating a New Form**:
1. Read `FORM_SKTM_REFERENCE_GUIDE.md`
2. Review SKTM form code
3. Review SKTM preview page
4. Check API routes pattern
5. Follow the checklist in the reference guide

### 4. Environment Files
- Never commit `.env.local` or `.env` files
- Always provide `.env.example` or `.env.local.example` templates
- Document all required environment variables

## Naming Conventions

### Files
- Use UPPERCASE for documentation files: `SETUP.md`, `API_GUIDE.md`
- Use kebab-case for feature docs: `user-management.md`, `api-integration.md`
- Use PascalCase for React components: `UserProfile.tsx`, `DashboardLayout.tsx`

### Folders
- Use lowercase with hyphens: `form-surat/`, `user-management/`
- Keep folder names descriptive and concise

## Git Commit Guidelines

### Commit Message Format
```
<type>: <subject>

<body (optional)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat: add pejabat selection dropdown to belum rumah form
fix: resolve ambiguous column error in daftar surat query
docs: update setup guide with new environment variables
```

## Code Quality Standards

### TypeScript
- Always define interfaces for data structures
- Use proper typing, avoid `any` when possible
- Enable strict mode in `tsconfig.json`

### React
- Use functional components with hooks
- Implement proper error handling
- Follow component composition patterns
- Keep components focused and reusable

### API Routes
- Always validate input data
- Return consistent response formats
- Include proper error messages
- Log errors for debugging

### Database
- Use parameterized queries to prevent SQL injection
- Always handle connection errors
- Close connections properly
- Use transactions for multi-step operations

## Security Guidelines

1. **Never commit sensitive data**:
   - API keys
   - Database credentials
   - Private keys
   - Access tokens

2. **Input Validation**:
   - Validate all user inputs
   - Sanitize data before database operations
   - Use prepared statements

3. **Authentication**:
   - Protect all sensitive routes
   - Implement proper session management
   - Use role-based access control

## Documentation Standards

### When to Create Documentation
- New features or major changes
- Setup procedures
- API changes
- Database schema changes
- Troubleshooting solutions

### Documentation Structure
1. **Title**: Clear and descriptive
2. **Overview**: Brief summary
3. **Prerequisites**: What's needed
4. **Steps**: Detailed instructions
5. **Examples**: Code samples
6. **Troubleshooting**: Common issues

### Documentation Location
All documentation files must be in `documentation/` folder as per Rule #1.

---

**Last Updated**: October 15, 2025
**Maintained By**: Development Team
