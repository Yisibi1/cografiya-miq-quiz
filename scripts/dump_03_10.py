# -*- coding: utf-8 -*-
import sys, json, re, glob, os
sys.stdout.reconfigure(encoding='utf-8')

base = r'E:\MİQ2026Cografiya'
txt_files = glob.glob(os.path.join(base, '**', '*Oktyabr*.txt'), recursive=True)
with open(txt_files[0], encoding='utf-8') as f:
    chat = f.read()

# Extract all messages by @eminov_osman on 03.10.26
msgs = re.findall(r'^03\.10\.26 \d{2}:\d{2} - @eminov_osman: (.*?)(?=\n\d{2}\.\d{2}\.\d{2} \d{2}:\d{2} - |\Z)', chat, re.S | re.M)
out_lines = []
for idx, m in enumerate(msgs):
    if '<Media buraxıldı>' in m or '.opus' in m:
        continue
    out_lines.append(f"--- MSG {idx} ---\n{m.strip()}\n")

with open(r'c:\Users\LN2\Documents\antigravity\gallant-meitner\cografiya-miq-quiz\scripts\osman_03_10.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print(f"Saved {len(out_lines)} messages from 03.10.26 to scripts/osman_03_10.txt")
