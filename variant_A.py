# -*- coding: utf-8 -*-
"""
BAKI MÜHƏNDİSLİK UNİVERSİTETİ (BMU)
Fənn: Maşın Öyrənmənin Əsasları — SDF 1 (Variant A)
Maksimum bal: 100 (20 tapşırıq)

İSTİFADƏ QAYDASI
1. Hər tapşırığın kodunu `with hell("..."):` blokunun İÇİNDƏ yazın
   (blokun içindəki sətirlər 4 boşluq girintili olmalıdır).
   `___` olan yerləri tamamlayın, `pass` əvəzinə funksiyanı yazın.
2. Faylı işə salın:   python variant_A.py
3. Hər tapşırıq dərhal yoxlanır:
       ✅ Tapşırıq B1: DÜZGÜNDÜR (+6 bal)
       ❌ Tapşırıq B1: XƏTA — ...   (altında səbəb göstərilir)
   Faylın sonunda yekun balınız çap olunur.

Qeyd: bir tapşırıqdakı icra xətası digər tapşırıqları dayandırmır.
SyntaxError (məs. mötərizə və ya girinti səhvi) isə bütün faylın işləməsinə
mane olur — Python xətanın sətrini göstərəcək, onu düzəldib yenidən işlədin.
Funksiyaların adlarını və arqumentlərini dəyişməyin.

Bu fayl tools/build_exam.py ilə SDF1_Variant_A.ipynb-dən yaradılıb.
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

results = {}
_errors = {}


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
            _errors[self.task_id] = f"kodunuz icra olunarkən xəta baş verdi → {exc_type.__name__}: {exc}"
        return True


def check(task_id, points, test):
    """Testi işlədir, nəticəni `results`-də saxlayır və ekrana rəy çıxarır."""
    tid = task_id.split("_")[0]
    try:
        test()
        results[task_id] = points
        print(f"✅ Tapşırıq {tid}: DÜZGÜNDÜR (+{points} bal)")
        return
    except AssertionError as e:
        reason = str(e) or "test şərti ödənmədi"
    except NameError as e:
        reason = f"tələb olunan dəyişən/funksiya təyin edilməyib ({e})"
    except Exception as e:
        reason = f"{type(e).__name__}: {e}"
    results[task_id] = 0
    if tid in _errors:
        reason = _errors[tid]
    print(f"❌ Tapşırıq {tid}: XƏTA — Çıxış formatı və ya hesablanmış dəyər gözlənilən nəticəyə uyğun deyil!")
    print(f"   ↳ Səbəb: {reason}")


# ======================================================================
# # Maşın Öyrənmənin Əsasları — SDF 1 (Variant A)
# ## Semestr Daxili Qiymətləndirmə 1
#
# **Fənn:** Maşın öyrənmənin əsasları
# **Fakültə:** İnformasiya və kompüter texnologiyaları
# **İxtisas:** Kompüter mühəndisliyi | **Kurs:** 4-cü kurs | **Qrup:** 1203A
# **Variant:** Variant A
# **Müddət:** 80 dəqiqə | **Maksimum bal:** 100 bal | **Ümumi tapşırıq:** 20 tapşırıq
#
# ---
#
# ### 📌 İmtahan Təlimatı və Qaydalar:
# 1. İmtahan **20 tapşırıqdan** ibarətdir və ümumi bal **100-dür**.
# 2. **Necə işləməli?**
#    - Həll xanasında `___` olan yerləri tamamlayın və ya `pass` əvəzinə tələb olunan funksiyanı yazın.
#    - Həll xanasını işlədin (**`Shift + Enter`**), sonra **dərhal altındakı Yoxlama xanasını** işlədin.
#    - ✅ görürsünüzsə, tapşırıq düzgündür və balınız qeydə alınıb.
#    - ❌ görürsünüzsə, mesajı oxuyub kodu düzəldin və yenidən yoxlayın.
# 3. **Yekun Bal:** Bütün sualları bitirdikdən sonra ən sondakı **"✅ Əsas yoxlama"** xanasını işlədərək imtahan balınızı görün.
#
# *Qeyd:* Funksiyaların adlarını və daxil olan arqumentlərini dəyişməyin.
# ======================================================================

# ======================================================================
# ### Tələbə Məlumatları
# ======================================================================

ad_soyad = "..."      # Bura ad və soyadınızı yazın
qrup = "1203A"        # Qrup nömrəniz


# ======================================================================
# ### Bal Bölgüsü Cədvəli (Cəmi 100 bal / 20 tapşırıq)
#
# | Hissə | Növ | Mövzular | Tapşırıq sayı | Bal |
# |---|---|---|---|---|
# | **A** | Data Emalı | Ortalama, NaN doldurma, MinMax Normalizasiya | 3 | 15 |
# | **B** | Alqoritmlər və Metriklər | Xətti Model, MAE, RMSE, Train-Test bölgüsü | 4 | 26 |
# | **C** | Çıxışı təxmin et | 2D İndeksləmə və Şərti Filtrləmə | 2 | 8 |
# | **D** | Debugging | Data Leakage və Broadcasting səhvlərinin düzəldilməsi | 2 | 10 |
# | **E** | Nəzəri Testlər | Outliers, Korrelyasiya, Leakage, Nəzarətli öyrənmə, GD, L1/L2, Overfitting | 7 | 21 |
# | **F** | Mini Layihə | Çoxölçülü Proqnoz və Xətaların Qiymətləndirilməsi | 1 (2 addım) | 20 |
# | | **CƏMİ** | | **20 tapşırıq** | **100** |
# ======================================================================

# ======================================================================
# ---
# # A hissəsi. Data ilə iş və Preprocessing (15 bal)
# Kodda `___` olan yerləri tamamlayın. Hər tapşırıq **5 bal**.
# ======================================================================

# ======================================================================
# ### Tapşırıq A1. NumPy ilə Sütun Ortalaması və Mərkəzləşdirmə (5 bal)
# Aşağıdakı 2D massivin hər bir sütununun ədədi ortasını hesablayın (`mean_vec`) və hər sütundan öz ortalamasını çıxaraq mərkəzləşdirilmiş massivi (`X_centered`) alın.
# ======================================================================

with hell("A1"):
    import numpy as np

    X = np.array([
        [10.0, 20.0],
        [20.0, 40.0],
        [30.0, 60.0]
    ])

    # 1. Hər sütunun ədədi ortasını tapın (axis parametri ilə):
    mean_vec = np.mean(X, axis=___)

    # 2. X matrisini mərkəzləşdirin (hər sütundan öz ortalamasını çıxın):
    X_centered = X - ___


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_a1():
    assert np.allclose(mean_vec, [20.0, 40.0]), "Sütun ortalamaları [20.0, 40.0] olmalıdır"
    assert math.isclose(np.mean(X_centered), 0.0, abs_tol=1e-7), "Mərkəzləşdirilmiş matrisin ortalaması 0 olmalıdır"
    assert X_centered.shape == (3, 2), "Ölçü (3, 2) qalmalıdır"
check("A1", 5, test_a1)


# ======================================================================
# ### Tapşırıq A2. pandas ilə Missing Value Doldurma və Şərti Filtrləmə (5 bal)
# Aşağıdakı `df` cədvəlində `bal` sütununda boş (`NaN`) dəyərlər var.
# 1. Həmin boşluqları `bal` sütununun **medianı** ilə doldurun.
# 2. Balı 60 və ya daha yüksək olan tələbələrin sayını tapın.
# ======================================================================

with hell("A2"):
    import pandas as pd

    df = pd.DataFrame({
        'saat': [2, 4, 6, 8],
        'bal': [40.0, None, 80.0, None]
    })

    # 1. Boşluqları 'bal' sütununun medianı ilə doldurun:
    df['bal'] = df['bal'].fillna(df['bal'].___())

    # 2. Balı 60-dan böyük və ya bərabər olan sətirlərin sayını tapın:
    kecenler_sayi = int((df['bal'] >= ___).sum())


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_a2():
    assert df['bal'].isna().sum() == 0, "Bütün NaN dəyərlər doldurulmalıdır"
    assert math.isclose(df.loc[1, 'bal'], 60.0), "NaN xanalar median (60.0) ilə əvəzlənməlidir"
    assert kecenler_sayi == 3, "60 və yuxarı bal toplayan 3 tələbə olmalıdır"
check("A2", 5, test_a2)


# ======================================================================
# ### Tapşırıq A3. Min-Max Normalizasiyası (5 bal)
# Əlamətlərin qiymətlərini $[0, 1]$ aralığına gətirmək üçün Min-Max normalizasiyası düsturu:
# $$x_{norm} = \frac{x - x_{min}}{x_{max} - x_{min}}$$
# Aşağıdakı massiv üçün $x_{min}$ və $x_{max}$-ı təyin edərək normallaşdırılmış massivi (`x_norm`) hesablayın.
# ======================================================================

with hell("A3"):
    x = np.array([10.0, 20.0, 30.0, 40.0, 50.0])

    x_min = np.min(x)
    x_max = np.max(x)

    # Min-Max düsturunu tətbiq edin:
    x_norm = (x - ___) / (___ - ___)


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_a3():
    assert math.isclose(float(np.min(x_norm)), 0.0), "Minimum dəyər 0.0 olmalıdır"
    assert math.isclose(float(np.max(x_norm)), 1.0), "Maksimum dəyər 1.0 olmalıdır"
    assert math.isclose(float(x_norm[2]), 0.5), "Orta element 0.5 olmalıdır"
check("A3", 5, test_a3)


# ======================================================================
# ---
# # B hissəsi. Alqoritmlər və Metriklər (26 bal)
# Funksiyaları sıfırdan (`pass` əvəzinə) yazın.
# ======================================================================

# ======================================================================
# ### Tapşırıq B1. Çoxölçülü Xətti Model Proqnozu (6 bal)
# Çoxölçülü xətti reqressiya modelində proqnoz vektorunun hesablanması:
# $$\hat{y} = X w + b$$
# Burada $X$ $(N, D)$ ölçülü əlamətlər matrisi, $w$ $(D,)$ ölçülü çəki vektoru, $b$ isə skalyar sərbəst hədd-dir.
#
# `predict_linear(X, w, b)` funksiyasını yazın. Funksiya $(N,)$ ölçülü proqnoz vektorunu qaytarmalıdır.
# ======================================================================

with hell("B1"):
    def predict_linear(X, w, b):
        # buranı yazın
        pass


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_b1():
    X_test = np.array([[1.0, 2.0], [3.0, 4.0]])
    w_test = np.array([2.0, 3.0])
    b_test = 1.0
    preds = predict_linear(X_test, w_test, b_test)
    assert np.allclose(preds, [9.0, 19.0]), f"Proqnozlar [9.0, 19.0] olmalıdır, sizinki: {preds}"
check("B1", 6, test_b1)


# ======================================================================
# ### Tapşırıq B2. MAE (Mean Absolute Error) Metriki (6 bal)
# Həqiqi və proqnozlaşdırılan qiymətlər arasındakı Orta Mütləq Xəta:
# $$MAE = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$
#
# `calc_mae(y_true, y_pred)` funksiyasını yazın. Funksiya xətanı tək bir float ədəd olaraq qaytarmalıdır.
# ======================================================================

with hell("B2"):
    def calc_mae(y_true, y_pred):
        # buranı yazın
        pass


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_b2():
    res = calc_mae([10, 20, 30], [12, 18, 35])
    assert math.isclose(res, 3.0), f"MAE 3.0 olmalıdır, sizinki: {res}"
    assert calc_mae([5, 5], [5, 5]) == 0.0, "Eyni qiymətlər üçün MAE 0.0 olmalıdır"
check("B2", 6, test_b2)


# ======================================================================
# ### Tapşırıq B3. RMSE (Root Mean Squared Error) Metriki (7 bal)
# Kökaltı Orta Kvadrat Xəta (RMSE) metriki:
# $$RMSE = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
#
# `calc_rmse(y_true, y_pred)` funksiyasını yazın. Funksiya xətanı tək bir float ədəd olaraq qaytarmalıdır.
# ======================================================================

with hell("B3"):
    def calc_rmse(y_true, y_pred):
        # buranı yazın
        pass


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_b3():
    res = calc_rmse([10, 20, 30], [12, 18, 30])
    assert math.isclose(res, math.sqrt(8/3)), f"RMSE düzgün deyil: {res}"
    assert calc_rmse([5, 5], [5, 5]) == 0.0, "Eyni qiymətlər üçün RMSE 0.0 olmalıdır"
check("B3", 7, test_b3)


# ======================================================================
# ### Tapşırıq B4. Xüsusiyyət və Hədəf üçün Train-Test Bölgüsü (7 bal)
# `split_data(X, y, train_ratio=0.8)` funksiyasını yazın:
# - Sətir sayını $N = len(X)$ tapın.
# - $k = int(N \times train\_ratio)$ sayda nümunəni Train üçün ayırın.
# - Qalan hissəni Test üçün ayırın.
# - `(X_train, X_test, y_train, y_test)` kortejini qaytarın.
# ======================================================================

with hell("B4"):
    def split_data(X, y, train_ratio=0.8):
        # buranı yazın
        pass


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_b4():
    X_sample = np.arange(20).reshape(10, 2)
    y_sample = np.arange(10)
    X_tr, X_te, y_tr, y_te = split_data(X_sample, y_sample, 0.8)
    assert len(X_tr) == 8 and len(X_te) == 2, "Train 8, Test 2 olmalıdır"
    assert len(y_tr) == 8 and len(y_te) == 2, "Hədəf bölgüsü 8 və 2 olmalıdır"
    assert X_tr[0, 0] == 0 and X_te[0, 0] == 16, "Məlumatların ardıcıllığı qorunmalıdır"
check("B4", 7, test_b4)


# ======================================================================
# ---
# # C hissəsi. Çıxışı təxmin et (8 bal)
# Kodu kompüterdə icra etmədən, riyazi olaraq hesablayın.
# ======================================================================

# ======================================================================
# ### Tapşırıq C1. 2D Massivdə Dilimləmə və Alt-matris Cəmi (4 bal)
# Aşağıdakı kod icra olunduqda ekrana hansı ədəd çap olunacaq?
#
# ```python
# import numpy as np
#
# M = np.array([
#     [1, 2, 3],
#     [4, 5, 6],
#     [7, 8, 9]
# ])
#
# sub = M[1:, :2]
# netice = int(np.sum(sub))
# print(netice)
# ```
#
# Cavabınızı `answer_C1` dəyişəninə yazın (tam ədəd):
# ======================================================================

with hell("C1"):
    answer_C1 = None   # məsələn: answer_C1 = 15


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_c1():
    assert _h(answer_C1) == "c2356069e9d1e79ca924378153cfbbfb4d4416b1f99d41a2940bfdb66c5319db", "cavab düzgün deyil. [1:, :2] indekslərini bir daha yoxlayın"
check("C1", 4, test_c1)


# ======================================================================
# ### Tapşırıq C2. Şərti Filtrləmə və Say Hesabı (4 bal)
# Aşağıdakı kod icra olunduqda ekrana hansı ədəd çap olunacaq?
#
# ```python
# import numpy as np
#
# arr = np.array([12, 18, 25, 30, 42, 55])
# mask = (arr % 3 == 0) & (arr > 20)
# print(int(mask.sum()))
# ```
#
# Cavabınızı `answer_C2` dəyişəninə yazın (tam ədəd):
# ======================================================================

with hell("C2"):
    answer_C2 = None   # məsələn: answer_C2 = 3


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_c2():
    assert _h(answer_C2) == "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35", "cavab düzgün deyil. Şərtləri ödəyən elementlərin sayını yenidən yoxlayın"
check("C2", 4, test_c2)


# ======================================================================
# ---
# # D hissəsi. Səhvi tap və düzəlt (Debugging) (10 bal)
# ======================================================================

# ======================================================================
# ### Tapşırıq D1. Pipeline daxilində Data Leakage Səhvini Düzəltmək (5 bal)
# Mühəndis sınaq (test) dəstini miqyaslayarkən `fit_transform`-u həm də test dəstinə tətbiq edərək **Data Leakage** səhvinə yol vermişdir.
# Düzgün qayda: Test məlumatları yalnız train-in öyrənilmiş parametrləri ilə çevrilməlidir (`transform`).
#
# Aşağıdakı xanada olan səhvi tapıb düzəldin.
# ======================================================================

with hell("D1"):
    class SimpleScaler:
        def fit_transform(self, data):
            self.mean = np.mean(data)
            self.std = np.std(data)
            return (data - self.mean) / self.std

        def transform(self, data):
            return (data - self.mean) / self.std

    scaler = SimpleScaler()
    X_train = np.array([10.0, 20.0, 30.0])
    X_test = np.array([40.0, 50.0])

    # SƏHV BURADADIR: X_test üçün də fit_transform çağırılıb!
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.fit_transform(X_test)   # Bunu düzəldin!


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_d1():
    assert scaler.mean == 20.0, "Scaler train ortalamasını (20.0) yadda saxlamalıdır"
    assert math.isclose(X_test_scaled[0], 2.449489742783178), "Test dəsti train parametrləri ilə çevrilməlidir"
check("D1", 5, test_d1)


# ======================================================================
# ### Tapşırıq D2. Loss Hesablamasında Broadcasting / Shape Mismatch Səhvini Düzəltmək (5 bal)
# Əgər `y_true` $(N, 1)$ sütun vektorudursa, `y_pred` isə $(N,)$ 1D vektorudursa, `y_true - y_pred` əməliyyatı $(N, N)$ ölçülü matris yaradır (Broadcasting səhvi).
# Funksiya istənilən ölçülü 1D və ya 2D massivlər üçün xətaların ölçüsünü eyniləşdirib (məsələn: `.reshape(-1)`) düzgün skalyar MSE qaytarmalıdır.
#
# Aşağıdakı funksiyanı düzəldin.
# ======================================================================

with hell("D2"):
    def compute_mse_vectorized(y_true, y_pred):
        # SƏHVİ DÜZƏLDİN: forma uyğunsuzluğunu (broadcasting xətasını) aradan qaldırın
        diff = y_true - y_pred
        return float(np.mean(diff ** 2))


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_d2():
    y_col = np.array([[10], [20], [30]])  # shape (3, 1)
    y_1d = np.array([10, 20, 30])         # shape (3,)
    res = compute_mse_vectorized(y_col, y_1d)
    assert math.isclose(res, 0.0), f"Eyni qiymətlər üçün MSE 0.0 olmalıdır, broadcasting səhvi var: {res}"
    res2 = compute_mse_vectorized(np.array([[12], [22]]), np.array([10, 20]))
    assert math.isclose(res2, 4.0), f"MSE 4.0 olmalıdır, sizinki: {res2}"
check("D2", 5, test_d2)


# ======================================================================
# ---
# # E hissəsi. Nəzəri Testlər (21 bal)
# Düzgün variantın hərfini (`"a"`, `"b"`, `"c"` və ya `"d"`) dırnaq içində yazın. Hər sual **3 bal**.
# ======================================================================

# ======================================================================
# ### Tapşırıq E1. Kənar Qiymətlər (Outliers) və Xəta Metrikləri (3 bal)
# Verilənlər dəstində kəskin kənar qiymətlər (outliers) olduqda, hansı reqressiya metriki bu xətalara qarşı **ən həssasdır** (onları böyüdərək cəzalandırır)?
#
# - **a)** MAE (Mean Absolute Error)
# - **b)** MSE (Mean Squared Error)
# - **c)** Median Absolute Error
# - **d)** R² metriki
# ======================================================================

with hell("E1"):
    E1 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e1():
    assert _h(E1) == "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d", "cavab düzgün deyil"
check("E1", 3, test_e1)


# ======================================================================
# ### Tapşırıq E2. Korrelyasiya Əmsalının Şərhi (3 bal)
# İki əlamət arasındakı Pearson korrelyasiya əmsalı $r = -0.85$ olarsa, bu nəyi göstərir?
#
# - **a)** İki əlamət arasında heç bir əlaqə yoxdur
# - **b)** Əlamətlər arasında güclü tərs xətti asılılıq var (biri artanda digəri azalır)
# - **c)** Əlamətlər arasında zəif müsbət asılılıq var
# - **d)** Verilənlərdə 85% çatışmayan dəyər var
# ======================================================================

with hell("E2"):
    E2 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e2():
    assert _h(E2) == "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d", "cavab düzgün deyil"
check("E2", 3, test_e2)


# ======================================================================
# ### Tapşırıq E3. Data Leakage-in Nəticəsi (3 bal)
# Model təlimi zamanı sınaq (test) dəstinin statistik göstəriciləri təlimə sızarsa (Data Leakage baş verərsə), bunun ən tipik nəticəsi nə olar?
#
# - **a)** Model təlim zamanı heç bir xəta hesablamaz
# - **b)** Modelin təlim müddəti 10 dəfə uzanar
# - **c)** Model təlimdə və validasiyada süni olaraq yüksək nəticə göstərər, lakin real istehsalatda (production) uğursuz olar
# - **d)** Bütün əmsallar (çəkilər) avtomatik sıfıra bərabər olar
# ======================================================================

with hell("E3"):
    E3 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e3():
    assert _h(E3) == "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6", "cavab düzgün deyil"
check("E3", 3, test_e3)


# ======================================================================
# ### Tapşırıq E4. Nəzarətli vs Nəzarətsiz Öyrənmə (3 bal)
# Nəzarətli öyrənməni (Supervised Learning) Nəzarətsiz öyrənmədən (Unsupervised Learning) fərqləndirən əsas cəhət hansıdır?
#
# - **a)** Nəzarətli öyrənmədə hər bir nümunə üçün hədəf dəyişən (etiket / label) mövcuddur
# - **b)** Nəzarətsiz öyrənmədə heç vaxt rəqəmsal verilənlərdən istifadə olunmur
# - **c)** Nəzarətli öyrənmə yalnız klasterləşdirmə məsələlərini həll edir
# - **d)** Nəzarətli öyrənmə üçün heç vaxt test dəsti tələb olunmur
# ======================================================================

with hell("E4"):
    E4 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e4():
    assert _h(E4) == "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", "cavab düzgün deyil"
check("E4", 3, test_e4)


# ======================================================================
# ### Tapşırıq E5. Qradiyent Enişi: Öyrənmə Dərəcəsi (3 bal)
# Qradiyent Enməsi (Gradient Descent) alqoritmində öyrənmə dərəcəsi ($\alpha$ / learning rate) həddindən artıq böyük seçilərsə, nə baş verər?
#
# - **a)** Model dərhal birinci addımda qlobal minimuma çatar
# - **b)** İtki funksiyası minimuma yaxınlaşmaq əvəzinə divergensiya edər (dağılar və böyüyər)
# - **c)** Çəkilərin hamısı dərhal sıfra çevrilər
# - **d)** Qradiyent enişi avtomatik Normal Equation rejiminə keçər
# ======================================================================

with hell("E5"):
    E5 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e5():
    assert _h(E5) == "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d", "cavab düzgün deyil"
check("E5", 3, test_e5)


# ======================================================================
# ### Tapşırıq E6. Requlyarizasiya: L1 (Lasso) vs L2 (Ridge) (3 bal)
# L1 (Lasso) requlyarizasiyasının L2 (Ridge) ilə müqayisədə ən əsas üstünlüyü və fərqi nədir?
#
# - **a)** L1 heç vaxt xəta hesablamır
# - **b)** L2 yalnız təsnifat üçün istifadə olunur
# - **c)** L1 əhəmiyyətsiz əlamətlərin çəkilərini tam sıfıra endirərək avtomatik xüsusiyyət seçimi (feature selection) aparır
# - **d)** L1 modelin çəkilərini sonsuz dərəcədə böyüdür
# ======================================================================

with hell("E6"):
    E6 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e6():
    assert _h(E6) == "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6", "cavab düzgün deyil"
check("E6", 3, test_e6)


# ======================================================================
# ### Tapşırıq E7. Overfitting (Yüksək Variance) Əlaməti (3 bal)
# Təlim prosesində modelin Overfitting vəziyyətində olduğunu göstərən əsas hal hansıdır?
#
# - **a)** Təlim xətası ($J_{train}$) çox kiçikdir, lakin test xətası ($J_{test}$) kəskin dərəcədə böyükdür
# - **b)** Həm təlim, həm də test xətası eyni dərəcədə yüksəkdir (Underfitting)
# - **c)** Modelin $R^2$ metriki həmişə 0-a bərabərdir
# - **d)** Bütün çəkilər mənfidir
# ======================================================================

with hell("E7"):
    E7 = ""   # "a", "b", "c" və ya "d"


# ======================================================================
# *Yoxlama:*
# ======================================================================

def test_e7():
    assert _h(E7) == "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", "cavab düzgün deyil"
check("E7", 3, test_e7)


# ======================================================================
# ---
# # F hissəsi. Mini Layihə: Çoxölçülü Proqnoz və Xətaların Qiymətləndirilməsi (20 bal)
#
# **Ssenari:**
# Siz daşınmaz əmlak qiymətlərini proqnozlaşdıran xətti reqressiya modelinin parametrlərini tətbiq edirsiniz.
# Hər bir mənzilin 2 əlaməti var: **Sahə ($m^2$)** və **Otaq sayı**.
# Modelin öyrənilmiş parametrləri:
# - Çəkilər: $w = [50.0, 10.0]$
# - Sərbəst hədd: $b = 20.0$
# ======================================================================

import numpy as np

X_val = np.array([
    [60.0, 2.0],
    [80.0, 3.0],
    [100.0, 4.0]
])

y_val = np.array([3040.0, 4050.0, 5070.0])
w = np.array([50.0, 10.0])
b = 20.0


# ======================================================================
# ### Addım 1. Çoxdəyişənli Proqnoz (10 bal)
# $\hat{y} = X w + b$ düsturuna əsasən `X_val` massivindəki hər 3 mənzil üçün proqnoz qiymətlərini (`y_pred`) hesablayın.
# ======================================================================

with hell("F1"):
    # Proqnoz vektorunu (y_pred) hesablayın:
    y_pred = ___


# ======================================================================
# ### Addım 2. Hərtərəfli Qiymətləndirmə (MAE və MSE) (10 bal)
# Həqiqi qiymətlər (`y_val`) ilə proqnozlar (`y_pred`) arasındakı:
# 1. **MAE** (Orta Mütləq Xəta): $\frac{1}{N} \sum |y_i - \hat{y}_i|$
# 2. **MSE** (Orta Kvadrat Xəta): $\frac{1}{N} \sum (y_i - \hat{y}_i)^2$
# metriklərini hesablayın.
# ======================================================================

# Diqqət: bu tapşırıq F1-də hesablanan y_pred dəyişənindən istifadə edir. Əvvəlcə F1 tapşırığını düzgün tamamlayın — əks halda bu tapşırıq da səhv sayılacaq.

with hell("F2"):
    # MAE və MSE metriklərini hesablayın:
    mae_score = float(np.mean(np.abs(___)))
    mse_score = float(np.mean((___) ** 2))


# ======================================================================
# *Yoxlama (Mini Layihə):*
# ======================================================================

def test_f1():
    assert np.allclose(y_pred, [3040.0, 4050.0, 5060.0]), "Proqnozlar düzgün deyil"

def test_f2():
    assert math.isclose(mae_score, 10/3), f"MAE 3.33 olmalıdır, sizinki: {mae_score}"
    assert math.isclose(mse_score, 100/3), f"MSE 33.33 olmalıdır, sizinki: {mse_score}"

check("F1_predict", 10, test_f1)
check("F2_evaluate", 10, test_f2)


# ======================================================================
# ---
# # ✅ Əsas yoxlama (Yekun nəticə)
# Bütün tapşırıqları bitirdikdən sonra bu xananı işlədin və yekun imtahan balınızı görün.
# ======================================================================

MAX_POINTS = {
    "A1": 5,
    "A2": 5,
    "A3": 5,
    "B1": 6,
    "B2": 6,
    "B3": 7,
    "B4": 7,
    "C1": 4,
    "C2": 4,
    "D1": 5,
    "D2": 5,
    "E1": 3,
    "E2": 3,
    "E3": 3,
    "E4": 3,
    "E5": 3,
    "E6": 3,
    "E7": 3,
    "F1_predict": 10,
    "F2_evaluate": 10,
}

total = 0
print(f"{'Tapşırıq':<14}{'Nəticə':<10}{'Bal':>6}")
print("-" * 32)
for k, p in MAX_POINTS.items():
    got = results.get(k)
    if got is None:
        status, earned = "—", 0
    elif got == p:
        status, earned = "✅", got
    else:
        status, earned = "❌", got
    total += earned
    print(f"{k:<14}{status:<10}{earned:>3}/{p}")

max_total = sum(MAX_POINTS.values())
print("-" * 32)
print(f"YEKUN İMTAHAN BALI: {total} / {max_total}  ({total / max_total * 100:.0f}%)")

if total == max_total:
    print("🏆 Təbriklər! Bütün 20 tapşırığı 100% düzgün yerinə yetirdiniz.")
elif total >= 0.7 * max_total:
    print("👍 Yaxşı nəticə. ❌ olan tapşırıqlara yenidən baxın.")
else:
    print("📚 Dərs materiallarına qayıdıb ❌ olan tapşırıqları yenidən işləyin.")
