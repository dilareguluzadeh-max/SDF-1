# -*- coding: utf-8 -*-
"""imtahan_suallari_v3.docx sual bankı: 14 nəzəri mövzu + 39 praktiki tapşırıq."""

# ---------------------------------------------------------------------------
# I HİSSƏ — nəzəri mövzular (docx №1–14) -> çoxvariantlı test sualı
# (başlıq, sual, düzgün cavab, [3 səhv cavab])
# ---------------------------------------------------------------------------
THEORY = [
 (1, "Verilən və məlumat anlayışları",
  "Verilən (data) və məlumat (information) anlayışlarının fərqi haqqında hansı ifadə düzgündür?",
  "Verilən işlənməmiş xam faktlardır; məlumat isə verilənlərin işlənməsi və şərh edilməsi nəticəsində məna qazanmış nəticədir",
  ["Məlumat işlənməmiş xam faktlardır, verilən isə onların işlənmiş formasıdır",
   "Bu iki anlayış tam eynidir, fərq yalnız yazılışdadır",
   "Verilən yalnız ədədlərdən, məlumat isə yalnız mətnlərdən ibarət ola bilər"]),
 (2, "Alqoritmin icra müddəti T(n)",
  "Alqoritmin icra müddətinin `T(n)` elementar addım sayı ilə ölçülməsinin əsas üstünlüyü nədir?",
  "Nəticə konkret kompüterin sürətindən və aparat təminatından asılı olmur, yalnız giriş ölçüsü n ilə alqoritmin davranışını göstərir",
  ["T(n) saniyələrlə ölçülür və hər kompüterdə eyni nəticə verir",
   "T(n) yalnız alqoritmin tutduğu yaddaşın bayt sayıdır",
   "T(n) yalnız dövr operatorlarının sayını hesablayır, digər əməliyyatlar nəzərə alınmır"]),
 (3, "O, Ω və Θ notasiyaları",
  "O, Ω və Θ asimptotik işarələmələri haqqında hansı ifadə düzgündür?",
  "O — artım sürətinin yuxarı sərhədi, Ω — aşağı sərhədi, Θ — həm yuxarı, həm aşağı sərhəd (sıx qiymətləndirmə)",
  ["O — aşağı sərhəd, Ω — yuxarı sərhəd, Θ — orta hal",
   "Üçü də eyni mənanı verir, sadəcə müxtəlif dərsliklərdə işlənir",
   "O — yaddaş, Ω — zaman, Θ — həm zaman, həm yaddaş mürəkkəbliyi"]),
 (4, "Ən pis hal (worst-case) analizi",
  "Alqoritmin ən pis hal (worst-case) analizi nəyi verir?",
  "İstənilən ölçülü girişdə icra müddətinin yuxarı sərhədini, yəni alqoritmin bundan çox addım atmayacağına zəmanəti",
  ["Yalnız ən sürətli giriş üçün icra müddətini",
   "Bütün mümkün girişlər üzrə orta icra müddətini",
   "Yalnız əvvəlcədən sıralanmış girişlər üçün icra müddətini"]),
 (5, "Mürəkkəblik dərəcələrinin hiyerarxiyası",
  "Hansı sıralama artım sürətinə görə (kiçikdən böyüyə) düzgündür?",
  "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)",
  ["O(1) < O(n) < O(log n) < O(n log n) < O(n²) < O(2ⁿ)",
   "O(1) < O(log n) < O(n) < O(n²) < O(n log n) < O(2ⁿ)",
   "O(log n) < O(1) < O(n) < O(n log n) < O(2ⁿ) < O(n²)"]),
 (6, "Statik massivdə indeks üzrə ünvanlama",
  "Birölçülü statik massivdə i-ci elementin ünvanı `Base + i * Size` düsturu ilə hesablanır. Bunun nəticəsi nədir?",
  "İndeks üzrə istənilən elementə müraciət O(1) müddətində mümkündür, çünki ünvan bir hesab əməli ilə tapılır",
  ["Elementə çatmaq üçün əvvəlki bütün elementlər keçilməlidir, yəni müraciət O(n)-dir",
   "Müraciət O(log n)-dir, çünki massiv hər addımda yarıya bölünür",
   "Düstur yalnız sıralanmış massivlər üçün işləyir"]),
 (7, "Python list və NumPy ndarray",
  "Python `list` və NumPy `ndarray` strukturlarının daxili yaddaş təşkili haqqında hansı ifadə düzgündür?",
  "list obyektlərə istinadlar saxlayır (elementlər yaddaşda səpələnə bilər), ndarray isə eyni tipli elementləri bitişik yaddaş blokunda saxlayır",
  ["list eyni tipli elementləri bitişik blokda saxlayır, ndarray isə yalnız istinadlar saxlayır",
   "İkisinin daxili yaddaş təşkili tam eynidir",
   "ndarray yalnız sətirləri saxlaya bilər, list isə yalnız ədədləri"]),
 (8, "Dinamik massiv və amortizasiya olunmuş O(1)",
  "Dinamik massivdə tutum dolduqda ölçü 2 dəfə artırılır. Element əlavə etmənin (`append`) amortizasiya olunmuş mürəkkəbliyi nədir və niyə?",
  "O(1): bahalı köçürmə (O(n)) nadir baş verir və onun qiyməti sonrakı çoxsaylı ucuz əlavələrə bölünür",
  ["O(n): hər əlavədə bütün elementlər yenidən köçürülür",
   "O(log n): hər əlavədən sonra massiv yarıya bölünür",
   "O(n²): hər köçürmə əvvəlkindən iki dəfə bahadır və cəmi kvadratik olur"]),
 (9, "Sətirlərin dəyişməzliyi və join()",
  "Sətirlər dəyişməzdir (immutable). Dövrdə `+` operatoru ilə birləşdirmə ilə `.join()` metodunun müqayisəsi haqqında hansı ifadə düzgündür?",
  "`+` hər dəfə yeni sətir yaradıb köçürdüyü üçün ümumilikdə O(n²) olur, `.join()` isə nəticəni bir dəfə qurur və O(n)-dir",
  ["Sətirlər dəyişəndir, ona görə `+` və `.join()` eyni sürətdədir",
   "`.join()` hər dəfə yeni sətir yaradır, `+` isə sətri yerində dəyişir",
   "`+` həmişə `.join()`-dən sürətlidir, çünki daha az simvol yazılır"]),
 (10, "Birtərəfli əlaqəli siyahı və düyün",
  "Birtərəfli əlaqəli siyahının (Singly Linked List) düyünü və yaddaşda yerləşməsi haqqında hansı ifadə düzgündür?",
  "Düyün `data` və növbəti düyünə istinad (`next`) saxlayır; düyünlər yaddaşda ardıcıl olmaya bilər, əlaqə yalnız `next` vasitəsilə qurulur",
  ["Düyünlər yaddaşda mütləq bitişik yerləşir, buna görə i-ci elementə O(1) müraciət mümkündür",
   "Hər düyün həm `next`, həm də `prev` istinadı saxlayır",
   "Siyahının sonuncu düyünü həmişə birinci düyünə istinad edir"]),
 (11, "Head və tail-ə əlavə etmə",
  "Birtərəfli əlaqəli siyahıya yeni düyünün əlavə olunmasının mürəkkəbliyi haqqında hansı ifadə düzgündür?",
  "Başa (head) əlavə O(1)-dir; sona əlavə tail göstəricisi yoxdursa O(n), varsa O(1)-dir",
  ["Başa əlavə O(n), sona əlavə həmişə O(1)-dir",
   "Hər iki əlavə həmişə O(n)-dir",
   "Başa əlavə üçün bütün düyünlər bir pillə sürüşdürülməlidir, ona görə O(n)-dir"]),
 (12, "İkitərəfli və dairəvi əlaqəli siyahı",
  "İkitərəfli (Doubly) və dairəvi (Circular) əlaqəli siyahılar haqqında hansı ifadə düzgündür?",
  "İkitərəfli siyahıda düyün `next` və `prev` saxlayır (hər iki istiqamətdə keçid olur); dairəvi siyahıda sonuncu düyün `None` əvəzinə birinci düyünə istinad edir",
  ["İkitərəfli siyahıda düyün yalnız `next` saxlayır, dairəvi siyahıda isə yalnız `prev`",
   "Dairəvi siyahıda sonuncu düyünün `next`-i həmişə `None`-dur",
   "İkitərəfli siyahı yalnız sıralanmış verilənləri saxlaya bilər"]),
 (13, "Massiv və əlaqəli siyahının müqayisəsi",
  "Massiv və birtərəfli əlaqəli siyahının əməliyyatlar üzrə mürəkkəbliyi haqqında hansı ifadə düzgündür?",
  "İndekslə müraciət: massivdə O(1), siyahıda O(n); əvvələ əlavə: massivdə O(n), siyahıda O(1)",
  ["İndekslə müraciət: massivdə O(n), siyahıda O(1); əvvələ əlavə: massivdə O(1), siyahıda O(n)",
   "İndekslə müraciət hər ikisində O(1)-dir",
   "Əvvələ əlavə hər ikisində O(n)-dir, çünki siyahıda da elementlər sürüşdürülməlidir"]),
 (14, "Budaqlanma və dövrlərin mürəkkəbliyə təsiri",
  "Aşağıdakı kodun zaman mürəkkəbliyi nədir?\n\n```\nx = 0\nfor i in range(n):\n    if i % 2 == 0:\n        x += 1\n    else:\n        for j in range(n):\n            x += j\n```",
  "O(n²): else budağı təxminən n/2 dəfə icra olunur və hər dəfə n addım atır",
  ["O(n): if/else-də yalnız bir budaq seçildiyi üçün hər iterasiya O(1)-dir",
   "O(n log n): daxili dövr hər dəfə yarıya bölünür",
   "O(2ⁿ): hər iterasiyada budaqlanma olduğu üçün hallar ikiqat artır"]),
]

