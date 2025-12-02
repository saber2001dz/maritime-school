--
-- PostgreSQL database dump
--

\restrict e0d4fnkCbFzuSbxeYUZ166c9saWXYufDlfAnxxEAZwlJd7Od1PBwrRS2CwhX9YG

-- Dumped from database version 16.11 (Homebrew)
-- Dumped by pg_dump version 16.11 (Homebrew)

-- Started on 2025-12-01 14:10:38 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."CoursFormateur" DROP CONSTRAINT IF EXISTS "CoursFormation_formateurId_fkey";
ALTER TABLE IF EXISTS ONLY public."CoursFormateur" DROP CONSTRAINT IF EXISTS "CoursFormation_coursId_fkey";
ALTER TABLE IF EXISTS ONLY public."AgentFormation" DROP CONSTRAINT IF EXISTS "AgentFormation_formationId_fkey";
ALTER TABLE IF EXISTS ONLY public."AgentFormation" DROP CONSTRAINT IF EXISTS "AgentFormation_agentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Session_userId_idx";
DROP INDEX IF EXISTS public."Session_token_key";
DROP INDEX IF EXISTS public."CoursFormation_formateurId_idx";
DROP INDEX IF EXISTS public."CoursFormation_coursId_idx";
DROP INDEX IF EXISTS public."Agent_matricule_key";
DROP INDEX IF EXISTS public."AgentFormation_formationId_idx";
DROP INDEX IF EXISTS public."AgentFormation_agentId_idx";
DROP INDEX IF EXISTS public."Account_userId_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."Verification" DROP CONSTRAINT IF EXISTS "Verification_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE IF EXISTS ONLY public."Formation" DROP CONSTRAINT IF EXISTS "Formation_pkey";
ALTER TABLE IF EXISTS ONLY public."Formateur" DROP CONSTRAINT IF EXISTS "Formateur_pkey";
ALTER TABLE IF EXISTS ONLY public."Cours" DROP CONSTRAINT IF EXISTS "Cours_pkey";
ALTER TABLE IF EXISTS ONLY public."CoursFormateur" DROP CONSTRAINT IF EXISTS "CoursFormation_pkey";
ALTER TABLE IF EXISTS ONLY public."Agent" DROP CONSTRAINT IF EXISTS "Agent_pkey";
ALTER TABLE IF EXISTS ONLY public."AgentFormation" DROP CONSTRAINT IF EXISTS "AgentFormation_pkey";
ALTER TABLE IF EXISTS ONLY public."Account" DROP CONSTRAINT IF EXISTS "Account_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."Verification";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Session";
DROP TABLE IF EXISTS public."Formation";
DROP TABLE IF EXISTS public."Formateur";
DROP TABLE IF EXISTS public."CoursFormateur";
DROP TABLE IF EXISTS public."Cours";
DROP TABLE IF EXISTS public."AgentFormation";
DROP TABLE IF EXISTS public."Agent";
DROP TABLE IF EXISTS public."Account";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16427)
-- Name: Account; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    password text,
    "accessToken" text,
    "refreshToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    "idToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Account" OWNER TO maritime;

--
-- TOC entry 216 (class 1259 OID 16401)
-- Name: Agent; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Agent" (
    id text NOT NULL,
    "nomPrenom" text NOT NULL,
    grade text NOT NULL,
    matricule text NOT NULL,
    responsabilite text NOT NULL,
    telephone integer NOT NULL,
    categorie text NOT NULL,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Agent" OWNER TO maritime;

--
-- TOC entry 222 (class 1259 OID 16451)
-- Name: AgentFormation; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."AgentFormation" (
    id text NOT NULL,
    "agentId" text NOT NULL,
    "formationId" text NOT NULL,
    "dateDebut" text NOT NULL,
    "dateFin" text NOT NULL,
    reference text,
    resultat text,
    moyenne double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AgentFormation" OWNER TO maritime;

--
-- TOC entry 224 (class 1259 OID 16854)
-- Name: Cours; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Cours" (
    id text NOT NULL,
    titre text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cours" OWNER TO maritime;

--
-- TOC entry 225 (class 1259 OID 17066)
-- Name: CoursFormateur; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."CoursFormateur" (
    id text NOT NULL,
    "formateurId" text NOT NULL,
    "coursId" text NOT NULL,
    "dateDebut" text NOT NULL,
    "dateFin" text NOT NULL,
    "nombreHeures" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    reference text
);


ALTER TABLE public."CoursFormateur" OWNER TO maritime;

--
-- TOC entry 223 (class 1259 OID 16658)
-- Name: Formateur; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Formateur" (
    id text NOT NULL,
    "nomPrenom" text NOT NULL,
    grade text NOT NULL,
    unite text NOT NULL,
    responsabilite text NOT NULL,
    telephone integer NOT NULL,
    "RIB" character varying(20) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Formateur" OWNER TO maritime;

--
-- TOC entry 221 (class 1259 OID 16443)
-- Name: Formation; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Formation" (
    id text NOT NULL,
    "typeFormation" text NOT NULL,
    formation text NOT NULL,
    duree text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "capaciteAbsorption" integer,
    specialite text
);


ALTER TABLE public."Formation" OWNER TO maritime;

--
-- TOC entry 218 (class 1259 OID 16419)
-- Name: Session; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "impersonatedBy" text
);


ALTER TABLE public."Session" OWNER TO maritime;

--
-- TOC entry 217 (class 1259 OID 16409)
-- Name: User; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    role text DEFAULT 'agent'::text NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO maritime;

--
-- TOC entry 220 (class 1259 OID 16435)
-- Name: Verification; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public."Verification" (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Verification" OWNER TO maritime;

--
-- TOC entry 215 (class 1259 OID 16392)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: maritime
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO maritime;

--
-- TOC entry 3910 (class 0 OID 16427)
-- Dependencies: 219
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Account" (id, "userId", "accountId", "providerId", password, "accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, "idToken", "createdAt", "updatedAt") FROM stdin;
CpjrFzItbARqRMWnsA0oZRYsg7O8Bv3y	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	credential	f7ccb58075e1ab238460192486f11cd6:01c2ba18781b3bfce1c0e301d0cb09a4e0c4136dae71419e692ee32093ef1d4a7cdd7f146936b2188e60b0d9c89f658ec0c1312fef2e2fe669da7d6fc9eaa751	\N	\N	\N	\N	\N	\N	2025-11-18 23:10:43.392	2025-11-18 23:10:43.392
cmibt57mw0006kpj331nl96jg	cmibt57mw0005kpj39s98ab5e	directeur@maritime.gn	credential	123456	\N	\N	\N	\N	\N	\N	2025-11-23 14:22:52.137	2025-11-23 14:22:52.137
\.


