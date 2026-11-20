# Guide de rédaction — 300 conversations « Lecture Louange »

Application de lecture graduée en **chinois traditionnel** (calquée sur
literatelanguages.com/chinese/reading-practice) pour apprendre le vocabulaire courant
**et** le vocabulaire spirituel / théologique chrétien. Fil conducteur : les chants de
**讚美之泉 Stream of Praise** (liste des titres : `docs/chants_streamofpraise.txt`).
Traductions en **français**.

## 1. Format du fichier source (`content/NNN-NNN.txt`, UTF-8)

```
# commentaire (ignoré)
@series 001 | 初到台北 | Arrivée à Taipei | Luc découvre Taipei, l'université et une nouvelle amie.

=== 001
series: 001
title_zh: 你好，我是路加
title_fr: Bonjour, je suis Luc
tagline: Arrivée à Taipei — un café, une nouvelle amie et une invitation.
song: 神愛世人
vocab: 教會=église (communauté, bâtiment) | 神=Dieu | 愛=aimer ; amour
---
路加/lu4jia1 ：你好/ni3hao3 ！我/wo3 是/shi4 路加/lu4jia1 。
= Luc : Bonjour ! Je suis Luc.
小恩/xiao3en1 ：你好/ni3hao3 ！我/wo3 叫/jiao4 小恩/xiao3en1 。
= Xiao En : Bonjour ! Je m'appelle Xiao En.
星期天/xing1qi1tian1 ，小恩/xiao3en1 去/qu4 教會/jiao4hui4 。
= Le dimanche, Xiao En va à l'église.
```

Règles :
- `@series <id> | <titre zh> | <titre fr> | <description fr>` : une déclaration par série,
  placée avant sa première conversation. L'**id de série = numéro (3 chiffres) de sa
  première conversation**. Une série = 3 à 8 conversations consécutives.
- `=== NNN` ouvre une conversation (numéro sur 3 chiffres). Puis les en-têtes, puis `---`.
- En-têtes obligatoires : `series`, `title_zh`, `title_fr`, `tagline` (fr, une phrase,
  style « Thème — détail, détail et détail. »), `song` (titre **exact** tiré de
  `docs/chants_streamofpraise.txt`), `vocab` (3 à 8 mots clés de la conversation, forme
  `詞=définition française | 詞=définition`, chaque mot doit apparaître **tel quel comme
  mot** dans le texte).
- Corps : alternance stricte **ligne chinoise** / **ligne de traduction** commençant par `= `.
  Une ligne = un paragraphe affiché (une réplique ou une phrase de narration).
- Chaque mot chinois s'écrit `漢字/pinyin` — pinyin **numérique**, une syllabe = lettres +
  chiffre de ton (1–4, **5 = ton neutre**), syllabes collées : `我們/wo3men5`,
  `聖經/sheng4jing1`, `旅行/lv3xing2` (ü = **v**). Autant de syllabes que de caractères.
- La ponctuation chinoise pleine chasse (，。！？：；、「」『』《》……——) se place entre
  les mots, sans pinyin. Aucun caractère chinois ne doit rester sans pinyin.
- Réplique : `Nom/pinyin ：texte` (deux-points pleine chasse). Narration : pas de nom.
- Tons : **tons de dictionnaire** (pas de sandhi) : 一/yi1, 不/bu4, 你好/ni3hao3. Donc 一定/yi1ding4,
  一直/yi1zhi2, 不是/bu4shi4, 不要/bu4yao4 (jamais yi2ding4, yi4zhi2, bu2shi4…).
  Pas de 兒化 (écrire 哪裡, 一點 et non 哪兒, 一點兒) ; pas de « 一會兒 » (écrire 一下, 一陣子, 一會).
