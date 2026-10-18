# -*- coding: utf-8 -*-
"""
SDF 1 imtahan materiallarının generatoru.

Mənbə: SDF1_Variant_[A-E].ipynb (tələbə notebook-ları) — yeganə həqiqət mənbəyi.
Nəticə:
  * variant_A.py ... variant_E.py  — `python variant_X.py` ilə işləyən müstəqil fayllar
  * exam_data.js                   — index.html üçün suallar, başlanğıc kodlar, testlər
                                     və brauzerdə (Pyodide) işləyən yoxlama mühərriki

İstifadə:
  python tools/build_exam.py                       # notebook-lar ../ qovluğundadır
  python tools/build_exam.py --src C:/yol/notebooks
  python tools/build_exam.py --verify              # *_cavablar.ipynb ilə 100/100 yoxlaması
"""

import argparse
import html
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from grader_core import HARNESS_SOURCE, load_harness  # noqa: E402

VARIANTS = ["A", "B", "C", "D", "E"]

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


# ======================================================================
# Notebook-un oxunması və tapşırıqlara bölünməsi
# ======================================================================

def _src(cell):
    s = cell.get("source", "")
    return "".join(s) if isinstance(s, list) else s


HEADING_RE = re.compile(r"^###\s+(Tapşırıq\s+([A-F]\d)\.|Addım\s+(\d)\.)(.*?)\((\d+)\s*bal\)", re.M)
OPTION_RE = re.compile(r"^-\s+\*\*([a-d])\)\*\*\s*(.+)$", re.M)
CHOICE_RE = re.compile(r'^(E\d)\s*=\s*""', re.M)
NUMBER_RE = re.compile(r"^(answer_C\d)\s*=", re.M)


def parse_notebook(path):
    """Notebook-u sıralı 'items' (veb üçün) və 'steps' (icra üçün) siyahısına çevirir."""
    with open(path, encoding="utf-8") as f:
        cells = json.load(f)["cells"]

    items, steps, tasks = [], [], []
    pending_md = []          # tapşırıq başlığına qədər yığılan markdown
    current = None           # sonuncu başlıq: (task_id, title, pts, md)
    intro_md = []
    seen_setup = False

    for cell in cells:
        src = _src(cell).rstrip()
        if cell["cell_type"] == "markdown":
            if not seen_setup:
                intro_md.append(src)
                continue
            if src.startswith("*Yoxlama"):
                continue
            m = HEADING_RE.search(src)
            if m:
                if pending_md:
                    items.append({"type": "section", "md": "\n\n".join(pending_md)})
                    pending_md = []
                tid = m.group(2) or f"F{m.group(3)}"
                title = src.splitlines()[0].lstrip("#").strip()
                current = {"id": tid, "title": title, "pts": int(m.group(5)), "md": src}
            else:
                if src.startswith("---\n# ✅") or "Əsas yoxlama" in src:
                    break
                pending_md.append(src)
            continue

        # --- kod xanası ---
        if "def check(" in src:
            seen_setup = True
            continue
        if not seen_setup:
            continue  # tələbə məlumatları xanası
        if re.search(r"^check\(", src, re.M):
            ids = [i.split("_")[0] for i in re.findall(r'^check\("([^"]+)"', src, re.M)]
            steps.append({"k": "test", "ids": ids, "code": src})
            continue
        if current is None:
            # başlıqsız sabit verilənlər xanası (məs. F hissəsinin X_val, y_val)
            if pending_md:
                items.append({"type": "section", "md": "\n\n".join(pending_md)})
                pending_md = []
            items.append({"type": "fixed", "code": src})
            steps.append({"k": "fixed", "code": src})
            continue

        task = {"id": current["id"], "title": current["title"], "pts": current["pts"], "md": current["md"]}
        mc, mn = CHOICE_RE.search(src), NUMBER_RE.search(src)
        if mc:
            task["kind"] = "choice"
            task["var"] = mc.group(1)
            task["options"] = {k: v.strip() for k, v in OPTION_RE.findall(current["md"])}
            task["md"] = OPTION_RE.sub("", current["md"]).rstrip()
            steps.append({"k": "var", "task": task["id"], "var": task["var"]})
        elif mn:
            task["kind"] = "number"
            task["var"] = mn.group(1)
            task["md"] = re.sub(r"^Cavabınızı `answer_C\d`.*$", "", current["md"], flags=re.M).rstrip()
            steps.append({"k": "var", "task": task["id"], "var": task["var"]})
        else:
            task["kind"] = "code"
            task["starter"] = src
            steps.append({"k": "code", "task": task["id"], "code": src})
        tasks.append(task)
        items.append({"type": "task", "id": task["id"]})
        current = None

    return {"intro_md": intro_md, "items": items, "steps": steps, "tasks": tasks, "cells": cells}