--
-- TOC entry 3907 (class 0 OID 16401)
-- Dependencies: 216
-- Data for Name: Agent; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Agent" (id, "nomPrenom", grade, matricule, responsabilite, telephone, categorie, avatar, "createdAt", "updatedAt") FROM stdin;
1	أحمد بن محمد	مقدم	12345	رئيس منطقة	55123456	ضابط سامي	\N	2025-11-08 13:14:34.299	2025-11-19 14:07:28.083
2	فاطمة الزهراء	رائد	23456	رئيس إدارة فرعية	55234567	ضابط سامي	\N	2025-11-08 13:14:34.301	2025-11-09 19:05:13.527
3	محمد الأمين	عريف أول	34567	عون بحري	55345678	ضابط صف	\N	2025-11-08 13:14:34.302	2025-11-09 19:07:32.066
4	خديجة بنت علي	عريف	45678	عون بحري	55456789	ضابط صف	\N	2025-11-08 13:14:34.302	2025-11-09 19:07:55.245
5	عبد الرحمن السعيد	ملازم أول	56789	رئيس فرقة بحرية	55567890	ضابط	\N	2025-11-08 13:14:34.303	2025-11-09 19:05:44.098
6	نور الهدى	وكيل	67890	رئيس قسم	55678901	ضابط صف	\N	2025-11-08 13:14:34.304	2025-11-09 19:07:12.56
7	يوسف بن إبراهيم	وكيل أول	78901	مساعد رئيس مركز	55789012	ضابط صف	\N	2025-11-08 13:14:34.306	2025-11-09 19:06:23.552
8	سارة القاسمي	وكيل	89012	رئيس قسم	55890123	ضابط صف	\N	2025-11-08 13:14:34.307	2025-11-09 19:07:03.4
9	عمر بن الخطاب	عريف أول	90123	عون بحري	55901234	ضابط صف	\N	2025-11-08 13:14:34.307	2025-11-09 19:07:24.286
10	ليلى المنصوري	عريف	10234	عون بحري	56012345	ضابط صف	\N	2025-11-08 13:14:34.308	2025-11-09 19:07:39.871
11	حسن البصري	وكيل	11345	ربان ثاني	56123456	ضابط صف	\N	2025-11-08 13:14:34.309	2025-11-09 19:06:50.46
12	مريم العلوي	وكيل أول	12456	ربان أول	56234567	ضابط صف	\N	2025-11-08 13:14:34.309	2025-11-09 19:06:06.437
13	زياد الحسني	وكيل أول	13567	ربان أول	56345678	ضابط صف	\N	2025-11-08 13:14:34.31	2025-11-09 19:05:54.566
14	إلهام الشريف	ملازم أول	14678	رئيس فرقة بحرية	56456789	ضابط	\N	2025-11-08 13:14:34.31	2025-11-19 14:07:37.419
15	طارق بن زياد	نقيب	15789	آمر خافرة	56567890	ضابط	\N	2025-11-08 13:14:34.311	2025-11-19 14:06:45.258
cmhqbfp4c0000kpphohjj5yfy	علي لجنف	عميد	20487	مدير إقليم	20487799	ضابط سامي	\N	2025-11-08 13:23:58.573	2025-11-23 22:38:28.015
cmi2c8xrc0000kp0nusq75of6	محمد البصري	رقيب	32546	عون بحري	98765453	هيئة الرقباء	\N	2025-11-16 23:19:56.904	2025-11-16 23:19:56.904
cmihna1ul0000kp1r6yyivqwj	محمد عبيد	وكيل أول	23656	رئيس مركز	22456985	ضابط صف	\N	2025-11-27 16:25:17.277	2025-11-27 16:25:17.277
cmiiw7yn10003kpu7qeymhrf4	محمد العبيدي	ملازم	12332	ريس مركز	55435566	ضابط	\N	2025-11-28 13:23:22.526	2025-11-28 13:23:22.526
\.


--
-- TOC entry 3913 (class 0 OID 16451)
-- Dependencies: 222
-- Data for Name: AgentFormation; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."AgentFormation" (id, "agentId", "formationId", "dateDebut", "dateFin", reference, resultat, moyenne, "createdAt", "updatedAt") FROM stdin;
cmi3lmq500001kpo5qjz1r3zp	cmhqbfp4c0000kpphohjj5yfy	cmhrj65iw0008kp8kx7jezrbb	2025-10-10	2025-10-30	برقية عدد 123 بتاريخ 10-10-2025	قيد التكوين	0	2025-11-17 20:30:22.932	2025-11-17 22:39:51.563
cmi3lvexd0003kpo5fad6ptgm	14	cmhrjbswl000gkp8ko2ji7cjx	2024-12-01	2024-12-15	برقية عدد 345 بتاريخ 01-12-2024		0	2025-11-17 20:37:08.305	2025-11-17 20:37:08.305
cmi3m1cm70005kpo5qjcxjg35	7	cmhrj7wsr000ckp8kprs6w023	2025-01-01	2025-01-15	برقية عدد 12 بتاريخ 01-01-2025		0	2025-11-17 20:41:45.247	2025-11-17 20:41:45.247
cmi3mem000007kpo5iiszs0n8	7	cmhrj75eg000akp8kt3lwdg3n	2025-03-01	2025-03-15	برقية عدد 222 بتاريخ 31-02-2025	قيد التكوين	0	2025-11-17 20:52:03.936	2025-11-17 20:52:03.936
cmi62jng20001kpvyx74lu2i1	1	cmhrj7wsr000ckp8kprs6w023	2024-04-15	2024-05-12	برقية عدد 234 بتاريخ 12-04-2024	نجاح	15	2025-11-19 13:59:25.298	2025-11-19 13:59:25.298
\.


