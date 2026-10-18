// AVTOMATİK YARADILIB: python tools/build_exam.py — əl ilə redaktə etməyin.
window.EXAM_DATA = {
 "version": 2,
 "harness": "\nimport builtins\nimport contextlib\nimport hashlib\nimport io\nimport json\nimport math\nimport re\nimport sys\nimport time\n\nimport numpy as np\nimport pandas as pd\n\n# Yalnız təhlükəsizlik üçün zəruri modullar bloklanır; digər standart kitabxanalar (itertools, collections, heapq, bisect, random, os, ...) sərbəstdir\n_BLOCKED_MODULES = (\"js\", \"pyodide\", \"pyodide_js\", \"_pyodide\", \"micropip\", \"subprocess\", \"socket\")\n_real_import = builtins.__import__\n\n\ndef _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):\n    if name.split(\".\")[0] in _BLOCKED_MODULES:\n        raise ImportError(f\"'{name}' modulu imtahanda qadağandır\")\n    return _real_import(name, globals, locals, fromlist, level)\n\n\ndef _h(x):\n    return hashlib.sha256(str(x).strip().lower().encode()).hexdigest()\n\n\ndef _plain(v):\n    \"\"\"numpy/tuple/set tiplərini adi Python siyahı-dəyərlərinə çevirir (tolerant müqayisə üçün).\"\"\"\n    if hasattr(v, \"tolist\"):\n        v = v.tolist()\n    if isinstance(v, (list, tuple)):\n        return [_plain(x) for x in v]\n    if isinstance(v, dict):\n        return {k: _plain(x) for k, x in v.items()}\n    return v\n\n\ndef _eq(a, b):\n    \"\"\"Tolerant bərabərlik: list≈tuple≈ndarray, 1.0≈1, float-lar üçün kiçik xəta payı.\"\"\"\n    a, b = _plain(a), _plain(b)\n    if isinstance(a, list) and isinstance(b, list):\n        return len(a) == len(b) and all(_eq(x, y) for x, y in zip(a, b))\n    if isinstance(a, dict) and isinstance(b, dict):\n        return a.keys() == b.keys() and all(_eq(a[k], b[k]) for k in a)\n    if isinstance(a, float) or isinstance(b, float):\n        try:\n            return math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9)\n        except TypeError:\n            return False\n    return a == b\n\n\nOK_MSG = \"✅ Tapşırıq {t}: DÜZGÜNDÜR (+{p} bal)\"\nFAIL_MSG = \"❌ Tapşırıq {t}: XƏTA — Çıxış formatı və ya hesablanmış dəyər gözlənilən nəticəyə uyğun deyil!\"\n\n\ndef _exec_limited(code, ns, budget, out):\n    \"\"\"Kodu vaxt limiti ilə icra edir (sonsuz dövrlər brauzeri dondurmasın).\"\"\"\n    deadline = time.monotonic() + budget\n\n    def tracer(frame, event, arg):\n        if time.monotonic() > deadline:\n            raise TimeoutError(f\"icra {budget:g} saniyədən çox çəkdi (sonsuz dövr ola bilər)\")\n        return tracer\n\n    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):\n        sys.settrace(tracer)\n        try:\n            exec(compile(code, \"<kod>\", \"exec\"), ns)\n        finally:\n            sys.settrace(None)\n\n\n_QUOTES = {\"\\u201c\": '\"', \"\\u201d\": '\"', \"\\u201e\": '\"', \"\\u2018\": \"'\", \"\\u2019\": \"'\", \"\\u00a0\": \" \", \"\\u2009\": \" \",\n           \"\\u200b\": \"\", \"\\u200c\": \"\", \"\\u200d\": \"\", \"\\ufeff\": \"\", \"\\u2013\": \"-\", \"\\u2212\": \"-\"}\n\n\ndef normalize_code(code):\n    \"\"\"\n    Colab/Jupyter-dən gələn kodu tolerant şəkildə qəbul edir:\n    CRLF, sətir başındakı Tab (4 boşluq), görünməz/qeyri-standart simvollar (NBSP, \\u200b), \"ağıllı\" dırnaqlar,\n    ümumi artıq girinti (kod xanası içəridən kopyalananda) və Jupyter sehrli sətirləri (%magic, !əmr) düzəldilir.\n    \"\"\"\n    import textwrap\n    code = str(code).replace(\"\\r\\n\", \"\\n\").replace(\"\\r\", \"\\n\")\n    code = \"\".join(_QUOTES.get(c, c) for c in code)\n    lines = []\n    for ln in code.split(\"\\n\"):\n        stripped = ln.lstrip(\" \\t\")\n        lead = ln[:len(ln) - len(stripped)].replace(\"\\t\", \"    \")\n        if stripped.startswith((\"%\", \"!\")) and not stripped.startswith(\"!=\"):\n            continue                      # Jupyter: %matplotlib inline, !pip install ...\n        lines.append((lead + stripped).rstrip())\n    return textwrap.dedent(\"\\n\".join(lines)).strip(\"\\n\") + \"\\n\"\n\n\ndef _describe(exc):\n    if \"'___'\" in str(exc):\n        return \"`___` boşluqları hələ doldurulmayıb\"\n    if isinstance(exc, IndentationError):\n        return f\"Girinti xətası (sətir {exc.lineno}): {exc.msg}. Bloklardan sonra (:) 4 boşluq girinti qoyun.\"\n    if isinstance(exc, SyntaxError):\n        return f\"Sintaksis xətası (sətir {exc.lineno}): {exc.msg}\"\n    return f\"{type(exc).__name__}: {exc}\"\n\n\ndef _coerce(value):\n    if value is None:\n        return None\n    s = str(value).strip()\n    if s == \"\":\n        return None\n    if re.fullmatch(r\"[+-]?\\d+\", s):\n        return int(s)\n    return s\n\n\ndef run_variant(steps, answers, upto=None, budget=10.0):\n    \"\"\"\n    steps   : exam_data.js-dəki addımlar (notebook ardıcıllığı ilə)\n    answers : {\"A1\": \"<kod>\", \"C1\": \"24\", \"E1\": \"b\", ...}\n    upto    : yalnız bu tapşırığın testinə qədər icra et (\"Test Et\" düyməsi üçün)\n    Nəticə  : {\"results\": {id: {ok, pts, max, msg, detail}}, \"output\": {id: stdout}}\n    \"\"\"\n    answers = answers or {}\n    ns = {\n        \"__name__\": \"__main__\",\n        \"__builtins__\": dict(vars(builtins), __import__=_guarded_import),\n        \"np\": np, \"pd\": pd, \"math\": math, \"hashlib\": hashlib, \"_h\": _h, \"_eq\": _eq,\n    }\n    errors, results, output = {}, {}, {}\n    defined_by = {}   # dəyişən/funksiya adı -> onu yaradan əvvəlki tapşırıq (məs. y_pred -> F1)\n\n    def check(task_id, points, test):\n        t = task_id.split(\"_\")[0]\n        try:\n            test()\n            results[t] = {\"ok\": True, \"pts\": points, \"max\": points, \"msg\": OK_MSG.format(t=t, p=points), \"detail\": \"\"}\n            return\n        except AssertionError as e:\n            detail = str(e) or \"test şərti ödənmədi\"\n        except NameError as e:\n            detail = f\"tələb olunan dəyişən/funksiya təyin edilməyib ({e})\"\n        except BaseException as e:\n            detail = _describe(e)\n        if t in errors:\n            detail = errors[t] if errors[t].startswith(\"`\") else \"kodunuz icra olunarkən xəta baş verdi → \" + errors[t]\n        results[t] = {\"ok\": False, \"pts\": 0, \"max\": points, \"msg\": FAIL_MSG.format(t=t), \"detail\": detail}\n\n    ns[\"check\"] = check\n\n    for st in steps:\n        kind = st[\"k\"]\n        if kind == \"var\":\n            ns[st[\"var\"]] = _coerce(answers.get(st[\"task\"]))\n            continue\n        label = st.get(\"task\")\n        code = st[\"code\"]\n        if kind == \"code\" and label in answers and answers[label] is not None:\n            code = normalize_code(answers[label])\n        out = io.StringIO()\n        try:\n            _exec_limited(code, ns, budget, out)\n        except BaseException as e:\n            if label:\n                errors[label] = _describe(e)\n                # Əvvəlki tapşırığın nəticəsi yoxdursa (məs. F2 üçün F1-in y_pred-i), bunu aydın deyək\n                missing = getattr(e, \"name\", None) if isinstance(e, NameError) else None\n                if missing in defined_by and defined_by[missing] != label:\n                    src = defined_by[missing]\n                    errors[label] = (f\"`{missing}` {src} tapşırığında hesablanır, lakin {src} hələ tamamlanmayıb \"\n                                     f\"və ya xəta verir. Əvvəlcə {src}-i düzgün tamamlayın.\")\n        if kind == \"code\" and label:\n            names = re.findall(r\"^\\s*([A-Za-z_]\\w*)\\s*=(?!=)\", st[\"code\"], re.M)\n            names += re.findall(r\"^\\s*def\\s+([A-Za-z_]\\w*)\", st[\"code\"], re.M)\n            for name in names:\n                defined_by.setdefault(name, label)\n        if label:\n            output[label] = out.getvalue()[-2000:]\n        elif kind == \"test\" and out.getvalue():\n            # test zamanı tələbə funksiyasının çap etdikləri\n            output[st[\"ids\"][0]] = (output.get(st[\"ids\"][0], \"\") + out.getvalue())[-2000:]\n        if kind == \"test\" and upto and upto in st[\"ids\"]:\n            break\n\n    if upto:\n        results = {k: v for k, v in results.items() if k == upto}\n        output = {k: v for k, v in output.items() if k == upto}\n    return {\"results\": results, \"output\": output}\n\n\ndef run_json(payload):\n    \"\"\"Pyodide körpüsü: JSON mətn daxil olur, JSON mətn qayıdır.\"\"\"\n    p = json.loads(payload)\n    return json.dumps(run_variant(p[\"steps\"], p.get(\"answers\"), p.get(\"upto\"), p.get(\"budget\", 10.0)),\n                      ensure_ascii=False)\n",
 "variants": {
  "A": {
   "name": "Variant A",
   "max_score": 100,
   "items": [
    {
     "type": "section",
     "html": "<h4>Bal bölgüsü (Cəmi 100 bal / 10 tapşırıq)</h4>\n<table class=\"md-table\"><tr><th>Hissə</th><th>Mövzu</th><th>Tapşırıq sayı</th><th>Hər biri</th><th>Bal</th></tr><tr><td><b>A</b></td><td>Nəzəri suallar</td><td>4</td><td>10</td><td>40</td></tr><tr><td><b>B</b></td><td>Riyazi və dövrü alqoritmlər</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>C</b></td><td>Massivlər, iki göstərici və prefiks cəmləri</td><td>2</td><td>10</td><td>20</td></tr><tr><td><b>D</b></td><td>Matrislər (iki ölçülü massivlər)</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>E</b></td><td>Sətirlər və Unicode emalı</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>F</b></td><td>Əlaqəli siyahılar (lüğət düyünləri ilə)</td><td>1</td><td>10</td><td>10</td></tr><tr><td></td><td><b>CƏMİ</b></td><td><b>10</b></td><td></td><td><b>100</b></td></tr></table>\n<hr>\n<h2>A hissəsi. Nəzəri suallar (40 bal)</h2>\n<p>Düzgün variantı seçin. Hər sual <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "A1"
    },
    {
     "type": "task",
     "id": "A2"
    },
    {
     "type": "task",
     "id": "A3"
    },
    {
     "type": "task",
     "id": "A4"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>B hissəsi. Riyazi və dövrü alqoritmlər (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "B1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>C hissəsi. Massivlər, iki göstərici və prefiks cəmləri (20 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "C1"
    },
    {
     "type": "task",
     "id": "C2"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>D hissəsi. Matrislər (iki ölçülü massivlər) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Matris — siyahıların siyahısıdır: <code>M[i][j]</code> — <code>i</code>-ci sətir, <code>j</code>-ci sütun.</p>"
    },
    {
     "type": "task",
     "id": "D1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>E hissəsi. Sətirlər və Unicode emalı (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "E1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>F hissəsi. Əlaqəli siyahılar (lüğət düyünləri ilə) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Düyün <b>lüğət</b> kimi təyin olunur: <code>{\"data\": qiymət, \"next\": növbəti_düyün}</code>. Boş siyahı <code>None</code> ilə göstərilir.</p>"
    },
    {
     "type": "task",
     "id": "F1"
    }
   ],
   "tasks": [
    {
     "id": "A1",
     "title": "Tapşırıq A1. Alqoritmin icra müddəti T(n) (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A1. Alqoritmin icra müddəti T(n) (10 bal)</h4>\n<p>Alqoritmin icra müddətinin <code>T(n)</code> elementar addım sayı ilə ölçülməsinin əsas üstünlüyü nədir?</p>",
     "options": {
      "a": "T(n) yalnız alqoritmin tutduğu yaddaşın bayt sayıdır",
      "b": "T(n) yalnız dövr operatorlarının sayını hesablayır, digər əməliyyatlar nəzərə alınmır",
      "c": "Nəticə konkret kompüterin sürətindən və aparat təminatından asılı olmur, yalnız giriş ölçüsü n ilə alqoritmin davranışını göstərir",
      "d": "T(n) saniyələrlə ölçülür və hər kompüterdə eyni nəticə verir"
     }
    },
    {
     "id": "A2",
     "title": "Tapşırıq A2. İkitərəfli və dairəvi əlaqəli siyahı (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A2. İkitərəfli və dairəvi əlaqəli siyahı (10 bal)</h4>\n<p>İkitərəfli (Doubly) və dairəvi (Circular) əlaqəli siyahılar haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "İkitərəfli siyahıda düyün <code>next</code> və <code>prev</code> saxlayır (hər iki istiqamətdə keçid olur); dairəvi siyahıda sonuncu düyün <code>None</code> əvəzinə birinci düyünə istinad edir",
      "b": "İkitərəfli siyahıda düyün yalnız <code>next</code> saxlayır, dairəvi siyahıda isə yalnız <code>prev</code>",
      "c": "İkitərəfli siyahı yalnız sıralanmış verilənləri saxlaya bilər",
      "d": "Dairəvi siyahıda sonuncu düyünün <code>next</code>-i həmişə <code>None</code>-dur"
     }
    },
    {
     "id": "A3",
     "title": "Tapşırıq A3. Python list və NumPy ndarray (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A3. Python list və NumPy ndarray (10 bal)</h4>\n<p>Python <code>list</code> və NumPy <code>ndarray</code> strukturlarının daxili yaddaş təşkili haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "list obyektlərə istinadlar saxlayır (elementlər yaddaşda səpələnə bilər), ndarray isə eyni tipli elementləri bitişik yaddaş blokunda saxlayır",
      "b": "İkisinin daxili yaddaş təşkili tam eynidir",
      "c": "ndarray yalnız sətirləri saxlaya bilər, list isə yalnız ədədləri",
      "d": "list eyni tipli elementləri bitişik blokda saxlayır, ndarray isə yalnız istinadlar saxlayır"
     }
    },
    {
     "id": "A4",
     "title": "Tapşırıq A4. Head və tail-ə əlavə etmə (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A4. Head və tail-ə əlavə etmə (10 bal)</h4>\n<p>Birtərəfli əlaqəli siyahıya yeni düyünün əlavə olunmasının mürəkkəbliyi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Başa əlavə O(n), sona əlavə həmişə O(1)-dir",
      "b": "Başa əlavə üçün bütün düyünlər bir pillə sürüşdürülməlidir, ona görə O(n)-dir",
      "c": "Hər iki əlavə həmişə O(n)-dir",
      "d": "Başa (head) əlavə O(1)-dir; sona əlavə tail göstəricisi yoxdursa O(n), varsa O(1)-dir"
     }
    },
    {
     "id": "B1",
     "title": "Tapşırıq B1. Fibonaççi ədədi (iterativ) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq B1. Fibonaççi ədədi (iterativ) (10 bal)</h4>\n<p>Fibonaççi ardıcıllığının <code>n</code>-ci həddini (<code>F(0)=0</code>, <code>F(1)=1</code>) <b>iterativ</b> üsulla, O(n) zamanda və O(1) əlavə yaddaşla hesablayan <code>fibonacci(n)</code> funksiyasını yazın.<br>Nümunə: <code>10</code> → <code>55</code>. Rekursiv həll böyük <code>n</code> üçün çox yavaş olacaq.</p>",
     "starter": "def fibonacci(n):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C1",
     "title": "Tapşırıq C1. Prefiks cəm massivi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C1. Prefiks cəm massivi (10 bal)</h4>\n<p><code>arr</code> üçün <b>prefiks cəm massivi</b> quran <code>prefiks_cem(arr)</code> funksiyasını yazın. Nəticə massivi <code>p</code>-nin uzunluğu <code>len(arr) + 1</code>, <code>p[0] = 0</code> və <code>p[i] = arr[0] + ... + arr[i-1]</code> olmalıdır. Beləliklə, <code>arr[l..r]</code> aralığının cəmi <code>p[r+1] - p[l]</code> ilə O(1) müddətində tapılır.<br>Nümunə: <code>[2, 4, 6, 8]</code> → <code>[0, 2, 6, 12, 20]</code>.</p>",
     "starter": "def prefiks_cem(arr):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C2",
     "title": "Tapşırıq C2. Dinamik massiv simulyasiyası (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C2. Dinamik massiv simulyasiyası (10 bal)</h4>\n<p>Tutumu <code>tutum</code> olan massivdə (<code>massiv</code>, içində <code>say</code> element var) yeni <code>x</code> elementini əlavə edən <code>elave_et(massiv, say, tutum, x)</code> funksiyasını yazın. Tutum dolubsa (<code>say == tutum</code>), <b>tutum 2 dəfə artırılmalı</b> (yeni siyahı <code>[None] * (2 * tutum)</code>, köhnə elementlər köçürülür) və sonra <code>x</code> əlavə olunmalıdır.<br>Funksiya <code>(massiv, say, tutum)</code> üçlüyünü (yenilənmiş) qaytarır. Başlanğıc: <code>massiv = [None] * 2</code>, <code>say = 0</code>, <code>tutum = 2</code>.</p>",
     "starter": "def elave_et(massiv, say, tutum, x):\n    # buranı yazın\n    pass"
    },
    {
     "id": "D1",
     "title": "Tapşırıq D1. Perimetr elementlərinin cəmi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq D1. Perimetr elementlərinin cəmi (10 bal)</h4>\n<p><code>N x M</code> matrisinin <b>sərhəd (perimetr) elementlərinin</b> (birinci/sonuncu sətir və birinci/sonuncu sütun) cəmini hesablayan <code>perimetr_cemi(M)</code> funksiyasını yazın. Hər element yalnız bir dəfə sayılmalıdır.<br>Nümunə: <code>[[1,2,3],[4,5,6],[7,8,9]]</code> → <code>40</code>.</p>",
     "starter": "def perimetr_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "id": "E1",
     "title": "Tapşırıq E1. Hər sözün ilk hərfi böyük (Custom Title Case) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq E1. Hər sözün ilk hərfi böyük (Custom Title Case) (10 bal)</h4>\n<p>Mətndəki hər sözün <b>ilk hərfini böyük</b>, qalan hərflərini <b>kiçik</b> edən <code>basliq_formati(metn)</code> funksiyasını yazın (<code>title()</code> və <code>capitalize()</code> istifadə etmək olmaz). Sözlər boşluqla ayrılır, boşluqlar (o cümlədən ardıcıl boşluqlar) olduğu kimi qalmalıdır.<br>Nümunə: <code>\"salam dünya\"</code> → <code>\"Salam Dünya\"</code>.</p>",
     "starter": "def basliq_formati(metn):\n    # buranı yazın\n    pass"
    },
    {
     "id": "F1",
     "title": "Tapşırıq F1. Siyahını oxumaq və düyün sayı (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq F1. Siyahını oxumaq və düyün sayı (10 bal)</h4>\n<p>Düyün lüğət kimi təyin olunur (<code>{\"data\": ..., \"next\": ...}</code>), boş siyahı <code>None</code>-dur. Siyahının bütün elementlərini <b>ardıcıl</b> olaraq siyahıya yığıb düyünlərin sayı ilə birlikdə <code>(elementler, say)</code> tuple-ı kimi qaytaran <code>siyahi_oxu(head)</code> funksiyasını yazın.<br>Nümunə: <code>1 → 2 → 3</code> → <code>([1, 2, 3], 3)</code>; boş siyahı → <code>([], 0)</code>.</p>",
     "starter": "def siyahi_oxu(head):\n    # buranı yazın\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "A1",
     "var": "cavab_A1"
    },
    {
     "k": "test",
     "ids": [
      "A1"
     ],
     "code": "def test_a1():\n    assert _h(cavab_A1) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"cavab düzgün deyil\"\ncheck(\"A1\", 10, test_a1)"
    },
    {
     "k": "var",
     "task": "A2",
     "var": "cavab_A2"
    },
    {
     "k": "test",
     "ids": [
      "A2"
     ],
     "code": "def test_a2():\n    assert _h(cavab_A2) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"cavab düzgün deyil\"\ncheck(\"A2\", 10, test_a2)"
    },
    {
     "k": "var",
     "task": "A3",
     "var": "cavab_A3"
    },
    {
     "k": "test",
     "ids": [
      "A3"
     ],
     "code": "def test_a3():\n    assert _h(cavab_A3) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"cavab düzgün deyil\"\ncheck(\"A3\", 10, test_a3)"
    },
    {
     "k": "var",
     "task": "A4",
     "var": "cavab_A4"
    },
    {
     "k": "test",
     "ids": [
      "A4"
     ],
     "code": "def test_a4():\n    assert _h(cavab_A4) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A4\", 10, test_a4)"
    },
    {
     "k": "code",
     "task": "B1",
     "code": "def fibonacci(n):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "B1"
     ],
     "code": "def test_b1():\n    for _args, _exp in [((0,), 0), ((1,), 1), ((10,), 55), ((30,), 832040), ((80,), 23416728348467685)]:\n        _r = fibonacci(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"fibonacci{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"B1\", 10, test_b1)"
    },
    {
     "k": "code",
     "task": "C1",
     "code": "def prefiks_cem(arr):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C1"
     ],
     "code": "def test_c1():\n    _r = prefiks_cem([2, 4, 6, 8])\n    assert list(_r) == [0, 2, 6, 12, 20], f\"[0, 2, 6, 12, 20] olmalıdır, sizinki: {_r}\"\n    assert list(prefiks_cem([])) == [0], \"boş massiv üçün [0] olmalıdır\"\n    assert list(prefiks_cem([-1, 5, -2])) == [0, -1, 4, 2], \"[-1, 5, -2] üçün [0, -1, 4, 2] olmalıdır\"\n    _p = prefiks_cem([5, 1, 3, 7, 2])\n    assert _p[4] - _p[1] == 11, \"arr[1..3] aralığının cəmi 11 olmalıdır (p[4] - p[1])\"\ncheck(\"C1\", 10, test_c1)"
    },
    {
     "k": "code",
     "task": "C2",
     "code": "def elave_et(massiv, say, tutum, x):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C2"
     ],
     "code": "def test_c2():\n    _m, _s, _t = [None] * 2, 0, 2\n    _tutumlar = []\n    for _x in range(1, 10):\n        _m, _s, _t = elave_et(_m, _s, _t, _x)\n        _tutumlar.append(_t)\n    assert _tutumlar == [2, 2, 4, 4, 8, 8, 8, 8, 16], f\"tutum ardıcıllığı [2, 2, 4, 4, 8, 8, 8, 8, 16] olmalıdır, sizinki: {_tutumlar}\"\n    assert _s == 9, f\"element sayı 9 olmalıdır, sizinki: {_s}\"\n    assert len(_m) == 16, f\"massivin uzunluğu 16 olmalıdır, sizinki: {len(_m)}\"\n    assert _m[:9] == [1, 2, 3, 4, 5, 6, 7, 8, 9], f\"ilk 9 element [1..9] olmalıdır, sizinki: {_m[:9]}\"\ncheck(\"C2\", 10, test_c2)"
    },
    {
     "k": "code",
     "task": "D1",
     "code": "def perimetr_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "D1"
     ],
     "code": "def test_d1():\n    for _args, _exp in [(([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), 40), (([[1, 2, 3]],), 6), (([[5]],), 5), (([[1, 2], [3, 4]],), 10), (([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]],), 65)]:\n        _r = perimetr_cemi(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"perimetr_cemi{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"D1\", 10, test_d1)"
    },
    {
     "k": "code",
     "task": "E1",
     "code": "def basliq_formati(metn):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "E1"
     ],
     "code": "def test_e1():\n    class _S(str):\n        \"\"\"Qadağan olunmuş metodları çağıranda xəta verən sətir.\"\"\"\n        _BAN = (\"title\", \"capitalize\")\n        def __contains__(self, x):\n            if \"__contains__\" in type(self)._BAN:\n                raise AssertionError(\"bu tapşırıqda 'in' operatorundan istifadə etmək olmaz\")\n            return str.__contains__(self, x)\n        def __getattribute__(self, name):\n            if name in type(self)._BAN:\n                raise AssertionError(f\"bu tapşırıqda {name}() metodundan istifadə etmək olmaz\")\n            return str.__getattribute__(self, name)\n\n    for _s, _e in [(\"salam dünya\", \"Salam Dünya\"), (\"pYTHON proqramlaşdırma dili\", \"Python Proqramlaşdırma Dili\"), (\"\", \"\"), (\"ədəd  alma\", \"Ədəd  Alma\"), (\"a\", \"A\")]:\n        _r = basliq_formati(_S(_s))\n        assert _r == _e, f\"basliq_formati({_s!r}) {_e!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"E1\", 10, test_e1)"
    },
    {
     "k": "code",
     "task": "F1",
     "code": "def siyahi_oxu(head):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "F1"
     ],
     "code": "def test_f1():\n    def _ll_qur(vals):\n        head = None\n        for v in reversed(vals):\n            head = {\"data\": v, \"next\": head}\n        return head\n\n    def _ll_list(head):\n        res = []\n        n = 0\n        while head is not None:\n            res.append(head[\"data\"])\n            head = head[\"next\"]\n            n += 1\n            assert n < 1000, \"siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)\"\n        return res\n\n    for _v, _e in [([1, 2, 3], ([1, 2, 3], 3)), ([], ([], 0)), ([\"a\"], ([\"a\"], 1)), ([5, 5, 5, 5], ([5, 5, 5, 5], 4))]:\n        _r = siyahi_oxu(_ll_qur(_v))\n        assert tuple(_r) == _e, f\"{_v} üçün {_e} olmalıdır, sizinki: {_r}\"\ncheck(\"F1\", 10, test_f1)"
    }
   ]
  },
  "B": {
   "name": "Variant B",
   "max_score": 100,
   "items": [
    {
     "type": "section",
     "html": "<h4>Bal bölgüsü (Cəmi 100 bal / 10 tapşırıq)</h4>\n<table class=\"md-table\"><tr><th>Hissə</th><th>Mövzu</th><th>Tapşırıq sayı</th><th>Hər biri</th><th>Bal</th></tr><tr><td><b>A</b></td><td>Nəzəri suallar</td><td>4</td><td>10</td><td>40</td></tr><tr><td><b>B</b></td><td>Riyazi və dövrü alqoritmlər</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>C</b></td><td>Massivlər, iki göstərici və prefiks cəmləri</td><td>2</td><td>10</td><td>20</td></tr><tr><td><b>D</b></td><td>Matrislər (iki ölçülü massivlər)</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>E</b></td><td>Sətirlər və Unicode emalı</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>F</b></td><td>Əlaqəli siyahılar (lüğət düyünləri ilə)</td><td>1</td><td>10</td><td>10</td></tr><tr><td></td><td><b>CƏMİ</b></td><td><b>10</b></td><td></td><td><b>100</b></td></tr></table>\n<hr>\n<h2>A hissəsi. Nəzəri suallar (40 bal)</h2>\n<p>Düzgün variantı seçin. Hər sual <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "A1"
    },
    {
     "type": "task",
     "id": "A2"
    },
    {
     "type": "task",
     "id": "A3"
    },
    {
     "type": "task",
     "id": "A4"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>B hissəsi. Riyazi və dövrü alqoritmlər (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "B1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>C hissəsi. Massivlər, iki göstərici və prefiks cəmləri (20 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "C1"
    },
    {
     "type": "task",
     "id": "C2"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>D hissəsi. Matrislər (iki ölçülü massivlər) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Matris — siyahıların siyahısıdır: <code>M[i][j]</code> — <code>i</code>-ci sətir, <code>j</code>-ci sütun.</p>"
    },
    {
     "type": "task",
     "id": "D1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>E hissəsi. Sətirlər və Unicode emalı (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "E1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>F hissəsi. Əlaqəli siyahılar (lüğət düyünləri ilə) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Düyün <b>lüğət</b> kimi təyin olunur: <code>{\"data\": qiymət, \"next\": növbəti_düyün}</code>. Boş siyahı <code>None</code> ilə göstərilir.</p>"
    },
    {
     "type": "task",
     "id": "F1"
    }
   ],
   "tasks": [
    {
     "id": "A1",
     "title": "Tapşırıq A1. Mürəkkəblik dərəcələrinin hiyerarxiyası (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A1. Mürəkkəblik dərəcələrinin hiyerarxiyası (10 bal)</h4>\n<p>Hansı sıralama artım sürətinə görə (kiçikdən böyüyə) düzgündür?</p>",
     "options": {
      "a": "O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ)",
      "b": "O(1) &lt; O(log n) &lt; O(n) &lt; O(n²) &lt; O(n log n) &lt; O(2ⁿ)",
      "c": "O(log n) &lt; O(1) &lt; O(n) &lt; O(n log n) &lt; O(2ⁿ) &lt; O(n²)",
      "d": "O(1) &lt; O(n) &lt; O(log n) &lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ)"
     }
    },
    {
     "id": "A2",
     "title": "Tapşırıq A2. İkitərəfli və dairəvi əlaqəli siyahı (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A2. İkitərəfli və dairəvi əlaqəli siyahı (10 bal)</h4>\n<p>İkitərəfli (Doubly) və dairəvi (Circular) əlaqəli siyahılar haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "İkitərəfli siyahıda düyün yalnız <code>next</code> saxlayır, dairəvi siyahıda isə yalnız <code>prev</code>",
      "b": "Dairəvi siyahıda sonuncu düyünün <code>next</code>-i həmişə <code>None</code>-dur",
      "c": "İkitərəfli siyahı yalnız sıralanmış verilənləri saxlaya bilər",
      "d": "İkitərəfli siyahıda düyün <code>next</code> və <code>prev</code> saxlayır (hər iki istiqamətdə keçid olur); dairəvi siyahıda sonuncu düyün <code>None</code> əvəzinə birinci düyünə istinad edir"
     }
    },
    {
     "id": "A3",
     "title": "Tapşırıq A3. Sətirlərin dəyişməzliyi və join() (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A3. Sətirlərin dəyişməzliyi və join() (10 bal)</h4>\n<p>Sətirlər dəyişməzdir (immutable). Dövrdə <code>+</code> operatoru ilə birləşdirmə ilə <code>.join()</code> metodunun müqayisəsi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "<code>+</code> hər dəfə yeni sətir yaradıb köçürdüyü üçün ümumilikdə O(n²) olur, <code>.join()</code> isə nəticəni bir dəfə qurur və O(n)-dir",
      "b": "<code>.join()</code> hər dəfə yeni sətir yaradır, <code>+</code> isə sətri yerində dəyişir",
      "c": "<code>+</code> həmişə <code>.join()</code>-dən sürətlidir, çünki daha az simvol yazılır",
      "d": "Sətirlər dəyişəndir, ona görə <code>+</code> və <code>.join()</code> eyni sürətdədir"
     }
    },
    {
     "id": "A4",
     "title": "Tapşırıq A4. Massiv və əlaqəli siyahının müqayisəsi (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A4. Massiv və əlaqəli siyahının müqayisəsi (10 bal)</h4>\n<p>Massiv və birtərəfli əlaqəli siyahının əməliyyatlar üzrə mürəkkəbliyi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Əvvələ əlavə hər ikisində O(n)-dir, çünki siyahıda da elementlər sürüşdürülməlidir",
      "b": "İndekslə müraciət: massivdə O(n), siyahıda O(1); əvvələ əlavə: massivdə O(1), siyahıda O(n)",
      "c": "İndekslə müraciət: massivdə O(1), siyahıda O(n); əvvələ əlavə: massivdə O(n), siyahıda O(1)",
      "d": "İndekslə müraciət hər ikisində O(1)-dir"
     }
    },
    {
     "id": "B1",
     "title": "Tapşırıq B1. Armstrong ədədi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq B1. Armstrong ədədi (10 bal)</h4>\n<p>Verilmiş müsbət <code>n</code> ədədinin <b>Armstrong ədədi</b> olub-olmadığını yoxlayan <code>armstrong(n)</code> funksiyasını yazın (<code>True</code>/<code>False</code>). Armstrong ədədi — rəqəmlərinin (rəqəm sayı) qüvvətləri cəmi özünə bərabər olan ədəddir.<br>Nümunə: <code>153 = 1³ + 5³ + 3³</code> → <code>True</code>.</p>",
     "starter": "def armstrong(n):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C1",
     "title": "Tapşırıq C1. Sıralanmış massivdə təkrarların silinməsi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C1. Sıralanmış massivdə təkrarların silinməsi (10 bal)</h4>\n<p>Sıralanmış <code>arr</code> massivindən təkrarlanan elementləri <b>yerində</b> (iki göstərici üsulu ilə) silən <code>tekrarlari_sil(arr)</code> funksiyasını yazın. Funksiya unikal elementlərin sayını <code>k</code> qaytarmalı və <code>arr</code>-ın ilk <code>k</code> elementi unikal qiymətlər (sıralı) olmalıdır.<br>Nümunə: <code>[1, 1, 2, 2, 3]</code> → <code>3</code>, <code>arr[:3] == [1, 2, 3]</code>.</p>",
     "starter": "def tekrarlari_sil(arr):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C2",
     "title": "Tapşırıq C2. Sıfırları sona ötürmək (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C2. Sıfırları sona ötürmək (10 bal)</h4>\n<p>Massivdəki bütün sıfırları, digər elementlərin nisbi ardıcıllığını pozmadan, <b>yerində</b> sona ötürən <code>sifirlari_sona(arr)</code> funksiyasını yazın.<br>Nümunə: <code>[0, 1, 0, 3, 12]</code> → <code>[1, 3, 12, 0, 0]</code>.</p>",
     "starter": "def sifirlari_sona(arr):\n    # buranı yazın\n    pass"
    },
    {
     "id": "D1",
     "title": "Tapşırıq D1. Perimetr elementlərinin cəmi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq D1. Perimetr elementlərinin cəmi (10 bal)</h4>\n<p><code>N x M</code> matrisinin <b>sərhəd (perimetr) elementlərinin</b> (birinci/sonuncu sətir və birinci/sonuncu sütun) cəmini hesablayan <code>perimetr_cemi(M)</code> funksiyasını yazın. Hər element yalnız bir dəfə sayılmalıdır.<br>Nümunə: <code>[[1,2,3],[4,5,6],[7,8,9]]</code> → <code>40</code>.</p>",
     "starter": "def perimetr_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "id": "E1",
     "title": "Tapşırıq E1. Azərbaycan əlifbasında sait və samit (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq E1. Azərbaycan əlifbasında sait və samit (10 bal)</h4>\n<p>Mətndəki Azərbaycan əlifbasına məxsus <b>sait</b> və <b>samit</b> hərflərin sayını <code>(sait_say, samit_say)</code> tuple-ı kimi qaytaran <code>sait_samit(metn)</code> funksiyasını yazın. Saitlər: <code>a, e, ə, i, ı, o, ö, u, ü</code>; samitlər isə əlifbanın digər hərfləridir (<code>b, c, ç, d, f, g, ğ, h, x, j, k, q, l, m, n, p, r, s, ş, t, v, y, z</code>). Registr nəzərə alınmır; rəqəm, durğu işarəsi və boşluqlar sayılmır.<br>Nümunə: <code>\"Azərbaycan dili!\"</code> → <code>(6, 8)</code>.</p>",
     "starter": "def sait_samit(metn):\n    # buranı yazın\n    pass"
    },
    {
     "id": "F1",
     "title": "Tapşırıq F1. Cəm və ədədi orta (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq F1. Cəm və ədədi orta (10 bal)</h4>\n<p>Düyün lüğət kimi təyin olunur (<code>{\"data\": ..., \"next\": ...}</code>), boş siyahı <code>None</code>-dur. Siyahıdakı bütün qiymətlərin <b>cəmini və ədədi ortasını</b> <code>(cem, orta)</code> tuple-ı kimi qaytaran <code>cem_ortasi(head)</code> funksiyasını yazın. Boş siyahı üçün <code>(0, 0)</code> qaytarın.<br>Nümunə: <code>2 → 4 → 6</code> → <code>(12, 4.0)</code>.</p>",
     "starter": "def cem_ortasi(head):\n    # buranı yazın\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "A1",
     "var": "cavab_A1"
    },
    {
     "k": "test",
     "ids": [
      "A1"
     ],
     "code": "def test_a1():\n    assert _h(cavab_A1) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"cavab düzgün deyil\"\ncheck(\"A1\", 10, test_a1)"
    },
    {
     "k": "var",
     "task": "A2",
     "var": "cavab_A2"
    },
    {
     "k": "test",
     "ids": [
      "A2"
     ],
     "code": "def test_a2():\n    assert _h(cavab_A2) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A2\", 10, test_a2)"
    },
    {
     "k": "var",
     "task": "A3",
     "var": "cavab_A3"
    },
    {
     "k": "test",
     "ids": [
      "A3"
     ],
     "code": "def test_a3():\n    assert _h(cavab_A3) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"cavab düzgün deyil\"\ncheck(\"A3\", 10, test_a3)"
    },
    {
     "k": "var",
     "task": "A4",
     "var": "cavab_A4"
    },
    {
     "k": "test",
     "ids": [
      "A4"
     ],
     "code": "def test_a4():\n    assert _h(cavab_A4) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"cavab düzgün deyil\"\ncheck(\"A4\", 10, test_a4)"
    },
    {
     "k": "code",
     "task": "B1",
     "code": "def armstrong(n):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "B1"
     ],
     "code": "def test_b1():\n    for _args, _exp in [((153,), True), ((9474,), True), ((123,), False), ((5,), True), ((10,), False), ((370,), True), ((9475,), False)]:\n        _r = armstrong(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"armstrong{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"B1\", 10, test_b1)"
    },
    {
     "k": "code",
     "task": "C1",
     "code": "def tekrarlari_sil(arr):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C1"
     ],
     "code": "def test_c1():\n    for _a, _k, _pref in [([1, 1, 2, 2, 3], 3, [1, 2, 3]), ([5, 5, 5], 1, [5]), ([], 0, []), ([1, 2, 3], 3, [1, 2, 3]), ([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], 5, [0, 1, 2, 3, 4])]:\n        _r = tekrarlari_sil(_a)\n        assert _r == _k, f\"unikal elementlərin sayı {_k} olmalıdır, sizinki: {_r}\"\n        assert _a[:_k] == _pref, f\"massivin ilk {_k} elementi {_pref} olmalıdır, sizinki: {_a[:_k]}\"\ncheck(\"C1\", 10, test_c1)"
    },
    {
     "k": "code",
     "task": "C2",
     "code": "def sifirlari_sona(arr):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C2"
     ],
     "code": "def test_c2():\n    for _a, _e in [([0, 1, 0, 3, 12], [1, 3, 12, 0, 0]), ([0, 0, 0], [0, 0, 0]), ([1, 2, 3], [1, 2, 3]), ([], []), ([4, 0, 5, 0, 0, 6], [4, 5, 6, 0, 0, 0])]:\n        _orig = _a\n        sifirlari_sona(_a)\n        assert _a is _orig and _a == _e, f\"siyahı yerində {_e} olmalıdır, sizinki: {_a}\"\ncheck(\"C2\", 10, test_c2)"
    },
    {
     "k": "code",
     "task": "D1",
     "code": "def perimetr_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "D1"
     ],
     "code": "def test_d1():\n    for _args, _exp in [(([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), 40), (([[1, 2, 3]],), 6), (([[5]],), 5), (([[1, 2], [3, 4]],), 10), (([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]],), 65)]:\n        _r = perimetr_cemi(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"perimetr_cemi{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"D1\", 10, test_d1)"
    },
    {
     "k": "code",
     "task": "E1",
     "code": "def sait_samit(metn):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "E1"
     ],
     "code": "def test_e1():\n    for _args, _exp in [(('Azərbaycan dili!',), (6, 8)), (('Şəhər, 2024!',), (2, 3)), (('',), (0, 0)), (('Üçüncü',), (3, 3)), (('123 !?',), (0, 0)), (('Əli',), (2, 1))]:\n        _r = sait_samit(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"sait_samit{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"E1\", 10, test_e1)"
    },
    {
     "k": "code",
     "task": "F1",
     "code": "def cem_ortasi(head):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "F1"
     ],
     "code": "def test_f1():\n    def _ll_qur(vals):\n        head = None\n        for v in reversed(vals):\n            head = {\"data\": v, \"next\": head}\n        return head\n\n    def _ll_list(head):\n        res = []\n        n = 0\n        while head is not None:\n            res.append(head[\"data\"])\n            head = head[\"next\"]\n            n += 1\n            assert n < 1000, \"siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)\"\n        return res\n\n    for _v, _e in [([2, 4, 6], (12, 4.0)), ([5], (5, 5.0)), ([1, 2], (3, 1.5)), ([], (0, 0)), ([-3, 3, 9], (9, 3.0))]:\n        _r = cem_ortasi(_ll_qur(_v))\n        assert tuple(_r) == _e, f\"{_v} üçün {_e} olmalıdır, sizinki: {_r}\"\ncheck(\"F1\", 10, test_f1)"
    }
   ]
  },
  "C": {
   "name": "Variant C",
   "max_score": 100,
   "items": [
    {
     "type": "section",
     "html": "<h4>Bal bölgüsü (Cəmi 100 bal / 10 tapşırıq)</h4>\n<table class=\"md-table\"><tr><th>Hissə</th><th>Mövzu</th><th>Tapşırıq sayı</th><th>Hər biri</th><th>Bal</th></tr><tr><td><b>A</b></td><td>Nəzəri suallar</td><td>4</td><td>10</td><td>40</td></tr><tr><td><b>B</b></td><td>Riyazi və dövrü alqoritmlər</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>C</b></td><td>Massivlər, iki göstərici və prefiks cəmləri</td><td>2</td><td>10</td><td>20</td></tr><tr><td><b>D</b></td><td>Matrislər (iki ölçülü massivlər)</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>E</b></td><td>Sətirlər və Unicode emalı</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>F</b></td><td>Əlaqəli siyahılar (lüğət düyünləri ilə)</td><td>1</td><td>10</td><td>10</td></tr><tr><td></td><td><b>CƏMİ</b></td><td><b>10</b></td><td></td><td><b>100</b></td></tr></table>\n<hr>\n<h2>A hissəsi. Nəzəri suallar (40 bal)</h2>\n<p>Düzgün variantı seçin. Hər sual <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "A1"
    },
    {
     "type": "task",
     "id": "A2"
    },
    {
     "type": "task",
     "id": "A3"
    },
    {
     "type": "task",
     "id": "A4"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>B hissəsi. Riyazi və dövrü alqoritmlər (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "B1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>C hissəsi. Massivlər, iki göstərici və prefiks cəmləri (20 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "C1"
    },
    {
     "type": "task",
     "id": "C2"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>D hissəsi. Matrislər (iki ölçülü massivlər) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Matris — siyahıların siyahısıdır: <code>M[i][j]</code> — <code>i</code>-ci sətir, <code>j</code>-ci sütun.</p>"
    },
    {
     "type": "task",
     "id": "D1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>E hissəsi. Sətirlər və Unicode emalı (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "E1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>F hissəsi. Əlaqəli siyahılar (lüğət düyünləri ilə) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Düyün <b>lüğət</b> kimi təyin olunur: <code>{\"data\": qiymət, \"next\": növbəti_düyün}</code>. Boş siyahı <code>None</code> ilə göstərilir.</p>"
    },
    {
     "type": "task",
     "id": "F1"
    }
   ],
   "tasks": [
    {
     "id": "A1",
     "title": "Tapşırıq A1. Verilən və məlumat anlayışları (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A1. Verilən və məlumat anlayışları (10 bal)</h4>\n<p>Verilən (data) və məlumat (information) anlayışlarının fərqi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Məlumat işlənməmiş xam faktlardır, verilən isə onların işlənmiş formasıdır",
      "b": "Bu iki anlayış tam eynidir, fərq yalnız yazılışdadır",
      "c": "Verilən yalnız ədədlərdən, məlumat isə yalnız mətnlərdən ibarət ola bilər",
      "d": "Verilən işlənməmiş xam faktlardır; məlumat isə verilənlərin işlənməsi və şərh edilməsi nəticəsində məna qazanmış nəticədir"
     }
    },
    {
     "id": "A2",
     "title": "Tapşırıq A2. O, Ω və Θ notasiyaları (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A2. O, Ω və Θ notasiyaları (10 bal)</h4>\n<p>O, Ω və Θ asimptotik işarələmələri haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "O — yaddaş, Ω — zaman, Θ — həm zaman, həm yaddaş mürəkkəbliyi",
      "b": "Üçü də eyni mənanı verir, sadəcə müxtəlif dərsliklərdə işlənir",
      "c": "O — aşağı sərhəd, Ω — yuxarı sərhəd, Θ — orta hal",
      "d": "O — artım sürətinin yuxarı sərhədi, Ω — aşağı sərhədi, Θ — həm yuxarı, həm aşağı sərhəd (sıx qiymətləndirmə)"
     }
    },
    {
     "id": "A3",
     "title": "Tapşırıq A3. Sətirlərin dəyişməzliyi və join() (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A3. Sətirlərin dəyişməzliyi və join() (10 bal)</h4>\n<p>Sətirlər dəyişməzdir (immutable). Dövrdə <code>+</code> operatoru ilə birləşdirmə ilə <code>.join()</code> metodunun müqayisəsi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Sətirlər dəyişəndir, ona görə <code>+</code> və <code>.join()</code> eyni sürətdədir",
      "b": "<code>+</code> həmişə <code>.join()</code>-dən sürətlidir, çünki daha az simvol yazılır",
      "c": "<code>+</code> hər dəfə yeni sətir yaradıb köçürdüyü üçün ümumilikdə O(n²) olur, <code>.join()</code> isə nəticəni bir dəfə qurur və O(n)-dir",
      "d": "<code>.join()</code> hər dəfə yeni sətir yaradır, <code>+</code> isə sətri yerində dəyişir"
     }
    },
    {
     "id": "A4",
     "title": "Tapşırıq A4. Dinamik massiv və amortizasiya olunmuş O(1) (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A4. Dinamik massiv və amortizasiya olunmuş O(1) (10 bal)</h4>\n<p>Dinamik massivdə tutum dolduqda ölçü 2 dəfə artırılır. Element əlavə etmənin (<code>append</code>) amortizasiya olunmuş mürəkkəbliyi nədir və niyə?</p>",
     "options": {
      "a": "O(n²): hər köçürmə əvvəlkindən iki dəfə bahadır və cəmi kvadratik olur",
      "b": "O(1): bahalı köçürmə (O(n)) nadir baş verir və onun qiyməti sonrakı çoxsaylı ucuz əlavələrə bölünür",
      "c": "O(n): hər əlavədə bütün elementlər yenidən köçürülür",
      "d": "O(log n): hər əlavədən sonra massiv yarıya bölünür"
     }
    },
    {
     "id": "B1",
     "title": "Tapşırıq B1. Evklid alqoritmi ilə ƏBOB (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq B1. Evklid alqoritmi ilə ƏBOB (10 bal)</h4>\n<p>İki tam ədədin Ən Böyük Ortaq Böləninı (ƏBOB) <b>Evklid alqoritmi</b> ilə tapan <code>ebob(a, b)</code> funksiyasını yazın (<code>math.gcd</code> istifadə etməyin).<br>Nümunə: <code>(48, 18)</code> → <code>6</code>.</p>",
     "starter": "def ebob(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C1",
     "title": "Tapşırıq C1. İki ədədin cəmi (Two Pointers) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C1. İki ədədin cəmi (Two Pointers) (10 bal)</h4>\n<p><b>Sıralanmış</b> <code>arr</code> massivində cəmi <code>hedef</code>-ə bərabər olan iki elementin indekslərini <code>(i, j)</code> (<code>i &lt; j</code>) tuple-ı kimi qaytaran <code>iki_cem(arr, hedef)</code> funksiyasını yazın (<b>iki göstərici</b> üsulu). Belə cüt yoxdursa <code>None</code> qaytarın.<br>Nümunə: <code>([1, 2, 4, 7, 11, 15], 9)</code> → <code>(1, 3)</code>.</p>",
     "starter": "def iki_cem(arr, hedef):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C2",
     "title": "Tapşırıq C2. İki sıralanmış massivin birləşdirilməsi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C2. İki sıralanmış massivin birləşdirilməsi (10 bal)</h4>\n<p>İki <b>sıralanmış</b> massivi (<code>a</code> və <code>b</code>) tək sıralanmış siyahıda birləşdirən <code>birlesdir(a, b)</code> funksiyasını O(n + m) zamanda yazın (iki göstərici ilə; yenidən sıralama aparmayın).<br>Nümunə: <code>([1, 3, 5], [2, 4, 6])</code> → <code>[1, 2, 3, 4, 5, 6]</code>.</p>",
     "starter": "def birlesdir(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "id": "D1",
     "title": "Tapşırıq D1. Baş və köməkçi diaqonal (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq D1. Baş və köməkçi diaqonal (10 bal)</h4>\n<p><code>N x N</code> kvadrat matrisinin <b>baş</b> və <b>köməkçi</b> diaqonallarının elementləri cəmini <code>(bas, komekci)</code> tuple-ı kimi qaytaran <code>dioqonallar(M)</code> funksiyasını yazın (tək ölçülü matrisdə mərkəzi element hər iki cəmə daxildir).<br>Nümunə: <code>[[2,0,1],[0,5,0],[3,0,7]]</code> → <code>(14, 9)</code>.</p>",
     "starter": "def dioqonallar(M):\n    # buranı yazın\n    pass"
    },
    {
     "id": "E1",
     "title": "Tapşırıq E1. Sözlərin sayı (split olmadan) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq E1. Sözlərin sayı (split olmadan) (10 bal)</h4>\n<p><code>split()</code> metodundan istifadə etmədən mətndəki <b>sözlərin sayını</b> tapan <code>soz_sayi(metn)</code> funksiyasını yazın. Sözlər bir və ya bir neçə boşluqla ayrılır; mətnin əvvəlində və sonunda boşluqlar ola bilər.<br>Nümunə: <code>\"  çox   boşluq  var \"</code> → <code>3</code>.</p>",
     "starter": "def soz_sayi(metn):\n    # buranı yazın\n    pass"
    },
    {
     "id": "F1",
     "title": "Tapşırıq F1. Birinci düyünü silmək (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq F1. Birinci düyünü silmək (10 bal)</h4>\n<p>Düyün lüğət kimi təyin olunur (<code>{\"data\": ..., \"next\": ...}</code>), boş siyahı <code>None</code>-dur. Siyahının <b>birinci düyününü (head)</b> silən <code>basi_sil(head)</code> funksiyasını yazın və <b>yeni head</b>-i qaytarın. Boş siyahıda <code>None</code> qaytarılmalıdır.<br>Nümunə: <code>1 → 2 → 3</code> → <code>2 → 3</code>.</p>",
     "starter": "def basi_sil(head):\n    # buranı yazın\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "A1",
     "var": "cavab_A1"
    },
    {
     "k": "test",
     "ids": [
      "A1"
     ],
     "code": "def test_a1():\n    assert _h(cavab_A1) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A1\", 10, test_a1)"
    },
    {
     "k": "var",
     "task": "A2",
     "var": "cavab_A2"
    },
    {
     "k": "test",
     "ids": [
      "A2"
     ],
     "code": "def test_a2():\n    assert _h(cavab_A2) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A2\", 10, test_a2)"
    },
    {
     "k": "var",
     "task": "A3",
     "var": "cavab_A3"
    },
    {
     "k": "test",
     "ids": [
      "A3"
     ],
     "code": "def test_a3():\n    assert _h(cavab_A3) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"cavab düzgün deyil\"\ncheck(\"A3\", 10, test_a3)"
    },
    {
     "k": "var",
     "task": "A4",
     "var": "cavab_A4"
    },
    {
     "k": "test",
     "ids": [
      "A4"
     ],
     "code": "def test_a4():\n    assert _h(cavab_A4) == \"3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d\", \"cavab düzgün deyil\"\ncheck(\"A4\", 10, test_a4)"
    },
    {
     "k": "code",
     "task": "B1",
     "code": "def ebob(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "B1"
     ],
     "code": "def test_b1():\n    _orig_gcd = math.gcd\n    def _qadagan(*a, **k):\n        raise AssertionError(\"bu tapşırıqda math.gcd istifadə etmək olmaz\")\n    math.gcd = _qadagan\n    try:\n        for _args, _exp in [((48, 18), 6), ((17, 5), 1), ((0, 9), 9), ((100, 75), 25), ((12, 12), 12)]:\n            _r = ebob(*_args)\n            assert _r == _exp, f\"ebob{_args} nəticəsi {_exp} olmalıdır, sizinki: {_r}\"\n    finally:\n        math.gcd = _orig_gcd\ncheck(\"B1\", 10, test_b1)"
    },
    {
     "k": "code",
     "task": "C1",
     "code": "def iki_cem(arr, hedef):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C1"
     ],
     "code": "def test_c1():\n    for _args, _e in [(([1, 2, 4, 7, 11, 15], 9), (1, 3)), (([2, 3, 4], 6), (0, 2)), (([1, 2, 3], 100), None), (([], 5), None), (([-4, -1, 0, 3, 10], 9), (1, 4))]:\n        _r = iki_cem(*_args)\n        if _e is None:\n            assert _r is None, f\"iki_cem{_args} üçün None olmalıdır, sizinki: {_r}\"\n        else:\n            assert _r is not None and tuple(_r) == _e, f\"iki_cem{_args} nəticəsi {_e} olmalıdır, sizinki: {_r}\"\ncheck(\"C1\", 10, test_c1)"
    },
    {
     "k": "code",
     "task": "C2",
     "code": "def birlesdir(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C2"
     ],
     "code": "def test_c2():\n    for _args, _exp in [(([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]), (([], [1, 2]), [1, 2]), (([1, 1], [1]), [1, 1, 1]), (([1, 2, 3], [10, 20]), [1, 2, 3, 10, 20]), (([], []), [])]:\n        _r = birlesdir(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"birlesdir{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"C2\", 10, test_c2)"
    },
    {
     "k": "code",
     "task": "D1",
     "code": "def dioqonallar(M):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "D1"
     ],
     "code": "def test_d1():\n    for _args, _exp in [(([[2, 0, 1], [0, 5, 0], [3, 0, 7]],), (14, 9)), (([[4]],), (4, 4)), (([[1, 2], [3, 4]],), (5, 5)), (([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), (15, 15))]:\n        _r = dioqonallar(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"dioqonallar{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"D1\", 10, test_d1)"
    },
    {
     "k": "code",
     "task": "E1",
     "code": "def soz_sayi(metn):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "E1"
     ],
     "code": "def test_e1():\n    class _S(str):\n        \"\"\"Qadağan olunmuş metodları çağıranda xəta verən sətir.\"\"\"\n        _BAN = (\"split\", \"rsplit\", \"splitlines\", \"partition\")\n        def __contains__(self, x):\n            if \"__contains__\" in type(self)._BAN:\n                raise AssertionError(\"bu tapşırıqda 'in' operatorundan istifadə etmək olmaz\")\n            return str.__contains__(self, x)\n        def __getattribute__(self, name):\n            if name in type(self)._BAN:\n                raise AssertionError(f\"bu tapşırıqda {name}() metodundan istifadə etmək olmaz\")\n            return str.__getattribute__(self, name)\n\n    for _s, _e in [(\"salam dünya\", 2), (\"  çox   boşluq  var \", 3), (\"\", 0), (\"   \", 0), (\"bir\", 1), (\"a b c d e\", 5)]:\n        _r = soz_sayi(_S(_s))\n        assert _r == _e, f\"soz_sayi({_s!r}) {_e} olmalıdır, sizinki: {_r}\"\ncheck(\"E1\", 10, test_e1)"
    },
    {
     "k": "code",
     "task": "F1",
     "code": "def basi_sil(head):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "F1"
     ],
     "code": "def test_f1():\n    def _ll_qur(vals):\n        head = None\n        for v in reversed(vals):\n            head = {\"data\": v, \"next\": head}\n        return head\n\n    def _ll_list(head):\n        res = []\n        n = 0\n        while head is not None:\n            res.append(head[\"data\"])\n            head = head[\"next\"]\n            n += 1\n            assert n < 1000, \"siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)\"\n        return res\n\n    assert basi_sil(None) is None, \"boş siyahıda None olmalıdır\"\n    assert basi_sil(_ll_qur([1])) is None, \"bir düyünlü siyahıdan sonra None olmalıdır\"\n    _r = basi_sil(_ll_qur([1, 2, 3]))\n    assert _ll_list(_r) == [2, 3], f\"[2, 3] olmalıdır, sizinki: {_ll_list(_r)}\"\n    _r = basi_sil(_r)\n    assert _ll_list(_r) == [3], f\"[3] olmalıdır, sizinki: {_ll_list(_r)}\"\ncheck(\"F1\", 10, test_f1)"
    }
   ]
  },
  "D": {
   "name": "Variant D",
   "max_score": 100,
   "items": [
    {
     "type": "section",
     "html": "<h4>Bal bölgüsü (Cəmi 100 bal / 10 tapşırıq)</h4>\n<table class=\"md-table\"><tr><th>Hissə</th><th>Mövzu</th><th>Tapşırıq sayı</th><th>Hər biri</th><th>Bal</th></tr><tr><td><b>A</b></td><td>Nəzəri suallar</td><td>4</td><td>10</td><td>40</td></tr><tr><td><b>B</b></td><td>Riyazi və dövrü alqoritmlər</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>C</b></td><td>Massivlər, iki göstərici və prefiks cəmləri</td><td>2</td><td>10</td><td>20</td></tr><tr><td><b>D</b></td><td>Matrislər (iki ölçülü massivlər)</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>E</b></td><td>Sətirlər və Unicode emalı</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>F</b></td><td>Əlaqəli siyahılar (lüğət düyünləri ilə)</td><td>1</td><td>10</td><td>10</td></tr><tr><td></td><td><b>CƏMİ</b></td><td><b>10</b></td><td></td><td><b>100</b></td></tr></table>\n<hr>\n<h2>A hissəsi. Nəzəri suallar (40 bal)</h2>\n<p>Düzgün variantı seçin. Hər sual <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "A1"
    },
    {
     "type": "task",
     "id": "A2"
    },
    {
     "type": "task",
     "id": "A3"
    },
    {
     "type": "task",
     "id": "A4"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>B hissəsi. Riyazi və dövrü alqoritmlər (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "B1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>C hissəsi. Massivlər, iki göstərici və prefiks cəmləri (20 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "C1"
    },
    {
     "type": "task",
     "id": "C2"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>D hissəsi. Matrislər (iki ölçülü massivlər) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Matris — siyahıların siyahısıdır: <code>M[i][j]</code> — <code>i</code>-ci sətir, <code>j</code>-ci sütun.</p>"
    },
    {
     "type": "task",
     "id": "D1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>E hissəsi. Sətirlər və Unicode emalı (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "E1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>F hissəsi. Əlaqəli siyahılar (lüğət düyünləri ilə) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Düyün <b>lüğət</b> kimi təyin olunur: <code>{\"data\": qiymət, \"next\": növbəti_düyün}</code>. Boş siyahı <code>None</code> ilə göstərilir.</p>"
    },
    {
     "type": "task",
     "id": "F1"
    }
   ],
   "tasks": [
    {
     "id": "A1",
     "title": "Tapşırıq A1. O, Ω və Θ notasiyaları (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A1. O, Ω və Θ notasiyaları (10 bal)</h4>\n<p>O, Ω və Θ asimptotik işarələmələri haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "O — yaddaş, Ω — zaman, Θ — həm zaman, həm yaddaş mürəkkəbliyi",
      "b": "Üçü də eyni mənanı verir, sadəcə müxtəlif dərsliklərdə işlənir",
      "c": "O — aşağı sərhəd, Ω — yuxarı sərhəd, Θ — orta hal",
      "d": "O — artım sürətinin yuxarı sərhədi, Ω — aşağı sərhədi, Θ — həm yuxarı, həm aşağı sərhəd (sıx qiymətləndirmə)"
     }
    },
    {
     "id": "A2",
     "title": "Tapşırıq A2. Statik massivdə indeks üzrə ünvanlama (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A2. Statik massivdə indeks üzrə ünvanlama (10 bal)</h4>\n<p>Birölçülü statik massivdə i-ci elementin ünvanı <code>Base + i * Size</code> düsturu ilə hesablanır. Bunun nəticəsi nədir?</p>",
     "options": {
      "a": "Düstur yalnız sıralanmış massivlər üçün işləyir",
      "b": "Elementə çatmaq üçün əvvəlki bütün elementlər keçilməlidir, yəni müraciət O(n)-dir",
      "c": "Müraciət O(log n)-dir, çünki massiv hər addımda yarıya bölünür",
      "d": "İndeks üzrə istənilən elementə müraciət O(1) müddətində mümkündür, çünki ünvan bir hesab əməli ilə tapılır"
     }
    },
    {
     "id": "A3",
     "title": "Tapşırıq A3. Python list və NumPy ndarray (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A3. Python list və NumPy ndarray (10 bal)</h4>\n<p>Python <code>list</code> və NumPy <code>ndarray</code> strukturlarının daxili yaddaş təşkili haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "İkisinin daxili yaddaş təşkili tam eynidir",
      "b": "list eyni tipli elementləri bitişik blokda saxlayır, ndarray isə yalnız istinadlar saxlayır",
      "c": "ndarray yalnız sətirləri saxlaya bilər, list isə yalnız ədədləri",
      "d": "list obyektlərə istinadlar saxlayır (elementlər yaddaşda səpələnə bilər), ndarray isə eyni tipli elementləri bitişik yaddaş blokunda saxlayır"
     }
    },
    {
     "id": "A4",
     "title": "Tapşırıq A4. Head və tail-ə əlavə etmə (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A4. Head və tail-ə əlavə etmə (10 bal)</h4>\n<p>Birtərəfli əlaqəli siyahıya yeni düyünün əlavə olunmasının mürəkkəbliyi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Hər iki əlavə həmişə O(n)-dir",
      "b": "Başa əlavə O(n), sona əlavə həmişə O(1)-dir",
      "c": "Başa (head) əlavə O(1)-dir; sona əlavə tail göstəricisi yoxdursa O(n), varsa O(1)-dir",
      "d": "Başa əlavə üçün bütün düyünlər bir pillə sürüşdürülməlidir, ona görə O(n)-dir"
     }
    },
    {
     "id": "B1",
     "title": "Tapşırıq B1. Bölənlərin sayı və cəmi (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq B1. Bölənlərin sayı və cəmi (10 bal)</h4>\n<p>Müsbət <code>n</code> tam ədədinin bütün müsbət bölənlərinin <b>sayını və cəmini</b> <code>(say, cem)</code> tuple-ı kimi qaytaran <code>bolenler(n)</code> funksiyasını yazın (1 və n özü də bölənlərdir).<br>Nümunə: <code>12</code> → <code>(6, 28)</code>.</p>",
     "starter": "def bolenler(n):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C1",
     "title": "Tapşırıq C1. Massivi yerində tərsinə çevirmək (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C1. Massivi yerində tərsinə çevirmək (10 bal)</h4>\n<p>Massivin elementlərini <b>əlavə massiv yaratmadan, yerində (in-place)</b> tərsinə çevirən <code>tersle(lst)</code> funksiyasını yazın. Funksiya verilmiş siyahını dəyişdirməlidir (yeni siyahı qaytarmaq kifayət deyil).<br>Nümunə: <code>[1, 2, 3, 4]</code> siyahısı çağırışdan sonra <code>[4, 3, 2, 1]</code> olur.</p>",
     "starter": "def tersle(lst):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C2",
     "title": "Tapşırıq C2. Dinamik massiv simulyasiyası (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C2. Dinamik massiv simulyasiyası (10 bal)</h4>\n<p>Tutumu <code>tutum</code> olan massivdə (<code>massiv</code>, içində <code>say</code> element var) yeni <code>x</code> elementini əlavə edən <code>elave_et(massiv, say, tutum, x)</code> funksiyasını yazın. Tutum dolubsa (<code>say == tutum</code>), <b>tutum 2 dəfə artırılmalı</b> (yeni siyahı <code>[None] * (2 * tutum)</code>, köhnə elementlər köçürülür) və sonra <code>x</code> əlavə olunmalıdır.<br>Funksiya <code>(massiv, say, tutum)</code> üçlüyünü (yenilənmiş) qaytarır. Başlanğıc: <code>massiv = [None] * 2</code>, <code>say = 0</code>, <code>tutum = 2</code>.</p>",
     "starter": "def elave_et(massiv, say, tutum, x):\n    # buranı yazın\n    pass"
    },
    {
     "id": "D1",
     "title": "Tapşırıq D1. Sətir və sütun cəmləri (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq D1. Sətir və sütun cəmləri (10 bal)</h4>\n<p><code>N x M</code> ölçülü <code>M</code> matrisinin (siyahıların siyahısı) hər sətirinin və hər sütununun cəmini hesablayıb <code>(setir_cemleri, sutun_cemleri)</code> tuple-ı kimi qaytaran <code>setir_sutun_cemi(M)</code> funksiyasını yazın.<br>Nümunə: <code>[[1, 2, 3], [4, 5, 6]]</code> → <code>([6, 15], [5, 7, 9])</code>.</p>",
     "starter": "def setir_sutun_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "id": "E1",
     "title": "Tapşırıq E1. Run-Length Encoding (RLE) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq E1. Run-Length Encoding (RLE) (10 bal)</h4>\n<p>Sətri <b>Run-Length Encoding</b> ilə sıxlaşdıran <code>rle(s)</code> funksiyasını yazın: ardıcıl təkrarlanan eyni simvollar <code>simvol + say</code> şəklində yazılır (bir dəfə olan simvol üçün də say <code>1</code> yazılır).<br>Nümunə: <code>\"aaabbc\"</code> → <code>\"a3b2c1\"</code>.</p>",
     "starter": "def rle(s):\n    # buranı yazın\n    pass"
    },
    {
     "id": "F1",
     "title": "Tapşırıq F1. Siyahıda axtarış (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq F1. Siyahıda axtarış (10 bal)</h4>\n<p>Düyün lüğət kimi təyin olunur (<code>{\"data\": ..., \"next\": ...}</code>), boş siyahı <code>None</code>-dur. Siyahıda <code>x</code> qiymətinin <b>ilk rast gəlindiyi mövqeyi</b> (0-dan başlayan indeks) O(n) zamanda tapan <code>axtar(head, x)</code> funksiyasını yazın; tapılmazsa <code>-1</code> qaytarın.<br>Nümunə: <code>4 → 8 → 15 → 16</code>, <code>x = 15</code> → <code>2</code>.</p>",
     "starter": "def axtar(head, x):\n    # buranı yazın\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "A1",
     "var": "cavab_A1"
    },
    {
     "k": "test",
     "ids": [
      "A1"
     ],
     "code": "def test_a1():\n    assert _h(cavab_A1) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A1\", 10, test_a1)"
    },
    {
     "k": "var",
     "task": "A2",
     "var": "cavab_A2"
    },
    {
     "k": "test",
     "ids": [
      "A2"
     ],
     "code": "def test_a2():\n    assert _h(cavab_A2) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A2\", 10, test_a2)"
    },
    {
     "k": "var",
     "task": "A3",
     "var": "cavab_A3"
    },
    {
     "k": "test",
     "ids": [
      "A3"
     ],
     "code": "def test_a3():\n    assert _h(cavab_A3) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A3\", 10, test_a3)"
    },
    {
     "k": "var",
     "task": "A4",
     "var": "cavab_A4"
    },
    {
     "k": "test",
     "ids": [
      "A4"
     ],
     "code": "def test_a4():\n    assert _h(cavab_A4) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"cavab düzgün deyil\"\ncheck(\"A4\", 10, test_a4)"
    },
    {
     "k": "code",
     "task": "B1",
     "code": "def bolenler(n):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "B1"
     ],
     "code": "def test_b1():\n    for _args, _exp in [((12,), (6, 28)), ((1,), (1, 1)), ((7,), (2, 8)), ((36,), (9, 91))]:\n        _r = bolenler(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"bolenler{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"B1\", 10, test_b1)"
    },
    {
     "k": "code",
     "task": "C1",
     "code": "def tersle(lst):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C1"
     ],
     "code": "def test_c1():\n    for _a, _e in [([1, 2, 3, 4], [4, 3, 2, 1]), ([1, 2, 3], [3, 2, 1]), ([], []), ([9], [9])]:\n        _orig = _a\n        tersle(_a)\n        assert _a is _orig and _a == _e, f\"siyahı yerində {_e} olmalıdır, sizinki: {_a}\"\ncheck(\"C1\", 10, test_c1)"
    },
    {
     "k": "code",
     "task": "C2",
     "code": "def elave_et(massiv, say, tutum, x):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C2"
     ],
     "code": "def test_c2():\n    _m, _s, _t = [None] * 2, 0, 2\n    _tutumlar = []\n    for _x in range(1, 10):\n        _m, _s, _t = elave_et(_m, _s, _t, _x)\n        _tutumlar.append(_t)\n    assert _tutumlar == [2, 2, 4, 4, 8, 8, 8, 8, 16], f\"tutum ardıcıllığı [2, 2, 4, 4, 8, 8, 8, 8, 16] olmalıdır, sizinki: {_tutumlar}\"\n    assert _s == 9, f\"element sayı 9 olmalıdır, sizinki: {_s}\"\n    assert len(_m) == 16, f\"massivin uzunluğu 16 olmalıdır, sizinki: {len(_m)}\"\n    assert _m[:9] == [1, 2, 3, 4, 5, 6, 7, 8, 9], f\"ilk 9 element [1..9] olmalıdır, sizinki: {_m[:9]}\"\ncheck(\"C2\", 10, test_c2)"
    },
    {
     "k": "code",
     "task": "D1",
     "code": "def setir_sutun_cemi(M):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "D1"
     ],
     "code": "def test_d1():\n    for _args, _exp in [(([[1, 2, 3], [4, 5, 6]],), ([6, 15], [5, 7, 9])), (([[5]],), ([5], [5])), (([[1, 2], [3, 4], [5, 6]],), ([3, 7, 11], [9, 12]))]:\n        _r = setir_sutun_cemi(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"setir_sutun_cemi{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"D1\", 10, test_d1)"
    },
    {
     "k": "code",
     "task": "E1",
     "code": "def rle(s):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "E1"
     ],
     "code": "def test_e1():\n    for _args, _exp in [(('aaabbc',), 'a3b2c1'), (('',), ''), (('abc',), 'a1b1c1'), (('zzzz',), 'z4'), (('aabaa',), 'a2b1a2'), (('xxxxxxxxxxxx',), 'x12')]:\n        _r = rle(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"rle{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"E1\", 10, test_e1)"
    },
    {
     "k": "code",
     "task": "F1",
     "code": "def axtar(head, x):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "F1"
     ],
     "code": "def test_f1():\n    def _ll_qur(vals):\n        head = None\n        for v in reversed(vals):\n            head = {\"data\": v, \"next\": head}\n        return head\n\n    def _ll_list(head):\n        res = []\n        n = 0\n        while head is not None:\n            res.append(head[\"data\"])\n            head = head[\"next\"]\n            n += 1\n            assert n < 1000, \"siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)\"\n        return res\n\n    _h = _ll_qur([4, 8, 15, 16, 23, 42])\n    for _x, _e in [(15, 2), (4, 0), (42, 5), (99, -1)]:\n        _r = axtar(_h, _x)\n        assert _r == _e, f\"axtar(..., {_x}) {_e} olmalıdır, sizinki: {_r}\"\n    assert axtar(None, 1) == -1, \"boş siyahıda -1 olmalıdır\"\n    assert axtar(_ll_qur([1, 2, 2]), 2) == 1, \"təkrar olduqda ilk mövqe qaytarılmalıdır\"\ncheck(\"F1\", 10, test_f1)"
    }
   ]
  },
  "E": {
   "name": "Variant E",
   "max_score": 100,
   "items": [
    {
     "type": "section",
     "html": "<h4>Bal bölgüsü (Cəmi 100 bal / 10 tapşırıq)</h4>\n<table class=\"md-table\"><tr><th>Hissə</th><th>Mövzu</th><th>Tapşırıq sayı</th><th>Hər biri</th><th>Bal</th></tr><tr><td><b>A</b></td><td>Nəzəri suallar</td><td>4</td><td>10</td><td>40</td></tr><tr><td><b>B</b></td><td>Riyazi və dövrü alqoritmlər</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>C</b></td><td>Massivlər, iki göstərici və prefiks cəmləri</td><td>2</td><td>10</td><td>20</td></tr><tr><td><b>D</b></td><td>Matrislər (iki ölçülü massivlər)</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>E</b></td><td>Sətirlər və Unicode emalı</td><td>1</td><td>10</td><td>10</td></tr><tr><td><b>F</b></td><td>Əlaqəli siyahılar (lüğət düyünləri ilə)</td><td>1</td><td>10</td><td>10</td></tr><tr><td></td><td><b>CƏMİ</b></td><td><b>10</b></td><td></td><td><b>100</b></td></tr></table>\n<hr>\n<h2>A hissəsi. Nəzəri suallar (40 bal)</h2>\n<p>Düzgün variantı seçin. Hər sual <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "A1"
    },
    {
     "type": "task",
     "id": "A2"
    },
    {
     "type": "task",
     "id": "A3"
    },
    {
     "type": "task",
     "id": "A4"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>B hissəsi. Riyazi və dövrü alqoritmlər (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "B1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>C hissəsi. Massivlər, iki göstərici və prefiks cəmləri (20 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "C1"
    },
    {
     "type": "task",
     "id": "C2"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>D hissəsi. Matrislər (iki ölçülü massivlər) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Matris — siyahıların siyahısıdır: <code>M[i][j]</code> — <code>i</code>-ci sətir, <code>j</code>-ci sütun.</p>"
    },
    {
     "type": "task",
     "id": "D1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>E hissəsi. Sətirlər və Unicode emalı (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>"
    },
    {
     "type": "task",
     "id": "E1"
    },
    {
     "type": "section",
     "html": "<hr>\n<h2>F hissəsi. Əlaqəli siyahılar (lüğət düyünləri ilə) (10 bal)</h2>\n<p>Funksiyanı yazın və <b>«Test Et»</b> düyməsi ilə yoxlayın. Hər tapşırıq <b>10 bal</b>.</p>\n<p>Düyün <b>lüğət</b> kimi təyin olunur: <code>{\"data\": qiymət, \"next\": növbəti_düyün}</code>. Boş siyahı <code>None</code> ilə göstərilir.</p>"
    },
    {
     "type": "task",
     "id": "F1"
    }
   ],
   "tasks": [
    {
     "id": "A1",
     "title": "Tapşırıq A1. Ən pis hal (worst-case) analizi (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A1. Ən pis hal (worst-case) analizi (10 bal)</h4>\n<p>Alqoritmin ən pis hal (worst-case) analizi nəyi verir?</p>",
     "options": {
      "a": "Yalnız ən sürətli giriş üçün icra müddətini",
      "b": "Bütün mümkün girişlər üzrə orta icra müddətini",
      "c": "Yalnız əvvəlcədən sıralanmış girişlər üçün icra müddətini",
      "d": "İstənilən ölçülü girişdə icra müddətinin yuxarı sərhədini, yəni alqoritmin bundan çox addım atmayacağına zəmanəti"
     }
    },
    {
     "id": "A2",
     "title": "Tapşırıq A2. Statik massivdə indeks üzrə ünvanlama (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A2. Statik massivdə indeks üzrə ünvanlama (10 bal)</h4>\n<p>Birölçülü statik massivdə i-ci elementin ünvanı <code>Base + i * Size</code> düsturu ilə hesablanır. Bunun nəticəsi nədir?</p>",
     "options": {
      "a": "İndeks üzrə istənilən elementə müraciət O(1) müddətində mümkündür, çünki ünvan bir hesab əməli ilə tapılır",
      "b": "Müraciət O(log n)-dir, çünki massiv hər addımda yarıya bölünür",
      "c": "Elementə çatmaq üçün əvvəlki bütün elementlər keçilməlidir, yəni müraciət O(n)-dir",
      "d": "Düstur yalnız sıralanmış massivlər üçün işləyir"
     }
    },
    {
     "id": "A3",
     "title": "Tapşırıq A3. Birtərəfli əlaqəli siyahı və düyün (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A3. Birtərəfli əlaqəli siyahı və düyün (10 bal)</h4>\n<p>Birtərəfli əlaqəli siyahının (Singly Linked List) düyünü və yaddaşda yerləşməsi haqqında hansı ifadə düzgündür?</p>",
     "options": {
      "a": "Siyahının sonuncu düyünü həmişə birinci düyünə istinad edir",
      "b": "Hər düyün həm <code>next</code>, həm də <code>prev</code> istinadı saxlayır",
      "c": "Düyün <code>data</code> və növbəti düyünə istinad (<code>next</code>) saxlayır; düyünlər yaddaşda ardıcıl olmaya bilər, əlaqə yalnız <code>next</code> vasitəsilə qurulur",
      "d": "Düyünlər yaddaşda mütləq bitişik yerləşir, buna görə i-ci elementə O(1) müraciət mümkündür"
     }
    },
    {
     "id": "A4",
     "title": "Tapşırıq A4. Budaqlanma və dövrlərin mürəkkəbliyə təsiri (10 bal)",
     "pts": 10,
     "kind": "choice",
     "html": "<h4>Tapşırıq A4. Budaqlanma və dövrlərin mürəkkəbliyə təsiri (10 bal)</h4>\n<p>Aşağıdakı kodun zaman mürəkkəbliyi nədir?</p>\n<pre class=\"md-code\"><code>x = 0\nfor i in range(n):\n    if i % 2 == 0:\n        x += 1\n    else:\n        for j in range(n):\n            x += j</code></pre>",
     "options": {
      "a": "O(n log n): daxili dövr hər dəfə yarıya bölünür",
      "b": "O(2ⁿ): hər iterasiyada budaqlanma olduğu üçün hallar ikiqat artır",
      "c": "O(n): if/else-də yalnız bir budaq seçildiyi üçün hər iterasiya O(1)-dir",
      "d": "O(n²): else budağı təxminən n/2 dəfə icra olunur və hər dəfə n addım atır"
     }
    },
    {
     "id": "B1",
     "title": "Tapşırıq B1. İntervalda sadə ədədlər (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq B1. İntervalda sadə ədədlər (10 bal)</h4>\n<p><code>[a, b]</code> intervalında (hər iki ucu daxil) yerləşən bütün sadə ədədləri artan sıra ilə siyahı kimi qaytaran <code>sade_ededler(a, b)</code> funksiyasını yazın.<br>Nümunə: <code>(10, 20)</code> → <code>[11, 13, 17, 19]</code>.</p>",
     "starter": "def sade_ededler(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C1",
     "title": "Tapşırıq C1. Dairəvi sağa sürüşdürmə (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C1. Dairəvi sağa sürüşdürmə (10 bal)</h4>\n<p><code>arr</code> massivinin elementlərini <code>k</code> mövqe <b>sağa dairəvi</b> sürüşdürüb <b>yeni siyahı</b> qaytaran <code>saga_surusdur(arr, k)</code> funksiyasını yazın (<code>k</code> massivin uzunluğundan böyük ola bilər).<br>Nümunə: <code>([1, 2, 3, 4, 5], 2)</code> → <code>[4, 5, 1, 2, 3]</code>.</p>",
     "starter": "def saga_surusdur(arr, k):\n    # buranı yazın\n    pass"
    },
    {
     "id": "C2",
     "title": "Tapşırıq C2. Təkrarlanmayan ədəd (XOR) (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq C2. Təkrarlanmayan ədəd (XOR) (10 bal)</h4>\n<p>Massivdə hər element iki dəfə, <b>yalnız biri bir dəfə</b> təkrarlanır. Bu ədədi <b>Bitwise XOR</b> ilə O(n) zamanda və O(1) əlavə yaddaşla tapan <code>tek_eded(arr)</code> funksiyasını yazın.<br>Nümunə: <code>[4, 1, 2, 1, 2]</code> → <code>4</code>.</p>",
     "starter": "def tek_eded(arr):\n    # buranı yazın\n    pass"
    },
    {
     "id": "D1",
     "title": "Tapşırıq D1. Baş və köməkçi diaqonal (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq D1. Baş və köməkçi diaqonal (10 bal)</h4>\n<p><code>N x N</code> kvadrat matrisinin <b>baş</b> və <b>köməkçi</b> diaqonallarının elementləri cəmini <code>(bas, komekci)</code> tuple-ı kimi qaytaran <code>dioqonallar(M)</code> funksiyasını yazın (tək ölçülü matrisdə mərkəzi element hər iki cəmə daxildir).<br>Nümunə: <code>[[2,0,1],[0,5,0],[3,0,7]]</code> → <code>(14, 9)</code>.</p>",
     "starter": "def dioqonallar(M):\n    # buranı yazın\n    pass"
    },
    {
     "id": "E1",
     "title": "Tapşırıq E1. Anaqram yoxlanışı (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq E1. Anaqram yoxlanışı (10 bal)</h4>\n<p>İki sətrin <b>anaqram</b> olub-olmadığını (eyni simvollardan, eyni sayda ibarət olub-olmadığını) <b>tezlik lüğəti/massivi</b> ilə yoxlayan <code>anaqram(a, b)</code> funksiyasını yazın (<code>sorted()</code> istifadə etməyin). Hərf registri fərqlidir.<br>Nümunə: <code>(\"listen\", \"silent\")</code> → <code>True</code>.</p>",
     "starter": "def anaqram(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "id": "F1",
     "title": "Tapşırıq F1. Sona düyün əlavə etmək (10 bal)",
     "pts": 10,
     "kind": "code",
     "html": "<h4>Tapşırıq F1. Sona düyün əlavə etmək (10 bal)</h4>\n<p>Düyün lüğət kimi təyin olunur (<code>{\"data\": ..., \"next\": ...}</code>), boş siyahı <code>None</code>-dur. Siyahının <b>sonuna</b> <code>x</code> qiymətli yeni düyün əlavə edən <code>sona_elave(head, x)</code> funksiyasını yazın və head-i qaytarın (siyahı boşdursa yeni düyün head olur).<br>Nümunə: <code>1 → 2</code>, <code>x = 3</code> → <code>1 → 2 → 3</code>.</p>",
     "starter": "def sona_elave(head, x):\n    # buranı yazın\n    pass"
    }
   ],
   "steps": [
    {
     "k": "var",
     "task": "A1",
     "var": "cavab_A1"
    },
    {
     "k": "test",
     "ids": [
      "A1"
     ],
     "code": "def test_a1():\n    assert _h(cavab_A1) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A1\", 10, test_a1)"
    },
    {
     "k": "var",
     "task": "A2",
     "var": "cavab_A2"
    },
    {
     "k": "test",
     "ids": [
      "A2"
     ],
     "code": "def test_a2():\n    assert _h(cavab_A2) == \"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb\", \"cavab düzgün deyil\"\ncheck(\"A2\", 10, test_a2)"
    },
    {
     "k": "var",
     "task": "A3",
     "var": "cavab_A3"
    },
    {
     "k": "test",
     "ids": [
      "A3"
     ],
     "code": "def test_a3():\n    assert _h(cavab_A3) == \"2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6\", \"cavab düzgün deyil\"\ncheck(\"A3\", 10, test_a3)"
    },
    {
     "k": "var",
     "task": "A4",
     "var": "cavab_A4"
    },
    {
     "k": "test",
     "ids": [
      "A4"
     ],
     "code": "def test_a4():\n    assert _h(cavab_A4) == \"18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4\", \"cavab düzgün deyil\"\ncheck(\"A4\", 10, test_a4)"
    },
    {
     "k": "code",
     "task": "B1",
     "code": "def sade_ededler(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "B1"
     ],
     "code": "def test_b1():\n    for _args, _exp in [((1, 10), [2, 3, 5, 7]), ((10, 20), [11, 13, 17, 19]), ((24, 28), []), ((2, 2), [2]), ((1, 1), []), ((90, 100), [97])]:\n        _r = sade_ededler(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"sade_ededler{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"B1\", 10, test_b1)"
    },
    {
     "k": "code",
     "task": "C1",
     "code": "def saga_surusdur(arr, k):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C1"
     ],
     "code": "def test_c1():\n    for _args, _exp in [(([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]), (([1, 2, 3], 4), [3, 1, 2]), (([], 3), []), (([1, 2], 0), [1, 2]), (([7, 8, 9], 3), [7, 8, 9])]:\n        _r = saga_surusdur(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"saga_surusdur{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"C1\", 10, test_c1)"
    },
    {
     "k": "code",
     "task": "C2",
     "code": "def tek_eded(arr):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "C2"
     ],
     "code": "def test_c2():\n    for _args, _exp in [(([4, 1, 2, 1, 2],), 4), (([7],), 7), (([2, 2, 3, 3, 9],), 9), (([-1, 5, 5],), -1), (([10, 20, 10, 30, 30],), 20)]:\n        _r = tek_eded(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"tek_eded{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"C2\", 10, test_c2)"
    },
    {
     "k": "code",
     "task": "D1",
     "code": "def dioqonallar(M):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "D1"
     ],
     "code": "def test_d1():\n    for _args, _exp in [(([[2, 0, 1], [0, 5, 0], [3, 0, 7]],), (14, 9)), (([[4]],), (4, 4)), (([[1, 2], [3, 4]],), (5, 5)), (([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), (15, 15))]:\n        _r = dioqonallar(*_args)\n        _ok = _eq(_r, _exp)\n        assert _ok, f\"dioqonallar{_args} nəticəsi {_exp!r} olmalıdır, sizinki: {_r!r}\"\ncheck(\"D1\", 10, test_d1)"
    },
    {
     "k": "code",
     "task": "E1",
     "code": "def anaqram(a, b):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "E1"
     ],
     "code": "def test_e1():\n    _b = __builtins__ if isinstance(__builtins__, dict) else vars(__builtins__)\n    _os = _b[\"sorted\"]\n    def _qadagan(*a, **k):\n        raise AssertionError(\"bu tapşırıqda sorted() istifadə etmək olmaz\")\n    _b[\"sorted\"] = _qadagan\n    try:\n        _res = [anaqram(*_c) for _c in [(\"listen\", \"silent\"), (\"abc\", \"abd\"), (\"aab\", \"ab\"), (\"\", \"\"), (\"rail\", \"liar\"), (\"aabb\", \"abab\"), (\"abc\", \"abcc\")]]\n    finally:\n        _b[\"sorted\"] = _os\n    assert _res == [True, False, False, True, True, True, False], f\"nəticələr [True, False, False, True, True, True, False] olmalıdır, sizinki: {_res}\"\ncheck(\"E1\", 10, test_e1)"
    },
    {
     "k": "code",
     "task": "F1",
     "code": "def sona_elave(head, x):\n    # buranı yazın\n    pass"
    },
    {
     "k": "test",
     "ids": [
      "F1"
     ],
     "code": "def test_f1():\n    def _ll_qur(vals):\n        head = None\n        for v in reversed(vals):\n            head = {\"data\": v, \"next\": head}\n        return head\n\n    def _ll_list(head):\n        res = []\n        n = 0\n        while head is not None:\n            res.append(head[\"data\"])\n            head = head[\"next\"]\n            n += 1\n            assert n < 1000, \"siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)\"\n        return res\n\n    _r = sona_elave(None, 7)\n    assert _ll_list(_r) == [7], f\"boş siyahıya əlavədən sonra [7] olmalıdır, sizinki: {_ll_list(_r)}\"\n    _h = _ll_qur([1, 2])\n    _r = sona_elave(_h, 3)\n    assert _r is _h, \"siyahı boş deyilsə, əvvəlki head qaytarılmalıdır\"\n    assert _ll_list(_r) == [1, 2, 3], f\"[1, 2, 3] olmalıdır, sizinki: {_ll_list(_r)}\"\n    _r = sona_elave(_r, 4)\n    assert _ll_list(_r) == [1, 2, 3, 4], f\"[1, 2, 3, 4] olmalıdır, sizinki: {_ll_list(_r)}\"\ncheck(\"F1\", 10, test_f1)"
    }
   ]
  }
 }
};
