#!/usr/bin/env python3
"""
Script untuk mengekstrak placeholder dari template N1.docx
"""

import zipfile
import xml.etree.ElementTree as ET
import re
import sys
from pathlib import Path

def extract_placeholders_from_docx(docx_path):
    """Extract placeholders dari file DOCX"""
    placeholders = set()
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Read document.xml
            with zip_ref.open('word/document.xml') as xml_file:
                content = xml_file.read().decode('utf-8')
                
                # Find all placeholders in format {placeholder}
                pattern = r'\{([^}]+)\}'
                matches = re.findall(pattern, content)
                placeholders.update(matches)
        
        return sorted(list(placeholders))
    
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []

def main():
    # Path to N1.docx template
    template_path = Path(__file__).parent.parent / 'public' / 'template' / 'N1.docx'
    
    if not template_path.exists():
        print(f"Error: Template not found at {template_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Extracting placeholders from: {template_path}")
    print("=" * 60)
    
    placeholders = extract_placeholders_from_docx(template_path)
    
    if placeholders:
        print(f"\nFound {len(placeholders)} placeholders:\n")
        for i, placeholder in enumerate(placeholders, 1):
            print(f"{i:2d}. {{{placeholder}}}")
        
        print("\n" + "=" * 60)
        print("\nPlaceholder list for TypeScript interface:")
        print("-" * 60)
        for placeholder in placeholders:
            # Convert to camelCase for TypeScript
            field_name = placeholder.lower().replace(' ', '_')
            print(f"  {field_name}: string;")
    else:
        print("No placeholders found!")

if __name__ == "__main__":
    main()