--
-- TOC entry 3915 (class 0 OID 16854)
-- Dependencies: 224
-- Data for Name: Cours; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Cours" (id, titre, "createdAt", "updatedAt") FROM stdin;
cmikb8r3e0000kpa2qp3o1qbh	التكوين السلوكي والعلائقي	2025-11-29 13:11:39.818	2025-11-29 13:11:39.818
cmikb8r3g0001kpa2rk19ocl9	حقوق الإنسان والإحتفاظ	2025-11-29 13:11:39.821	2025-11-29 13:11:39.821
cmikb8r3h0002kpa2ppmco3w9	القوانين والمجلات البحرية	2025-11-29 13:11:39.821	2025-11-29 13:11:39.821
cmikb8r3i0003kpa2l83qydoy	قانون البحار وصلاحيات الدولة بالبحر	2025-11-29 13:11:39.822	2025-11-29 13:11:39.822
cmikb8r3i0004kpa2jc7cm0on	السلامة البحرية	2025-11-29 13:11:39.823	2025-11-29 13:11:39.823
cmikb8r3k0005kpa2a577kzgu	أشغال على الخريطة	2025-11-29 13:11:39.824	2025-11-29 13:11:39.824
cmikb8r3l0006kpa2bsl29nfn	إستعلامات	2025-11-29 13:11:39.825	2025-11-29 13:11:39.825
cmikb8r3l0007kpa2crellgyi	الإجراءات الجزائية	2025-11-29 13:11:39.826	2025-11-29 13:11:39.826
cmikb8r3m0008kpa2np5eh9vy	قانون تدارك التصادم والإشارات البحرية	2025-11-29 13:11:39.826	2025-11-29 13:11:39.826
cmikb8r3m0009kpa2s861uu33	أمن الموانئ	2025-11-29 13:11:39.826	2025-11-29 13:11:39.826
cmikb8r3m000akpa2i0r3fayc	التنظيم الإداري	2025-11-29 13:11:39.827	2025-11-29 13:11:39.827
cmikb8r3n000bkpa2ofd5bnjz	التخطيط العملياتي للمهمات بالبحر	2025-11-29 13:11:39.827	2025-11-29 13:11:39.827
cmikb8r3n000ckpa2g81r6fgy	التلوث البحري	2025-11-29 13:11:39.827	2025-11-29 13:11:39.827
cmikb8r3n000dkpa2n0xxmab4	إجراءات مراقبة السفن الترفيهية الأجنبية	2025-11-29 13:11:39.828	2025-11-29 13:11:39.828
cmikb8r3o000ekpa2f2se19vo	منظومة تأمين الحدود البحرية	2025-11-29 13:11:39.828	2025-11-29 13:11:39.828
cmikb8r3o000fkpa2jpjvkvrj	المحاضر	2025-11-29 13:11:39.828	2025-11-29 13:11:39.828
cmikb8r3o000gkpa2xsf0ca5r	التصرف في الجثث بالبحر	2025-11-29 13:11:39.829	2025-11-29 13:11:39.829
cmikb8r3p000hkpa27ubbbxw7	الهجرة غير شرعية عبر البحر	2025-11-29 13:11:39.829	2025-11-29 13:11:39.829
cmikb8r3p000ikpa2inelb1j6	الأمن البحري	2025-11-29 13:11:39.829	2025-11-29 13:11:39.829
cmikb8r3p000jkpa27bomo2fu	تدليس الوثائق	2025-11-29 13:11:39.83	2025-11-29 13:11:39.83
cmikb8r3p000kkpa2xt3xro1o	التهديدات الإرهابية بالبحر	2025-11-29 13:11:39.83	2025-11-29 13:11:39.83
cmikb8r3q000lkpa2nipvrdxn	المتفجرات	2025-11-29 13:11:39.83	2025-11-29 13:11:39.83
cmikb8r3q000mkpa2wwgthcps	الرادار	2025-11-29 13:11:39.831	2025-11-29 13:11:39.831
cmikb8r3q000nkpa2ttboetit	التجهيزات الإلكترونية للمساعدة على الملاحة	2025-11-29 13:11:39.831	2025-11-29 13:11:39.831
cmikb8r3r000okpa2079dotlg	محركات السفن	2025-11-29 13:11:39.831	2025-11-29 13:11:39.831
cmikb8r3r000pkpa26h9dq8p3	كهرباء السفن	2025-11-29 13:11:39.832	2025-11-29 13:11:39.832
cmikb8r3s000qkpa211xenk0j	فنيات الشرطة	2025-11-29 13:11:39.832	2025-11-29 13:11:39.832
cmikb8r3s000rkpa2v84cx27k	إعلامية	2025-11-29 13:11:39.832	2025-11-29 13:11:39.832
cmikb8r3s000skpa22fjeev97	أسلحة رماية	2025-11-29 13:11:39.833	2025-11-29 13:11:39.833
cmikb8r3t000tkpa209mjamud	تكوين بدني	2025-11-29 13:11:39.833	2025-11-29 13:11:39.833
cmikb8r3t000ukpa2ec2kh43h	سباحة	2025-11-29 13:11:39.834	2025-11-29 13:11:39.834
cmikb8r3u000vkpa2l6npzy8e	Ronde de sécurité	2025-11-29 13:11:39.834	2025-11-29 13:11:39.834
cmikb8r3u000wkpa26oacclhl	Système mondiale de détresse et de sécurité en mer	2025-11-29 13:11:39.834	2025-11-29 13:11:39.834
cmikb8r3u000xkpa2ychbl8x9	Signaux de détresse	2025-11-29 13:11:39.835	2025-11-29 13:11:39.835
cmikb8r3v000ykpa2ukejedx5	Recherche et sauvetage en mer	2025-11-29 13:11:39.835	2025-11-29 13:11:39.835
cmikb8r3v000zkpa2f1966g05	Equipements et engins de sauvetage en mer	2025-11-29 13:11:39.836	2025-11-29 13:11:39.836
cmikb8r3w0010kpa26i8lu5jo	Sécurité au travail	2025-11-29 13:11:39.836	2025-11-29 13:11:39.836
cmikb8r3w0011kpa2f7hjzyl9	Entretien courant et ravitaillement carburant	2025-11-29 13:11:39.836	2025-11-29 13:11:39.836
cmikb8r3w0012kpa2d0w89yn6	Importance de compartimentage	2025-11-29 13:11:39.837	2025-11-29 13:11:39.837
cmikb8r3x0013kpa27sdht164	Les effets de la carène liquide	2025-11-29 13:11:39.837	2025-11-29 13:11:39.837
cmikb8r3x0014kpa25wzaii6w	Stabilité de navire	2025-11-29 13:11:39.838	2025-11-29 13:11:39.838
cmikb8r3y0015kpa2qb40a7dw	الإسعافات الأولية	2025-11-29 13:11:39.838	2025-11-29 13:11:39.838
cmikb8r3y0016kpa26k0qhl7n	مكافحة الحرائق نظري	2025-11-29 13:11:39.838	2025-11-29 13:11:39.838
cmikb8r3y0017kpa2c96bwsl3	مكافحة الحرائق تطبيقي	2025-11-29 13:11:39.839	2025-11-29 13:11:39.839
cmikb8r3z0018kpa2p1kv4fjt	Les voies d'eau	2025-11-29 13:11:39.839	2025-11-29 13:11:39.839
cmikb8r3z0019kpa2xttifvlz	المجلات البحرية والقوانين المنظمة للمجال البحري	2025-11-29 13:11:39.84	2025-11-29 13:11:39.84
cmikb8r3z001akpa2bukh8951	الملاحة الترفيهية	2025-11-29 13:11:39.84	2025-11-29 13:11:39.84
cmikb8r40001bkpa2sge76w0y	النجدة والانقاذ بالبحر	2025-11-29 13:11:39.84	2025-11-29 13:11:39.84
cmikb8r40001ckpa2aba8ya60	امن الموانئ	2025-11-29 13:11:39.841	2025-11-29 13:11:39.841
cmikb8r41001dkpa2i2irs3gb	مناورة نظرية	2025-11-29 13:11:39.841	2025-11-29 13:11:39.841
cmikb8r41001ekpa25x0pp38k	اشغال على الخريطة	2025-11-29 13:11:39.842	2025-11-29 13:11:39.842
cmikb8r42001fkpa2vgmyg0vs	المنظومات الالكترونية للملاحة البحرية	2025-11-29 13:11:39.842	2025-11-29 13:11:39.842
cmikb8r42001gkpa2yiuxvnem	الإنقليبية الفنية	2025-11-29 13:11:39.843	2025-11-29 13:11:39.843
cmikb8r43001hkpa2cj2a5poo	منظومة الاتصالات بالبحر	2025-11-29 13:11:39.843	2025-11-29 13:11:39.843
cmikb8r43001ikpa2mp4aoj1g	الرصد الجوي	2025-11-29 13:11:39.843	2025-11-29 13:11:39.843
cmikb8r43001jkpa20eb10f2t	مقاومة الحرائق	2025-11-29 13:11:39.844	2025-11-29 13:11:39.844
cmikb8r44001kkpa2f19bv7hu	مقاومة تسرب المياه	2025-11-29 13:11:39.844	2025-11-29 13:11:39.844
cmikb8r44001lkpa26n6zqtxz	إجراءات اخلاء السفينة	2025-11-29 13:11:39.845	2025-11-29 13:11:39.845
cmikb8r45001mkpa2996zsgqg	تجهيزات السلامة على المتن	2025-11-29 13:11:39.845	2025-11-29 13:11:39.845
cmikb8r45001nkpa2fh21hqi9	تفتيش السفن نظري	2025-11-29 13:11:39.846	2025-11-29 13:11:39.846
cmikb8r46001okpa2wwy81vx8	تفتيش السفن تطبيقي	2025-11-29 13:11:39.846	2025-11-29 13:11:39.846
cmikb8r46001pkpa26t9bwzhl	تكوين عام في الميكانيك	2025-11-29 13:11:39.847	2025-11-29 13:11:39.847
cmikb8r47001qkpa2tgmmcuyk	قانون الإتجار بالبشر	2025-11-29 13:11:39.847	2025-11-29 13:11:39.847
cmikb8r47001rkpa2kar9o0ro	محاضر عدلية	2025-11-29 13:11:39.847	2025-11-29 13:11:39.847
cmikb8r47001skpa2onshqn8j	محاضر جنائية	2025-11-29 13:11:39.848	2025-11-29 13:11:39.848
cmikb8r48001tkpa2o49fpodm	رماية	2025-11-29 13:11:39.848	2025-11-29 13:11:39.848
cmikb8r48001ukpa2hmjj15j4	التعرف على وثائق السفن	2025-11-29 13:11:39.848	2025-11-29 13:11:39.848
cmikb8r48001vkpa2j5bog8p9	الوثائق الإدارية	2025-11-29 13:11:39.849	2025-11-29 13:11:39.849
cmikb8r48001wkpa2mfn6wczs	الإنقليبية البحرية	2025-11-29 13:11:39.849	2025-11-29 13:11:39.849
cmikb8r49001xkpa2gvq7xrbg	تقنيات الأسلحة والإيقاف القانوني	2025-11-29 13:11:39.849	2025-11-29 13:11:39.849
cmikb8r49001ykpa2368lvxkq	التحكم في الزوارق السريعة	2025-11-29 13:11:39.85	2025-11-29 13:11:39.85
cmikb8r49001zkpa2kloodhwy	الصيانة	2025-11-29 13:11:39.85	2025-11-29 13:11:39.85
cmikb8r4a0020kpa2uz56sskp	المناورة	2025-11-29 13:11:39.85	2025-11-29 13:11:39.85
cmikb8r4a0021kpa20t65pymz	التدخل بالزوارق السريعة	2025-11-29 13:11:39.851	2025-11-29 13:11:39.851
cmikb8r4a0022kpa2bcb0yogl	إسعافات أولية	2025-11-29 13:11:39.851	2025-11-29 13:11:39.851
cmikb8r4b0023kpa2lphdttj6	الملاحة	2025-11-29 13:11:39.852	2025-11-29 13:11:39.852
cmikb8r4c0024kpa2njjncr35	زيارة ميدانية	2025-11-29 13:11:39.852	2025-11-29 13:11:39.852
cmikb8r4c0025kpa2635p8se1	convention internationale pour la sauvegarde de la vie humaine en mer	2025-11-29 13:11:39.852	2025-11-29 13:11:39.852
cmikb8r4c0026kpa2xfi77b0l	le code ISPS	2025-11-29 13:11:39.853	2025-11-29 13:11:39.853
cmikb8r4d0027kpa2ii7cid2j	تقنيات تصوير الجثة	2025-11-29 13:11:39.853	2025-11-29 13:11:39.853
cmikb8r4d0028kpa2v0dqhn09	تعريف إختصاص التصرف في الجثث	2025-11-29 13:11:39.854	2025-11-29 13:11:39.854
cmikb8r4d0029kpa2oaeoncg3	تعريف الجثة وخصوصياتها	2025-11-29 13:11:39.854	2025-11-29 13:11:39.854
cmikb8r4e002akpa2hce1lsqm	تفتيش الجثة	2025-11-29 13:11:39.854	2025-11-29 13:11:39.854
cmikb8r4e002bkpa2wh1i4wqf	تعريف البصمة والتحليل الجيني	2025-11-29 13:11:39.855	2025-11-29 13:11:39.855
cmikb8r4f002ckpa2r8yrml8w	Câblage des navires	2025-11-29 13:11:39.855	2025-11-29 13:11:39.855
cmikb8r4f002dkpa21o4xrlhi	المراقبة الإدارية	2025-11-29 13:11:39.856	2025-11-29 13:11:39.856
cmikb8r4g002ekpa2z8pkaxza	عموميات جهاز الرادار، أساسيات تشغيل الرادار (نظري)	2025-11-29 13:11:39.856	2025-11-29 13:11:39.856
cmikb8r4g002fkpa2wko43ozv	التعرف على إستخدامات الرادار ومختلف الوظائف والإعدادات	2025-11-29 13:11:39.857	2025-11-29 13:11:39.857
cmikb8r4h002gkpa2kyxlnm87	صيانة الرادار وتوصيات الإستخدام	2025-11-29 13:11:39.857	2025-11-29 13:11:39.857
cmikb8r4h002hkpa21y6hooge	تمرين تطبيقي بمحطة الرصد بالمستوى (نهاري وليلي)	2025-11-29 13:11:39.858	2025-11-29 13:11:39.858
cmikb8r4h002ikpa2hzj2hato	صيانة وإدامة الزوارق السريعة	2025-11-29 13:11:39.858	2025-11-29 13:11:39.858
cmikb8r4i002jkpa2vrdyvutv	مناورات الإبحار والإرساء والتنقل داخل الميناء	2025-11-29 13:11:39.858	2025-11-29 13:11:39.858
\.