# ---------------------------------------------------------------------------
# II HİSSƏ — praktiki tapşırıqlar (docx №21–60; №27 sənəddə yoxdur)
# hissə: B riyazi, C massiv, D matris, E sətir, F əlaqəli siyahı
# ---------------------------------------------------------------------------
CODING = {}

def task(num, part, title, desc, starter, solution, test):
    CODING[num] = dict(num=num, part=part, title=title, desc=desc, starter=starter,
                       solution=solution.strip("\n"), test=test.strip("\n"))

def cases(func, cs, extra=""):
    """Sadə təmiz funksiyalar üçün test gövdəsi (cs = [(args_tuple, gözlənilən), ...])."""
    return f'''
{extra}
for _args, _exp in {cs!r}:
    _r = {func}(*_args)
    _ok = _eq(_r, _exp)
    assert _ok, f"{func}{{_args}} nəticəsi {{_exp!r}} olmalıdır, sizinki: {{_r!r}}"
'''

def stub(sig):
    return f"def {sig}:\n    # buranı yazın\n    pass"

# ======================= B. Riyazi və dövrü alqoritmlər =====================
task(21, "B", "Rəqəmlər cəmi",
 "Verilmiş `n` (n ≥ 0) tam ədədinin rəqəmlərinin cəmini hesablayan `reqemler_cemi(n)` funksiyasını yazın.\nNümunə: `12345` → `15`.",
 stub("reqemler_cemi(n)"),
 '''def reqemler_cemi(n):
    c = 0
    while n > 0:
        c += n % 10
        n //= 10
    return c''',
 cases("reqemler_cemi", [((12345,), 15), ((0,), 0), ((907,), 16), ((1000,), 1), ((99,), 18)]))

task(22, "B", "İntervalda sadə ədədlər",
 "`[a, b]` intervalında (hər iki ucu daxil) yerləşən bütün sadə ədədləri artan sıra ilə siyahı kimi qaytaran `sade_ededler(a, b)` funksiyasını yazın.\nNümunə: `(10, 20)` → `[11, 13, 17, 19]`.",
 stub("sade_ededler(a, b)"),
 '''def sade_ededler(a, b):
    res = []
    for n in range(max(a, 2), b + 1):
        sade = True
        d = 2
        while d * d <= n:
            if n % d == 0:
                sade = False
                break
            d += 1
        if sade:
            res.append(n)
    return res''',
 cases("sade_ededler", [((1, 10), [2, 3, 5, 7]), ((10, 20), [11, 13, 17, 19]), ((24, 28), []), ((2, 2), [2]), ((1, 1), []), ((90, 100), [97])]))

task(23, "B", "Evklid alqoritmi ilə ƏBOB",
 "İki tam ədədin Ən Böyük Ortaq Böləninı (ƏBOB) **Evklid alqoritmi** ilə tapan `ebob(a, b)` funksiyasını yazın (`math.gcd` istifadə etməyin).\nNümunə: `(48, 18)` → `6`.",
 stub("ebob(a, b)"),
 '''def ebob(a, b):
    while b != 0:
        a, b = b, a % b
    return a''',
 '''
_orig_gcd = math.gcd
def _qadagan(*a, **k):
    raise AssertionError("bu tapşırıqda math.gcd istifadə etmək olmaz")
math.gcd = _qadagan
try:
    for _args, _exp in [((48, 18), 6), ((17, 5), 1), ((0, 9), 9), ((100, 75), 25), ((12, 12), 12)]:
        _r = ebob(*_args)
        assert _r == _exp, f"ebob{_args} nəticəsi {_exp} olmalıdır, sizinki: {_r}"
finally:
    math.gcd = _orig_gcd
''')


task(24, "B", "Armstrong ədədi",
 "Verilmiş müsbət `n` ədədinin **Armstrong ədədi** olub-olmadığını yoxlayan `armstrong(n)` funksiyasını yazın (`True`/`False`). Armstrong ədədi — rəqəmlərinin (rəqəm sayı) qüvvətləri cəmi özünə bərabər olan ədəddir.\nNümunə: `153 = 1³ + 5³ + 3³` → `True`.",
 stub("armstrong(n)"),
 '''def armstrong(n):
    s = str(n)
    k = len(s)
    t = 0
    for ch in s:
        t += int(ch) ** k
    return t == n''',
 cases("armstrong", [((153,), True), ((9474,), True), ((123,), False), ((5,), True), ((10,), False), ((370,), True), ((9475,), False)]))