- **Norme de prononciation : celle de Taïwan** (décidée le 20 novembre 2026, pour rester cohérent avec le
  chinois traditionnel de Taïwan). Lectures de caractère à appliquer partout : 微 wei2 (微笑 wei2xiao4),
  期 qi2 (星期 xing1qi2, 學期 xue2qi2, 期待 qi2dai4), 突 tu2 (突然 tu2ran2), 識 shi4 (認識 ren4shi4),
  息 xi2 (休息 xiu1xi2, 訊息 xun4xi2), 蹟 ji1 (神蹟 shen2ji1, 奇蹟 qi2ji1), 髮 fa3 (頭髮 tou2fa3),
  跌 die2 (跌倒 die2dao3). Pour les mots dont le dernier syllabe peut être neutre ou plein, on a retenu
  **une seule forme par mot** dans tout le corpus (la plus fréquente) : 朋友 peng2you5, 喜歡 xi3huan5,
  知道 zhi1dao4, 名字 ming2zi5, 告訴 gao4su4, 地方 di4fang1, 故事 gu4shi5, 早上 zao3shang4, 明白 ming2bai5,
  清楚 qing1chu5, 眼睛 yan3jing1, 衣服 yi1fu5, 對不起 dui4bu4qi3, 事情 shi4qing5, 差點 cha4dian3… (liste complète
  des mots arbitrés : tableau `WORD` de `scripts/harmoniser_pinyin.js`, que l'on relance après chaque nouvelle
  tranche : `npm run pinyin:harmoniser` ; `npm run pinyin:variantes` liste ce qui reste ambigu). Le validateur connaît ces lectures
  (`TW_READINGS` dans `scripts/validate.js`) et ne les signale plus comme « inhabituelles ».
- **ü s'écrit v** dans le pinyin numérique : 女孩/nv3hai2, 旅行/lv3xing2, 驢子/lv2zi5.
- Un mot de `vocab:` doit apparaître **tel quel comme un seul mot** (token) dans le texte ; si besoin,
  regrouper les syllabes dans le texte (吃飯/chi1fan4 plutôt que 吃/chi1 飯/fan4).
- Lectures spéciales : 祢/ni3 (« Tu » adressé à Dieu), 祂/ta1 (« Il » = Dieu),
  耶和華/ye1he2hua2, 阿們/a1men2, 哈利路亞/ha1li4lu4ya4, 以馬內利/yi3ma3nei4li4,
  和散那/he2san3na4, 長老/zhang3lao3, 音樂/yin1yue4, 得救/de2jiu4.

### Segmentation (découpage en mots) — elle sert aux définitions au toucher
- Découper comme un dictionnaire : 我們 · 教會 · 牧師 · 禱告 · 喜歡 · 聖經 · 十字架 ·
  耶穌基督 · 聖靈 · 天父 · 敬拜團 · 主日學 · 唱歌.
- Noms propres et personnages = un seul mot : 路加, 小恩, 王牧師, 陳奶奶, 張長老,
  恩典教會, 讚美之泉, 約翰福音, 台北.
- Particules séparées : 的 · 了 · 嗎 · 吧 · 呢 · 著 · 得 · 地 · 過.
- Nombre + classificateur séparés : 一/yi1 個/ge4, 三/san1 本/ben3.
- Chengyu (4 caractères) = un seul mot.
- Titre de chant : 《有何神像祢》 se découpe normalement : 《有/you3 何/he2 神/shen2 像/xiang4 祢/ni3》.

## 2. Langue et ton
- **Chinois traditionnel de Taïwan** uniquement (aucun caractère simplifié ; 裡 et non 裏/里,
  著 particule, 台北). Usages taïwanais : 禮拜天/星期天, 捷運, 計程車, 腳踏車, 很棒,
  珍珠奶茶, 便利商店, 機車…
- Dieu : **祢** quand on Lui parle (prière, chant), **祂** quand on parle de Lui
  (comme dans les chants de 讚美之泉).
- Versets bibliques : citer **uniquement le 和合本** (traduction de 1919, domaine public),
  mot pour mot, en traditionnel, avec la référence (約翰福音 三章 十六節 ou 約翰福音3:16
  — les chiffres arabes sont acceptés). En français : **Louis Segond 1910**. Ne citer
  que des versets dont tu es certain du texte exact.
