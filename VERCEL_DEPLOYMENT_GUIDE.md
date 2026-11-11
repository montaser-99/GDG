# دليل نشر مشروع GDG على Vercel

الدليل ده بيجهّز المشروع عشان الـ Frontend والـ Backend يشتغلوا كـ Vercel Projects منفصلين من نفس GitHub repository.

## التغييرات اللي اتعملت

- Vercel بيحوّل تطبيق Express المُصدّر من `server/app.js` إلى Function واحدة، والمسارات الحالية كلها بتفضل تحت `/api` وبنفس أسماء الـ endpoints. التشغيل المحلي لسه بيتم من `server/server.js`.
- مسارات قاعدة البيانات بتوصل بـ MongoDB قبل التنفيذ، باستخدام اتصال بيتم الاحتفاظ بيه وإعادة استخدامه بين الطلبات على نفس instance. `/api/health` بيفضل متاح من غير اتصال قاعدة البيانات.
- ضبط CORS على origins محددة من `CLIENT_URL` و`CLIENT_URLS`. في production مفيش سماح تلقائي لأي دومين. في التطوير المحلي مسموح `http://localhost:5173`.
- توحيد عنوان الـ API في `VITE_API_URL`، مع الاحتفاظ بالافتراضي المحلي `http://localhost:5000`.
- إضافة أمثلة للـ environment variables. مفيش أسرار حقيقية في ملفات الأمثلة.

## أسماء المجلدات وإعدادات Vercel

| المشروع | Root Directory | Framework Preset | Build Command | Output Directory |
|---|---|---|---|---|
| Backend | `server` | Express | سيبه فاضي / Auto | سيبه فاضي |
| Frontend | `client` | Vite | `npm run build` | `dist` |

لكل مشروع اختار نفس GitHub repository. سيب Install Command على الإعداد التلقائي؛ كل مجلد فيه `package-lock.json` مستقل. في الـ Backend اختار Framework Preset **Express**؛ Vercel بيستخدم default export الموجود في `server/app.js` كـ Node.js Function وبيمرر له كل Express routes. `app.listen()` موجود بس في `server/server.js` للتشغيل المحلي، ومش بيتنفّذ عند نشر `app.js`.

## 1. جهّز MongoDB وحساب الإدارة

1. استخدم MongoDB Atlas أو MongoDB متاح على الإنترنت؛ قاعدة MongoDB على جهازك المحلي مش هتكون متاحة لـ Vercel.
2. أنشئ Database User وخد connection string من Atlas. استبدل بيانات المستخدم واسم قاعدة البيانات في الرابط، وخلي كلمة المرور URL-encoded لو فيها رموز خاصة.
3. من إعدادات Network Access في Atlas اسمح باتصالات Vercel. لو حسابك مش موفّر Static IP Egress، هتحتاج تسمح بعناوين الخروج الديناميكية؛ خيار `0.0.0.0/0` بيوسّع الوصول، فاستخدم Database User بصلاحيات محدودة وكلمة مرور قوية.
4. التسجيل العام في التطبيق بيعمل حساب `member` فقط. عشان تنشئ أول `head_hr`، انسخ `server/.env.example` إلى `server/.env` محليًا، وحط فيه `MONGO_URI` بتاع قاعدة الإنتاج، و`SEED_ADMIN_EMAIL` و`SEED_ADMIN_PASSWORD`، وبعدها شغّل من مجلد `server`:

   ```sh
   npm ci
   npm run seed
   ```

   السكريبت بيعمل الحساب مرة واحدة وبيتخطى الإنشاء لو الإيميل موجود. ماتحطش بيانات seed على Frontend أو في أي متغير بيبدأ بـ `VITE_`. ملف `.env` مستبعد من Git.

## 2. انشر الـ Backend

1. من Vercel اختار **Add New → Project**، واستورد الـ repository.
2. اختار Root Directory: **`server`**.
3. اختار Framework Preset: **Express**. سيب Build Command وOutput Directory فاضيين/Auto. سيب Install Command تلقائي.
4. قبل أول Deploy، أضف Environment Variables:

   - `MONGO_URI`: رابط MongoDB Atlas.
   - `JWT_SECRET`: قيمة عشوائية طويلة وفريدة. ممكن تولّد قيمة محليًا بـ `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`، وماتستخدمش القيمة كمثال أو تشاركها.
   - `CLIENT_URL`: دومين الـ Frontend النهائي بالضبط، زي `https://your-project.vercel.app` من غير `/` في الآخر. لو لسه ماعرفتوش، انشر الـ Backend، وبعد نشر الـ Frontend ارجع حدّث المتغير واعمل Redeploy للـ Backend.
   - `CLIENT_URLS` (اختياري): origins إضافية مفصولة بفاصلة، زي دومين custom أو preview محدد. كل قيمة لازم تكون origin كامل زي `https://preview.example.com` من غير path. ماتستخدمش `*`.

   `NODE_ENV=production` بيتم ضبطه تلقائيًا على Vercel. ماتحتاجش تضيف `PORT` للـ Vercel؛ ده للتشغيل المحلي فقط.