task(25, "B", "Bölənlərin sayı və cəmi",
 "Müsbət `n` tam ədədinin bütün müsbət bölənlərinin **sayını və cəmini** `(say, cem)` tuple-ı kimi qaytaran `bolenler(n)` funksiyasını yazın (1 və n özü də bölənlərdir).\nNümunə: `12` → `(6, 28)`.",
 stub("bolenler(n)"),
 '''def bolenler(n):
    say = 0
    cem = 0
    for d in range(1, n + 1):
        if n % d == 0:
            say += 1
            cem += d
    return (say, cem)''',
 cases("bolenler", [((12,), (6, 28)), ((1,), (1, 1)), ((7,), (2, 8)), ((36,), (9, 91))]))

task(26, "B", "Fibonaççi ədədi (iterativ)",
 "Fibonaççi ardıcıllığının `n`-ci həddini (`F(0)=0`, `F(1)=1`) **iterativ** üsulla, O(n) zamanda və O(1) əlavə yaddaşla hesablayan `fibonacci(n)` funksiyasını yazın.\nNümunə: `10` → `55`. Rekursiv həll böyük `n` üçün çox yavaş olacaq.",
 stub("fibonacci(n)"),
 '''def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a''',
 cases("fibonacci", [((0,), 0), ((1,), 1), ((10,), 55), ((30,), 832040), ((80,), 23416728348467685)]))

task(28, "B", "Faktorial",
 "`n` ədədinin faktorialını (`n!`) hesablayan O(n) **iterativ** `faktorial(n)` funksiyasını yazın (`math.factorial` istifadə etməyin). `0! = 1`.\nNümunə: `5` → `120`.",
 stub("faktorial(n)"),
 '''def faktorial(n):
    r = 1
    for i in range(2, n + 1):
        r *= i
    return r''',
 '''
_orig_f = math.factorial
def _qadagan(*a, **k):
    raise AssertionError("bu tapşırıqda math.factorial istifadə etmək olmaz")
math.factorial = _qadagan
try:
    for _n, _exp in [(0, 1), (1, 1), (5, 120), (10, 3628800), (20, 2432902008176640000)]:
        _r = faktorial(_n)
        assert _r == _exp, f"faktorial({_n}) {_exp} olmalıdır, sizinki: {_r}"
finally:
    math.factorial = _orig_f
''')

task(29, "B", "Ulduzlardan piramida",
 "Dövr operatorları ilə `n` sətirli ulduz (`*`) piramidasını **bir sətir (string) kimi qaytaran** `piramida(n)` funksiyasını yazın. Sətirlər `\"\\n\"` ilə birləşdirilir (sonda əlavə `\"\\n\"` olmasın); `i`-ci sətirdə əvvəl `n-i` boşluq, sonra `2*i-1` ulduz olur (sağda boşluq yoxdur).\nNümunə: `piramida(3)` → `\"  *\\n ***\\n*****\"`.",
 stub("piramida(n)"),
 '''def piramida(n):
    setirler = []
    for i in range(1, n + 1):
        setirler.append(" " * (n - i) + "*" * (2 * i - 1))
    return "\\n".join(setirler)''',
 cases("piramida", [((1,), "*"), ((2,), " *\n***"), ((3,), "  *\n ***\n*****"), ((4,), "   *\n  ***\n *****\n*******")]))

task(30, "B", "Rəqəmlərin əks sırası",
 "Verilmiş `n` (n ≥ 0) tam ədədinin rəqəmlərinin əks sırayla düzülməsindən alınan ədədi qaytaran `eks_eded(n)` funksiyasını yazın.\nNümunə: `1234` → `4321`, `1200` → `21`.",
 stub("eks_eded(n)"),
 '''def eks_eded(n):
    r = 0
    while n > 0:
        r = r * 10 + n % 10
        n //= 10
    return r''',
 cases("eks_eded", [((1234,), 4321), ((1200,), 21), ((5,), 5), ((0,), 0), ((100,), 1)]))

# ======================= C. Massivlər, iki göstərici, prefiks ================
task(31, "C", "Min və max — tək keçidlə",
 "Boş olmayan massivdə ən kiçik və ən böyük elementləri **tək keçidlə** (O(n)) tapıb `(min, max)` tuple-ı kimi qaytaran `min_max(lst)` funksiyasını yazın. `min()` və `max()` funksiyalarından istifadə etmək olmaz.\nNümunə: `[3, 1, 4, 1, 5, 9, 2, 6]` → `(1, 9)`.",
 stub("min_max(lst)"),
 '''def min_max(lst):
    k = lst[0]
    b = lst[0]
    for x in lst:
        if x < k:
            k = x
        if x > b:
            b = x
    return (k, b)''',
 '''
_b = __builtins__ if isinstance(__builtins__, dict) else vars(__builtins__)
_om, _oM = _b["min"], _b["max"]
def _qadagan(*a, **k):
    raise AssertionError("bu tapşırıqda min() və max() istifadə etmək olmaz")
_b["min"], _b["max"] = _qadagan, _qadagan
try:
    _res = [min_max([3, 1, 4, 1, 5, 9, 2, 6]), min_max([7]), min_max([-3, -1, -8]), min_max([2, 2, 2])]
finally:
    _b["min"], _b["max"] = _om, _oM
for _r, _e in zip(_res, [(1, 9), (7, 7), (-8, -1), (2, 2)]):
    assert tuple(_r) == _e, f"gözlənilən {_e}, sizinki: {_r}"
''')

task(32, "C", "Massivi yerində tərsinə çevirmək",
 "Massivin elementlərini **əlavə massiv yaratmadan, yerində (in-place)** tərsinə çevirən `tersle(lst)` funksiyasını yazın. Funksiya verilmiş siyahını dəyişdirməlidir (yeni siyahı qaytarmaq kifayət deyil).\nNümunə: `[1, 2, 3, 4]` siyahısı çağırışdan sonra `[4, 3, 2, 1]` olur.",
 stub("tersle(lst)"),
 '''def tersle(lst):
    i, j = 0, len(lst) - 1
    while i < j:
        lst[i], lst[j] = lst[j], lst[i]
        i += 1
        j -= 1''',
 '''
for _a, _e in [([1, 2, 3, 4], [4, 3, 2, 1]), ([1, 2, 3], [3, 2, 1]), ([], []), ([9], [9])]:
    _orig = _a
    tersle(_a)
    assert _a is _orig and _a == _e, f"siyahı yerində {_e} olmalıdır, sizinki: {_a}"
''')

