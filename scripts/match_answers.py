# -*- coding: utf-8 -*-
import sys, json, re, glob, os
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\LN2\Documents\antigravity\gallant-meitner\cografiya-miq-quiz\scripts\raw_4_forms.json', encoding='utf-8') as f:
    forms = json.load(f)

for fid, fdata in forms.items():
    qlist = fdata['questions']
    print(f"=== {fid} ({len(qlist)} Qs) ===")
    for q in qlist[:3]:
        print(" Q:", q['q_text'][:120].replace('\n', ' '))
        for o in q['options']:
            print("   ", o[:80].replace('\n', ' '))

# Check 03.10.26 in Oktyabr chat
base = r'E:\MİQ2026Cografiya'
txt_files = glob.glob(os.path.join(base, '**', '*Oktyabr*.txt'), recursive=True)
with open(txt_files[0], encoding='utf-8') as f:
    chat = f.read()

# Find all blocks by @eminov_osman on 03.10.26
lines_03 = [line for line in chat.splitlines() if '03.10.26' in line or '*Cavab:' in line]
cavabs_03 = re.findall(r'03\.10\.26.*?@eminov_osman: (.*?)(?=\n\d{2}\.\d{2}\.\d{2} |\Z)', chat, re.S)
print(f"\nTotal @eminov_osman messages on 03.10.26: {len(cavabs_03)}")
ans_blocks = [b for b in cavabs_03 if '*Cavab:' in b or 'Cavab:' in b or 'Nə öyrəndik' in b]
print(f"Answer/Note blocks on 03.10.26: {len(ans_blocks)}")
for b in ans_blocks[:6]:
    print("--- BLOCK ---")
    print(b[:300])
