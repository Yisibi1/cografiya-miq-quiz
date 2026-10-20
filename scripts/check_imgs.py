# -*- coding: utf-8 -*-
import sys, re, urllib.request
sys.stdout.reconfigure(encoding='utf-8')
url = 'https://docs.google.com/forms/d/e/1FAIpQLScMEm0YrmD1-OXCU6UY0_3Bx5lFhV1odTccxPjuVthPchwAMA/viewform'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
for m in re.finditer(r'<img[^>]+>', html):
    print("IMG TAG:", m.group(0)[:200])
for m in re.finditer(r'data-params="([^"]{0,120})', html):
    print("DATA-PARAMS:", m.group(1)[:120])
