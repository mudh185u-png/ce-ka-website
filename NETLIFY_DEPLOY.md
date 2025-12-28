# دليل النشر السريع على Netlify 🚀

## المتطلبات:
- ✅ حساب GitHub (مجاني)
- ✅ حساب Netlify (مجاني)
- ✅ بيانات Supabase (URL + Key)
- ✅ رقم WhatsApp

---

## الخطوات:

### 1️⃣ رفع المشروع على GitHub

#### أ. إنشاء مستودع جديد:
1. اذهب إلى [github.com](https://github.com)
2. اضغط على **"+"** → **"New repository"**
3. اسم المستودع: `ce-ka-website` (أو أي اسم تريده)
4. اختر **Public** (أو Private)
5. **لا** تضع علامة على README أو .gitignore (لأنها موجودة)
6. اضغط **"Create repository"**

#### ب. رفع الملفات:
افتح PowerShell في مجلد المشروع واكتب:

```powershell
# التحقق من Git
git --version

# إذا لم يكن مثبتاً، قم بتثبيته من: https://git-scm.com/download/win

# تهيئة Git (إذا لم تكن مهيأ)
git init

# إضافة جميع الملفات
git add .

# حفظ التغييرات
git commit -m "Initial commit - Ready for Netlify"

# إضافة المستودع البعيد (استبدل YOUR_USERNAME و REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# رفع الملفات
git branch -M main
git push -u origin main
```

**ملاحظة:** إذا طُلب منك اسم المستخدم وكلمة المرور:
- اسم المستخدم: اسمك على GitHub
- كلمة المرور: استخدم **Personal Access Token** (ليس كلمة المرور العادية)
  - أنشئه من: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

---

### 2️⃣ النشر على Netlify

#### أ. تسجيل الدخول:
1. اذهب إلى [netlify.com](https://netlify.com)
2. اضغط **"Sign up"** أو **"Log in"**
3. اختر **"Continue with GitHub"**
4. سجّل الدخول بحساب GitHub

#### ب. إنشاء موقع جديد:
1. اضغط **"Add new site"** → **"Import an existing project"**
2. اختر **"Deploy with GitHub"**
3. امنح Netlify صلاحية الوصول إلى GitHub (إذا طُلب)
4. اختر المستودع الذي أنشأته (`ce-ka-website`)

#### ج. إعدادات البناء:
Netlify سيكتشف الإعدادات تلقائياً من `netlify.toml`، لكن تأكد من:
- **Build command:** `npm run build` ✅
- **Publish directory:** `dist` ✅
- **Node version:** 18 ✅

#### د. إضافة Environment Variables:
**قبل الضغط على "Deploy site"**، اضغط على **"Show advanced"** → **"New variable"**

أضف هذه المتغيرات الثلاثة:

```
VITE_SUPABASE_URL
```
القيمة: رابط Supabase الخاص بك (مثال: `https://xxxxx.supabase.co`)

```
VITE_SUPABASE_ANON_KEY
```
القيمة: مفتاح Supabase Anon Key (من Supabase Dashboard → Settings → API)

```
VITE_WHATSAPP_NUMBER
```
القيمة: رقم WhatsApp (مثال: `905551234567`)

#### هـ. النشر:
1. اضغط **"Deploy site"**
2. انتظر 2-3 دقائق حتى يكتمل البناء
3. ✅ **تم!** موقعك الآن على الإنترنت!

---

### 3️⃣ الحصول على الرابط

بعد اكتمال النشر:
- **الرابط التلقائي:** `https://random-name-123.netlify.app`
- يمكنك تغييره من: **Site settings** → **Change site name**

---

### 4️⃣ ربط النطاق (Domain) - اختياري

إذا كان لديك نطاق (`cekabaza.com.tr`):

1. اذهب إلى: **Site settings** → **Domain management**
2. اضغط **"Add custom domain"**
3. أدخل النطاق: `cekabaza.com.tr`
4. اتبع التعليمات لإضافة DNS records:
   - **Type:** A
   - **Name:** @
   - **Value:** `75.2.60.5`
   
   أو:
   - **Type:** CNAME
   - **Name:** www
   - **Value:** `your-site-name.netlify.app`

---

## ✅ التحقق من النشر:

1. افتح الرابط الذي حصلت عليه من Netlify
2. تأكد من:
   - ✅ الصفحة الرئيسية تظهر
   - ✅ المنتجات تظهر (من Supabase)
   - ✅ السلة تعمل
   - ✅ WhatsApp يعمل

---

## 🔄 تحديث الموقع (بعد التعديلات):

```powershell
# في مجلد المشروع
git add .
git commit -m "Update website"
git push
```

Netlify سيقوم بنشر التحديثات تلقائياً خلال 1-2 دقيقة!

---

## ❌ حل المشاكل:

### المشكلة: البناء فشل
**الحل:**
- تحقق من Environment Variables (يجب أن تكون موجودة)
- تحقق من الأخطاء في **Deploy log** في Netlify

### المشكلة: الموقع لا يعرض المنتجات
**الحل:**
- تحقق من `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`
- تأكد من أن Supabase يعمل

### المشكلة: الصفحات لا تعمل (404)
**الحل:**
- تأكد من وجود `netlify.toml` مع redirects
- تحقق من أن `dist` هو مجلد النشر

---

## 📞 الدعم:

- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
- Netlify Community: [community.netlify.com](https://community.netlify.com)

---

**🎉 تهانينا! موقعك الآن على الإنترنت!**