- **Jamais de paroles de chants** (droits d'auteur) : on peut citer le **titre** entre
  《》, dire qu'on le chante, en expliquer le thème avec ses propres mots, relier au verset
  biblique dont il s'inspire. Pas de vers recopiés, même partiellement.
- Théologie : protestante évangélique classique, celle du milieu de 讚美之泉 (Bible, grâce,
  croix, résurrection, Saint-Esprit, adoration). Exacte, chaleureuse, jamais caricaturale.
  Aux niveaux 5–6, exposer les débats avec nuance (ex. vues sur le millénium).
- Histoires vivantes : humour, vie quotidienne à Taïwan, émotions, petites intrigues,
  questions sincères. Pas de prêche monotone : les mots spirituels arrivent naturellement
  par les situations (répétition, culte, prière, repas, questions d'enfant…).
- Mélanger dialogues et narration, comme dans l'exemple ci-dessus.
- Traduction française naturelle et fidèle (pas mot à mot), noms : Luc, Xiao En,
  pasteur Wang, Mme Wang, Meiling, A-Jie, Mamie Chen, Xiao Guang, l'ancien Zhang,
  professeur Lin, David, papa Chen, maman Chen.

## 3. Personnages et cadre (communs à toutes les conversations)
- **路加 lu4jia1 (Luc)** — Français, 22 ans au début, étudiant d'échange à Taipei (cours de
  chinois à l'université). Curieux, sincère, un peu maladroit. Au départ non croyant ;
  sa foi, son chinois et sa théologie grandissent au fil des 300 conversations.
- **小恩 xiao3en1 (Xiao En, 陳小恩)** — Taïwanaise, 22 ans, étudiante, chante dans l'équipe
  de louange (敬拜團). Partenaire d'échange linguistique de Luc ; joyeuse, foi simple et
  solide. Une tendre histoire entre eux se dessine très lentement (mariage seulement
  à la fin, conversations 286–300).
- **王牧師 wang2mu4shi1 (pasteur Wang)** — pasteur de l'église, la cinquantaine, chaleureux,
  aime les métaphores. **王師母 wang2shi1mu3 (Mme Wang)** — son épouse, accueille tout le
  monde, cuisine.
- **美玲 mei3ling2 (Meiling)** — responsable de louange (敬拜主領), trentaine, exigeante et douce.
- **阿傑 a1jie2 (A-Jie)** — guitariste, 25 ans, blagueur, parfois impulsif.
- **陳奶奶 chen2nai3nai5 (Mamie Chen)** — grand-mère de Xiao En, ~80 ans, femme de prière,
  connaît les vieux cantiques, parle parfois taïwanais.
- **小光 xiao3guang1 (Xiao Guang)** — 8 ans, fils de Meiling, école du dimanche,
  questions naïves et profondes.
- **張長老 zhang1zhang3lao3 (l'ancien Zhang)** — ancien de l'église, ex-professeur, anime
  l'étude biblique ; précis, patient.
- **林老師 lin2lao3shi1 (professeur Lin)** — professeur au séminaire (神學院), niveaux 5–6.
- **大衛 da4wei4 (David)** — ami de Luc à l'université, Taïwanais, étudiant en philosophie,
  sceptique honnête ; pose les questions difficiles ; se convertit vers la fin.
- **陳爸爸 / 陳媽媽** — parents de Xiao En. La mère de Luc (路加的媽媽) appelle de France.
- Lieu : **恩典教會 en1dian3jiao4hui4 (l'église de la Grâce)**, à Taipei (台北).
  Culte le dimanche (主日崇拜), groupe de maison le mercredi (小組), répétition de
  louange le samedi.

## 4. Progression (difficulté croissante) — niveaux et longueurs
Longueur = nombre de caractères chinois de la conversation (noms compris).

| N° | Niveau | Longueur | Phrases | Grammaire indicative |
|----|--------|----------|---------|----------------------|
| 001–060 | 1 Débutant (≈HSK 1/TOCFL A1) | 70–150 | 8–14 lignes, phrases ≤ 12 car. | 是, 有, 很, 嗎, 呢, 吧, 不, 也, 都, 的, 在, 想, 要, 喜歡, 會, 去, 來 |
| 061–120 | 2 Élémentaire (≈HSK 2) | 130–220 | 10–16 lignes | 了, 過, 正在, 要…了, 比, 因為…所以, 可是, 就, 才, 得 (complément), 一點, 已經 |
| 121–180 | 3 Intermédiaire (≈HSK 3) | 220–320 | 12–18 lignes | 把, 被, 雖然…但是, 如果…就, 越來越, 不但…而且, 除了…以外, 一…就, 只要…就 |
| 181–230 | 4 Intermédiaire + (≈HSK 4) | 320–430 | 14–22 lignes | 即使…也, 無論…都, 既然…就, 難道, 甚至, 居然, 於是, 至於, 以及, un peu d'écrit |
| 231–270 | 5 Avancé (≈HSK 5) | 430–560 | 16–26 lignes | style plus soutenu, connecteurs, chengyu courants, passages argumentatifs |
| 271–300 | 6 Expert (≈HSK 6) | 560–720 | 18–30 lignes | registre écrit/théologique, chengyu, 之/乃/亦/而/其, citations du 和合本 |

- Au niveau 1, rester vraiment simple (vocabulaire HSK 1 + mots chrétiens de base) ;
  chaque conversation introduit 2–4 mots clés nouveaux, et **réutilise** souvent les
  mots déjà vus (répétition espacée).
- La difficulté monte **progressivement à l'intérieur** de chaque tranche.
- Chaque conversation tourne autour d'un chant (champ `song`) : on le chante, on en
  parle, on explique son titre, on relie au verset dont il s'inspire. Varier les chants ;
  ne pas réutiliser un chant dans ta tranche.

## 5. Arc narratif global (pour la continuité entre tranches)
- **001–060** (sept.–nov., année 1) : Luc arrive à Taipei, rencontre Xiao En à l'université,
  premier culte à l'église de la Grâce, rencontre de tous les personnages, premiers mots
  (Dieu, Jésus, prier, chanter, louer, Bible, amour, paix, amen…). Il est curieux, pas
  encore croyant. Scènes de vie : repas, thé aux perles, pluie, MRT, anniversaire.
- **061–120** (déc. année 1 – avril année 2) : Noël (報佳音), Nouvel An chinois (新春敬拜,
  紅包), groupe de maison, lecture de l'Évangile de Jean, questions sur le péché, le pardon,
  la croix, Pâques. Vers 110–115, Luc décide de suivre Jésus (決志) ; témoignage simple.
- **121–150** (mai–août année 2) : préparation au baptême, **baptême de Luc (~140)**, il
  entre dans l'équipe de louange (guitare/chant avec A-Jie et Meiling), camp d'été (夏令營).
  Thèmes : repentance, nouvelle naissance, liberté, sainteté, suivre Jésus.
- **151–180** (sept.–déc. année 2) : servir — école du dimanche avec Xiao Guang, prière avec
  Mamie Chen, papa Chen hospitalisé puis rétabli (prière, guérison, confiance), conflit et
  pardon entre Luc et A-Jie, préparation d'une mission courte (短宣), 2e Noël.
- **181–205** (janv.–avril année 3) : mission courte à 花蓮 dans une église aborigène,
  grand rassemblement de louange de 讚美之泉 à Taipei, étude de l'épître aux Romains avec
  l'ancien Zhang (justification, sanctification), tentation et combat spirituel, Pâques.
- **206–230** (mai–sept. année 3) : débats avec David (existence de Dieu, souffrance, fiabilité
  de la Bible, résurrection, science et foi), série sur le fruit de l'Esprit, Mamie Chen
  tombe malade, histoire de l'Église à Taïwan (馬偕 George Leslie Mackay).
- **231–250** (oct. année 3 – janv. année 4) : décès paisible de Mamie Chen, culte
  d'action de grâce (追思禮拜), espérance de la résurrection ; grâce et loi, justification
  par la foi, élection, providence ; Luc sent un appel au séminaire ; David commence à lire
  la Bible.
- **251–270** (année 4) : Luc entre au séminaire (神學院) de Taipei ; cours du professeur Lin :
  herméneutique, grec et hébreu, eschatologie, ecclésiologie, mission, disciplines
  spirituelles ; stage à l'église.
- **271–285** (année 5) : Trinité, christologie, credo (使徒信經, 尼西亞信經), Pères de
  l'Église, Réforme, histoire du chant chrétien chinois ; dernières questions de David,
  **conversion de David (~283)**.
- **286–300** (fin) : théologie de l'adoration, Luc compose un chant, prêche son premier
  sermon, baptême de David, mariage de Luc et Xiao En ; **300** : un culte final qui relie
  tout le parcours (chant 《這是我們的敬拜》).

## 6. Vérification
Après chaque fichier : `node scripts/validate.js content/NNN-NNN.txt`
- Corriger **toutes les ERREURS** (pinyin manquant/mal formé, nombre de syllabes,
  caractère simplifié, champ manquant…).
- Lire les **avertissements** : longueur hors cible (à corriger), ton inhabituel ou
  « à vérifier (dictionnaire : …) » → vérifier ; garder ta version si tu es sûr
  (le dictionnaire automatique se trompe parfois), sinon corriger.
- `--lengths` affiche la longueur de chaque conversation.