task(33, "C", "Sıralanmış massivdə təkrarların silinməsi",
 "Sıralanmış `arr` massivindən təkrarlanan elementləri **yerində** (iki göstərici üsulu ilə) silən `tekrarlari_sil(arr)` funksiyasını yazın. Funksiya unikal elementlərin sayını `k` qaytarmalı və `arr`-ın ilk `k` elementi unikal qiymətlər (sıralı) olmalıdır.\nNümunə: `[1, 1, 2, 2, 3]` → `3`, `arr[:3] == [1, 2, 3]`.",
 stub("tekrarlari_sil(arr)"),
 '''def tekrarlari_sil(arr):
    if not arr:
        return 0
    k = 1
    for i in range(1, len(arr)):
        if arr[i] != arr[k - 1]:
            arr[k] = arr[i]
            k += 1
    return k''',
 '''
for _a, _k, _pref in [([1, 1, 2, 2, 3], 3, [1, 2, 3]), ([5, 5, 5], 1, [5]), ([], 0, []), ([1, 2, 3], 3, [1, 2, 3]), ([0, 0, 1, 1, 1, 2, 2, 3, 3, 4], 5, [0, 1, 2, 3, 4])]:
    _r = tekrarlari_sil(_a)
    assert _r == _k, f"unikal elementlərin sayı {_k} olmalıdır, sizinki: {_r}"
    assert _a[:_k] == _pref, f"massivin ilk {_k} elementi {_pref} olmalıdır, sizinki: {_a[:_k]}"
''')

task(34, "C", "Sıfırları sona ötürmək",
 "Massivdəki bütün sıfırları, digər elementlərin nisbi ardıcıllığını pozmadan, **yerində** sona ötürən `sifirlari_sona(arr)` funksiyasını yazın.\nNümunə: `[0, 1, 0, 3, 12]` → `[1, 3, 12, 0, 0]`.",
 stub("sifirlari_sona(arr)"),
 '''def sifirlari_sona(arr):
    j = 0
    for i in range(len(arr)):
        if arr[i] != 0:
            arr[j], arr[i] = arr[i], arr[j]
            j += 1''',
 '''
for _a, _e in [([0, 1, 0, 3, 12], [1, 3, 12, 0, 0]), ([0, 0, 0], [0, 0, 0]), ([1, 2, 3], [1, 2, 3]), ([], []), ([4, 0, 5, 0, 0, 6], [4, 5, 6, 0, 0, 0])]:
    _orig = _a
    sifirlari_sona(_a)
    assert _a is _orig and _a == _e, f"siyahı yerində {_e} olmalıdır, sizinki: {_a}"
''')

task(35, "C", "İki ədədin cəmi (Two Pointers)",
 "**Sıralanmış** `arr` massivində cəmi `hedef`-ə bərabər olan iki elementin indekslərini `(i, j)` (`i < j`) tuple-ı kimi qaytaran `iki_cem(arr, hedef)` funksiyasını yazın (**iki göstərici** üsulu). Belə cüt yoxdursa `None` qaytarın.\nNümunə: `([1, 2, 4, 7, 11, 15], 9)` → `(1, 3)`.",
 stub("iki_cem(arr, hedef)"),
 '''def iki_cem(arr, hedef):
    i, j = 0, len(arr) - 1
    while i < j:
        s = arr[i] + arr[j]
        if s == hedef:
            return (i, j)
        if s < hedef:
            i += 1
        else:
            j -= 1
    return None''',
 '''
for _args, _e in [(([1, 2, 4, 7, 11, 15], 9), (1, 3)), (([2, 3, 4], 6), (0, 2)), (([1, 2, 3], 100), None), (([], 5), None), (([-4, -1, 0, 3, 10], 9), (1, 4))]:
    _r = iki_cem(*_args)
    if _e is None:
        assert _r is None, f"iki_cem{_args} üçün None olmalıdır, sizinki: {_r}"
    else:
        assert _r is not None and tuple(_r) == _e, f"iki_cem{_args} nəticəsi {_e} olmalıdır, sizinki: {_r}"
''')

task(36, "C", "Prefiks cəm massivi",
 "`arr` üçün **prefiks cəm massivi** quran `prefiks_cem(arr)` funksiyasını yazın. Nəticə massivi `p`-nin uzunluğu `len(arr) + 1`, `p[0] = 0` və `p[i] = arr[0] + ... + arr[i-1]` olmalıdır. Beləliklə, `arr[l..r]` aralığının cəmi `p[r+1] - p[l]` ilə O(1) müddətində tapılır.\nNümunə: `[2, 4, 6, 8]` → `[0, 2, 6, 12, 20]`.",
 stub("prefiks_cem(arr)"),
 '''def prefiks_cem(arr):
    p = [0]
    for x in arr:
        p.append(p[-1] + x)
    return p''',
 '''
_r = prefiks_cem([2, 4, 6, 8])
assert list(_r) == [0, 2, 6, 12, 20], f"[0, 2, 6, 12, 20] olmalıdır, sizinki: {_r}"
assert list(prefiks_cem([])) == [0], "boş massiv üçün [0] olmalıdır"
assert list(prefiks_cem([-1, 5, -2])) == [0, -1, 4, 2], "[-1, 5, -2] üçün [0, -1, 4, 2] olmalıdır"
_p = prefiks_cem([5, 1, 3, 7, 2])
assert _p[4] - _p[1] == 11, "arr[1..3] aralığının cəmi 11 olmalıdır (p[4] - p[1])"
''')

task(37, "C", "Dairəvi sağa sürüşdürmə",
 "`arr` massivinin elementlərini `k` mövqe **sağa dairəvi** sürüşdürüb **yeni siyahı** qaytaran `saga_surusdur(arr, k)` funksiyasını yazın (`k` massivin uzunluğundan böyük ola bilər).\nNümunə: `([1, 2, 3, 4, 5], 2)` → `[4, 5, 1, 2, 3]`.",
 stub("saga_surusdur(arr, k)"),
 '''def saga_surusdur(arr, k):
    n = len(arr)
    if n == 0:
        return []
    k %= n
    res = [0] * n
    for i in range(n):
        res[(i + k) % n] = arr[i]
    return res''',
 cases("saga_surusdur", [(([1, 2, 3, 4, 5], 2), [4, 5, 1, 2, 3]), (([1, 2, 3], 4), [3, 1, 2]), (([], 3), []), (([1, 2], 0), [1, 2]), (([7, 8, 9], 3), [7, 8, 9])]))