--
-- TOC entry 3916 (class 0 OID 17066)
-- Dependencies: 225
-- Data for Name: CoursFormateur; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."CoursFormateur" (id, "formateurId", "coursId", "dateDebut", "dateFin", "nombreHeures", "createdAt", "updatedAt", reference) FROM stdin;
cmikv9xqv0001kpccalb8h8r8	cmii2iuyx0000kp27hppnvtyh	cmikb8r3e0000kpa2qp3o1qbh	2025-01-15	2025-01-20	8.5	2025-11-29 22:32:27.415	2025-11-29 22:32:27.415	\N
cmikv9xqx0003kpcc6r90bru6	cmii2iuyx0000kp27hppnvtyh	cmikb8r3g0001kpa2rk19ocl9	2025-02-01	2025-02-05	12	2025-11-29 22:32:27.418	2025-11-29 22:32:27.418	\N
cmikv9xqy0005kpccrzp5m7dm	cmii2iuz10001kp2748ngqf8f	cmikb8r3e0000kpa2qp3o1qbh	2025-01-22	2025-01-26	10	2025-11-29 22:32:27.419	2025-11-29 22:32:27.419	\N
cmikv9xqz0007kpcc23wbrzi6	cmii2iuz10001kp2748ngqf8f	cmikb8r3h0002kpa2ppmco3w9	2025-03-01	2025-03-10	16.5	2025-11-29 22:32:27.42	2025-11-29 22:32:27.42	\N
cmikvm0y40001kpk1arvprpnw	cmii2iuyx0000kp27hppnvtyh	cmikb8r3i0003kpa2l83qydoy	2025-01-10	2025-01-15	12	2025-11-29 22:41:51.437	2025-11-29 22:41:51.437	\N
cmikvm0y90003kpk1s49g62v2	cmii2iuz10001kp2748ngqf8f	cmikb8r3k0005kpa2a577kzgu	2025-01-20	2025-01-25	15.5	2025-11-29 22:41:51.442	2025-11-29 22:41:51.442	\N
cmikvm0yc0005kpk14bbnkxht	cmii2iuz10002kp279jd8bl1o	cmikb8r3l0007kpa2crellgyi	2025-02-01	2025-02-10	20	2025-11-29 22:41:51.444	2025-11-29 22:41:51.444	\N
cmikvm0yd0007kpk1tuws32eh	cmii2iuz20003kp279yhj2xy8	cmikb8r3m000akpa2i0r3fayc	2025-02-15	2025-02-20	10.5	2025-11-29 22:41:51.446	2025-11-29 22:41:51.446	\N
cmikvm0yf0009kpk123lvpkks	cmii2iuz20004kp27rv2k6v5f	cmikb8r3n000ckpa2g81r6fgy	2025-03-01	2025-03-08	18	2025-11-29 22:41:51.447	2025-11-29 22:41:51.447	\N
cmikvm0yg000bkpk1x99mvabn	cmii2iuz30005kp27fxark2j6	cmikb8r3o000fkpa2jpjvkvrj	2025-03-10	2025-03-15	14	2025-11-29 22:41:51.448	2025-11-29 22:41:51.448	\N
cmikvm0yh000dkpk1c9or4de6	cmii2iuz40006kp277mcuv5gv	cmikb8r3p000ikpa2inelb1j6	2025-03-20	2025-03-28	22.5	2025-11-29 22:41:51.45	2025-11-29 22:41:51.45	\N
cmikvm0yk000hkpk1gdv86e5l	cmii2iuz50008kp277rrqtklc	cmikb8r3r000pkpa26h9dq8p3	2025-04-10	2025-04-18	16.5	2025-11-29 22:41:51.453	2025-11-29 22:41:51.453	\N
cmikvm0yl000jkpk1njws6kq1	cmii2iuz50009kp27u38j255y	cmikb8r3t000ukpa2ec2kh43h	2025-04-20	2025-04-30	25	2025-11-29 22:41:51.454	2025-11-29 22:41:51.454	\N
cmikvm0ym000lkpk19hwf41mx	cmii2pxf10000kpadd3mmjvdj	cmikb8r3v000zkpa2f1966g05	2025-05-01	2025-05-10	20.5	2025-11-29 22:41:51.455	2025-11-29 22:41:51.455	\N
cmikvm0yo000nkpk10pxfyjrz	cmii2pxf40001kpads2i5v932	cmikb8r3x0014kpa25wzaii6w	2025-05-15	2025-05-22	17	2025-11-29 22:41:51.456	2025-11-29 22:41:51.456	\N
cmikvm0yp000pkpk1u7rs5hdy	cmii2pxf60002kpadl1s1svt9	cmikb8r3z0019kpa2xttifvlz	2025-06-01	2025-06-12	28	2025-11-29 22:41:51.458	2025-11-29 22:41:51.458	\N
cmikvm0yq000rkpk19e32i9p3	cmii2pxfa0003kpady0xpa1pi	cmikb8r41001ekpa25x0pp38k	2025-06-15	2025-06-20	12.5	2025-11-29 22:41:51.459	2025-11-29 22:41:51.459	\N
cmikvm0yj000fkpk14usr62b1	cmii2iuz40007kp27qrd0y8bc	cmikb8r3p000kkpa2xt3xro1o	2025-04-01	2025-04-05	10	2025-11-29 22:41:51.451	2025-11-30 10:11:01.522	\N
cmikvm0yr000tkpk1wk3u6c6m	cmii2pxfb0004kpad6j7oa4pe	cmikb8r43001jkpa20eb10f2t	2025-07-01	2025-07-08	20	2025-11-29 22:41:51.46	2025-11-30 10:42:47.45	\N
\.


