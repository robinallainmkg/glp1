#!/usr/bin/env python3
import os
import re
from datetime import datetime

FILES_LIST = "C:/Users/robin/glp1/glp1/content_files_temp.txt"

files = []
with open(FILES_LIST, 'r') as f:
    files = [line.strip() for line in f if line.strip()]

errors = []
warnings = []

def extract_frontmatter(content):
    if not content.startswith('---'):
        return None, content
    end = content.find('---', 3)
    if end == -1:
        return None, content
    fm_text = content[3:end].strip()
    body = content[end+3:].strip()
    return fm_text, body

def parse_yaml_simple(fm_text):
    fields = {}
    duplicate_keys = []
    seen_keys = []
    current_key = None
    current_value = []

    for line in fm_text.split('\n'):
        m = re.match(r'^(\w+):\s*(.*)', line)
        if m and not line.startswith(' ') and not line.startswith('\t'):
            if current_key:
                val = '\n'.join(current_value).strip()
                if current_key in seen_keys:
                    duplicate_keys.append(current_key)
                seen_keys.append(current_key)
                if current_key not in fields:
                    fields[current_key] = val
            current_key = m.group(1)
            current_value = [m.group(2)]
        elif current_key:
            current_value.append(line)

    if current_key:
        val = '\n'.join(current_value).strip()
        if current_key in seen_keys:
            duplicate_keys.append(current_key)
        seen_keys.append(current_key)
        if current_key not in fields:
            fields[current_key] = val

    return fields, duplicate_keys

titles_seen = {}
descs_seen = {}
keywords_seen = {}
seo_errors = []
seo_warnings = []
files_checked = 0

for filepath in files[:100]:
    try:
        with open(filepath, 'r', encoding='utf-8') as fh:
            content = fh.read()
    except Exception as e:
        errors.append("ERROR: %s: Cannot read: %s" % (filepath, e))
        continue

    files_checked += 1
    filename = os.path.basename(filepath)
    dirname = os.path.dirname(filepath).replace('\\','/').split('/')[-1]
    slug = filename.replace('.md', '').replace('.mdx', '')

    fm_text, body = extract_frontmatter(content)
    if fm_text is None:
        errors.append("ERROR: %s: No frontmatter" % slug)
        continue

    fields, dup_keys = parse_yaml_simple(fm_text)

    if dup_keys:
        errors.append("ERROR: %s (%s): Duplicate YAML keys: %s" % (slug, dirname, dup_keys))

    title = fields.get('title', '').strip().strip('"').strip("'")
    description = fields.get('description', '').strip().strip('"').strip("'")
    main_keyword = fields.get('mainKeyword', fields.get('main_keyword', '')).strip().strip('"').strip("'")
    date_val = fields.get('date', '').strip().strip('"').strip("'")

    if not title:
        errors.append("ERROR: %s (%s): Missing title" % (slug, dirname))

    if not description:
        errors.append("ERROR: %s (%s): Missing description" % (slug, dirname))
    elif len(description) < 50:
        warnings.append("WARNING: %s (%s): Description too short (%d chars)" % (slug, dirname, len(description)))
    elif len(description) > 160:
        warnings.append("WARNING: %s (%s): Description too long (%d chars)" % (slug, dirname, len(description)))

    if not main_keyword:
        warnings.append("WARNING: %s (%s): Missing mainKeyword" % (slug, dirname))

    if not date_val:
        warnings.append("WARNING: %s (%s): Missing date" % (slug, dirname))
    else:
        date_ok = False
        try:
            datetime.strptime(date_val[:10], '%Y-%m-%d')
            date_ok = True
        except:
            pass
        if not date_ok:
            warnings.append("WARNING: %s (%s): Invalid date: %s" % (slug, dirname, date_val))

    for key, val in fields.items():
        if val in ['null', 'NULL', '~', '']:
            warnings.append("WARNING: %s (%s): Empty/null field '%s'" % (slug, dirname, key))

    word_count = len(body.split())
    if word_count < 300:
        warnings.append("WARNING: %s (%s): Content too short (%d words)" % (slug, dirname, word_count))

    if title:
        if len(title) < 30:
            seo_warnings.append("SEO_WARN: %s: Title too short (%d chars)" % (slug, len(title)))
        elif len(title) > 65:
            seo_warnings.append("SEO_WARN: %s: Title too long (%d chars)" % (slug, len(title)))

    if description:
        if len(description) < 120:
            seo_warnings.append("SEO_WARN: %s: Desc too short for SEO (%d chars)" % (slug, len(description)))

    mk_lower = main_keyword.lower() if main_keyword else ''
    if mk_lower and title and mk_lower not in title.lower():
        seo_warnings.append("SEO_WARN: %s: mainKeyword not in title" % slug)
    if mk_lower and description and mk_lower not in description.lower():
        seo_warnings.append("SEO_WARN: %s: mainKeyword not in description" % slug)

    if title:
        if title in titles_seen:
            seo_errors.append("DUPLICATE_ERROR: Title shared by %s and %s" % (slug, titles_seen[title]))
        else:
            titles_seen[title] = slug

    if description:
        if description in descs_seen:
            seo_warnings.append("DUPLICATE_WARN: Description shared by %s and %s" % (slug, descs_seen[description]))
        else:
            descs_seen[description] = slug

    if mk_lower:
        if mk_lower in keywords_seen:
            seo_warnings.append("DUPLICATE_WARN: mainKeyword '%s' shared by %s and %s" % (mk_lower, slug, keywords_seen[mk_lower]))
        else:
            keywords_seen[mk_lower] = slug

print("Files checked: %d" % files_checked)
print("\n=== FRONTMATTER ERRORS ===")
for e in errors:
    print(e)
print("Total errors: %d" % len(errors))

print("\n=== FRONTMATTER WARNINGS (first 30) ===")
for w in warnings[:30]:
    print(w)
if len(warnings) > 30:
    print("... and %d more" % (len(warnings)-30))
print("Total warnings: %d" % len(warnings))

print("\n=== SEO ERRORS ===")
for e in seo_errors:
    print(e)
print("Total SEO errors: %d" % len(seo_errors))

print("\n=== SEO WARNINGS (first 20) ===")
for w in seo_warnings[:20]:
    print(w)
if len(seo_warnings) > 20:
    print("... and %d more" % (len(seo_warnings)-20))
print("Total SEO warnings: %d" % len(seo_warnings))
