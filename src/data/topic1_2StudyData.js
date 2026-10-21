export const TOPIC_1_2_AUDIO = [
  {
    "id": "t1_2_full",
    "title": "Tam Müəllim İzahı: Məkan, Miqyas, Plan, Azimut, Paletka və Horizontallar (8 Fəsil)",
    "src": "/audio/movzu_1_2_tam_izah.mp3",
    "desc": "6–11-ci sinif dərslikləri və Osman müəllimin Plan/Miqyas tezarusu üzrə bütün təriflər, düsturlar və məsələ həlli qaydaları"
  },
  {
    "id": "t1_2_icmal",
    "title": "Sürətli Düstur və Fakt İcmalı (Mövzu 1.2 Xülasəsi)",
    "src": "/audio/movzu_1_2_icmal.mp3",
    "desc": "İmtahan öncəsi sürətli təkrar: 4-lü/6-lı şəbəkə, miqyas, sahə, paletka, azimut, kəsmə yüksəklik və meyillik düsturları"
  }
];

export const TOPIC_1_2_CHAPTERS = [
  {
    "id": "ch_1_2_1",
    "code": "1.1",
    "frameworkGroup": "1. Məkan və Məkanın Miqyası",
    "title": "1.1. Məkan Anlayışı və Məkanın 3 Növü (Fiziki, Xəyali, Virtual Məkan)",
    "html": `<h2 class="section-title">1.1. Məkan Anlayışı və Məkanın 3 Növü (6-cı sinif, Qrif 2024-034)</h2>
  <p><strong>Məkan</strong> — coğrafiya elminin ən fundamental anlayışlarından biridir. Məkan təbii və sosial-iqtisadi obyektlərin yerləşdiyi yer və ya mühitdir («obyektlərin yeri», «obyektlərin yerləşdiyi mühit»). Çalışma otağımız, yaşadığımız bina, kənd, şəhər, ölkə, Yer kürəsi və Günəş sistemi müxtəlif ölçülü məkanlardır. Coğrafiya elmi obyektlərin sadəcə harada yerləşməsini deyil, nə üçün məhz orada yerləşdiyini və zaman keçdikcə necə dəyişdiyini tədqiq edir.</p>

  <div class="figure-single">
    <div class="figure-frame wide">
      <img src="/images/movzu_1_2_clean/mekan_3_nov.png" alt="Məkanın 3 növü: Fiziki, Xəyali və Virtual məkan">
    </div>
    <div class="figure-caption">
      <strong>Şəkil 1.1.</strong> 6-cı sinif dərsliyinə (səh. 12–13) əsasən məkanın 3 əsas növü: Fiziki məkan, Xəyali (mental) məkan və Virtual məkan.
    </div>
  </div>

  <h3 class="subsection-title">Məkanın 3 Əsas Növü və Xüsusiyyətləri</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 20%;">Məkanın Növü</th>
        <th style="width: 38%;">Elmi Tərifi və Mahiyyəti</th>
        <th style="width: 42%;">Tərkib Hissələri və Dərslik Nümunələri</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Fiziki məkan</strong></td>
        <td>Ətrafımızda olan obyekt və hadisələri əhatə edən maddi (real, toxuna və görə bildiyimiz) mühitdir. İki alt-qrupa bölünür: <strong>təbii məkan</strong> və <strong>sosial-iqtisadi məkan</strong>.</td>
        <td>
          • <strong>Təbii obyektlər:</strong> dağlar, düzənliklər, çaylar, göllər, səhra, okean, meşə.<br>
          • <strong>Sosial obyektlər:</strong> yaşayış binaları, parklar, istirahət zonaları, məktəb, xəstəxana.<br>
          • <strong>Sosial-iqtisadi obyektlər:</strong> zavodlar, fabriklər, müəssisələr, banklar, avtomobil yolu, körpü.
        </td>
      </tr>
      <tr>
        <td><strong>2. Xəyali (mental) məkan</strong></td>
        <td>Zehnimizdə, təsəvvürümüzdə yaratdığımız mücərrəd (abstrakt) məkandır. İnsanlar təbii və sosial-iqtisadi obyektləri xəyallarında şəkillə və ya sözlə canlandıra bilirlər.</td>
        <td>
          • Məktəbdən evə qədər olan yolun zehində canlandırılması (mental xəritə);<br>
          • İstirahət etmək istədiyimiz yerin sözlə təsviri;<br>
          • Oxuduğumuz bədii kitabda (nağıl, dastan, hekayə) hadisələrin cərəyan etdiyi məkan.
        </td>
      </tr>
      <tr>
        <td><strong>3. Virtual məkan</strong></td>
        <td>Fiziki olaraq içində olmadığımız, müasir rəqəmsal texnologiyalar, kompüter və internet vasitəsilə yaradılmış rəqəmsal məkandır.</td>
        <td>
          • Veb-səhifələrdə təqdim olunan elektron qlobus və xəritələr;<br>
          • Rəqəmsal naviqasiya sistemləri (Google Maps, Waze), CİS və VR (Virtual Reallıq) simulyasiyaları;<br>
          • Onlayn xidmətlər (e-ticarət, e-hökumət, e-dərslik) və internet oyunları.
        </td>
      </tr>
    </tbody>
  </table>

  <div class="editorial-note">
    <strong>Metodik Vəsait Qeydi (səh. 17–18):</strong>
    <ul>
      <li><strong>İç-içə yerləşən məkanlar:</strong> Ölçüsünə görə böyükdən kiçiyə doğru <em>Günəş sistemi &gt; Yer kürəsi &gt; Çalışma otağı</em> bir-birinin daxilində yerləşdiyi üçün insan eyni anda hər üç məkanda mövcud ola bilir. Lakin eyniölçülü iki müstəqil məkanda (məsələn, eyni anda həm çalışma otağında, həm də mətbəxdə) olmaq qeyri-mümkündür.</li>
      <li><strong>Ailənin Ağdama səyahət ardıcıllığı (Dərslik səh. 13, G şəkli):</strong> Səyahət planlaşdıran ailə gedəcəyi yeri əvvəlcə təsəvvüründə canlandırır (<strong>1. Xəyali məkan</strong>), sonra naviqasiya tətbiqi ilə marşrutu müəyyən edir (<strong>2. Virtual məkan</strong>), sonda isə Ağdama gedərək ərazi ilə əyani tanış olur (<strong>3. Fiziki məkan</strong>).</li>
      <li>Virtual məkandakı obyektlərin yerləşməsi real fiziki məkandakı obyektlərin yerləşməsinə tam uyğun gəlir — obyektlərin həqiqi mövqeyi dəyişmir, yalnız təsvir olunan mühit fərqlənir.</li>
    </ul>
  </div>`
  },
  {
    "id": "ch_1_2_2",
    "code": "1.2",
    "frameworkGroup": "1. Məkan və Məkanın Miqyası",
    "title": "1.2. Coğrafi Məkanın 5 Əsas Xüsusiyyəti (Ağdam və Bakı Nümunələri)",
    "html": `<h2 class="section-title">1.2. Coğrafi Məkanın 5 Əsas Xüsusiyyəti (6-cı sinif, səh. 10–17)</h2>
  <p>İnsanların məskunlaşması, təsərrüfat fəaliyyəti və şəhər planlaşdırılması coğrafi məkanda həyata keçirilir. 6-cı sinif dərsliyinə (səh. 14–15) və Metodik vəsaitə (səh. 18–20) əsasən coğrafi məkan <strong>5 fundamental xüsusiyyətə</strong> görə fərqləndirilir:</p>

  <div class="figure-single">
    <div class="figure-frame wide">
      <img src="/images/movzu_1_2_clean/mekan_5_xususiyyet.png" alt="Coğrafi məkanın 5 əsas xüsusiyyəti">
    </div>
    <div class="figure-caption">
      <strong>Şəkil 1.2.</strong> Coğrafi məkanın 5 xüsusiyyəti: komponentlərin müxtəlifliyi, qarşılıqlı əlaqəsi, məkanda dəyişiklik, yayılma və mövqe (6-cı sinif, səh. 14–15).
    </div>
  </div>

  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 22%;">Məkan Xüsusiyyəti</th>
        <th style="width: 38%;">Elmi İzahı</th>
        <th style="width: 40%;">Dərslik və Metodik Vəsait Nümunələri</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Məkanda komponentlərin müxtəlifliyi</strong></td>
        <td>Məkanda həm təbii proseslər, həm də insan fəaliyyəti nəticəsində yaranmış fərqli obyektlərin birgə mövcudluğudur.</td>
        <td>Azərbaycanda Qafqaz dağları, Kür-Araz ovalığı, Xəzər sahili, meşələr (təbii) ilə şəhərlər, kəndlər, kanallar, yollar (sosial-iqtisadi).</td>
      </tr>
      <tr>
        <td><strong>2. Məkanda komponentlərin qarşılıqlı əlaqəsi</strong></td>
        <td>Təbiət–təbiət və təbiət–insan komponentləri arasındakı səbəb-nəticə əlaqəsidir (müsbət və ya mənfi ola bilər).</td>
        <td>
          • <strong>Təbiət–təbiət:</strong> Kür çayı boyunca torpaqların nəmliyi tuğay meşələrinin yaranmasına səbəb olur.<br>
          • <strong>Müsbət (təbiət–insan):</strong> Lənkəranda bol yağıntı və sarı torpaqlar sitrus meyvəçiliyinin inkişafına şərait yaradır.<br>
          • <strong>Mənfi:</strong> Meşələrin qırılması torpağın münbitliyinin itməsinə, eroziyaya və səhralaşmaya səbəb olur.
        </td>
      </tr>
      <tr>
        <td><strong>3. Məkanda baş verən dəyişiklik</strong></td>
        <td>Zaman keçdikcə məkanın görünüşünün təbii proseslər (vulkan, zəlzələ, quraqlıq, buzlaq əriməsi) və ya insan fəaliyyəti ilə dəyişməsidir.</td>
        <td>Dubay şəhərinin 2005 və 2023-cü illərdəki görüntüsü; Bakı şəhərinin 1979 və 2023-cü il müqayisəsi; Nyu-Yorkun 1856 və 2019-cu il mənzərəsi; Ağdamın Baş Plan üzrə yenidən qurulması.</td>
      </tr>
      <tr>
        <td><strong>4. Məkanda komponentlərin yayılması</strong></td>
        <td>Təbii və sosial-iqtisadi obyektlərin məkanda <strong>üfüqi</strong> (düzənliklərdə, enliklər üzrə) və <strong>şaquli</strong> (dağ ətəyindən zirvəyə doğru) paylanmasıdır.</td>
        <td>Buzlaqların və meşələrin həm üfüqi (qütbətrafı düzənliklərdə — K nöqtəsi), həm də şaquli (yüksək dağ zirvələrində — L nöqtəsi) yayılması. Sosial-iqtisadi obyektlər isə əsasən üfüqi (düzən) ərazilərdə cəmlənir.</td>
      </tr>
      <tr>
        <td><strong>5. Məkanda komponentlərin mövqeyi</strong></td>
        <td>Hər bir obyektin və bütövlükdə məkanın Yer səthində müəyyən coğrafi ünvana (koordinata və qonşuluq mövqeyinə) malik olmasıdır.</td>
        <td>Azərbaycanın 38°–42° şm.e. və 44°–51° ş.u. arasında yerləşməsi; Bakının Abşeron yarımadasında, Xəzər sahilində mövqeyi.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="subsection-title">Dərslik Keys Faktları: Ağdam və Bakı (6-cı sinif, səh. 10–11, 16–17)</h3>
  <ul>
    <li><strong>Ağdam rayonu:</strong> İnzibati rayon kimi <strong>1930-cu ildə</strong> yaradılmışdır. Qarabağda dağətəyi və düzən ərazidə yerləşir. Qonşu inzibati vahidləri: <em>Bərdə, Ağcabədi, Xocavənd, Xankəndi, Kəlbəcər və Tərtər</em>. «Ağdam» sözü qədim türk dilində <strong>«kiçik qala»</strong> deməkdir.</li>
    <li><strong>Ağdamın tarixi və təbii abidələri:</strong> XVIII əsrə aid <strong>Pənahəli xanın imarəti</strong>, <strong>Şahbulaq qalası</strong> və <strong>Karvansara</strong>; XIX əsrdə memar <strong>Kərbəlayi Səfixan Qarabaği</strong> tərəfindən inşa edilmiş <strong>Ağdam Cümə məscidi</strong> (oxşar memarlıq üslublu məscidlər Şuşa, Bərdə və Füzulidə də tikilmişdir). Təbii məkan nümunəsi: Qarabağ düzündə, <strong>Xaçınçayın</strong> sahilində yerləşən <strong>«Sultanbud» saqqızağacı meşəsi</strong>.</li>
    <li><strong>Ağdamın Baş Planında zonalar (səh. 11):</strong> <strong>X</strong> — yaşayış zonası (yeni çoxmərtəbəli binalar), <strong>Y</strong> — tarixi mərkəz, <strong>Z</strong> — ümumi istirahət və yaşıllıq zonası. Məktəb binası meşəlik Z nöqtəsində deyil, yaşayış binalarına yaxın <strong>M nöqtəsində</strong> layihələndirilmişdir ki, təbii ərazi çirklənməsin və şagirdlərin təhlükəsizliyi təmin olunsun.</li>
    <li><strong>Bakı və Qobustan:</strong> Bakı XII əsrdə Şirvanşahlar, XVI əsrdə Səfəvilər dövlətinin, XVIII əsrdə Bakı xanlığının əsas şəhərlərindən biri olmuşdur. Qobustan qayalarında regionun <strong>15 minillik tarixi</strong> əks olunmuşdur.</li>
    <li><strong>Bakı memarlıq abidələrinin xronoloji ardıcıllığı (səh. 17):</strong>
      1) <strong>Qız qalası</strong> (XII əsr, İçərişəhər) &rarr;
      2) <strong>Şirvanşahlar Sarayı Kompleksi</strong> (XIII–XVI əsrlər) &rarr;
      3) <strong>Azərbaycan Milli Xalça Muzeyi</strong> (1967-ci il / XX əsr) &rarr;
      4) <strong>Heydər Əliyev Mərkəzi</strong> (2012-ci il) &rarr;
      5) <strong>Alov qüllələri</strong> (2013-cü il) və <strong>Aypara sarayı (Crescent Bay)</strong> (2020-ci il).
    </li>
  </ul>`
  },
  {
    "id": "ch_1_2_3",
    "code": "1.3",
    "frameworkGroup": "1. Məkan və Məkanın Miqyası",
    "title": "1.3. Məkanın Miqyası: Lokal, Regional və Qlobal Miqyas (6-cı sinif)",
    "html": `<h2 class="section-title">1.3. Məkanın Miqyası: Lokal, Regional və Qlobal Miqyas (6-cı sinif, səh. 18–26)</h2>
  <p>Coğrafiyada Yer kürəsini öyrənmək üçün <strong>iki fərqli miqyas anlayışından</strong> istifadə olunur: <strong>1) Məkanın miqyası</strong> və <strong>2) Xəritə və ya kartoqrafik təsvirin miqyası</strong>. <strong>Məkanın miqyası</strong> — hər hansı bir coğrafi hadisənin və ya prosesin baş verdiyi, yayıldığı və təsir etdiyi ərazinin ölçüsüdür.</p>

  <div class="figures-grid">
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/lokal_regional_qlobal.png" alt="Lokal, Regional və Qlobal məkan miqyası">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.3.</strong> Məkan miqyasının 3 səviyyəsi (Lokal, Regional, Qlobal) və müxtəlif miqyaslarda öyrənilən 7 amil (6-cı sinif, səh. 20–21).
      </div>
    </div>
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/serq_qerb_dehlizi.png" alt="Şərq-Qərb nəqliyyat dəhlizi və alternativ marşrutlar">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.4.</strong> Çindən Avropaya uzanan 3 nəqliyyat dəhlizinin məsafə və vaxt müqayisəsi (6-cı sinif, səh. 25).
      </div>
    </div>
  </div>

  <h3 class="subsection-title">Məkan Miqyasının 3 Səviyyəsi və Dərslik Nümunələri</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 18%;">Məkan Miqyası</th>
        <th style="width: 30%;">Əhatə Etdiyi Ərazi</th>
        <th style="width: 52%;">6-cı Sinif Dərsliyindəki Konkret Nümunələr (səh. 18–25)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Lokal miqyas</strong></td>
        <td>Yaşadığımız kiçikölçülü ərazi: həyətimiz, evimiz, məhəllə, kənd, şəhər. Ərazini ən ətraflı öyrənməyə imkan verir.</td>
        <td>
          • <strong>Lahor şəhəri (Pakistan):</strong> Əhalisi 13 milyondan çox olan, Pakistanın 2-ci böyük şəhəri; 2022-ci ildə dünyada ən çirkli havaya malik lokal məkan.<br>
          • <strong>Uhan şəhəri (Çin):</strong> COVID-19 virusunun ilk yarandığı lokal ocaq.<br>
          • <strong>Trabzon və Uzungöl (Türkiyə):</strong> 4000 illik tarixi olan Trabzon şəhəri və Çayqara rayonundakı Uzungöl.<br>
          • <strong>Şanxay şəhəri (Çin):</strong> Yantsızı çayının mənsəbində yerləşən, 28,4 milyon əhalisi (2022) olan şəhər.<br>
          • <strong>Bakı şəhəri:</strong> Sahəsi <strong>2,14 min km²</strong>, əhalisi <strong>2 mln 300 min nəfərdən çox</strong> (2023).
        </td>
      </tr>
      <tr>
        <td><strong>2. Regional miqyas</strong></td>
        <td>Yaşadığımız ərazidən daha böyük ərazi: bütöv ölkəmiz, qonşu ölkələr qrupu və ya böyük təbii vilayət.</td>
        <td>
          • <strong>Cənubi və Şərqi Asiya hava çirkliliyi:</strong> Banqladeş, Pakistan, Hindistan, Çin (Asiyada havası ən təmiz 3 ölkə isə: <strong>Yaponiya, Sinqapur, Filippin</strong>).<br>
          • <strong>Amazon həmişəyaşıl meşələri:</strong> Cənubi Amerikada <strong>8 ölkənin</strong> (<em>Braziliya, Boliviya, Peru, Ekvador, Kolumbiya, Venesuela, Qayana, Surinam</em>) ərazisini əhatə edir.<br>
          • <strong>Neft-qaz boru kəmərləri:</strong> Azərbaycan neft və qazını daşıyan <em>Bakı–Supsa</em>, <em>Bakı–Tbilisi–Ceyhan (BTC)</em> və <em>Bakı–Tbilisi–Ərzurum (BTƏ)</em> xətləri.
        </td>
      </tr>
      <tr>
        <td><strong>3. Qlobal miqyas</strong></td>
        <td>Bütün Yer kürəsini (dünyamızı) əhatə edən proses və hadisələr.</td>
        <td>
          • <strong>Qlobal istiləşmə:</strong> Ən çox Avropa və Asiyada (2–3°C artım), ən az Avstraliya və Cənubi Amerikada (1–2°C artım) müşahidə olunur.<br>
          • <strong>COVID-19 pandemiyası:</strong> Uhan (lokal) &rarr; Çin (regional) &rarr; Bütün dünya (qlobal).<br>
          • <strong>Dünya turizm abidələri (səh. 22):</strong> Misir ehramları (Misir), Kolizey amfiteatrı (İtaliya), Uzungöl və Ayasofya (Türkiyə), Tac-Mahal (Hindistan), Böyük Çin səddi (Çin).
        </td>
      </tr>
    </tbody>
  </table>

  <div class="editorial-note">
    <strong>Vacib İmtahan Faktı — Çindən (X) Avropaya (Y) 3 Nəqliyyat Marşrutunun Müqayisəsi (6-cı sinif, səh. 25):</strong>
    <ol>
      <li><strong>Qırmızı xətt (Azərbaycandan və Xəzər dənizindən keçən Orta Dəhliz / «Bir kəmər, bir yol»):</strong> Uzunluğu <strong>7 000 km</strong>, yükdaşıma müddəti <strong>10–15 gün</strong> (ən qısa və ən səmərəli marşrutdur!).</li>
      <li><strong>Bənövşəyi xətt (Şimal quru dəmir yolu marşrutu):</strong> Uzunluğu <strong>10 000 km</strong>, müddəti <strong>15–20 gün</strong>.</li>
      <li><strong>Sarı xətt (Cənub dəniz marşrutu — Hind okeanı və Süveyş kanalı ilə):</strong> Uzunluğu <strong>24 000 km</strong>, müddəti <strong>45–60 gün</strong>.</li>
    </ol>
    Həmçinin dərslik səh. 21-dəki sxemə əsasən müxtəlif məkan miqyaslarında hadisələrə <strong>7 amil</strong> üzrə baxılır: <em>1) sosial, 2) mədəni, 3) siyasi, 4) iqtisadi, 5) təbii, 6) ekoloji, 7) tarixi</em>.
  </div>`
  },
  {
    "id": "ch_1_2_4",
    "code": "1.4",
    "frameworkGroup": "1. Məkan və Məkanın Miqyası",
    "title": "1.4. Regionların Miqyasına (Sahəsinə) Görə 5 Pilləli Təsnifatı (8-ci sinif)",
    "html": `<h2 class="section-title">1.4. Regionların Miqyasına Görə 5 Pilləli İyerarxiyası (8-ci sinif 2-ci hissə, Qrif 2026-28, səh. 44–45)</h2>
  <p>Oxşar təbii, iqtisadi, siyasi və sosial xüsusiyyətlərə malik olan ərazi <strong>region</strong>, dünyanın müxtəlif regionlara ayrılması isə <strong>regionlaşma</strong> adlanır. Hər bir regionun <strong>3 ümumi xüsusiyyəti</strong> vardır: <strong>1) Sahə (miqyas)</strong>, <strong>2) Coğrafi mövqe</strong> (mütləq və nisbi) və <strong>3) Sərhədlər</strong> (təbii və ya siyasi/inzibati; dəqiq və ya şərti).</p>

  <div class="figure-single">
    <div class="figure-frame wide">
      <img src="/images/movzu_1_2_clean/regionlar_5_pille.png" alt="Regionların miqyasına görə 5 pilləli təsnifatı">
    </div>
    <div class="figure-caption">
      <strong>Şəkil 1.5.</strong> 8-ci sinif dərsliyinə (2-ci hissə, səh. 45) əsasən regionların miqyasına (sahəsinə) görə kiçikdən böyüyə 5 pilləli təsnifatı.
    </div>
  </div>

  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 12%;">Pillə</th>
        <th style="width: 23%;">Regionun Miqyas Növü</th>
        <th style="width: 32%;">Mahiyyəti və Əhatə Səviyyəsi</th>
        <th style="width: 33%;">8-ci Sinif Dərslik və MV Nümunələri</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>I (Ən kiçik)</strong></td>
        <td><strong>Lokal region</strong></td>
        <td>İnzibati rayonlar, şəhərlər və ya xüsusi ixtisaslaşmış kiçik ərazilər.</td>
        <td><strong>Ucar inzibati rayonu</strong>, Quba rayonu, ABŞ-də <strong>«Silikon dərəsi»</strong>.</td>
      </tr>
      <tr>
        <td><strong>II</strong></td>
        <td><strong>Mikroregion</strong></td>
        <td>Bir dövlətin daxilindəki iqtisadi-coğrafi və ya fiziki-coğrafi rayonlar.</td>
        <td><strong>Mərkəzi Aran iqtisadi rayonu</strong>, Quba-Xaçmaz iqtisadi rayonu, Dağlıq Şirvan.</td>
      </tr>
      <tr>
        <td><strong>III</strong></td>
        <td><strong>Mezoregion</strong></td>
        <td>Ayrı-ayrı müstəqil dövlətlər (ölkələr).</td>
        <td><strong>Azərbaycan Respublikası</strong>, Türkiyə, Fransa.</td>
      </tr>
      <tr>
        <td><strong>IV</strong></td>
        <td><strong>Makroregion</strong></td>
        <td>Qitələrin böyük tarixi-coğrafi hissələri və ya dövlətlərarası böyük birliklər.</td>
        <td><strong>Cənub-Qərbi Asiya</strong>, Cənubi Avropa, Şimali Afrika, Türk dünyası.</td>
      </tr>
      <tr>
        <td><strong>V (Ən böyük)</strong></td>
        <td><strong>Qlobal region</strong></td>
        <td>Bütöv materiklər, qitələr və ya qitələr qrupu.</td>
        <td><strong>Avrasiya materiki</strong>, Şimal qitələri, Cənub qitələri.</td>
      </tr>
    </tbody>
  </table>

  <div class="editorial-note">
    <strong>8-ci Sinif (1-ci hissə, səh. 8–9) — Tarixi Xəritələrin Məkan Miqyası:</strong>
    <ul>
      <li><strong>Babil gil lövhəsi («İmago Mundi», e.ə. VIII–VII əsrlər):</strong> Yalnız Fərat çayı, Babil, Assuriya və Urartunu əhatə etdiyi üçün <strong>məkanın regional miqyasına</strong> aiddir.</li>
      <li><strong>Eratosfenin xəritəsi (e.ə. III əsr) və H.Merkatorun dünya xəritəsi (1569):</strong> Bir neçə qitəni və dünya okeanını əks etdirdiyi üçün <strong>məkanın qlobal miqyasına</strong> aiddir.</li>
    </ul>
  </div>`
  },
  {
    "id": "ch_1_2_5",
    "code": "1.5",
    "frameworkGroup": "2. Coğrafi Mövqe və Koordinat Şəbəkəsi",
    "title": "1.5. Coğrafi Mövqeyin Təyini, 4-lü və 6-lı Şəbəkə Koordinatları (7-ci sinif)",
    "html": `<h2 class="section-title">1.5. Coğrafi Mövqeyin Təyini: Mütləq və Nisbi Mövqe, 4-lü və 6-lı Şəbəkə (7-ci sinif, Qrif 2025-021, səh. 7–24)</h2>
  <p><strong>Coğrafi mövqe</strong> — hər hansı bir coğrafi obyektin Yer kürəsində yerləşdiyi nöqtə və ya sahədir. Coğrafi mövqe iki yerə bölünür:</p>
  <ul>
    <li><strong>1. Mütləq mövqe:</strong> Obyektin coğrafi koordinat sistemindəki dəqiq ünvanıdır. Kiçikmiqyaslı xəritələrdə və qlobusda <strong>coğrafi enlik və coğrafi uzunluqla (dərəcə toru ilə)</strong>, böyükmiqyaslı topoqrafik xəritələrdə və planda <strong>4-lü və 6-lı koordinat şəbəkə sistemi ilə</strong>, müasir dövrdə isə <strong>Qlobal Mövqetəyinetmə Sistemi (QMS / GPS)</strong> ilə təyin olunur.</li>
    <li><strong>2. Nisbi mövqe:</strong> Obyektin digər coğrafi obyektlərə (dənizə, dağa, çaya, qonşu dövlətlərə, nəqliyyat dəhlizlərinə) nəzərən yerləşməsi və onlarla qarşılıqlı əlaqəsidir. <em>Fiziki-coğrafi mövqedən fərqli olaraq, iqtisadi-coğrafi mövqe (İCM) zaman keçdikcə sürətlə dəyişə bilir.</em></li>
  </ul>

  <div class="figures-grid">
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/sebeke_4lu_6li.png" alt="4-lü və 6-lı koordinat şəbəkə sistemi">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.6.</strong> Böyükmiqyaslı planda 4-lü (kvadrat üzrə) və 6-lı (onda-bir bölgü üzrə) koordinat şəbəkə sistemi (7-ci sinif, səh. 10).
      </div>
    </div>
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/azerbaycan_movqe_serhed.png" alt="Azərbaycanın coğrafi mövqeyi və sərhədləri">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.7.</strong> Azərbaycan Respublikasının mütləq və nisbi coğrafi mövqeyi, quru və su sərhədləri (7-ci sinif, səh. 12–13).
      </div>
    </div>
  </div>

  <h3 class="subsection-title">YENİ DƏRSLİK QAYDASI: 4-lü və 6-lı Koordinat Şəbəkəsinin Oxunma Alqoritmi (səh. 10)</h3>
  <p>Böyükmiqyaslı xəritələrdə və planda kiçik ərazilər təsvir edildiyi üçün meridian və paralellər çəkilmir. Əvəzində plan kilometr kvadratlarına bölünür:</p>
  <ol>
    <li><strong>4-lü koordinat şəbəkəsi (Obyektin yerləşdiyi kvadratı göstərir):</strong>
      <ul>
        <li><strong>Addım 1 (Üfüqi ox — Şərqə doğru):</strong> Kvadratın <strong>sol aşağı küncündən</strong> keçən şaquli xəttin (soldan sağa artan) ikirəqəmli nömrəsi götürülür (məsələn, <code>28</code>).</li>
        <li><strong>Addım 2 (Şaquli ox — Şimala doğru):</strong> Həmin kvadratın <strong>sol aşağı küncündən</strong> keçən üfüqi xəttin (aşağıdan yuxarıya artan) ikirəqəmli nömrəsi götürülür (məsələn, <code>51</code>).</li>
        <li><strong>Nəticə:</strong> İki ədəd ardıcıl yazılır &rarr; Məktəbin 4-lü koordinatı: <strong><code>2851</code></strong> (Yanacaqdoldurma: <code>3050</code>, Hava limanı: <code>3153</code>).</li>
      </ul>
    </li>
    <li><strong>6-lı koordinat şəbəkəsi (Kvadrat daxilində obyektin dəqiq nöqtəsini göstərir):</strong>
      <ul>
        <li>Hər kvadratın tərəfləri <code>10</code> bərabər hissəyə bölünür.</li>
        <li>Əvvəlcə üfüqi istiqamətdə (məsələn, <code>62</code> xəttindən sağa doğru <code>5</code>-ci bölgü &rarr; <code>625</code>), sonra şaquli istiqamətdə (məsələn, <code>33</code> xəttindən yuxarıya doğru <code>2</code>-ci bölgü &rarr; <code>332</code>) oxunur &rarr; Restoranın 6-lı koordinatı: <strong><code>625332</code></strong> (Muzey: <code>623338</code>, Kinoteatr: <code>628331</code>).</li>
      </ul>
    </li>
  </ol>

  <h3 class="subsection-title">7-ci Sinif Dərsliyinin Əsas Keys Faktları və Rəqəmləri (səh. 7–21)</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 24%;">Coğrafi Obyekt / Mövzu</th>
        <th style="width: 76%;">İmtahanda Soruşulan Dəqiq Faktlar və Rəqəmlər</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Azərbaycanın mövqeyi və sərhədləri</strong><br>(səh. 12–13)</td>
        <td>
          • <strong>Mütləq mövqeyi:</strong> <code>38°–42° şm.e.</code> və <code>44°–51° ş.u.</code> Sahəsi: <code>86,6 min km²</code> (Şm–C: <code>400 km</code>, Q–Ş: <code>500 km</code>).<br>
          • <strong>Quru sərhədləri (5 ölkə):</strong> 1) Ermənistan — <strong>1007 km</strong> (qərbdə, ən uzun), 2) İran — <strong>765 km</strong> (cənubda), 3) Gürcüstan — <strong>471 km</strong> (şimal-qərbdə), 4) Rusiya — <strong>391 km</strong> (şimalda), 5) Türkiyə — <strong>15 km</strong> (cənub-qərbdə, ən qısa).<br>
          • <strong>Su sərhədi:</strong> Şərqdə Xəzər dənizi sahili — <strong>825 km</strong>. Yalnız su sərhədimiz olan ölkələr: <strong>Qazaxıstan və Türkmənistan</strong> (Rusiya və İranla həm quru, həm də su sərhədi var).
        </td>
      </tr>
      <tr>
        <td><strong>Sinqapur və Rotterdam</strong><br>(səh. 7–9)</td>
        <td>
          • <strong>Rotterdam:</strong> Reyn və Maas çaylarının birləşib Şimal dənizinə töküldüyü yerdə yerləşən Avropanın ən böyük limanı.<br>
          • <strong>Sinqapur:</strong> <code>1° şm.e., 103° ş.u.</code>; sahəsi <code>728,6 km²</code>, əhalisi <code>6 mln+</code> (74,3% çinlilər, 13,5% malaylar, 9% hindlilər). Heç bir ölkə ilə quru sərhədi yoxdur: şimalda Malayziyadan <strong>Kohor boğazı</strong>, cənubda İndoneziyadan <strong>Sinqapur boğazı</strong> ilə ayrılır. <strong>Çanqi</strong> hava limanı qitələrarası qovşaqdır.<br>
          • <strong>Okeanlar üzrə dəniz yükdaşımalarının həcm ardıcıllığı:</strong> <em>1) Atlantik &gt; 2) Sakit &gt; 3) Hind &gt; 4) Şimal Buzlu (Arktik) okeanı</em>.
        </td>
      </tr>
      <tr>
        <td><strong>Çiapas və Böyük Çin Səddi</strong><br>(səh. 11, 14)</td>
        <td>
          • <strong>Böyük Çin səddi:</strong> Çinin şimal sərhədi boyu <code>13 000 mildən (21,2 min km)</code> çox uzanır.<br>
          • <strong>Çiapas əyaləti:</strong> Meksikanın cənub-şərqində, Sakit okean sahilində, Qvatemala sərhədində (<code>14°–17° şm.e., 91°–95° q.u.</code>) yerləşir. Meseta yaylası (<code>1500–2500 m</code>) və <strong>Takana vulkanı (<code>4060 m</code>)</strong> buradadır; 63 növ k/t məhsulunun 90%-dən çoxunu ABŞ-yə ixrac edir.
        </td>
      </tr>
      <tr>
        <td><strong>Beynəlxalq neftdaşıma su obyektləri</strong><br>(səh. 20, mln barel/gün)</td>
        <td>
          Gündəlik neft daşınması həcminə görə ardıcıllıq: <strong>1) Hörmüz boğazı (<code>18</code>)</strong> &gt; <strong>2) Malakka boğazı (<code>16</code>)</strong> &gt; <strong>3) Boru kəmərləri (<code>15,5</code>)</strong> &gt; <strong>4) Süveyş kanalı (<code>13,6</code>)</strong> &gt; <strong>5) Bab-əl-Məndəb boğazı (<code>3,2</code>)</strong> &gt; <strong>6) Bosfor boğazı (<code>2,9</code>)</strong> &gt; <strong>7) Panama kanalı (<code>0,8</code>)</strong>.
        </td>
      </tr>
      <tr>
        <td><strong>QMS (GPS) və CİS-in 5 elementi</strong><br>(səh. 11, 18–19)</td>
        <td>
          • <strong>QMS (GPS):</strong> 1) Süni peyklər, 2) Yerüstü izləmə stansiyaları, 3) Qəbuledicilər (<strong>minimum 4 peykdən</strong> siqnal qəbul edir).<br>
          • <strong>CİS-in 5 əsas elementi:</strong> 1) Kompüter avadanlığı (Hardware), 2) Proqram təminatı (ArcGIS, QGIS, Mapbox), 3) Mütəxəssislər, 4) Coğrafi datalar (baza və xüsusi məlumatlar), 5) Metodlar.
        </td>
      </tr>
    </tbody>
  </table>

  <div class="figure-single">
    <div class="figure-frame wide">
      <img src="/images/movzu_1_2_clean/bogazlar_neft_dasima.png" alt="Beynəlxalq su obyektləri üzrə yanacaq daşınması">
    </div>
    <div class="figure-caption">
      <strong>Şəkil 1.8.</strong> Beynəlxalq əhəmiyyətli su obyektləri (Hörmüz, Malakka, Süveyş, Bab-əl-Məndəb, Bosfor, Panama) vasitəsilə gündəlik yanacaq daşınması həcmi (7-ci sinif, səh. 20).
    </div>
  </div>`
  },
  {
    "id": "ch_1_2_6",
    "code": "1.6",
    "frameworkGroup": "3. Plan, Şərti İşarələr, Üfüqün Cəhətləri və Azimut",
    "title": "1.6. Məhəllin Planı, Şərti İşarələr, Üfüqün Cəhətləri və Azimut",
    "html": `<h2 class="section-title">1.6. Məhəllin Planı, Şərti İşarələr, Üfüqün Cəhətləri və Azimut</h2>
  <p><strong>Məhəllin planı</strong> — Yer səthinin kiçik bir hissəsinin yuxarıdan («quşbaxışı») müstəvi üzərində miqyasla kiçildilmiş və şərti işarələrlə sadələşdirilmiş dəqiq təsviridir. 6-cı sinif dərsliyinə (səh. 30) əsasən planın tərtib edilməsi üçün <strong>4 vacib şərt (element)</strong> tələb olunur: <strong>1) Başlıq</strong>, <strong>2) Şərti işarələr</strong>, <strong>3) Miqyas</strong>, <strong>4) İstiqamət (Şimal–Cənub oxu)</strong>.</p>

  <div class="figures-grid">
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/serti_isareler_3_qrup.png" alt="Şərti işarələrin 3 qrupu">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.9.</strong> Planda istifadə olunan şərti işarələrin 3 qrupu: konturlu, xətti və miqyassız şərti işarələr (6-cı sinif, səh. 31).
      </div>
    </div>
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/ufugun_cehetleri.png" alt="Üfüqün cəhətləri və istiqamətlərin təyini">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.10.</strong> Üfüqün əsas və aralıq cəhətləri, kompas və Qütb ulduzuna görə istiqamətlərin təyini (6-cı sinif, səh. 34–35).
      </div>
    </div>
  </div>

  <h3 class="subsection-title">1. Planda Şərti İşarələrin 3 Qrupu və Planaalma Üsulları</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 22%;">Şərti İşarə Qrupu</th>
        <th style="width: 40%;">Xüsusiyyəti və Ölçmə İmkanı</th>
        <th style="width: 38%;">Konkret Obyekt Nümunələri</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Konturlu (sahəvi) şərti işarələr</strong></td>
        <td>Böyük sahə tutan obyektləri əks etdirir. Sərhədləri nöqtə və ya qırıq xətlərlə verilir; <strong>miqyas və paletka vasitəsilə həqiqi sahəsini hesablamaq mümkündür</strong>.</td>
        <td>Meşə (enliyarpaqlı, iynəyarpaqlı, qarışıq), meyvə bağı, üzüm bağı, çəmənlik, bataqlıq, göl, qumluq, şoranlıq, yaşayış məntəqəsi, stadion, park.</td>
      </tr>
      <tr>
        <td><strong>2. Xətti şərti işarələr</strong></td>
        <td>Zolaq şəklində uzanan obyektləri göstərir. Uzunluğu miqyasa uyğun gəlir (<strong>uzunluğunu pərgar və ya kurvimetrlə ölçmək olar</strong>), lakin eni miqyasdan böyük çəkilir.</td>
        <td>Çay, kanal, şose yolu, dəmir yolu, cığır, rabitə və elektrik xətti, neft-qaz boru kəməri, dövlət sərhədi, yarğan.</td>
      </tr>
      <tr>
        <td><strong>3. Miqyassız (nöqtəvi) şərti işarələr</strong></td>
        <td>Sahəsi kiçik olan, lakin məhəldə ориентиr kimi mühüm rol oynayan obyektlərdir. <strong>Yalnız obyektin yerini (mövqeyini) göstərir</strong>, ölçüsünü və sahəsini tapmaq olmur.</td>
        <td>Tək ağac, bulaq, su quyusu, yel dəyirmanı, zavod/müəssisə, məktəb, abidə, körpü, tunel, yanacaqdoldurma məntəqəsi, metro stansiyası.</td>
      </tr>
    </tbody>
  </table>
  <p><strong>Planaalma üsulları:</strong> 1) <em>Havadan planaalma</em> (təyyarə, PUA/dron, peyk) və 2) <em>Yerdən planaalma</em>. Yerdən planaalma dəqiqliyinə görə <strong>gözəyarı</strong> (planşet, kompas, vizir xətkeşi) və <strong>dəqiq (alətlərlə)</strong> (teodolit, nivelir, ruletka, bussol) olur. Yerdən gözəyarı planaalma iki üsulla aparılır: <strong>a) Qütb üsulu</strong> (bir mərkəzi nöqtədən açıq ərazinin plana alınması) və <strong>b) Marşrut üsulu</strong> (yol və ya çay boyunca hərəkət edərək bir neçə nöqtədən planaalma).</p>

  <h3 class="subsection-title">2. Üfüqün Cəhətləri, Azimut (0°–360°) və Əks-Azimut (±180°)</h3>
  <p><strong>Azimut</strong> — müşahidəçinin dayandığı nöqtədən <strong>şimal istiqaməti</strong> ilə verilmiş obyektə doğru çəkilmiş xətt arasında qalan və <strong>saat əqrəbinin hərəkəti istiqamətində</strong> ölçülən bucaqdır (<code>0°</code>-dən <code>360°</code>-yə qədər dəyişir).</p>

  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 25%;">Üfüqün Cəhəti</th>
        <th style="width: 18%;">Düz Azimut ($A$)</th>
        <th style="width: 25%;">Əks İstiqamət</th>
        <th style="width: 32%;">Əks-Azimut ($A_{\text{əks}} = A \pm 180^\circ$)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Şimal (Şm)</strong></td>
        <td><code>0°</code> və ya <code>360°</code></td>
        <td>Cənub (C)</td>
        <td><code>180°</code></td>
      </tr>
      <tr>
        <td><strong>Şimal-Şərq (Şm-Ş)</strong></td>
        <td><code>45°</code></td>
        <td>Cənub-Qərb (C-Q)</td>
        <td><code>45° + 180° = 225°</code></td>
      </tr>
      <tr>
        <td><strong>Şərq (Ş)</strong></td>
        <td><code>90°</code></td>
        <td>Qərb (Q)</td>
        <td><code>90° + 180° = 270°</code></td>
      </tr>
      <tr>
        <td><strong>Cənub-Şərq (C-Ş)</strong></td>
        <td><code>135°</code></td>
        <td>Şimal-Qərb (Şm-Q)</td>
        <td><code>135° + 180° = 315°</code></td>
      </tr>
      <tr>
        <td><strong>Cənub (C)</strong></td>
        <td><code>180°</code></td>
        <td>Şimal (Şm)</td>
        <td><code>180° - 180° = 0° (360°)</code></td>
      </tr>
      <tr>
        <td><strong>Cənub-Qərb (C-Q)</strong></td>
        <td><code>225°</code></td>
        <td>Şimal-Şərq (Şm-Ş)</td>
        <td><code>225° - 180° = 45°</code></td>
      </tr>
      <tr>
        <td><strong>Qərb (Q)</strong></td>
        <td><code>270°</code></td>
        <td>Şərq (Ş)</td>
        <td><code>270° - 180° = 90°</code></td>
      </tr>
      <tr>
        <td><strong>Şimal-Qərb (Şm-Q)</strong></td>
        <td><code>315°</code></td>
        <td>Cənub-Şərq (C-Ş)</td>
        <td><code>315° - 180° = 135°</code></td>
      </tr>
    </tbody>
  </table>

  <div class="editorial-note">
    <strong>Osman Müəllimin «Plan Tezarus»undan Vacib Qaydalar:</strong>
    <ul>
      <li><strong>Əks-azimut düsturu:</strong> Getdiyiniz yolla geri qayıtmaq üçün azimut <code>180°</code>-dən kiçikdirsə üzərinə <code>180°</code> gəlinir ($A + 180^\circ$), <code>180°</code>-dən böyükdürsə <code>180°</code> çıxılır ($A - 180^\circ$).</li>
      <li><strong>Yerli əlamətlərə görə cəhətlərin təyini:</strong> Mamır və şibyələr ağac gövdələrinin və qayaların <strong>şimal</strong> tərəfində bitir; ağacların çətiri (budaqları) <strong>cənub</strong> tərəfdə daha sıx və uzun olur; qar yazda dağların və təpələrin <strong>cənub</strong> yamacında daha tez əriyir; günorta vaxtı (saat 12:00-da) Şimal yarımkürəsində cisimlərin ən qısa kölgəsi <strong>şimala</strong> düşür; <strong>Qütb ulduzu</strong> həmişə <strong>şimalı (0°/360°)</strong> göstərir və onun üfüqdən görünmə bucağı müşahidəçinin yerləşdiyi <strong>coğrafi enliyə</strong> bərabərdir (Cənub yarımkürəsində Qütb ulduzu görünmür!).</li>
      <li><strong>9-cu sinif (§2) Fərqi:</strong> Yaşıl rəng fiziki xəritədə <strong>ovalıqları (0–200 m)</strong>, topoqrafik xəritədə və planda isə <strong>bitki örtüyünü (meşə, bağ, kolluq)</strong> göstərir!</li>
    </ul>
  </div>`
  },
  {
    "id": "ch_1_2_7",
    "code": "1.7",
    "frameworkGroup": "4. Kartoqrafik Miqyas, Sahə və Paletka",
    "title": "1.7. Kartoqrafik Miqyas, Məsafə və Sahə Hesablamaları, Paletka Üsulu",
    "html": `<h2 class="section-title">1.7. Kartoqrafik Miqyas, Məsafə və Sahə Hesablamaları, Paletka Üsulu</h2>
  <p><strong>Miqyas</strong> — Yer səthi üzərindəki həqiqi məsafənin planda, xəritədə və ya qlobusda neçə dəfə kiçildildiyini göstərən kəsr ədədidir. Yazılışına görə miqyasın <strong>3 forması</strong> vardır:</p>

  <div class="figure-single">
    <div class="figure-frame wide">
      <img src="/images/movzu_1_2_clean/miqyas_3_forma.png" alt="Ədədi, İzahlı və Xətti miqyas">
    </div>
    <div class="figure-caption">
      <strong>Şəkil 1.11.</strong> Miqyasın 3 yazılış forması: ədədi, izahlı və xətti miqyas (6-cı sinif, səh. 32–33).
    </div>
  </div>

  <ol>
    <li><strong>Ədədi miqyas:</strong> Surəti <code>1</code>, məxrəci kiçiltmə dərəcəsini göstərən kəsrdir (məsələn, <code>1 : 250 000</code>).</li>
    <li><strong>İzahlı (adlı) miqyas:</strong> Planda və ya xəritədə <code>1 sm</code> məsafəyə həqiqətdə neçə metr və ya kilometr uyğun gəldiyini göstərir.
      <ul>
        <li><strong>Sıfırların silinməsi qaydası:</strong> Ədədi miqyasın məxrəcindən <strong>2 sıfır sildikdə metr</strong>, <strong>5 sıfır sildikdə isə kilometr</strong> alınır (məsələn, <code>1 : 250 000</code> &rarr; <code>1 sm-də 2500 m</code> və ya <code>1 sm-də 2,5 km</code>). Buradakı <code>2,5 km</code> ədədi <strong>miqyasın kəmiyyəti ($k$)</strong> adlanır.</li>
      </ul>
    </li>
    <li><strong>Xətti miqyas:</strong> Bərabər bölgülərə ayrılmış qrafik şkaladır. Pərgar-ölçən vasitəsilə <strong>heç bir riyazi hesablama aparmadan</strong> birbaşa həqiqi məsafəni təyin etməyə imkan verir (<code>0</code>-dan soldakı kiçik bölgülər xırda məsafələri dəqiq ölçmək üçündür).</li>
  </ol>

  <h3 class="subsection-title">Miqyasına Görə Xəritələrin və Qlobusların Təsnifatı (6-cı və 10-cu siniflər)</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 24%;">Kartoqrafik Təsvir Qrupu</th>
        <th style="width: 28%;">Miqyas İntervalı</th>
        <th style="width: 48%;">Əsas Xüsusiyyətləri (Generalizasiya və Təhrif)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Məhəllin planı</strong></td>
        <td><code>1 : 10 000</code>-dən böyük<br>(məs: <code>1:500</code>, <code>1:2000</code>, <code>1:5000</code>)</td>
        <td>Ən kiçik əraziləri ən böyük dəqiqliklə əks etdirir; Yer kürəviliyi nəzərə alınmır, dərəcə toru yoxdur.</td>
      </tr>
      <tr>
        <td><strong>1. Böyükmiqyaslı (topoqrafik) xəritələr</strong></td>
        <td><code>1 : 10 000</code> — <code>1 : 200 000</code><br>(daxil olmaqla)</td>
        <td>Kiçik əraziləri (inzibati rayon, şəhər) əks etdirir; <strong>miqyasın kəmiyyəti kiçik, təsvir dəqiq, generalizasiya və təhrif ən azdır</strong>.</td>
      </tr>
      <tr>
        <td><strong>2. Ortamiqyaslı (icmal-topoqrafik) xəritələr</strong></td>
        <td><code>1 : 200 000</code> — <code>1 : 1 000 000</code><br>(daxil olmaqla)</td>
        <td>Nisbətən geniş əraziləri (məsələn, Azərbaycanın <code>1:600 000</code> və ya <code>1:850 000</code> divar xəritələri) əks etdirir.</td>
      </tr>
      <tr>
        <td><strong>3. Kiçikmiqyaslı (icmal) xəritələr</strong></td>
        <td><code>1 : 1 000 000</code>-dan kiçik<br>(məs: <code>1:22 000 000</code>)</td>
        <td>Böyük dövlətləri, materikləri və dünyanı təsvir edir; <strong>miqyasın kəmiyyəti böyük, generalizasiya və təhrif çoxdur</strong>.</td>
      </tr>
      <tr>
        <td><strong>Tədris Qlobusları</strong><br>(10-cu sinif, səh. 27)</td>
        <td>• Böyük: <code>1 : 30 000 000</code><br>• Orta: <code>1 : 50 000 000</code><br>• Kiçik: <code>1 : 83 000 000</code></td>
        <td>Qlobusda bütün istiqamətlərdə miqyas dəyişməzdir (xüsusi miqyas baş miqyasa bərabərdir) və kartoqrafik təhrif yoxdur.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="subsection-title">Bütün Miqyas, Sahə, Paletka və Təhrif Düsturları Cədvəli</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 26%;">Hesablama Növü</th>
        <th style="width: 34%;">Riyazi Düstur</th>
        <th style="width: 40%;">Nümunə Məsələ və Həlli (Osman Müəllim və Güvən Bazası)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Məsafə miqyası</strong></td>
        <td>$L_{\text{həqiqi}} = l_{\text{xəritə}} \times k$<br>$k = \dfrac{L_{\text{həqiqi}}}{l_{\text{xəritə}}}$</td>
        <td>Miqyası <code>1:400 000</code> (<code>k = 4 km</code>) olan xəritədə <code>8 sm</code> məsafə həqiqətdə: $L = 8 \times 4 = 32\text{ km}$.</td>
      </tr>
      <tr>
        <td><strong>2. İki xəritədə məsafə mütənasibliyi</strong></td>
        <td>$\dfrac{l_1}{l_2} = \dfrac{k_2}{k_1}$<br><em>(Xəritə məsafəsi miqyasın kəmiyyəti ilə tərs mütənasibdir!)</em></td>
        <td><code>1:200 000</code> (<code>k₁ = 2 km</code>) miqyaslı xəritədə <code>12 sm</code> olan çay <code>1:600 000</code> (<code>k₂ = 6 km</code>) miqyaslı xəritədə: $l_2 = \dfrac{12 \times 2}{6} = 4\text{ sm}$ olar.</td>
      </tr>
      <tr>
        <td><strong>3. Sahə miqyası</strong></td>
        <td>$S_{\text{həqiqi}} = S_{\text{xəritə}} \times k^2$<br>$k = \sqrt{\dfrac{S_{\text{həqiqi}}}{S_{\text{xəritə}}}}$</td>
        <td>Həqiqi sahəsi <code>448 km²</code> olan göl xəritədə <code>7 sm²</code> yer tutursa: $k = \sqrt{448 / 7} = \sqrt{64} = 8\text{ km}$ &rarr; Miqyas: <strong><code>1 : 800 000</code></strong>.</td>
      </tr>
      <tr>
        <td><strong>4. İki xəritədə sahə mütənasibliyi</strong></td>
        <td>$\dfrac{S_1}{S_2} = \left(\dfrac{k_2}{k_1}\right)^2$<br><em>(Miqyas $n$ dəfə böyüdükdə sahə $n^2$ dəfə böyüyür!)</em></td>
        <td>I xəritədə <code>9 sm²</code> olan sahə II xəritədə <code>81 sm²</code> olmuşsa, sahə $81 / 9 = 9$ dəfə böyümüşdür &rarr; deməli, <strong>miqyas $\sqrt{9} = 3$ dəfə böyümüşdür</strong> (miqyasın kəmiyyəti 3 dəfə kiçilmişdir).</td>
      </tr>
      <tr>
        <td><strong>5. Paletka ilə sahənin hesablanması</strong></td>
        <td>$N_{\text{dama}} = a + \dfrac{b}{2}$<br>Standart paletkada <code>1 dama = 0,25 sm²</code> (yəni <code>4 dama = 1 sm²</code>):<br>$S_{\text{xəritə}} = \dfrac{a + b/2}{4}\text{ sm}^2$</td>
        <td><strong>Osman müəllim məsələsi:</strong> Paletkada <code>24 tam (a)</code> və <code>8 yarımçıq (b)</code> dama var, həqiqi sahə <code>4732 km²</code>-dir. Miqyası tapın:<br>$N = 24 + 8/2 = 28\text{ dama}$ &rarr; $S_{\text{xər}} = 28 : 4 = 7\text{ sm}^2$ &rarr; $k = \sqrt{4732 / 7} = \sqrt{676} = 26\text{ km}$ &rarr; <strong><code>1 : 2 600 000</code></strong>.</td>
      </tr>
      <tr>
        <td><strong>6. Baş miqyas, Xüsusi miqyas və Təhrif</strong><br>(10–11-ci siniflər)</td>
        <td>$k_{\text{xüsusi}} = \dfrac{L_{\text{dərəcə}}}{l_{\text{xəritə}}}$<br>$\Delta L = |L_{\text{dərəcə}} - L_{\text{baş miqyas}}|$</td>
        <td><code>1:20 000 000</code> (<code>k = 200 km</code>) miqyaslı xəritədə eyni meridianda <code>20° şm.e.</code> və <code>20° c.e.</code> arasında məsafə <code>20 sm</code>-dir: $L_{\text{dər}} = 40 \times 111,1 = 4444\text{ km}$; $L_{\text{miq}} = 20 \times 200 = 4000\text{ km}$ &rarr; Təhrif: $4444 - 4000 = 444\text{ km}$.</td>
      </tr>
    </tbody>
  </table>`
  },
  {
    "id": "ch_1_2_8",
    "code": "1.8",
    "frameworkGroup": "5. Nisbi və Mütləq Hündürlük, Horizontallar və Meyillik",
    "title": "1.8. Nisbi və Mütləq Hündürlük, Horizontallar, Berqştrix və Meyillik",
    "html": `<h2 class="section-title">1.8. Nisbi və Mütləq Hündürlük, Horizontallar (İzohipslər), Berqştrix və Meyillik</h2>
  <p>Yer səthindəki nöqtələrin şaquli hündürlüyü iki üsulla ifadə olunur:</p>
  <ul>
    <li><strong>Mütləq hündürlük ($H$):</strong> Nöqtənin <strong>okean və ya dəniz səviyyəsindən (0 metr — Baltik dənizi səviyyəsindən)</strong> şaquli xətt üzrə hündürlüyüdür. <strong>Barometr (aneroid)</strong> və ya QMS/GPS ilə ölçülür. Plan və xəritələrdə yazılan bütün rəqəmlər mütləq hündürlüyü göstərir.</li>
    <li><strong>Nisbi hündürlük ($h$):</strong> Yer səthindəki bir nöqtənin digər nöqtədən şaquli xətt üzrə hündürlük fərqidir ($h = H_{\text{zirvə}} - H_{\text{ətək}}$). <strong>Nivelir</strong> cihazı ilə ölçülür.</li>
    <li><strong>Horizontallar (izohipslər):</strong> Plan və xəritələrdə <strong>mütləq hündürlükləri eyni olan nöqtələri birləşdirən qəhvəyi rəngli əyri xətlərdir</strong>. İki qonşu horizontal arasındakı şaquli hündürlük fərqinə <strong>kəsmə yüksəklik</strong> deyilir.</li>
  </ul>

  <div class="figures-grid">
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/topoqrafik_horizontallar.png" alt="Topoqrafik xəritədə horizontallar, təpə və çökəklik">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.12.</strong> Topoqrafik xəritədə horizontalların oxunması, təpə və çökəkliyin fərqləndirilməsi (9-cu sinif, səh. 11–12).
      </div>
    </div>
    <div class="figure-item">
      <div class="figure-frame medium">
        <img src="/images/movzu_1_2_clean/azimut_marsrut_plan.png" alt="Məktəblilərin yolu — topoqrafik marşrut">
      </div>
      <div class="figure-caption">
        <strong>Şəkil 1.13.</strong> Topoqrafik planda azimut, məsafə və mütləq hündürlüyün birgə təhlili (9-cu sinif, səh. 13).
      </div>
    </div>
  </div>

  <h3 class="subsection-title">Horizontallar, Daxili/Xarici Horizontal və Meyillik Qaydaları (Osman Müəllim və Güvən Düsturları)</h3>
  <table class="booktabs">
    <thead>
      <tr>
        <th style="width: 26%;">Qayda və ya Məsələ Növü</th>
        <th style="width: 74%;">Dəqiq Həll Alqoritmi və İmtahan İpucları</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Berqştrixin istiqaməti (Dağ/Təpə vs Çökəklik)</strong></td>
        <td>
          <strong>Berqştrix</strong> — horizontala perpendikulyar çəkilmiş qısa xətt olub suyun axın (yamacın alçalma) istiqamətini göstərir:<br>
          • Berqştrix <strong>çölə (kənara)</strong> baxırsa &rarr; <strong>Müsbət relyef formasıdır (dağ, təpə)</strong>; mərkəzə doğru hündürlük artır.<br>
          • Berqştrix <strong>içəriyə (mərkəzə)</strong> baxırsa &rarr; <strong>Mənfi relyef formasıdır (çökəklik, krater, göl çuxuru)</strong>; mərkəzə doğru hündürlük azalır.<br>
          • <strong>Çay kəsişməsi qaydası:</strong> Çay keçən horizontal sxemlərdə berqştrix olmasa belə, <strong>həmişə dağ (yamac/dərə)</strong> kimi hesablanır və çay daxili horizontaldan xarici horizontala doğru (yüksəkdən alçağa) axır!
        </td>
      </tr>
      <tr>
        <td><strong>2. Yamacın dikliyi və görünmə şərti</strong></td>
        <td>
          • Horizontallar <strong>sıx (bir-birinə yaxın)</strong> çəkilibsə &rarr; yamac <strong>dikdir</strong> (çay sürətlə axır, eroziya güclüdür).<br>
          • Horizontallar <strong>seyrək (aralı)</strong> çəkilibsə &rarr; yamac <strong>azmeyillidir / mailidir</strong>.<br>
          • Dağın müxtəlif yamaclarında yerləşən iki müşahidəçi bir-birini <strong>görə bilməz</strong> (zirvə mane olur).
        </td>
      </tr>
      <tr>
        <td><strong>3. Zirvəyə və ya Dibi Nöqtəsinə görə Daxili Horizontalın Tapılması</strong></td>
        <td>
          <strong>Qızıl Qayda:</strong> Bütün horizontalların qiyməti <strong>kəsmə yüksəkliyə ($\Delta h$) qalıqsız (tam) bölünməlidir!</strong><br>
          • <strong>Təpədə (dağda):</strong> Ən daxili horizontal zirvə hündürlüyündən ($H_{\text{zirvə}}$) <strong>kiçik olan və kəsmə yüksəkliyə tam bölünən ən böyük ədəddir</strong>. <em>Misal: Zirvə <code>391 m</code>, kəsmə yüksəklik <code>20 m</code> olarsa, daxili horizontal <code>380 m</code>-dir.</em><br>
          • <strong>Çökəklikdə:</strong> Ən daxili horizontal dib nöqtəsindən ($H_{\text{dib}}$) <strong>böyük olan və kəsmə yüksəkliyə tam bölünən ən kiçik ədəddir</strong>. <em>Misal: Dib nöqtəsi <code>98 m</code>, kəsmə yüksəklik <code>7 m</code> olarsa, daxili horizontal <code>105 m</code>-dir.</em><br>
          • <strong>Mənfi çökəklik istisnası (Osman müəllim qaydası):</strong> Dib nöqtəsi <code>-47 m</code>, kəsmə yüksəklik <code>50 m</code> olarsa, <code>-47</code>-dən böyük ilk 50-yə bölünən ədəd <strong><code>0 m</code></strong> olduğu üçün daxili horizontal <code>0 m</code> götürülür!
        </td>
      </tr>
      <tr>
        <td><strong>4. Çayın Düşməsi ($D$) və Meyillilik ($M$) Düsturları</strong></td>
        <td>
          • <strong>Düşmə ($D$):</strong> Çayın mənbəyi ilə mənsəbi (və ya yamacın iki nöqtəsi) arasındakı mütləq hündürlük fərqidir: $D = H_1 - H_2\text{ (metrlə)}$.<br>
          • <strong>Meyillilik ($M$, $\text{m/km}$ və ya $\text{sm/km}$ ilə):</strong> Düşmənin həqiqi üfüqi məsafəyə ($L$, km-lə) nisbətidir: $M = \dfrac{D}{L}$.<br>
          • <strong>Faizlə meyillilik ($M\%$):</strong> Həm hündürlük fərqi ($h$), həm də həqiqi məsafə ($L$) <strong>eyni vahidə (metrə)</strong> çevrilir:<br>
          $$M(\%) = \dfrac{h\text{ (m)}}{L\text{ (m)}} \times 100\%$$
          • <strong>Promille ilə meyillilik ($M‰$):</strong> $M(‰) = \dfrac{h\text{ (m)}}{L\text{ (m)}} \times 1000‰$.<br>
          <em>Misal (Osman müəllim):</em> <code>1:400 000</code> miqyasda A–B məsafəsi <code>8 sm</code> ($L = 32\text{ km} = 32\,000\text{ m}$), meyillilik <code>4%</code>, $H_B = 200\text{ m}$ olarsa: $h = \dfrac{32\,000 \times 4}{100} = 1280\text{ m}$ &rarr; $H_A = 200 + 1280 = 1480\text{ m}$.
        </td>
      </tr>
    </tbody>
  </table>`
  }
];