def answers_from_key_notebook(path, parsed):
    """*_cavablar.ipynb-dən veb formatında (task_id -> kod/dəyər) düzgün cavabları çıxarır."""
    with open(path, encoding="utf-8") as f:
        key_cells = json.load(f)["cells"]
    student_cells = parsed["cells"]
    answers = {}
    by_starter = {t["starter"]: t for t in parsed["tasks"] if t["kind"] == "code"}
    var_tasks = {t["var"]: t for t in parsed["tasks"] if t["kind"] != "code"}
    for sc, kc in zip(student_cells, key_cells):
        if sc["cell_type"] != "code":
            continue
        s, k = _src(sc).rstrip(), _src(kc).rstrip()
        if s in by_starter:
            answers[by_starter[s]["id"]] = k
            continue
        m = re.match(r"^(answer_C\d|E\d)\s*=\s*(.+?)\s*(#.*)?$", k.splitlines()[0]) if k else None
        if m and m.group(1) in var_tasks:
            val = m.group(2).strip().strip('"').strip("'")
            answers[var_tasks[m.group(1)]["id"]] = val
    return answers


# ======================================================================
# Markdown -> HTML (notebook-larda istifadə olunan alt çoxluq üçün)
# ======================================================================

def _inline(text):
    keep = []

    def stash(m):
        keep.append(m.group(0))
        return f"\x00{len(keep) - 1}\x00"

    text = re.sub(r"\$\$.+?\$\$|\$[^$\n]+\$|`[^`\n]+`", stash, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<i>\1</i>", text)

    def restore(m):
        tok = keep[int(m.group(1))]
        if tok.startswith("`"):
            return f"<code>{html.escape(tok[1:-1], quote=False)}</code>"
        return html.escape(tok, quote=False)

    return re.sub(r"\x00(\d+)\x00", restore, text)


def md_to_html(md):
    out, para, lst = [], [], None
    lines = md.split("\n")
    i = 0

    def flush():
        nonlocal para, lst
        if para:
            out.append("<p>" + "<br>".join(_inline(p) for p in para) + "</p>")
            para = []
        if lst:
            tag, entries = lst
            out.append(f"<{tag}>" + "".join(f"<li>{_inline(e)}</li>" for e in entries) + f"</{tag}>")
            lst = None

    while i < len(lines):
        line = lines[i]
        s = line.strip()
        if s.startswith("```"):
            flush()
            code = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            out.append(f"<pre class=\"md-code\"><code>{html.escape(chr(10).join(code), quote=False)}</code></pre>")
        elif s.startswith("$$") and s.endswith("$$") and len(s) > 4:
            flush()
            out.append(f"<div class=\"math\">{html.escape(s, quote=False)}</div>")
        elif s == "---":
            flush()
            out.append("<hr>")
        elif s.startswith("#"):
            flush()
            level = min(len(s) - len(s.lstrip("#")), 4)
            out.append(f"<h{level + 1}>{_inline(s.lstrip('#').strip())}</h{level + 1}>")
        elif re.match(r"^[-*]\s+", s):
            if para:
                flush()
            if not lst or lst[0] != "ul":
                flush()
                lst = ("ul", [])
            lst[1].append(re.sub(r"^[-*]\s+", "", s))
        elif re.match(r"^\d+\.\s+", s):
            if para:
                flush()
            if not lst or lst[0] != "ol":
                flush()
                lst = ("ol", [])
            lst[1].append(re.sub(r"^\d+\.\s+", "", s))
        elif s.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells_ = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c) for c in cells_):
                    rows.append(cells_)
                i += 1
            i -= 1
            body = "".join(
                "<tr>" + "".join(f"<{'th' if r == 0 else 'td'}>{_inline(c)}</{'th' if r == 0 else 'td'}>" for c in row) + "</tr>"
                for r, row in enumerate(rows))
            out.append(f"<table class=\"md-table\">{body}</table>")
        elif not s:
            flush()
        else:
            if lst:
                flush()
            para.append(s)
        i += 1
    flush()
    return "\n".join(out)