--
-- TOC entry 3914 (class 0 OID 16658)
-- Dependencies: 223
-- Data for Name: Formateur; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Formateur" (id, "nomPrenom", grade, unite, responsabilite, telephone, "RIB", "createdAt", "updatedAt") FROM stdin;
cmii2iuyx0000kp27hppnvtyh	أحمد بن محمد	عقيد	المدرسة البحرية	مدير التكوين	98765432	12345678901234567890	2025-11-27 23:32:02.506	2025-11-27 23:32:02.506
cmii2iuz10001kp2748ngqf8f	محمد الطاهر	مقدم	المدرسة البحرية	أستاذ الملاحة	97654321	12345678901234567891	2025-11-27 23:32:02.509	2025-11-27 23:32:02.509
cmii2iuz10002kp279jd8bl1o	سعيد العياري	رائد	المدرسة العدلية	أستاذ القانون البحري	96543210	12345678901234567892	2025-11-27 23:32:02.51	2025-11-27 23:32:02.51
cmii2iuz20003kp279yhj2xy8	كمال بن علي	نقيب	المدرسة البحرية	أستاذ الميكانيك	95432109	12345678901234567893	2025-11-27 23:32:02.51	2025-11-27 23:32:02.51
cmii2iuz20004kp27rv2k6v5f	ياسين المبروك	ملازم أول	المدرسة العدلية	أستاذ الإجراءات البحرية	94321098	12345678901234567894	2025-11-27 23:32:02.511	2025-11-27 23:32:02.511
cmii2iuz30005kp27fxark2j6	رضا الهمامي	ملازم	المدرسة البحرية	أستاذ السلامة البحرية	93210987	12345678901234567895	2025-11-27 23:32:02.511	2025-11-27 23:32:02.511
cmii2iuz40006kp277mcuv5gv	فتحي السعيدي	عميد	المدرسة العدلية	مدير المدرسة	92109876	12345678901234567896	2025-11-27 23:32:02.512	2025-11-27 23:32:02.512
cmii2iuz40007kp27qrd0y8bc	هشام الزواري	مقدم	المدرسة الفنية	رئيس قسم التكوين	91098765	12345678901234567897	2025-11-27 23:32:02.513	2025-11-27 23:32:02.513
cmii2iuz50008kp277rrqtklc	نبيل القاسمي	رائد	المدرسة الفنية	أستاذ الإلكترونيات	90987654	12345678901234567898	2025-11-27 23:32:02.513	2025-11-27 23:32:02.513
cmii2iuz50009kp27u38j255y	عماد الدين البحري	نقيب	المدرسة البحرية	أستاذ الاتصالات البحرية	89876543	12345678901234567899	2025-11-27 23:32:02.514	2025-11-27 23:32:02.514
cmii2pxf10000kpadd3mmjvdj	علي الجزيري	مقدم	المدرسة الفنية	أستاذ الكهرباء	88765432	12345678901234567900	2025-11-27 23:37:32.269	2025-11-27 23:37:32.269
cmii2pxf40001kpads2i5v932	منير الصغير	ملازم أول	المدرسة البحرية	أستاذ الرادار	87654321	12345678901234567901	2025-11-27 23:37:32.273	2025-11-27 23:37:32.273
cmii2pxf60002kpadl1s1svt9	زياد المؤدب	رائد	المدرسة البحرية	أستاذ الخرائط البحرية	86543210	12345678901234567902	2025-11-27 23:37:32.275	2025-11-27 23:37:32.275
cmii2pxfa0003kpady0xpa1pi	سامي الناصري	نقيب	المدرسة العدلية	أستاذ التحقيق البحري	85432109	12345678901234567903	2025-11-27 23:37:32.278	2025-11-27 23:37:32.278
cmii2pxfb0004kpad6j7oa4pe	بلال الكريمي	ملازم	المدرسة الفنية	أستاذ المعدات البحرية	84321098	12345678901234567904	2025-11-27 23:37:32.279	2025-11-27 23:37:32.279
cmiixp65w0002kp67ev6mrc4i	أحمد الرمضاني	ملازم أول	المنطقة البحرية المنستير	رئيس فرقة	45	64343437343234647455	2025-11-28 14:04:45.038	2025-11-28 14:04:45.038
cmiix4ww50000kp67plwrigun	صابر عزيز	عميد	الإدراة العامة	مدير مركزي	54231232	12325654653131345645	2025-11-28 13:48:59.909	2025-11-29 11:50:11.326
cmik8d5o90000kpzna9cf6ah2	علي لحمر	عميد	الإقليم	رئيس إدارة فرعية	98445433	33245465464576664576	2025-11-29 11:51:06.489	2025-11-29 11:51:06.489
cmik8fifk0001kpzn3050havq	نبيل عزيز	رائد	المدرسة البحرية	رئيس مصلحة	44656675	33434235364534645645	2025-11-29 11:52:56.336	2025-11-29 11:52:56.336
cmiixkcxa0001kp67qds7xlyr	محمود درويش	رائد	إقليم الساحل	رئيس إدارة	23456525	23232343435787879756	2025-11-28 14:01:00.526	2025-11-29 23:14:49.375
\.


