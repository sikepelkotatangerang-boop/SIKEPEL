#!/usr/bin/env python3
"""
Script untuk membaca placeholder dari template DOCX
"""

import re
import zipfile
import xml.etree.ElementTree as ET

def extract_placeholders(docx_path, show_content=False):
    """Extract all placeholders from a DOCX file"""
    try:
        placeholders = set()
        all_text = ""
        
        # DOCX is a ZIP file
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Read document.xml which contains the main content
            xml_content = zip_ref.read('word/document.xml')
            
            # Parse XML
            root = ET.fromstring(xml_content)
            
            # Get all text content
            text_content = ET.tostring(root, encoding='unicode', method='text')
            all_text = text_content
            
            # Try different placeholder patterns
            patterns = [
                r'\{\{([^}]+)\}\}',  # {{placeholder}}
                r'\{([^}]+)\}',      # {placeholder}
                r'\[([^\]]+)\]',     # [placeholder]
                r'<([^>]+)>',        # <placeholder>
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, text_content)
                if matches:
                    placeholders.update([(pattern, m) for m in matches])
            
            # Also search in raw XML for split placeholders
            xml_str = xml_content.decode('utf-8')
            for pattern in patterns:
                matches = re.findall(pattern, xml_str)
                if matches:
                    placeholders.update([(pattern, m) for m in matches])
        
        return sorted(list(placeholders)), all_text
    
    except Exception as e:
        print(f"Error reading file: {e}")
        import traceback
        traceback.print_exc()
        return [], ""

if __name__ == "__main__":
    import os
    
    template_path = "public/template/PENGANTARKTP.docx"
    
    print("=" * 60)
    print("Reading placeholders from PENGANTARKTP.docx")
    print("=" * 60)
    print(f"Current directory: {os.getcwd()}")
    print(f"Template path: {template_path}")
    print(f"File exists: {os.path.exists(template_path)}")
    print("=" * 60)
    
    if not os.path.exists(template_path):
        print("\nERROR: Template file not found!")
        print("Please check the file path.")
    else:
        placeholders, all_text = extract_placeholders(template_path)
        
        if placeholders:
            print(f"\nFound {len(placeholders)} placeholders:\n")
            for i, (pattern, placeholder) in enumerate(placeholders, 1):
                print(f"{i:2d}. Pattern: {pattern[:20]:<20} -> {placeholder}")
            
            print("\n" + "=" * 60)
            print("Unique placeholders:")
            print("=" * 60)
            unique = set([p[1] for p in placeholders])
            for placeholder in sorted(unique):
                print(f"  {placeholder}")
        else:
            print("\nNo placeholders found in the template.")
            print("\nShowing first 1000 characters of content:")
            print("=" * 60)
            print(all_text[:1000])
            print("=" * 60)
