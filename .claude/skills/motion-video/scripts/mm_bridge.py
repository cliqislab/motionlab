"""Ponte entre este pipeline (Remotion + whisper) e as ferramentas do Motionmaxxing.
uso:
  python3 mm_bridge.py words narr.script_words.json saida.mm.words.json
      [[ini, fim, palavra], ...] (words.py / align.py)  ->  [{"word","start","end"}] (entrada do sync.mjs)
  python3 mm_bridge.py events src/events.json final.mp4.events.json
      cuts/shake/flash/glitch do events.json (tempo da narração) -> lista de eventos no tempo do VÍDEO (+vo)
      no formato que o look.py lê sozinho quando o arquivo se chama <video>.mp4.events.json.
Depois:
  node $MM/scripts/sync.mjs saida.mm.words.json --fps 30 --lead 2 --out beats.json
  python3 $MM/scripts/look.py final.mp4 --out look --expect <s> --expect-audio"""
import sys, json

mode, src, out = sys.argv[1:4]
if mode == "words":
    W = json.load(open(src))
    res = [{"word": w, "start": s, "end": e} for s, e, w in W]
    json.dump(res, open(out, "w"), ensure_ascii=False, indent=0)
    print(f"{len(res)} palavras -> {out}")
elif mode == "events":
    ev = json.load(open(src))
    vo = ev.get("vo", 0)
    res = [{"type": "cut", "t": round(c + vo, 3), "label": f"cena {i + 2}"} for i, c in enumerate(ev.get("cuts", []))]
    for kind in ("shake", "flash", "glitch"):
        for item in ev.get(kind, []):
            t = item[0] if isinstance(item, list) else item
            res.append({"type": f"hit-{kind}", "t": round(t + vo, 3)})
    res.sort(key=lambda e: e["t"])
    json.dump({"events": res}, open(out, "w"), ensure_ascii=False, indent=0)
    print(f"{len(ev.get('cuts', []))} cortes (+vo {vo}s) -> {out}")
else:
    sys.exit(__doc__)