--
-- TOC entry 3912 (class 0 OID 16443)
-- Dependencies: 221
-- Data for Name: Formation; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Formation" (id, "typeFormation", formation, duree, "createdAt", "updatedAt", "capaciteAbsorption", specialite) FROM stdin;
cmhrizm1e0000kp8kkk5n4cmd	تكوين إختصاص	درجة أولى حدود بحرية BS1	سنتان	2025-11-09 09:43:11.186	2025-11-09 22:10:35.868	27	بحري
cmhrj0p2g0001kp8kqxz9kmv8	تكوين إختصاص	درجة ثانية حدود بحرية BS2	سنة ونصف	2025-11-09 09:44:01.769	2025-11-10 14:11:27.66	31	بحري
cmhrj1whf0002kp8kkd3vtx82	تكوين إختصاص	درجة ثانية قيادة سفن BS2	سنتان	2025-11-09 09:44:58.036	2025-11-09 22:10:35.87	20	بحري
cmhrj2axr0003kp8kvlaqpwje	تكوين إختصاص	درجة ثالثة قيادة سفن BS3	سنة	2025-11-09 09:45:16.767	2025-11-09 22:10:35.871	22	بحري
cmhrj3ajg0004kp8ka3uviy3e	تكوين إختصاص	درجة ثالثة ميكانيك السفن BS3	سنة	2025-11-09 09:46:02.908	2025-11-09 22:10:35.873	23	بحري
cmhrj421x0005kp8ktljbkgvx	تكوين إختصاص	درجة ثالثة سلامة بحرية BS3	سنة	2025-11-09 09:46:38.566	2025-11-09 22:10:35.874	29	بحري
cmhrj5ahi0006kp8ktq6f3dcw	تكوين تخصصي	قيادة و صيانة الزوارق السريعة	6 أشهر	2025-11-09 09:47:36.15	2025-11-09 22:10:35.874	22	بحري
cmhrj5qn60007kp8kgdyb1ynk	تكوين تخصصي	تشغيل الرادار	أسبوعان	2025-11-09 09:47:57.091	2025-11-09 22:10:35.875	26	بحري
cmhrj65iw0008kp8kx7jezrbb	تكوين تخصصي	الأمن البحري	أسبوع	2025-11-09 09:48:16.376	2025-11-09 22:10:35.875	28	عدلي
cmhrj6r950009kp8k8di55rft	تكوين تخصصي	التصرف في الجثث بالبحر	أسبوع	2025-11-09 09:48:44.538	2025-11-09 22:10:35.876	21	عدلي
cmhrj75eg000akp8kt3lwdg3n	تكوين تخصصي	تفتيش السفن	أسبوعان	2025-11-09 09:49:02.872	2025-11-09 22:10:35.877	23	عدلي
cmhrj7j6k000bkp8k6c72c3yx	تكوين تخصصي	التعامل مع المجتازين	أسبوع	2025-11-09 09:49:20.732	2025-11-09 22:10:35.877	29	عدلي
cmhrj7wsr000ckp8kprs6w023	تكوين تخصصي	تدليس الوثائق	أسبوع	2025-11-09 09:49:38.38	2025-11-09 22:10:35.878	23	عدلي
cmhrj9r29000dkp8kqipvbqr9	تكوين تخصصي	رئيس مركز بحري	شهر	2025-11-09 09:51:04.257	2025-11-09 22:10:35.879	25	إداري
cmhrja2cz000ekp8kgisu8687	تكوين تخصصي	الإسعافات الأولية	أسبوع	2025-11-09 09:51:18.899	2025-11-19 14:31:29.093	26	بحري
cmhrjb37g000fkp8kk71ctska	تكوين تخصصي	منظومة العمل بقاعات العمليات	أسبوعان	2025-11-09 09:52:06.652	2025-11-09 22:10:35.88	20	إداري
cmhrjbswl000gkp8ko2ji7cjx	تكوين تخصصي	المحاضر و الإجراءات العدلية	أسبوعان	2025-11-09 09:52:39.957	2025-11-09 22:10:35.88	26	عدلي
\.