# ======================================================================
# Tapşırıqlar arası asılılıq (məs. F2 F1-də hesablanan y_pred-dən istifadə edir)
# ======================================================================

def _defined_names(code):
    names = re.findall(r"^\s*([A-Za-z_]\w*)\s*=(?!=)", code, re.M)
    names += re.findall(r"^\s*def\s+([A-Za-z_]\w*)", code, re.M)
    return set(names)


def _param_names(code):
    out = set()
    for params in re.findall(r"^\s*def\s+\w+\s*\(([^)]*)\)", code, re.M):
        out |= {p.split("=")[0].strip() for p in params.split(",") if p.strip()}
    return out


def task_dependencies(tasks):
    """{task_id: [(əvvəlki_tapşırıq, [adlar])]} — yalnız kod tapşırıqları arasında."""
    deps, defined_by = {}, {}
    for t in tasks:
        if t["kind"] != "code":
            continue
        code = t["starter"]
        own = _defined_names(code) | _param_names(code)
        used = set(re.findall(r"\b([A-Za-z_]\w*)\b", re.sub(r"#.*", "", code)))
        # başlanğıc kodda `___` ola bilər — tapşırıq mətnində adı çəkilən dəyişənlər də nəzərə alınır
        used |= set(re.findall(r"`([A-Za-z_]\w*)`", t.get("md", "")))
        found = {}
        for name in sorted(used - own):
            if name in defined_by:
                found.setdefault(defined_by[name], []).append(name)
        if found:
            deps[t["id"]] = sorted(found.items())
        for name in _defined_names(code):
            defined_by.setdefault(name, t["id"])
    return deps


def dependency_note(deps):
    parts = [f"{src}-də hesablanan " + ", ".join(f"`{n}`" for n in names) for src, names in deps]
    srcs = ", ".join(src for src, _ in deps)
    return (f"Diqqət: bu tapşırıq {' və '.join(parts)} dəyişənindən istifadə edir. "
            f"Əvvəlcə {srcs} tapşırığını düzgün tamamlayın — əks halda bu tapşırıq da səhv sayılacaq.")


# ======================================================================
# variant_X.py generatoru
# ======================================================================

PY_HEADER = '''# -*- coding: utf-8 -*-
"""
BAKI MÜHƏNDİSLİK UNİVERSİTETİ (BMU)
Fənn: Maşın Öyrənmənin Əsasları — SDF 1 (Variant {v})
Maksimum bal: 100 (20 tapşırıq)

İSTİFADƏ QAYDASI
1. Hər tapşırığın kodunu `with hell("..."):` blokunun İÇİNDƏ yazın
   (blokun içindəki sətirlər 4 boşluq girintili olmalıdır).
   `___` olan yerləri tamamlayın, `pass` əvəzinə funksiyanı yazın.
2. Faylı işə salın:   python variant_{v}.py
3. Hər tapşırıq dərhal yoxlanır:
       ✅ Tapşırıq B1: DÜZGÜNDÜR (+6 bal)
       ❌ Tapşırıq B1: XƏTA — ...   (altında səbəb göstərilir)
   Faylın sonunda yekun balınız çap olunur.

Qeyd: bir tapşırıqdakı icra xətası digər tapşırıqları dayandırmır.
SyntaxError (məs. mötərizə və ya girinti səhvi) isə bütün faylın işləməsinə
mane olur — Python xətanın sətrini göstərəcək, onu düzəldib yenidən işlədin.
Funksiyaların adlarını və arqumentlərini dəyişməyin.

Bu fayl tools/build_exam.py ilə SDF1_Variant_{v}.ipynb-dən yaradılıb.
"""

import hashlib
import math
import sys

import numpy as np
import pandas as pd

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

results = {{}}
_errors = {{}}


def _h(x):
    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()


class hell:
    """Tapşırıq blokunu qoruyur: blokdakı xəta yadda saxlanır, fayl isə işləməyə davam edir."""

    def __init__(self, task_id):
        self.task_id = task_id

    def __enter__(self):
        _errors.pop(self.task_id, None)
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            return False
        if "'___'" in str(exc):
            _errors[self.task_id] = "`___` boşluqları hələ doldurulmayıb"
        else:
            _errors[self.task_id] = f"kodunuz icra olunarkən xəta baş verdi → {{exc_type.__name__}}: {{exc}}"
        return True


def check(task_id, points, test):
    """Testi işlədir, nəticəni `results`-də saxlayır və ekrana rəy çıxarır."""
    tid = task_id.split("_")[0]
    try:
        test()
        results[task_id] = points
        print(f"✅ Tapşırıq {{tid}}: DÜZGÜNDÜR (+{{points}} bal)")
        return
    except AssertionError as e:
        reason = str(e) or "test şərti ödənmədi"
    except NameError as e:
        reason = f"tələb olunan dəyişən/funksiya təyin edilməyib ({{e}})"
    except Exception as e:
        reason = f"{{type(e).__name__}}: {{e}}"
    results[task_id] = 0
    if tid in _errors:
        reason = _errors[tid]
    print(f"❌ Tapşırıq {{tid}}: XƏTA — Çıxış formatı və ya hesablanmış dəyər gözlənilən nəticəyə uyğun deyil!")
    print(f"   ↳ Səbəb: {{reason}}")

'''