task(38, "C", "İki sıralanmış massivin birləşdirilməsi",
 "İki **sıralanmış** massivi (`a` və `b`) tək sıralanmış siyahıda birləşdirən `birlesdir(a, b)` funksiyasını O(n + m) zamanda yazın (iki göstərici ilə; yenidən sıralama aparmayın).\nNümunə: `([1, 3, 5], [2, 4, 6])` → `[1, 2, 3, 4, 5, 6]`.",
 stub("birlesdir(a, b)"),
 '''def birlesdir(a, b):
    i = j = 0
    res = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i])
            i += 1
        else:
            res.append(b[j])
            j += 1
    res.extend(a[i:])
    res.extend(b[j:])
    return res''',
 cases("birlesdir", [(([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]), (([], [1, 2]), [1, 2]), (([1, 1], [1]), [1, 1, 1]), (([1, 2, 3], [10, 20]), [1, 2, 3, 10, 20]), (([], []), [])]))

task(39, "C", "Dinamik massiv simulyasiyası",
 "Tutumu `tutum` olan massivdə (`massiv`, içində `say` element var) yeni `x` elementini əlavə edən `elave_et(massiv, say, tutum, x)` funksiyasını yazın. Tutum dolubsa (`say == tutum`), **tutum 2 dəfə artırılmalı** (yeni siyahı `[None] * (2 * tutum)`, köhnə elementlər köçürülür) və sonra `x` əlavə olunmalıdır.\nFunksiya `(massiv, say, tutum)` üçlüyünü (yenilənmiş) qaytarır. Başlanğıc: `massiv = [None] * 2`, `say = 0`, `tutum = 2`.",
 stub("elave_et(massiv, say, tutum, x)"),
 '''def elave_et(massiv, say, tutum, x):
    if say == tutum:
        yeni = [None] * (2 * tutum)
        for i in range(say):
            yeni[i] = massiv[i]
        massiv = yeni
        tutum = 2 * tutum
    massiv[say] = x
    return (massiv, say + 1, tutum)''',
 '''
_m, _s, _t = [None] * 2, 0, 2
_tutumlar = []
for _x in range(1, 10):
    _m, _s, _t = elave_et(_m, _s, _t, _x)
    _tutumlar.append(_t)
assert _tutumlar == [2, 2, 4, 4, 8, 8, 8, 8, 16], f"tutum ardıcıllığı [2, 2, 4, 4, 8, 8, 8, 8, 16] olmalıdır, sizinki: {_tutumlar}"
assert _s == 9, f"element sayı 9 olmalıdır, sizinki: {_s}"
assert len(_m) == 16, f"massivin uzunluğu 16 olmalıdır, sizinki: {len(_m)}"
assert _m[:9] == [1, 2, 3, 4, 5, 6, 7, 8, 9], f"ilk 9 element [1..9] olmalıdır, sizinki: {_m[:9]}"
''')

task(40, "C", "Təkrarlanmayan ədəd (XOR)",
 "Massivdə hər element iki dəfə, **yalnız biri bir dəfə** təkrarlanır. Bu ədədi **Bitwise XOR** ilə O(n) zamanda və O(1) əlavə yaddaşla tapan `tek_eded(arr)` funksiyasını yazın.\nNümunə: `[4, 1, 2, 1, 2]` → `4`.",
 stub("tek_eded(arr)"),
 '''def tek_eded(arr):
    r = 0
    for x in arr:
        r ^= x
    return r''',
 cases("tek_eded", [(([4, 1, 2, 1, 2],), 4), (([7],), 7), (([2, 2, 3, 3, 9],), 9), (([-1, 5, 5],), -1), (([10, 20, 10, 30, 30],), 20)]))

# ======================= D. Matrislər =======================================
task(41, "D", "Sətir və sütun cəmləri",
 "`N x M` ölçülü `M` matrisinin (siyahıların siyahısı) hər sətirinin və hər sütununun cəmini hesablayıb `(setir_cemleri, sutun_cemleri)` tuple-ı kimi qaytaran `setir_sutun_cemi(M)` funksiyasını yazın.\nNümunə: `[[1, 2, 3], [4, 5, 6]]` → `([6, 15], [5, 7, 9])`.",
 stub("setir_sutun_cemi(M)"),
 '''def setir_sutun_cemi(M):
    s = [0] * len(M)
    c = [0] * len(M[0])
    for i in range(len(M)):
        for j in range(len(M[0])):
            s[i] += M[i][j]
            c[j] += M[i][j]
    return (s, c)''',
 cases("setir_sutun_cemi", [(([[1, 2, 3], [4, 5, 6]],), ([6, 15], [5, 7, 9])), (([[5]],), ([5], [5])), (([[1, 2], [3, 4], [5, 6]],), ([3, 7, 11], [9, 12]))]))

task(42, "D", "Baş və köməkçi diaqonal",
 "`N x N` kvadrat matrisinin **baş** və **köməkçi** diaqonallarının elementləri cəmini `(bas, komekci)` tuple-ı kimi qaytaran `dioqonallar(M)` funksiyasını yazın (tək ölçülü matrisdə mərkəzi element hər iki cəmə daxildir).\nNümunə: `[[2,0,1],[0,5,0],[3,0,7]]` → `(14, 9)`.",
 stub("dioqonallar(M)"),
 '''def dioqonallar(M):
    n = len(M)
    b = 0
    k = 0
    for i in range(n):
        b += M[i][i]
        k += M[i][n - 1 - i]
    return (b, k)''',
 cases("dioqonallar", [(([[2, 0, 1], [0, 5, 0], [3, 0, 7]],), (14, 9)), (([[4]],), (4, 4)), (([[1, 2], [3, 4]],), (5, 5)), (([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), (15, 15))]))

task(43, "D", "Yerində transponə",
 "`N x N` kvadrat matrisini **əlavə yaddaş istifadə etmədən yerində** transponə edən `transpone(M)` funksiyasını yazın (funksiya verilmiş matrisi dəyişdirməlidir).\nNümunə: `[[1, 2], [3, 4]]` matrisi çağırışdan sonra `[[1, 3], [2, 4]]` olur.",
 stub("transpone(M)"),
 '''def transpone(M):
    n = len(M)
    for i in range(n):
        for j in range(i + 1, n):
            M[i][j], M[j][i] = M[j][i], M[i][j]''',
 '''
for _M, _e in [([[1, 2], [3, 4]], [[1, 3], [2, 4]]), ([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]), ([[5]], [[5]])]:
    _orig = _M
    _rows = [id(r) for r in _M]
    transpone(_M)
    assert _M is _orig and [id(r) for r in _M] == _rows, "matris yerində dəyişdirilməlidir (yeni matris yaratmayın)"
    assert _M == _e, f"{_e} olmalıdır, sizinki: {_M}"
''')

task(44, "D", "Yəhər nöqtəsi",
 "Matrisin **yəhər nöqtəsini** (öz **sətrində minimum**, öz **sütununda maksimum** olan element) tapan `yeher_noqtesi(M)` funksiyasını yazın. Tapılsa həmin elementin qiymətini, tapılmasa `None` qaytarın.\nNümunə: `[[3,5,7],[1,4,9],[2,6,8]]` → `3`.",
 stub("yeher_noqtesi(M)"),
 '''def yeher_noqtesi(M):
    for i in range(len(M)):
        j = 0
        for k in range(len(M[i])):
            if M[i][k] < M[i][j]:
                j = k
        v = M[i][j]
        maks = True
        for r in range(len(M)):
            if M[r][j] > v:
                maks = False
                break
        if maks:
            return v
    return None''',
 cases("yeher_noqtesi", [(([[3, 5, 7], [1, 4, 9], [2, 6, 8]],), 3), (([[1, 2], [3, 4]],), 3), (([[1, 3], [4, 2]],), None), (([[8]],), 8)]))

task(45, "D", "Perimetr elementlərinin cəmi",
 "`N x M` matrisinin **sərhəd (perimetr) elementlərinin** (birinci/sonuncu sətir və birinci/sonuncu sütun) cəmini hesablayan `perimetr_cemi(M)` funksiyasını yazın. Hər element yalnız bir dəfə sayılmalıdır.\nNümunə: `[[1,2,3],[4,5,6],[7,8,9]]` → `40`.",
 stub("perimetr_cemi(M)"),
 '''def perimetr_cemi(M):
    n, m = len(M), len(M[0])
    t = 0
    for i in range(n):
        for j in range(m):
            if i == 0 or i == n - 1 or j == 0 or j == m - 1:
                t += M[i][j]
    return t''',
 cases("perimetr_cemi", [(([[1, 2, 3], [4, 5, 6], [7, 8, 9]],), 40), (([[1, 2, 3]],), 6), (([[5]],), 5), (([[1, 2], [3, 4]],), 10), (([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]],), 65)]))

# ======================= E. Sətirlər ========================================
S_HELPER = '''class _S(str):
    """Qadağan olunmuş metodları çağıranda xəta verən sətir."""
    _BAN = ()
    def __contains__(self, x):
        if "__contains__" in type(self)._BAN:
            raise AssertionError("bu tapşırıqda 'in' operatorundan istifadə etmək olmaz")
        return str.__contains__(self, x)
    def __getattribute__(self, name):
        if name in type(self)._BAN:
            raise AssertionError(f"bu tapşırıqda {name}() metodundan istifadə etmək olmaz")
        return str.__getattribute__(self, name)
'''

task(46, "E", "Palindrom (iki göstərici)",
 "Mətnin palindrom olub-olmadığını **iki göstərici** üsulu ilə yoxlayan `palindromdur(s)` funksiyasını yazın (`True`/`False`). Boş sətir və bir simvollu sətir palindromdur; hərf registri fərqlidir.\nNümunə: `\"level\"` → `True`, `\"abca\"` → `False`.",
 stub("palindromdur(s)"),
 '''def palindromdur(s):
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return False
        i += 1
        j -= 1
    return True''',
 cases("palindromdur", [(("level",), True), (("abca",), False), (("",), True), (("a",), True), (("madam",), True), (("abba",), True), (("ab",), False)]))

task(47, "E", "Sözlərin sayı (split olmadan)",
 "`split()` metodundan istifadə etmədən mətndəki **sözlərin sayını** tapan `soz_sayi(metn)` funksiyasını yazın. Sözlər bir və ya bir neçə boşluqla ayrılır; mətnin əvvəlində və sonunda boşluqlar ola bilər.\nNümunə: `\"  çox   boşluq  var \"` → `3`.",
 stub("soz_sayi(metn)"),
 '''def soz_sayi(metn):
    say = 0
    sozde = False
    for ch in metn:
        if ch != " ":
            if not sozde:
                say += 1
                sozde = True
        else:
            sozde = False
    return say''',
 S_HELPER.replace('_BAN = ()', '_BAN = ("split", "rsplit", "splitlines", "partition")') + '''
for _s, _e in [("salam dünya", 2), ("  çox   boşluq  var ", 3), ("", 0), ("   ", 0), ("bir", 1), ("a b c d e", 5)]:
    _r = soz_sayi(_S(_s))
    assert _r == _e, f"soz_sayi({_s!r}) {_e} olmalıdır, sizinki: {_r}"
''')

task(48, "E", "Anaqram yoxlanışı",
 "İki sətrin **anaqram** olub-olmadığını (eyni simvollardan, eyni sayda ibarət olub-olmadığını) **tezlik lüğəti/massivi** ilə yoxlayan `anaqram(a, b)` funksiyasını yazın (`sorted()` istifadə etməyin). Hərf registri fərqlidir.\nNümunə: `(\"listen\", \"silent\")` → `True`.",
 stub("anaqram(a, b)"),
 '''def anaqram(a, b):
    if len(a) != len(b):
        return False
    t = {}
    for ch in a:
        t[ch] = t.get(ch, 0) + 1
    for ch in b:
        if t.get(ch, 0) == 0:
            return False
        t[ch] -= 1
    return True''',
 '''
_b = __builtins__ if isinstance(__builtins__, dict) else vars(__builtins__)
_os = _b["sorted"]
def _qadagan(*a, **k):
    raise AssertionError("bu tapşırıqda sorted() istifadə etmək olmaz")
_b["sorted"] = _qadagan
try:
    _res = [anaqram(*_c) for _c in [("listen", "silent"), ("abc", "abd"), ("aab", "ab"), ("", ""), ("rail", "liar"), ("aabb", "abab"), ("abc", "abcc")]]
finally:
    _b["sorted"] = _os
assert _res == [True, False, False, True, True, True, False], f"nəticələr [True, False, False, True, True, True, False] olmalıdır, sizinki: {_res}"
''')

task(49, "E", "Simvol tezliyi",
 "Sətirdəki hər simvolun rast gəlmə tezliyini `{simvol: say}` lüğəti kimi qaytaran `simvol_tezliyi(s)` funksiyasını yazın.\nNümunə: `\"hello\"` → `{'h': 1, 'e': 1, 'l': 2, 'o': 1}`.",
 stub("simvol_tezliyi(s)"),
 '''def simvol_tezliyi(s):
    t = {}
    for ch in s:
        t[ch] = t.get(ch, 0) + 1
    return t''',
 cases("simvol_tezliyi", [(("hello",), {"h": 1, "e": 1, "l": 2, "o": 1}), (("",), {}), (("aab",), {"a": 2, "b": 1}), (("ə ə",), {"ə": 2, " ": 1})]))

task(50, "E", "Azərbaycan əlifbasında sait və samit",
 "Mətndəki Azərbaycan əlifbasına məxsus **sait** və **samit** hərflərin sayını `(sait_say, samit_say)` tuple-ı kimi qaytaran `sait_samit(metn)` funksiyasını yazın. Saitlər: `a, e, ə, i, ı, o, ö, u, ü`; samitlər isə əlifbanın digər hərfləridir (`b, c, ç, d, f, g, ğ, h, x, j, k, q, l, m, n, p, r, s, ş, t, v, y, z`). Registr nəzərə alınmır; rəqəm, durğu işarəsi və boşluqlar sayılmır.\nNümunə: `\"Azərbaycan dili!\"` → `(6, 8)`.",
 stub("sait_samit(metn)"),
 '''def sait_samit(metn):
    saitler = "aeəıioöuü"
    samitler = "bcçdfgğhxjkqlmnprsştvyz"
    a = b = 0
    for ch in metn.lower():
        if ch in saitler:
            a += 1
        elif ch in samitler:
            b += 1
    return (a, b)''',
 cases("sait_samit", [(("Azərbaycan dili!",), (6, 8)), (("Şəhər, 2024!",), (2, 3)), (("",), (0, 0)), (("Üçüncü",), (3, 3)), (("123 !?",), (0, 0)), (("Əli",), (2, 1))]))

task(51, "E", "Run-Length Encoding (RLE)",
 "Sətri **Run-Length Encoding** ilə sıxlaşdıran `rle(s)` funksiyasını yazın: ardıcıl təkrarlanan eyni simvollar `simvol + say` şəklində yazılır (bir dəfə olan simvol üçün də say `1` yazılır).\nNümunə: `\"aaabbc\"` → `\"a3b2c1\"`.",
 stub("rle(s)"),
 '''def rle(s):
    if not s:
        return ""
    res = ""
    cari = s[0]
    say = 1
    for ch in s[1:]:
        if ch == cari:
            say += 1
        else:
            res += cari + str(say)
            cari = ch
            say = 1
    res += cari + str(say)
    return res''',
 cases("rle", [(("aaabbc",), "a3b2c1"), (("",), ""), (("abc",), "a1b1c1"), (("zzzz",), "z4"), (("aabaa",), "a2b1a2"), (("x" * 12,), "x12")]))

task(52, "E", "Hər sözün ilk hərfi böyük (Custom Title Case)",
 "Mətndəki hər sözün **ilk hərfini böyük**, qalan hərflərini **kiçik** edən `basliq_formati(metn)` funksiyasını yazın (`title()` və `capitalize()` istifadə etmək olmaz). Sözlər boşluqla ayrılır, boşluqlar (o cümlədən ardıcıl boşluqlar) olduğu kimi qalmalıdır.\nNümunə: `\"salam dünya\"` → `\"Salam Dünya\"`.",
 stub("basliq_formati(metn)"),
 '''def basliq_formati(metn):
    res = ""
    yeni_soz = True
    for ch in metn:
        if ch == " ":
            res += ch
            yeni_soz = True
        elif yeni_soz:
            res += ch.upper()
            yeni_soz = False
        else:
            res += ch.lower()
    return res''',
 S_HELPER.replace('_BAN = ()', '_BAN = ("title", "capitalize")') + '''
for _s, _e in [("salam dünya", "Salam Dünya"), ("pYTHON proqramlaşdırma dili", "Python Proqramlaşdırma Dili"), ("", ""), ("ədəd  alma", "Ədəd  Alma"), ("a", "A")]:
    _r = basliq_formati(_S(_s))
    assert _r == _e, f"basliq_formati({_s!r}) {_e!r} olmalıdır, sizinki: {_r!r}"
''')

task(53, "E", "Alt-sətrin axtarışı",
 "`alt` alt-sətrinin `metn` içində **ilk rast gəlindiyi mövqeyi** (0-dan başlayan indeks) tapan `alt_setir_tap(metn, alt)` funksiyasını yazın; tapılmazsa `-1` qaytarın. Boş `alt` üçün nəticə `0`-dır. Daxili axtarış üsullarından (`in`, `find`, `index`, `count`, `startswith` və s.) istifadə edib **simvolları özünüz müqayisə edin**.\nNümunə: `(\"salam dünya\", \"dün\")` → `6`.",
 stub("alt_setir_tap(metn, alt)"),
 '''def alt_setir_tap(metn, alt):
    n, m = len(metn), len(alt)
    for i in range(n - m + 1):
        j = 0
        while j < m and metn[i + j] == alt[j]:
            j += 1
        if j == m:
            return i
    return -1''',
 S_HELPER.replace('_BAN = ()', '_BAN = ("find", "rfind", "index", "rindex", "count", "startswith", "endswith", "partition", "rpartition", "split", "replace", "__contains__")') + '''
for _m, _a, _e in [("salam dünya", "dün", 6), ("abcabc", "ca", 2), ("abc", "d", -1), ("abc", "", 0), ("aaab", "aab", 1), ("ab", "abc", -1), ("abc", "abc", 0)]:
    _r = alt_setir_tap(_S(_m), _a)
    assert _r == _e, f"alt_setir_tap({_m!r}, {_a!r}) {_e} olmalıdır, sizinki: {_r}"
''')

# ======================= F. Əlaqəli siyahılar ===============================
LL = '''def _ll_qur(vals):
    head = None
    for v in reversed(vals):
        head = {"data": v, "next": head}
    return head

def _ll_list(head):
    res = []
    n = 0
    while head is not None:
        res.append(head["data"])
        head = head["next"]
        n += 1
        assert n < 1000, "siyahı sonsuz dövrə düşüb (next əlaqələri səhvdir)"
    return res
'''

task(54, "F", "Başa düyün əlavə etmək",
 "Əlaqəli siyahının düyünü **lüğət** kimi təyin olunur: `{\"data\": qiymət, \"next\": növbəti_düyün_və_ya_None}`; boş siyahı `None`-dur. Siyahının **başlanğıcına** `x` qiymətli yeni düyün əlavə edən `basa_elave(head, x)` funksiyasını yazın və **yeni head**-i qaytarın.\nNümunə: `head = 2 → 3`, `x = 1` → `1 → 2 → 3`.",
 stub("basa_elave(head, x)"),
 '''def basa_elave(head, x):
    return {"data": x, "next": head}''',
 LL + '''
_r = basa_elave(None, 5)
assert _ll_list(_r) == [5], f"boş siyahıya əlavədən sonra [5] olmalıdır, sizinki: {_ll_list(_r)}"
assert set(_r.keys()) == {"data", "next"}, "düyün yalnız 'data' və 'next' açarlarından ibarət lüğət olmalıdır"
_h = _ll_qur([2, 3])
_r = basa_elave(_h, 1)
assert _ll_list(_r) == [1, 2, 3], f"[1, 2, 3] olmalıdır, sizinki: {_ll_list(_r)}"
assert _r["next"] is _h, "yeni düyünün next-i köhnə head olmalıdır"
''')

task(55, "F", "Sona düyün əlavə etmək",
 "Düyün lüğət kimi təyin olunur (`{\"data\": ..., \"next\": ...}`), boş siyahı `None`-dur. Siyahının **sonuna** `x` qiymətli yeni düyün əlavə edən `sona_elave(head, x)` funksiyasını yazın və head-i qaytarın (siyahı boşdursa yeni düyün head olur).\nNümunə: `1 → 2`, `x = 3` → `1 → 2 → 3`.",
 stub("sona_elave(head, x)"),
 '''def sona_elave(head, x):
    yeni = {"data": x, "next": None}
    if head is None:
        return yeni
    cari = head
    while cari["next"] is not None:
        cari = cari["next"]
    cari["next"] = yeni
    return head''',
 LL + '''
_r = sona_elave(None, 7)
assert _ll_list(_r) == [7], f"boş siyahıya əlavədən sonra [7] olmalıdır, sizinki: {_ll_list(_r)}"
_h = _ll_qur([1, 2])
_r = sona_elave(_h, 3)
assert _r is _h, "siyahı boş deyilsə, əvvəlki head qaytarılmalıdır"
assert _ll_list(_r) == [1, 2, 3], f"[1, 2, 3] olmalıdır, sizinki: {_ll_list(_r)}"
_r = sona_elave(_r, 4)
assert _ll_list(_r) == [1, 2, 3, 4], f"[1, 2, 3, 4] olmalıdır, sizinki: {_ll_list(_r)}"
''')

task(56, "F", "Siyahını oxumaq və düyün sayı",
 "Düyün lüğət kimi təyin olunur (`{\"data\": ..., \"next\": ...}`), boş siyahı `None`-dur. Siyahının bütün elementlərini **ardıcıl** olaraq siyahıya yığıb düyünlərin sayı ilə birlikdə `(elementler, say)` tuple-ı kimi qaytaran `siyahi_oxu(head)` funksiyasını yazın.\nNümunə: `1 → 2 → 3` → `([1, 2, 3], 3)`; boş siyahı → `([], 0)`.",
 stub("siyahi_oxu(head)"),
 '''def siyahi_oxu(head):
    res = []
    cari = head
    while cari is not None:
        res.append(cari["data"])
        cari = cari["next"]
    return (res, len(res))''',
 LL + '''
for _v, _e in [([1, 2, 3], ([1, 2, 3], 3)), ([], ([], 0)), (["a"], (["a"], 1)), ([5, 5, 5, 5], ([5, 5, 5, 5], 4))]:
    _r = siyahi_oxu(_ll_qur(_v))
    assert tuple(_r) == _e, f"{_v} üçün {_e} olmalıdır, sizinki: {_r}"
''')

task(57, "F", "Siyahıda axtarış",
 "Düyün lüğət kimi təyin olunur (`{\"data\": ..., \"next\": ...}`), boş siyahı `None`-dur. Siyahıda `x` qiymətinin **ilk rast gəlindiyi mövqeyi** (0-dan başlayan indeks) O(n) zamanda tapan `axtar(head, x)` funksiyasını yazın; tapılmazsa `-1` qaytarın.\nNümunə: `4 → 8 → 15 → 16`, `x = 15` → `2`.",
 stub("axtar(head, x)"),
 '''def axtar(head, x):
    cari = head
    i = 0
    while cari is not None:
        if cari["data"] == x:
            return i
        cari = cari["next"]
        i += 1
    return -1''',
 LL + '''
_h = _ll_qur([4, 8, 15, 16, 23, 42])
for _x, _e in [(15, 2), (4, 0), (42, 5), (99, -1)]:
    _r = axtar(_h, _x)
    assert _r == _e, f"axtar(..., {_x}) {_e} olmalıdır, sizinki: {_r}"
assert axtar(None, 1) == -1, "boş siyahıda -1 olmalıdır"
assert axtar(_ll_qur([1, 2, 2]), 2) == 1, "təkrar olduqda ilk mövqe qaytarılmalıdır"
''')

task(58, "F", "Birinci düyünü silmək",
 "Düyün lüğət kimi təyin olunur (`{\"data\": ..., \"next\": ...}`), boş siyahı `None`-dur. Siyahının **birinci düyününü (head)** silən `basi_sil(head)` funksiyasını yazın və **yeni head**-i qaytarın. Boş siyahıda `None` qaytarılmalıdır.\nNümunə: `1 → 2 → 3` → `2 → 3`.",
 stub("basi_sil(head)"),
 '''def basi_sil(head):
    if head is None:
        return None
    return head["next"]''',
 LL + '''
assert basi_sil(None) is None, "boş siyahıda None olmalıdır"
assert basi_sil(_ll_qur([1])) is None, "bir düyünlü siyahıdan sonra None olmalıdır"
_r = basi_sil(_ll_qur([1, 2, 3]))
assert _ll_list(_r) == [2, 3], f"[2, 3] olmalıdır, sizinki: {_ll_list(_r)}"
_r = basi_sil(_r)
assert _ll_list(_r) == [3], f"[3] olmalıdır, sizinki: {_ll_list(_r)}"
''')

task(59, "F", "Cəm və ədədi orta",
 "Düyün lüğət kimi təyin olunur (`{\"data\": ..., \"next\": ...}`), boş siyahı `None`-dur. Siyahıdakı bütün qiymətlərin **cəmini və ədədi ortasını** `(cem, orta)` tuple-ı kimi qaytaran `cem_ortasi(head)` funksiyasını yazın. Boş siyahı üçün `(0, 0)` qaytarın.\nNümunə: `2 → 4 → 6` → `(12, 4.0)`.",
 stub("cem_ortasi(head)"),
 '''def cem_ortasi(head):
    cem = 0
    say = 0
    cari = head
    while cari is not None:
        cem += cari["data"]
        say += 1
        cari = cari["next"]
    if say == 0:
        return (0, 0)
    return (cem, cem / say)''',
 LL + '''
for _v, _e in [([2, 4, 6], (12, 4.0)), ([5], (5, 5.0)), ([1, 2], (3, 1.5)), ([], (0, 0)), ([-3, 3, 9], (9, 3.0))]:
    _r = cem_ortasi(_ll_qur(_v))
    assert tuple(_r) == _e, f"{_v} üçün {_e} olmalıdır, sizinki: {_r}"
''')

task(60, "F", "İkitərəfli siyahı və əks keçid",
 "İkitərəfli siyahının düyünü lüğətdir: `{\"data\": qiymət, \"prev\": əvvəlki_düyün_və_ya_None, \"next\": növbəti_düyün_və_ya_None}`. Verilmiş `lst` siyahısından **ikitərəfli əlaqəli siyahı qurub** `(bas, son, eks)` üçlüyünü qaytaran `ikiterefli(lst)` funksiyasını yazın: `bas` — birinci düyün, `son` — sonuncu düyün, `eks` — `son`-dan başlayaraq `prev` əlaqələri ilə **əks istiqamətdə** keçərək yığılmış qiymətlər siyahısı. Boş `lst` üçün `(None, None, [])`.\nNümunə: `[1, 2, 3]` → `eks == [3, 2, 1]`.",
 stub("ikiterefli(lst)"),
 '''def ikiterefli(lst):
    bas = None
    son = None
    for x in lst:
        yeni = {"data": x, "prev": son, "next": None}
        if son is None:
            bas = yeni
        else:
            son["next"] = yeni
        son = yeni
    eks = []
    cari = son
    while cari is not None:
        eks.append(cari["data"])
        cari = cari["prev"]
    return (bas, son, eks)''',
 '''
_bas, _son, _eks = ikiterefli([])
assert _bas is None and _son is None and list(_eks) == [], "boş siyahı üçün (None, None, []) olmalıdır"
_bas, _son, _eks = ikiterefli([1, 2, 3])
assert list(_eks) == [3, 2, 1], f"eks [3, 2, 1] olmalıdır, sizinki: {_eks}"
assert _bas["data"] == 1 and _bas["prev"] is None, "birinci düyünün prev-i None olmalıdır"
assert _son["data"] == 3 and _son["next"] is None, "sonuncu düyünün next-i None olmalıdır"
assert _bas["next"]["data"] == 2 and _bas["next"]["prev"] is _bas, "ikinci düyünün prev-i birinci düyünü göstərməlidir"
assert _son["prev"] is _bas["next"] and _bas["next"]["next"] is _son, "düyünlər qarşılıqlı əlaqəli olmalıdır"
_bas, _son, _eks = ikiterefli([9])
assert _bas is _son and list(_eks) == [9], "bir elementli siyahıda bas və son eyni düyündür"
''')

# ---------------------------------------------------------------------------
# Çətinlik qiymətləri (1 — asan ... 5 — çətin). Variantlara balanslı paylamaq üçün.
# ---------------------------------------------------------------------------
THEORY_DIFF = {1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 4, 9: 3, 10: 2, 11: 3, 12: 2, 13: 3, 14: 4}
CODING_DIFF = {
    21: 1, 22: 2, 23: 2, 24: 2, 25: 2, 26: 2, 28: 1, 29: 3, 30: 1,
    31: 1, 32: 2, 33: 3, 34: 3, 35: 3, 36: 2, 37: 3, 38: 3, 39: 4, 40: 3,
    41: 1, 42: 2, 43: 3, 44: 4, 45: 2,
    46: 2, 47: 3, 48: 2, 49: 1, 50: 2, 51: 3, 52: 3, 53: 4,
    54: 1, 55: 2, 56: 1, 57: 2, 58: 1, 59: 2, 60: 4,
}
for _n, _d in CODING_DIFF.items():
    CODING[_n]["diff"] = _d