--
-- TOC entry 3909 (class 0 OID 16419)
-- Dependencies: 218
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Session" (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt", "impersonatedBy") FROM stdin;
iaxDO77YZBvmXc5bpz2OqYuJOwsw3PMd	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	gFQJvXk93kg8l4vxzQYg9mQpyxsOk08x	2025-11-25 23:10:43.393	127.0.0.1	node	2025-11-18 23:10:43.393	2025-11-18 23:10:43.393	\N
9sg8UG4dnkckL7hryJhxBv49Hccy2tG1	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	A3r0S8yr0HB3ScOho94lGKj9gXSNNmue	2025-11-26 13:24:34.186	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 13:24:34.186	2025-11-19 13:24:34.186	\N
lUvyvoeG4Y0cwGNfue02c2QMaCuDPTOq	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	nBSVtq8AIg8gzqWhRGJvT7PQsVwjT3Ew	2025-11-20 14:37:44.959	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 14:37:44.959	2025-11-19 14:37:44.959	\N
cmjhV4s7JFzor1KVh2jRlUjeAq4BKPSq	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	aDsHwcFBKdLoNXxDQBgzT9UyD5NHTTY8	2025-11-20 14:39:11.527	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0.1 Safari/605.1.15	2025-11-19 14:39:11.527	2025-11-19 14:39:11.527	\N
ySHvY1yOGwtNEQFZ16MBtWVZsPINMiod	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	tWR7cC1AqedGpVqLbCzOXZfXTDzQh7nn	2025-11-26 14:46:32.006	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 14:46:32.007	2025-11-19 14:46:32.007	\N
pJ9BxORGFFBroifHZZrTX00vF7x6BKpZ	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	F3TSxoq4Bij9pQKu1LIvNjrODJqnM5sC	2025-11-26 14:46:35.439	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 14:46:35.439	2025-11-19 14:46:35.439	\N
X0l1BClVY9kyJnx7POTNJbl7sdabbaxd	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	bagfcxBpyG6cSpB5hISXFwGdS0U03Bi9	2025-11-26 14:46:36.541	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 14:46:36.541	2025-11-19 14:46:36.541	\N
89OjWRVzphGSmatwRvjmPYSbzFJ7dQvD	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	DQH4dFqEkeg9DqWn5RuV3ZHDA7h3lN1M	2025-11-26 15:46:30.834	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-19 15:46:30.835	2025-11-19 15:46:30.835	\N
zNucM1zPRaDr5TldYcVZ3WBGwNS90zWi	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	irmPj3rECv12FOQzPiyNeGCmDq6lrUwt	2025-11-30 22:20:43.313	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-23 22:20:43.314	2025-11-23 22:20:43.314	\N
Ff3ZTF8mqdXEReXn1GODBdlkCqpxoSME	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	O4xmnzulTGmocyxkMoNNYXUXmNekSsQ7	2025-11-30 22:21:06.522	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-23 22:21:06.522	2025-11-23 22:21:06.522	\N
Ug9uBOfd0LCGF1FIuvcVL6efISiXyX5W	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	FtYD8GCy9HK6Q2BDNl5CiAZfpCnhbDCI	2025-11-30 22:21:29.314	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-23 22:21:29.314	2025-11-23 22:21:29.314	\N
LlL1ia7y9tS0vD9xWI5l9XmHOk56Zj5r	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	TYUKvDDVwGUxFAiBy5Gplq1wBEwnCh7B	2025-11-30 22:25:13.946	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-23 22:25:13.947	2025-11-23 22:25:13.947	\N
aUP8LGAs3h5Jink0vDGPhf6yeiyqNCq9	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	OrafwyHOLE3XeMr7aSlTeFg0dqwXYgAt	2025-12-02 12:05:00.588	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-23 22:28:48.991	2025-11-25 12:05:00.588	\N
terDbEeKPbr9zfPpNm98On5w0KLdqdhi	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	RNxFjSL834UpBQwCHDFKtlg3hWrx5ge6	2025-12-07 16:29:46.598	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-27 16:23:13.898	2025-11-30 16:29:46.598	\N
CXHczs8HWQ5sCKxA8DCpF70a8CPpHek0	YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	53Yi6jecnJIura3GveeZPpr4XGYfCDxX	2025-12-08 08:27:14.055	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-12-01 08:27:14.056	2025-12-01 08:27:14.056	\N
\.


--
-- TOC entry 3908 (class 0 OID 16409)
-- Dependencies: 217
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."User" (id, email, name, "emailVerified", image, role, "lastLogin", "createdAt", "updatedAt", banned, "banReason", "banExpires") FROM stdin;
cmibt57mw0005kpj39s98ab5e	directeur@maritime.gn	ameur	t	\N	administrateur	\N	2025-11-23 14:22:52.137	2025-11-24 17:07:25.293	\N	\N	\N
YltJBKbqfH4wiuwMXDOTYZjLNWWULFOE	admin@maritime.gn	Saber Younes	t	\N	agent	2025-12-01 08:27:14.072	2025-11-18 23:10:43.389	2025-12-01 08:27:14.073	\N	\N	\N
\.


