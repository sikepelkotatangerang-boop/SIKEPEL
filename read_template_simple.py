#!/usr/bin/env python3
import zipfile
import re

def read_docx_text(docx_path):
    """Read all text from DOCX file"""
    with zipfile.ZipFile(docx_path, 'r') as zip_ref:
        xml_content = zip_ref.read('word/document.xml').decode('utf-8')
        
        # Remove XML tags to get text
        text = re.sub(r'<[^>]+>', ' ', xml_content)
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

# Read template
template_path = "public/template/PENGANTARKTP.docx"
text = read_docx_text(template_path)

print("=" * 80)
print("CONTENT FROM PENGANTARKTP.docx")
print("=" * 80)
print(text[:2000])  # First 2000 characters
print("\n...")
print("\n" + "=" * 80)

# Look for potential placeholders
print("\nSearching for potential placeholders...")
print("=" * 80)

# Try different patterns
patterns = {
    '{{...}}': re.findall(r'\{\{([^}]+)\}\}', text),
    '{...}': re.findall(r'\{([^}]+)\}', text),
    '[...]': re.findall(r'\[([^\]]+)\]', text),
    '<...>': re.findall(r'<([^>]+)>', text),
}

for pattern_name, matches in patterns.items():
    if matches:
        print(f"\n{pattern_name} pattern found ({len(matches)} matches):")
        for match in sorted(set(matches))[:20]:  # Show first 20 unique
            print(f"  - {match}")