5. اضغط Deploy. بعد النشر انسخ رابط الـ Backend. افحص `https://BACKEND-DOMAIN/api/health`؛ المفروض يرجع JSON بالشكل `{"status":"ok"}`. الـ API endpoints موجودة تحت `/api`، مثل `/api/auth/login`.

## 3. انشر الـ Frontend

1. اختار **Add New → Project** مرة تانية، واستورد نفس الـ repository.
2. اختار Root Directory: **`client`**، وFramework Preset: **Vite**.
3. استخدم Build Command: **`npm run build`** وOutput Directory: **`dist`**. خلي Install Command تلقائي.
4. أضف Environment Variable:

   - `VITE_API_URL`: رابط الـ Backend اللي نسخته، مثال `https://your-backend.vercel.app`. استخدم origin من غير `/api` أو slash أخيرة؛ التطبيق بيضيف `/api` تلقائيًا. ينفع كمان تحط URL بينتهي بـ `/api`.

5. اعمل Deploy. لو غيرت `VITE_API_URL` بعد كده، لازم تعمل Redeploy للـ Frontend عشان Vite بيضمّن القيمة وقت الـ build.

## 4. اربط الدومينين وفعّل تسجيل الدخول

بعد ما يظهر دومين الـ Frontend النهائي:

1. افتح إعدادات Backend Project في Vercel → **Settings → Environment Variables**.
2. خلي `CLIENT_URL` مطابق لدومين الموقع اللي المستخدمين هيفتحوه، مثال `https://your-frontend.vercel.app`.
3. لأي origin تاني عايز تسمحله (زي custom domain أو preview معين)، ضيفه في `CLIENT_URLS` كقائمة مفصولة بفواصل. ماتحطش `*`.
4. اعمل Redeploy للـ Backend بعد تغيير CORS variables.
5. اتأكد إن `VITE_API_URL` على Frontend بيوصل للـ Backend domain، واعمل Redeploy للـ Frontend لو احتجت تغيّره.

طلبات المتصفح بتبعت cookies باستخدام `credentials: include`. الـ Backend بيرجع CORS credentials وبيستخدم Cookie `HttpOnly`, `Secure`, `SameSite=None` في production. مفيش cookie domain ثابت، فالمتصفح بيخزنها على دومين الـ API. دومينات Vercel الافتراضية للـ Frontend والـ Backend تعتبر cross-site؛ `SameSite=None` بيسمح بمحاولة إرسالها، لكنه مايجبرش المتصفح يقبل third-party cookies. النتيجة إن تسجيل الدخول ممكن يشتغل في إعدادات/متصفحات تسمح بالـ third-party cookies، ومش مضمون يشتغل في متصفح أو وضع خصوصية بيحظرها. CORS لوحده مش بيغيّر سياسة cookies. عشان جلسة موثوقة، استخدم دومينات مملوكة ليك من نفس النطاق، مثل `app.example.com` و`api.example.com`، واضبط `CLIENT_URL` و`VITE_API_URL` عليها.

## متغيرات البيئة بالكامل

| المتغير | التطبيق | مطلوب؟ | الاستخدام ومصدر القيمة |
|---|---|---|---|
| `MONGO_URI` | Backend | أيوه | اتصال Mongoose بقاعدة MongoDB. خده من MongoDB Atlas أو مزود قاعدة البيانات. |
| `JWT_SECRET` | Backend | أيوه | توقيع والتحقق من JWT الموجود في cookie. ولّد قيمة عشوائية طويلة بنفسك. |
| `CLIENT_URL` | Backend | أيوه للمتصفح في production | الـ origin الأساسي المسموح له بـ CORS؛ هاته من رابط Frontend على Vercel أو custom domain. |
| `CLIENT_URLS` | Backend | اختياري | Origins إضافية دقيقة، مفصولة بفواصل، للـ domains الإضافية أو preview محدد. |
| `NODE_ENV` | Backend | لا | Vercel بيحدد `production` تلقائيًا. محليًا استخدم `development`. بيأثر على تفاصيل الأخطاء وإعدادات cookies. |
| `PORT` | Backend محلي | لا | منفذ `server.js` المحلي؛ الافتراضي `5000`. Vercel بيدير استقبال HTTP بنفسه. |
| `JWT_EXPIRES_IN` | Backend | لا | مدة صلاحية JWT بصيغة jsonwebtoken؛ الافتراضي `7d`. |
| `SEED_ADMIN_EMAIL` | Backend seed محليًا | وقت إنشاء أول مسؤول فقط | إيميل حساب `head_hr` الأول. اختار الإيميل بنفسك. مش مطلوب كـ Vercel runtime variable. |
| `SEED_ADMIN_PASSWORD` | Backend seed محليًا | وقت إنشاء أول مسؤول فقط | كلمة مرور الحساب الأول (6 أحرف على الأقل). اختارها بنفسك، وماتحطهاش في Git. |
| `SEED_ADMIN_NAME` | Backend seed محليًا | لا | الاسم الظاهر للحساب الأول؛ فيه اسم افتراضي لو مش موجود. |
| `VITE_API_URL` | Frontend | في Vercel أيوه | عنوان الـ Backend. محليًا الافتراضي `http://localhost:5000`؛ على Vercel حط رابط Backend Project. ده عنوان عام، وممنوع تحط فيه أي سر. |