--
-- TOC entry 3911 (class 0 OID 16435)
-- Dependencies: 220
-- Data for Name: Verification; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public."Verification" (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3906 (class 0 OID 16392)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: maritime
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9d34f6ab-6ac3-48b6-9eb1-2fb82d05fba1	76f9660cb9d8e866780eaffdf224c4fcf36894361acafc41448c24be5e3125ee	2025-11-27 16:17:46.890382+01	20251127151746_init_postgresql	\N	\N	2025-11-27 16:17:46.880937+01	1
5cf9d392-519e-482e-9058-f08de235e00a	f7a2217870cce8b3810ae7b19adc44b1576642ad6f4f6f66bad44ca4ee33b6ba	2025-11-27 18:04:17.79164+01	20251127170417_add_formateur_table	\N	\N	2025-11-27 18:04:17.788613+01	1
07e9e875-9f8d-4f90-8502-7d562b5d2432	45e4563aa4a76955ecbc7a61237f3747f8ed90069110d83bca847aaa50ebc5ff	2025-11-29 13:42:47.769463+01	20251129124247_add_cours_table	\N	\N	2025-11-29 13:42:47.764921+01	1
cddecdc5-1dc7-49c0-91b4-2006f92cc5fe	24ab789db2cf24e7a7cfa30ba63c8e5dabebddaaf5fe41a1ac2598cc445e49ed	2025-11-29 23:29:52.841594+01	20251129222952_add_cours_formation_table	\N	\N	2025-11-29 23:29:52.83529+01	1
53d3571f-e43d-46d5-b88a-5f7e8a7b9af0	78eee1f286e393cf3b0e61c99b37f7820067304ad7ec41141de8ec0dc5ab4fca	2025-11-30 10:37:27.28125+01	20251130103712_rename_cours_formation_to_cours_formateur		\N	2025-11-30 10:37:27.28125+01	0
ec3004f9-280d-4b4d-b92e-976fd41f69bc	9ec888bf48a927894728539eaf8f1941ff660faef714afae3bc0c5d7d0e20dfa	\N	20251130095825_add_reference_to_cours_formateur	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251130095825_add_reference_to_cours_formateur\n\nDatabase error code: 42601\n\nDatabase error:\nERROR: syntax error at or near ","\n\nPosition:\n[1m  0[0m\n[1m  1[0m -- AlterTable\n[1m  2[1;31m ALTER TABLE "CoursFormateur" RENAME CONSTRAINT "CoursFormation_pkey" TO "CoursFormateur_pkey",[0m\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42601), message: "syntax error at or near \\",\\"", detail: None, hint: None, position: Some(Original(108)), where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("scan.l"), line: Some(1248), routine: Some("scanner_yyerror") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251130095825_add_reference_to_cours_formateur"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251130095825_add_reference_to_cours_formateur"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:260	2025-11-30 10:59:03.868832+01	2025-11-30 10:58:25.690828+01	0
\.


--
-- TOC entry 3739 (class 2606 OID 16434)
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 16458)
-- Name: AgentFormation AgentFormation_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."AgentFormation"
    ADD CONSTRAINT "AgentFormation_pkey" PRIMARY KEY (id);


--
-- TOC entry 3730 (class 2606 OID 16408)
-- Name: Agent Agent_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Agent"
    ADD CONSTRAINT "Agent_pkey" PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 17073)
-- Name: CoursFormateur CoursFormation_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."CoursFormateur"
    ADD CONSTRAINT "CoursFormation_pkey" PRIMARY KEY (id);


--
-- TOC entry 3752 (class 2606 OID 16861)
-- Name: Cours Cours_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Cours"
    ADD CONSTRAINT "Cours_pkey" PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 16665)
-- Name: Formateur Formateur_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Formateur"
    ADD CONSTRAINT "Formateur_pkey" PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 16450)
-- Name: Formation Formation_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Formation"
    ADD CONSTRAINT "Formation_pkey" PRIMARY KEY (id);


--
-- TOC entry 3735 (class 2606 OID 16426)
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- TOC entry 3733 (class 2606 OID 16418)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 16442)
-- Name: Verification Verification_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Verification"
    ADD CONSTRAINT "Verification_pkey" PRIMARY KEY (id);


--
-- TOC entry 3727 (class 2606 OID 16400)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3740 (class 1259 OID 16463)
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- TOC entry 3745 (class 1259 OID 16464)
-- Name: AgentFormation_agentId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "AgentFormation_agentId_idx" ON public."AgentFormation" USING btree ("agentId");


--
-- TOC entry 3746 (class 1259 OID 16465)
-- Name: AgentFormation_formationId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "AgentFormation_formationId_idx" ON public."AgentFormation" USING btree ("formationId");


--
-- TOC entry 3728 (class 1259 OID 16459)
-- Name: Agent_matricule_key; Type: INDEX; Schema: public; Owner: maritime
--

CREATE UNIQUE INDEX "Agent_matricule_key" ON public."Agent" USING btree (matricule);


--
-- TOC entry 3753 (class 1259 OID 17075)
-- Name: CoursFormation_coursId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "CoursFormation_coursId_idx" ON public."CoursFormateur" USING btree ("coursId");


--
-- TOC entry 3754 (class 1259 OID 17074)
-- Name: CoursFormation_formateurId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "CoursFormation_formateurId_idx" ON public."CoursFormateur" USING btree ("formateurId");


--
-- TOC entry 3736 (class 1259 OID 16461)
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: maritime
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- TOC entry 3737 (class 1259 OID 16462)
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: maritime
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- TOC entry 3731 (class 1259 OID 16460)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: maritime
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3758 (class 2606 OID 16471)
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3759 (class 2606 OID 16481)
-- Name: AgentFormation AgentFormation_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."AgentFormation"
    ADD CONSTRAINT "AgentFormation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public."Agent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3760 (class 2606 OID 16476)
-- Name: AgentFormation AgentFormation_formationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."AgentFormation"
    ADD CONSTRAINT "AgentFormation_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES public."Formation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3761 (class 2606 OID 17081)
-- Name: CoursFormateur CoursFormation_coursId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."CoursFormateur"
    ADD CONSTRAINT "CoursFormation_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES public."Cours"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3762 (class 2606 OID 17076)
-- Name: CoursFormateur CoursFormation_formateurId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."CoursFormateur"
    ADD CONSTRAINT "CoursFormation_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES public."Formateur"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3757 (class 2606 OID 16466)
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: maritime
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-12-01 14:10:39 CET

--
-- PostgreSQL database dump complete
--

\unrestrict e0d4fnkCbFzuSbxeYUZ166c9saWXYufDlfAnxxEAZwlJd7Od1PBwrRS2CwhX9YG