def _comment(md):
    lines = md.rstrip().split("\n")
    bar = "# " + "=" * 70
    return "\n".join([bar] + [("# " + l).rstrip() for l in lines] + [bar])


def _indent(code):
    return "\n".join(("    " + l) if l.strip() else "" for l in code.split("\n"))


def build_py(variant, nb_path, answers=None):
    """answers verilsə, həll blokları düzgün cavablarla doldurulur (yoxlama üçün)."""
    with open(nb_path, encoding="utf-8") as f:
        cells = json.load(f)["cells"]
    parsed = parse_notebook(nb_path)
    starter_to_task = {t["starter"]: t["id"] for t in parsed["tasks"] if t["kind"] == "code"}
    var_to_task = {t["var"]: t for t in parsed["tasks"] if t["kind"] != "code"}

    deps = task_dependencies(parsed["tasks"])
    parts = [PY_HEADER.format(v=variant)]
    seen_setup = False
    for cell in cells:
        src = _src(cell).rstrip()
        if cell["cell_type"] == "markdown":
            if src.startswith("## Yoxlama Sisteminin"):
                continue
            parts.append(_comment(src) + "\n")
            continue
        if "def check(" in src:
            seen_setup = True
            continue
        if not seen_setup or re.search(r"^check\(", src, re.M) or src.startswith("MAX_POINTS"):
            parts.append(src + "\n\n")
            continue
        if src in starter_to_task:
            tid = starter_to_task[src]
            code = answers.get(tid, src) if answers else src
        else:
            mm = re.match(r"^(answer_C\d|E\d)\s*=", src)
            if mm and mm.group(1) in var_to_task:
                tid = var_to_task[mm.group(1)]["id"]
                code = src
                if answers and tid in answers:
                    val = answers[tid]
                    code = f'{mm.group(1)} = {val if re.fullmatch(r"-?\d+", val) else json.dumps(val)}'
            else:
                parts.append(src + "\n\n")  # sabit verilənlər
                continue
        if tid in deps:
            parts.append("# " + dependency_note(deps[tid]).replace("`", "") + "\n")
        parts.append(f'with hell("{tid}"):\n{_indent(code)}\n\n')
    return "\n".join(parts).rstrip() + "\n"


# ======================================================================
# exam_data.js generatoru
# ======================================================================

def build_exam_data(src_dir):
    data = {"version": 2, "harness": HARNESS_SOURCE, "variants": {}}
    for v in VARIANTS:
        p = parse_notebook(os.path.join(src_dir, f"SDF1_Variant_{v}.ipynb"))
        deps = task_dependencies(p["tasks"])
        tasks = []
        for t in p["tasks"]:
            out = {"id": t["id"], "title": t["title"], "pts": t["pts"], "kind": t["kind"], "html": md_to_html(t["md"])}
            if t["id"] in deps:
                out["depends_on"] = [src for src, _ in deps[t["id"]]]
                out["html"] = f'<div class="dep-note">{_inline(dependency_note(deps[t["id"]]))}</div>' + out["html"]
            if t["kind"] == "code":
                out["starter"] = t["starter"]
            elif t["kind"] == "choice":
                out["options"] = {k: _inline(o) for k, o in t["options"].items()}
            tasks.append(out)
        items = []
        for it in p["items"]:
            if it["type"] == "section":
                items.append({"type": "section", "html": md_to_html(it["md"])})
            else:
                items.append(it)
        data["variants"][v] = {
            "name": f"Variant {v}",
            "max_score": sum(t["pts"] for t in tasks),
            "items": items,
            "tasks": tasks,
            "steps": p["steps"],
        }
        assert len(tasks) == 20, f"Variant {v}: {len(tasks)} tapşırıq tapıldı (20 gözlənilirdi)"
        assert data["variants"][v]["max_score"] == 100, f"Variant {v}: cəm bal {data['variants'][v]['max_score']}"
    return data