ملفات `.env.example` فيها أسماء ومثال connection string فقط. مفيش في المشروع حاليًا OAuth providers أو Email service أو Payment integration أو Cloud storage أو رفع ملفات. مفيش متغيرات خاصة بالخدمات دي مطلوبة.

## 5. التحقق بعد النشر

1. افتح `https://BACKEND-DOMAIN/api/health` وتأكد من استجابة `status: ok`.
2. افتح الـ Frontend من دومين Vercel. جرّب تسجيل الدخول بحساب `head_hr` اللي أنشأته وشوف إن الواجهة بتستعيد الجلسة بعد refresh.
3. من أدوات المطور في المتصفح → Network، اتأكد إن طلبات الـ API رايحة لـ `BACKEND-DOMAIN/api/...` وإن استجابة login فيها `Set-Cookie`، وبعدها إن طلب `/api/auth/me` بيرجع المستخدم.
4. اختبر إنشاء/قراءة تقرير والـ Leaderboard بحساب عنده صلاحيات مناسبة. التسجيل العام وحده مش بيدي صلاحية تقارير.
5. اختبر دومين الإنتاج النهائي، مش Preview domain بس؛ دومين كل Preview لازم يتضاف صراحةً في `CLIENT_URLS` لو عايز تستخدمه.

## أخطاء شائعة

- **`MONGO_URI` غير موجود أو فشل الاتصال:** راجع Environment Variables في Backend Project، وصحة الرابط وصلاحيات Database User وNetwork Access في Atlas.
- **`JWT_SECRET` غير موجود:** ضيفه في Backend Project واعمل Redeploy.
- **خطأ CORS:** راجع إن `CLIENT_URL` مطابق للـ origin اللي ظاهر في شريط العنوان، بنفس `https://` ومن غير path أو slash إضافية. origins الإضافية مكانها `CLIENT_URLS`، وبعد أي تعديل اعمل Redeploy للـ Backend.
- **Frontend بيطلب `localhost` بعد النشر:** ضيف `VITE_API_URL` لرابط الـ Backend في إعدادات Frontend Project واعمل Redeploy؛ متغيرات Vite بتتحدد وقت الـ build.
- **Login بيرجع نجاح بس الجلسة ماتستمرش:** اتأكد إن الموقع والـ API على HTTPS، وإن CORS origin مطابق وcredentials مفعّلة. لو المتصفح حاظر third-party cookies بين دومينات Vercel، استخدم custom domains من نفس النطاق.
- **404 على endpoint أو التطبيق مش بيبدأ:** راجع Root Directory إنه `server`، وFramework Preset إنه **Express**، وإن `server/app.js` بيصدّر تطبيق Express كـ default export.
- **`/api/health` شغال لكن الحساب مش قادر يفتح التقارير:** تأكد من استخدام حساب `head_hr` أو `supervisor` مضبوط؛ التسجيل العام بيعمل `member` فقط.
- **التعديلات الأخيرة مش ظاهرة:** اعمل Redeploy للمشروع المناسب. تغييرات `VITE_API_URL` تتطلب build جديد للـ Frontend.

## قائمة تنفيذ سريعة

- [ ] إنشاء MongoDB Atlas database وDatabase User وضبط Network Access.
- [ ] إنشاء أول حساب `head_hr` بتشغيل `npm run seed` محليًا على قاعدة البيانات المقصودة.
- [ ] استيراد الـ repository للـ Backend على Vercel واختيار Root Directory `server`.
- [ ] إضافة `MONGO_URI`, `JWT_SECRET`, و`CLIENT_URL` للـ Backend وعمل Deploy.
- [ ] فحص `/api/health` ونسخ Backend URL.
- [ ] استيراد نفس الـ repository للـ Frontend واختيار Root Directory `client`.
- [ ] إضافة `VITE_API_URL` وعمل Deploy للـ Frontend.
- [ ] تحديث `CLIENT_URL` (و`CLIENT_URLS` لو لزم) بدومين Frontend النهائي، ثم Redeploy للـ Backend.
- [ ] تجربة تسجيل الدخول والـ API من دومين Frontend النهائي.