def write_exam_data(data, path):
    body = json.dumps(data, ensure_ascii=False, indent=1)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("// AVTOMATİK YARADILIB: python tools/build_exam.py — əl ilə redaktə etməyin.\n")
        f.write("window.EXAM_DATA = " + body + ";\n")


# ======================================================================
# Yoxlama (--verify)
# ======================================================================

def verify(src_dir, data):
    harness = load_harness()
    ok = True
    print("\n=== YOXLAMA: notebook-lar, .py faylları və veb mühərriki ===")
    for v in VARIANTS:
        nb = os.path.join(src_dir, f"SDF1_Variant_{v}.ipynb")
        key_nb = os.path.join(src_dir, f"SDF1_Variant_{v}_cavablar.ipynb")
        parsed = parse_notebook(nb)
        key = answers_from_key_notebook(key_nb, parsed)
        steps = data["variants"][v]["steps"]

        web_full = harness.run_variant(steps, key)
        web_blank = harness.run_variant(steps, {})
        s_full = sum(r["pts"] for r in web_full["results"].values())
        s_blank = sum(r["pts"] for r in web_blank["results"].values())
        bad = [k for k, r in web_full["results"].items() if not r["ok"]]

        with tempfile.TemporaryDirectory() as td:
            def run_py(code):
                fp = os.path.join(td, f"variant_{v}.py")
                with open(fp, "w", encoding="utf-8") as f:
                    f.write(code)
                r = subprocess.run([sys.executable, fp], capture_output=True, text=True, encoding="utf-8", timeout=120)
                m = re.search(r"YEKUN İMTAHAN BALI: (\d+) / (\d+)", r.stdout)
                return (int(m.group(1)) if m else None), r
            py_full, r_full = run_py(build_py(v, nb, key))
            py_blank, r_blank = run_py(build_py(v, nb))

        cvals = {k: key[k] for k in ("C1", "C2")}
        evals = "".join(key[f"E{i}"] for i in range(1, 8))
        line_ok = s_full == 100 and s_blank == 0 and py_full == 100 and py_blank == 0 and len(key) == 20
        ok &= line_ok
        print(f"Variant {v}: veb düzgün={s_full}/100 boş={s_blank}/100 | .py düzgün={py_full}/100 boş={py_blank}/100 "
              f"| açar C={cvals} E={evals} {'✅' if line_ok else '❌'}")
        if bad:
            print("   veb səhv tapşırıqlar:", {k: web_full['results'][k]['detail'] for k in bad})
        if py_full != 100:
            print(r_full.stdout[-2000:], r_full.stderr[-2000:])
        if py_blank != 0:
            print(r_blank.stdout[-2000:], r_blank.stderr[-2000:])
    print("NƏTİCƏ:", "HAMISI DÜZGÜNDÜR ✅" if ok else "PROBLEM VAR ❌")
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--src", default=os.path.dirname(ROOT), help="SDF1_Variant_*.ipynb olan qovluq")
    ap.add_argument("--verify", action="store_true", help="*_cavablar.ipynb ilə 100/100 və boş faylla 0/100 yoxlaması")
    args = ap.parse_args()

    data = build_exam_data(args.src)
    write_exam_data(data, os.path.join(ROOT, "exam_data.js"))
    for v in VARIANTS:
        code = build_py(v, os.path.join(args.src, f"SDF1_Variant_{v}.ipynb"))
        with open(os.path.join(ROOT, f"variant_{v}.py"), "w", encoding="utf-8", newline="\n") as f:
            f.write(code)
    print("Yaradıldı: exam_data.js, variant_A.py ... variant_E.py")

    if args.verify and not verify(args.src, data):
        sys.exit(1)


if __name__ == "__main__":
    main()
