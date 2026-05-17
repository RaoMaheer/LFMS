--
-- PostgreSQL database dump
--

\restrict L6cHfllanLjj1DmfXYTcu77OU9U3kBXMOG3VYn2fx1pEzmTe74EVVO41QgjAccN

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: check_appointment_date(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_appointment_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.appointment_date < NOW() THEN
        RAISE EXCEPTION 'Appointment date cannot be in the past!';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_appointment_date() OWNER TO postgres;

--
-- Name: notify_new_client(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_new_client() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE NOTICE 'A new client has been added: %', NEW.name;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_new_client() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    appointment_id integer NOT NULL,
    case_id integer,
    lawyer_id integer,
    client_id integer,
    appointment_date timestamp without time zone,
    location character varying(200),
    purpose text,
    status character varying(50) DEFAULT 'scheduled'::character varying
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_appointment_id_seq OWNER TO postgres;

--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_appointment_id_seq OWNED BY public.appointments.appointment_id;


--
-- Name: case_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.case_documents (
    document_id integer NOT NULL,
    case_id integer,
    title character varying(100),
    file_path text,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.case_documents OWNER TO postgres;

--
-- Name: case_documents_document_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.case_documents_document_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.case_documents_document_id_seq OWNER TO postgres;

--
-- Name: case_documents_document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.case_documents_document_id_seq OWNED BY public.case_documents.document_id;


--
-- Name: cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cases (
    case_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    client_id integer,
    lawyer_id integer,
    status character varying(50) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cases OWNER TO postgres;

--
-- Name: cases_case_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cases_case_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cases_case_id_seq OWNER TO postgres;

--
-- Name: cases_case_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cases_case_id_seq OWNED BY public.cases.case_id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    client_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    address text,
    joined_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_client_id_seq OWNER TO postgres;

--
-- Name: clients_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_client_id_seq OWNED BY public.clients.client_id;


--
-- Name: court_dates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.court_dates (
    court_date_id integer NOT NULL,
    case_id integer,
    court_name character varying(100),
    date date,
    notes text
);


ALTER TABLE public.court_dates OWNER TO postgres;

--
-- Name: court_dates_court_date_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.court_dates_court_date_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.court_dates_court_date_id_seq OWNER TO postgres;

--
-- Name: court_dates_court_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.court_dates_court_date_id_seq OWNED BY public.court_dates.court_date_id;


--
-- Name: lawyers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lawyers (
    lawyer_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20),
    specialization character varying(50),
    joined_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.lawyers OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    case_id integer,
    amount numeric(12,2) NOT NULL,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    payment_method character varying(50),
    payment_status character varying(20),
    transaction_id character varying(100),
    notes text,
    CONSTRAINT payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['Credit Card'::character varying, 'Wire Transfer'::character varying, 'Check'::character varying, 'Cash'::character varying])::text[]))),
    CONSTRAINT payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Pending'::character varying, 'Completed'::character varying, 'Failed'::character varying, 'Refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: lawyer_revenue_report; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.lawyer_revenue_report AS
 SELECT l.name AS lawyer_name,
    l.specialization,
    sum(p.amount) AS total_collected,
    count(DISTINCT c.case_id) AS active_cases
   FROM ((public.lawyers l
     JOIN public.cases c ON ((l.lawyer_id = c.lawyer_id)))
     JOIN public.payments p ON ((c.case_id = p.case_id)))
  WHERE ((p.payment_status)::text = 'Completed'::text)
  GROUP BY l.lawyer_id, l.name, l.specialization;


ALTER VIEW public.lawyer_revenue_report OWNER TO postgres;

--
-- Name: lawyers_lawyer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lawyers_lawyer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lawyers_lawyer_id_seq OWNER TO postgres;

--
-- Name: lawyers_lawyer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lawyers_lawyer_id_seq OWNED BY public.lawyers.lawyer_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_message_id_seq OWNER TO postgres;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: appointments appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointments_appointment_id_seq'::regclass);


--
-- Name: case_documents document_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_documents ALTER COLUMN document_id SET DEFAULT nextval('public.case_documents_document_id_seq'::regclass);


--
-- Name: cases case_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases ALTER COLUMN case_id SET DEFAULT nextval('public.cases_case_id_seq'::regclass);


--
-- Name: clients client_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN client_id SET DEFAULT nextval('public.clients_client_id_seq'::regclass);


--
-- Name: court_dates court_date_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_dates ALTER COLUMN court_date_id SET DEFAULT nextval('public.court_dates_court_date_id_seq'::regclass);


--
-- Name: lawyers lawyer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lawyers ALTER COLUMN lawyer_id SET DEFAULT nextval('public.lawyers_lawyer_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (appointment_id, case_id, lawyer_id, client_id, appointment_date, location, purpose, status) FROM stdin;
1	1	2	7	2026-05-01 09:00:00	601 Lexington Ave, NY	Strategy session for Hedge Fund Audit	Scheduled
2	2	3	2	2026-05-01 14:00:00	Room 402, Civil Court	Eviction Defense Hearing	Completed
3	3	4	3	2026-05-02 11:00:00	Conference Room A (Pearson)	Tech Acquisition - Letter of Intent review	Scheduled
4	4	5	4	2026-05-03 10:30:00	Virtual Zoom Call	NDA Breach - Discovery Discussion	Cancelled
5	5	1	9	2026-05-04 15:45:00	Police Precinct 12	DUI Appeal - Client Interview	Scheduled
6	6	3	10	2026-05-05 08:00:00	Starbucks, 5th Ave	Informal Child Custody Mediation	Scheduled
11	3	4	3	2026-05-10 09:00:00	Conference Room A (Pearson)	Closing signature session	Scheduled
12	5	1	9	2026-05-11 14:00:00	Superior Court, Room 5	DUI Preliminary Hearing	Pending
13	2	3	2	2026-05-12 11:00:00	Pearson Specter Litt Office	Eviction Defense - Final Paperwork	Scheduled
8	1	2	7	2026-06-01 10:00:00	601 Lexington Ave, NY	Follow-up on Audit discrepancies	Scheduled
9	9	7	13	2026-06-05 11:30:00	Boardroom, Mercer Corp	Shareholder Lawsuit - Depositions	Scheduled
10	10	4	12	2026-06-12 16:00:00	District Attorney Office	Mortgage Fraud - Plea Negotiation	Pending
15	4	5	4	2026-06-28 09:00:00	Conference Room C (Zane)	NDA Breach - Settlement Talk	Scheduled
16	11	5	11	2026-06-02 09:00:00	Industrial Hub, Detroit	Workplace safety site inspection	Scheduled
18	15	8	15	2026-06-08 10:30:00	Virtual Zoom Call	Proprietary hardware recovery status	Scheduled
20	17	1	17	2026-06-15 09:00:00	Aspen Valley Medical Center	Personal injury witness interview	Scheduled
22	19	1	19	2026-06-22 13:00:00	Conference Room A (Pearson)	Merger finalization briefing	Scheduled
24	21	4	21	2026-06-25 14:00:00	St. Louis Shipping Yard	Logistics damage assessment	Scheduled
25	22	3	22	2026-06-29 09:30:00	Rookery Dr Historic Site	Preservation rights consultation	Scheduled
26	23	8	23	2026-06-30 11:00:00	Conference Room C (Zane)	Defamation defense client meeting	Scheduled
27	25	5	25	2026-07-02 10:00:00	Dearborn Manufacturing Plant	Defective materials evidence review	Scheduled
28	26	2	26	2026-07-06 13:00:00	Buckingham Pl Estate	Heirloom inventory and valuation	Scheduled
30	28	8	28	2026-07-10 09:00:00	Arcadia Bay Town Hall	Utility damage claim negotiation	Pending
31	29	5	29	2026-07-13 14:00:00	601 Lexington Ave, NY	Securities fraud defense prep	Scheduled
33	1	2	7	2026-07-16 11:00:00	Virtual Zoom Call	Audit final report walkthrough	Scheduled
34	3	4	3	2026-07-20 14:00:00	Conference Room A (Pearson)	Post-acquisition integration talk	Scheduled
36	13	2	2	2026-07-24 13:00:00	Manhattan Housing Dept	Compliance check for settlement	Scheduled
39	71	3	1	2026-07-30 11:30:00	Riverdale City Council	Zoning board follow-up	Scheduled
40	99	5	29	2026-07-31 14:00:00	601 Lexington Ave, NY	Post-sentencing client briefing	Scheduled
41	75	2	3	2026-05-11 20:25:00	Zoom Video Conference	Reviewing draft merger agreement	Scheduled
\.


--
-- Data for Name: case_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.case_documents (document_id, case_id, title, file_path, uploaded_at) FROM stdin;
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cases (case_id, title, description, client_id, lawyer_id, status, created_at, updated_at) FROM stdin;
1	Corporate Merger	Handling the acquisition of a tech startup.	7	2	open	2026-03-15 09:00:00	2026-03-15 09:00:00
2	Patent Infringement	Defense against software patent claims.	8	5	pending	2026-03-16 10:30:00	2026-03-16 10:30:00
3	DUI Defense	Representation for traffic violation.	9	1	open	2026-03-18 14:20:00	2026-03-18 14:20:00
4	Estate Planning	Drafting will and trust documents.	4	7	closed	2026-03-20 08:15:00	2026-03-20 08:15:00
5	Insurance Claim	Personal injury litigation from car accident.	5	9	open	2026-03-22 11:45:00	2026-03-22 11:45:00
6	Child Custody	Mediation for custody agreement.	10	3	pending	2026-03-25 16:30:00	2026-03-25 16:30:00
8	Medical Malpractice	Client suing hospital for negligence.	14	9	open	2026-04-01 09:20:00	2026-04-01 09:20:00
9	Contract Breach	Vendor failed to deliver equipment.	13	8	pending	2026-04-02 15:10:00	2026-04-02 15:10:00
10	Cybersecurity Breach	Legal response to data leak.	19	5	open	2026-04-03 10:05:00	2026-04-03 10:05:00
11	Wrongful Termination	Employment law dispute.	2	10	closed	2026-04-05 13:40:00	2026-04-05 13:40:00
12	Zoning Dispute	Building permit appeal for commercial lot.	12	7	open	2026-04-07 17:50:00	2026-04-07 17:50:00
13	Tax Evasion Defense	Representation in federal tax audit.	11	2	pending	2026-04-08 08:30:00	2026-04-08 08:30:00
15	Embezzlement Case	White-collar crime defense.	21	1	open	2026-04-12 14:25:00	2026-04-12 14:25:00
16	Adoption Finalization	Legal processing for family adoption.	22	3	closed	2026-04-14 09:15:00	2026-04-14 09:15:00
17	Trademark Registration	Securing brand IP for startup.	26	5	open	2026-04-16 10:45:00	2026-04-16 10:45:00
19	Asset Forfeiture	Reclaiming seized property.	23	8	open	2026-04-20 12:00:00	2026-04-20 12:00:00
20	Environmental Violation	Defense against EPA fine.	24	8	closed	2026-04-22 17:00:00	2026-04-22 17:00:00
21	Hedge Fund Audit	Investigation into offshore accounts.	1	2	open	2026-04-10 09:00:00	2026-04-10 09:00:00
22	Eviction Defense	Representing tenant in illegal eviction.	2	3	closed	2026-04-11 10:30:00	2026-04-25 14:00:00
23	Tech Acquisition	Negotiating the sale of a SaaS platform.	3	4	open	2026-04-12 11:45:00	2026-04-12 11:45:00
24	Non-Disclosure Breach	Former employee leaked trade secrets.	4	5	closed	2026-04-13 08:15:00	2026-04-20 16:30:00
25	DUI Appeal	Challenging breathalyzer accuracy.	5	1	pending	2026-04-14 14:20:00	2026-04-14 14:20:00
26	Prenuptial Agreement	Drafting high-asset marital contract.	6	3	closed	2026-04-15 16:30:00	2026-04-26 09:00:00
28	Libel Defense	Defending journalist against defamation.	8	8	pending	2026-04-17 09:20:00	2026-04-17 09:20:00
29	Shareholder Lawsuit	Minority owners suing for transparency.	9	7	open	2026-04-18 15:10:00	2026-04-18 15:10:00
30	Mortgage Fraud	Representing bank in foreclosure fraud.	10	4	closed	2026-04-19 10:05:00	2026-04-27 11:00:00
31	Starlight Tech Merger	Full acquisition of a silicon-valley startup including IP transfer.	1	1	open	2026-04-01 00:00:00	2026-04-05 00:00:00
32	Hedge Fund Restructuring	Internal reorganization of capital assets for offshore compliance.	2	2	pending	2026-04-02 00:00:00	2026-04-02 00:00:00
33	Retail Chain Buyout	Negotiating terms for a $50M takeover of a national retail brand.	3	4	open	2026-04-03 00:00:00	2026-04-10 00:00:00
34	Venture Capital Round B	Drafting investment agreements for a second-stage funding round.	4	1	closed	2026-03-15 00:00:00	2026-04-20 00:00:00
35	Shareholder Proxy Dispute	Defending the board of directors against a hostile takeover attempt.	5	7	open	2026-04-15 00:00:00	2026-04-15 00:00:00
36	Joint Venture Agreement	Structuring a partnership between a logistics firm and a tech provider.	6	4	pending	2026-04-20 00:00:00	2026-04-20 00:00:00
37	White Collar Fraud Defense	Representation for a CEO accused of insider trading and wire fraud.	7	5	open	2026-04-05 00:00:00	2026-04-05 00:00:00
38	Felony DUI Appeal	Challenging the admissibility of roadside breathalyzer evidence.	8	1	pending	2026-04-10 00:00:00	2026-04-10 00:00:00
39	Grand Larceny Investigation	Pre-indictment representation regarding missing corporate funds.	9	5	closed	2026-02-10 00:00:00	2026-03-30 00:00:00
40	Cybercrime Allegations	Defending against charges of unauthorized access to federal servers.	10	8	open	2026-04-12 00:00:00	2026-04-12 00:00:00
41	Witness Protection Liaison	Negotiating a cooperation agreement with the District Attorney.	1	5	pending	2026-04-18 00:00:00	2026-04-18 00:00:00
45	Bio-Tech Trade Secret	Investigating a former researcher for leaking chemical formulas.	5	2	pending	2026-04-25 00:00:00	2026-04-25 00:00:00
47	Skyscraper Zoning Dispute	Representing developers in a clash with the city planning board.	7	3	open	2026-04-01 00:00:00	2026-04-01 00:00:00
48	Commercial Lease Breach	Eviction proceedings against a major tenant for non-payment.	8	3	closed	2026-02-15 00:00:00	2026-04-10 00:00:00
49	Luxury Condo Closing	Finalizing the purchase of a $12M penthouse in Manhattan.	9	3	pending	2026-04-30 00:00:00	2026-04-30 00:00:00
50	Eminent Domain Challenge	Suing the state to prevent the seizure of industrial property.	10	3	open	2026-05-01 00:00:00	2026-05-01 00:00:00
51	Environmental Assessment	Liability review for potential soil contamination on a new site.	1	4	open	2026-05-02 00:00:00	2026-05-02 00:00:00
52	Sexual Harassment Defense	Defending a senior partner against workplace misconduct claims.	2	7	open	2026-05-03 00:00:00	2026-05-03 00:00:00
53	Non-Compete Litigation	Enforcing a restrictive covenant against an ex-COO.	3	7	pending	2026-05-04 00:00:00	2026-05-04 00:00:00
54	Unfair Dismissal Claim	Representing a whistleblower fired after reporting safety violations.	4	7	open	2026-05-05 00:00:00	2026-05-05 00:00:00
55	Union Negotiation	Drafting a collective bargaining agreement for hospital staff.	5	2	closed	2026-03-01 00:00:00	2026-04-15 00:00:00
56	Employee Misclassification	Class action suit regarding independent contractor status.	6	7	open	2026-05-06 00:00:00	2026-05-06 00:00:00
57	Medical Malpractice Claim	Expert witness review for surgical error resulting in paralysis.	7	1	open	2026-05-06 00:00:00	2026-05-06 00:00:00
58	Defamation Libel Suit	High-profile lawsuit against a major news outlet for false reporting.	8	8	pending	2026-05-07 00:00:00	2026-05-07 00:00:00
59	Estate Probate Dispute	Contesting a multi-million dollar will among distant relatives.	9	2	open	2026-05-07 00:00:00	2026-05-07 00:00:00
60	Family Trust Formation	Creating a tax-efficient legacy structure for a high-net-worth client.	10	2	closed	2026-04-01 00:00:00	2026-05-01 00:00:00
61	Aviation Safety Lawsuit	Representing victims in a commercial airline engine failure case.	1	1	open	2026-05-08 00:00:00	2026-05-08 00:00:00
62	Tax Evasion Defense	Auditing financial records to counter IRS allegations of fraud.	2	5	pending	2026-05-08 00:00:00	2026-05-08 00:00:00
63	Product Liability Class Action	Defending a manufacturer of faulty lithium-ion batteries.	3	4	open	2026-05-09 00:00:00	2026-05-09 00:00:00
64	Adoption Legalities	Navigating the legal hurdles of an international adoption process.	4	3	closed	2026-03-20 00:00:00	2026-05-02 00:00:00
65	Insurance Coverage Denial	Suing a provider for refusing to cover fire damage to a warehouse.	5	8	open	2026-05-09 00:00:00	2026-05-09 00:00:00
66	Anti-Trust Investigation	Cooperating with the FTC regarding price-fixing in the auto market.	6	4	pending	2026-05-10 00:00:00	2026-05-10 00:00:00
67	Maritime Salvage Claim	Dispute over ownership of recovered cargo from a shipwreck.	7	8	open	2026-05-10 00:00:00	2026-05-10 00:00:00
68	Oil and Gas Leasing	Securing drilling rights on private land in Texas.	8	3	closed	2026-04-10 00:00:00	2026-05-05 00:00:00
70	Political Campaign Compliance	Audit of donation records to ensure FEC guidelines are met.	10	7	pending	2026-05-11 00:00:00	2026-05-11 00:00:00
71	Divorce Asset Division	Equitable distribution of high-value art and property portfolios.	1	2	open	2026-05-12 00:00:00	2026-05-12 00:00:00
72	Cryptocurrency Theft	Tracking stolen digital assets via blockchain forensics.	2	8	open	2026-05-12 00:00:00	2026-05-12 00:00:00
73	Civil Rights Violation	Suing a municipality for discriminatory policing practices.	3	1	pending	2026-05-13 00:00:00	2026-05-13 00:00:00
75	Bankruptcy Chapter 11	Filing for protection to allow for business restructuring.	5	2	closed	2026-02-01 00:00:00	2026-05-01 00:00:00
76	Immigration Visa Denial	Appealing a rejected H1-B visa application for a tech worker.	6	8	pending	2026-05-14 00:00:00	2026-05-14 00:00:00
77	Public Defamation Defense	Protecting a celebrity’s reputation after a viral scandal.	7	8	open	2026-05-14 00:00:00	2026-05-14 00:00:00
78	Privacy Data Breach	Managing the legal fallout after a customer database was hacked.	8	8	open	2026-05-15 00:00:00	2026-05-15 00:00:00
79	Franchise Agreement Review	Assisting a business owner in buying their 5th burger franchise.	9	4	closed	2026-04-20 00:00:00	2026-05-10 00:00:00
81	Securities Fraud Defense	Countering allegations of market manipulation in day trading.	1	5	open	2026-05-16 00:00:00	2026-05-16 00:00:00
82	Durable Power of Attorney	Establishing legal guardians for an elderly high-net-worth client.	2	2	closed	2026-05-01 00:00:00	2026-05-15 00:00:00
83	Telecommunications Licensing	Applying for 5G spectrum rights in the New York area.	3	4	open	2026-05-16 00:00:00	2026-05-16 00:00:00
84	Food Safety Litigation	Defending a restaurant chain in a salmonella outbreak case.	4	1	pending	2026-05-17 00:00:00	2026-05-17 00:00:00
85	Child Custody Modification	Petitioning to move the primary residence of the children.	5	3	open	2026-05-17 00:00:00	2026-05-17 00:00:00
86	Art Forgery Investigation	Authenticating a painting sold as an original Basquiat.	6	8	closed	2026-03-10 00:00:00	2026-05-10 00:00:00
87	Construction Delay Damages	Suing a general contractor for missed completion deadlines.	7	3	open	2026-05-18 00:00:00	2026-05-18 00:00:00
88	Professional Negligence	Suing an accounting firm for failure to identify embezzlement.	8	1	pending	2026-05-18 00:00:00	2026-05-18 00:00:00
89	Non-Profit Tax Status	Helping a charity regain its 501(c)(3) standing with the IRS.	9	2	closed	2026-04-05 00:00:00	2026-05-12 00:00:00
90	Export Control Compliance	Ensuring defense technology sales meet international treaties.	10	4	open	2026-05-19 00:00:00	2026-05-19 00:00:00
92	Amnesty Negotiation	Representing a corporate whistleblower in a multi-national antitrust probe.	2	5	pending	2026-05-21 00:00:00	2026-05-21 00:00:00
93	Sovereign Debt Dispute	Advising a private equity firm on bonds issued by a foreign government.	3	4	open	2026-05-22 00:00:00	2026-05-22 00:00:00
94	Maritime Collision	Liability litigation regarding a cargo ship collision in New York Harbor.	4	8	closed	2026-02-15 00:00:00	2026-05-10 00:00:00
95	Fine Art Restitution	Recovering stolen historical artifacts for a private museum collection.	5	2	open	2026-05-23 00:00:00	2026-05-23 00:00:00
97	Sports Franchise Sale	Handling the legal complexities of a professional basketball team ownership transfer.	7	4	pending	2026-05-25 00:00:00	2026-05-25 00:00:00
99	Electoral Law Challenge	Representing a political candidate in a dispute over ballot access and redistricting.	9	7	closed	2026-04-10 00:00:00	2026-05-15 00:00:00
100	Space Law Compliance	Advising a commercial satellite company on orbital debris liability and international treaties.	10	4	open	2026-05-27 00:00:00	2026-05-27 00:00:00
101	Oak Ave Rezoning	Dispute with Riverdale city council regarding residential property lines.	1	3	open	2026-04-10 00:00:00	2026-04-10 00:00:00
102	Gotham Municipal Suit	Sophia Vance vs Gotham City regarding public safety negligence.	2	8	pending	2026-04-12 00:00:00	2026-04-12 00:00:00
104	Las Vegas Casino Merger	Regulatory compliance for Olivia Rhodes acquisition of Lucky Ln.	4	1	closed	2026-03-20 00:00:00	2026-04-20 00:00:00
105	Seattle Tech Employment	Non-compete litigation for Ethan Blackwood against a cloud provider.	5	7	open	2026-04-16 00:00:00	2026-04-16 00:00:00
106	Portland Eco-Compliance	Environmental audit for Ava Montgomery’s organic farm business.	6	4	pending	2026-04-18 00:00:00	2026-04-18 00:00:00
107	Chicago Shadow Ct Dispute	Mason Wolfe’s civil suit regarding breach of construction contract.	7	3	open	2026-04-20 00:00:00	2026-04-20 00:00:00
108	Miami Maritime Liability	Isabella Claire vs Cruise Line regarding offshore injury.	8	8	open	2026-04-22 00:00:00	2026-04-22 00:00:00
109	Denver Forest Ln Zoning	Lucas Halloway’s petition for land use modification in Denver.	9	3	closed	2026-03-10 00:00:00	2026-04-01 00:00:00
96	Class Action: Data Privacy	Leading the defense for a social media giant regarding biometric data usage.	57	8	open	2026-05-24 00:00:00	2026-05-14 22:22:48.358428
110	Boston London Way Estate	Probate and inheritance management for the Kensington family.	10	2	pending	2026-04-24 00:00:00	2026-04-24 00:00:00
111	Detroit Industrial Liability	Jacob Mercer vs Manufacturing Hub regarding workplace safety.	11	5	open	2026-04-25 00:00:00	2026-04-25 00:00:00
113	Greenwich Manor Trust	Wealth management and trust formation for William Ashford.	13	2	closed	2026-03-25 00:00:00	2026-04-15 00:00:00
114	Paris TX Contract Review	Amelia Hart’s business partnership agreement for a new boutique.	14	4	pending	2026-04-27 00:00:00	2026-04-27 00:00:00
115	Austin Tech Server Theft	Jameson Cole’s civil recovery of proprietary hardware.	15	8	open	2026-04-28 00:00:00	2026-04-28 00:00:00
117	Aspen Winter St Liability	Benjamin Frost vs Ski Resort regarding a personal injury claim.	17	1	pending	2026-04-30 00:00:00	2026-04-30 00:00:00
118	Phoenix Granite Dr Zoning	Evelyn Stone’s application for commercial development in AZ.	18	3	open	2026-05-01 00:00:00	2026-05-01 00:00:00
119	Orlando Castle Way Merger	Alexander Knight’s entertainment firm merger with a local park.	19	1	closed	2026-04-05 00:00:00	2026-05-02 00:00:00
121	St. Louis River St Dispute	Daniel Brooks vs Logistics Corp regarding cargo damage.	21	4	pending	2026-05-03 00:00:00	2026-05-03 00:00:00
122	Rookery Dr Property Law	Luna Lovegood’s claim regarding historic preservation rights.	22	3	open	2026-05-03 00:00:00	2026-05-03 00:00:00
123	New Orleans Mystery Suit	Sebastian Cain’s civil defense regarding a defamation claim.	23	8	open	2026-05-04 00:00:00	2026-05-04 00:00:00
124	KC Wheat Dr Grain Export	Grace Miller’s agricultural contract dispute with a distributor.	24	4	closed	2026-04-15 00:00:00	2026-05-05 00:00:00
125	Dearborn Assembly Suit	Henry Ford vs Parts Supplier regarding defective materials.	25	5	pending	2026-05-05 00:00:00	2026-05-05 00:00:00
126	KY Buckingham Pl Probate	Victoria Reign’s inheritance dispute over family heirlooms.	26	2	open	2026-05-06 00:00:00	2026-05-06 00:00:00
127	Boston Freedom Rd Zoning	Samuel Adams vs City of Boston regarding historic building use.	27	3	open	2026-05-06 00:00:00	2026-05-06 00:00:00
128	Arcadia Bay Civil Claim	Chloe Price vs Local Utility regarding environmental damage.	28	8	pending	2026-05-07 00:00:00	2026-05-07 00:00:00
129	NYC Justice Blvd Fraud	Owen Wright’s representation in a securities fraud investigation.	29	5	open	2026-05-07 00:00:00	2026-05-07 00:00:00
134	Sanders Merger	High-stakes acquisition of a tech startup by Sanders International. Focuses on hostile takeover defense and contract finalization.102Hell’s Kitchen DefenseMike Ross4A pro-bono criminal defense case involving a local community center facing illegal eviction by a land developer.103Zane Asset AuditRachel Zane8Comprehensive forensic accounting and asset verification for a high-net-worth estate settlement.104Restructure DisputeAlex Williams11Representation of a Fortune 500 company in a multi-state labor dispute and corporate reorganization.105Family Trust LitigationEmma Brown3A complex family law matter regarding the distribution of a multi-generational trust and real estate holdings.	55	5	appealed	2026-05-14 22:19:33.211235	2026-05-14 22:52:11.167334
135	Hell’s Kitchen Defense	A pro-bono criminal defense case involving a local community center facing illegal eviction by a land developer.	57	4	appealed	2026-05-14 22:21:18.451787	2026-05-17 14:46:30.537443
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (client_id, name, email, phone, address, joined_date) FROM stdin;
1	Liam Sterling	liam.s@gmail.com	555-0101	452 Oak Ave, Riverdale	2026-01-15 09:00:00
2	Sophia Vance	sophia.v@gmail.com	555-0102	89 High St, Gotham	2026-01-20 10:30:00
3	Noah Thorne	noah.t@gmail.com	555-0103	12 Maple Rd, Star City	2026-02-01 14:20:00
4	Olivia Rhodes	olivia.r@gmail.com	555-0104	777 Lucky Ln, Las Vegas	2026-02-05 08:15:00
5	Ethan Blackwood	ethan.b@gmail.com	555-0105	101 Pine St, Seattle	2026-02-10 11:45:00
6	Ava Montgomery	ava.m@gmail.com	555-0106	23 Birch Blvd, Portland	2026-02-12 16:30:00
7	Mason Wolfe	mason.w@gmail.com	555-0107	56 Shadow Ct, Chicago	2026-02-15 12:00:00
8	Isabella Claire	isabella.c@gmail.com	555-0108	99 Ocean Dr, Miami	2026-02-18 09:20:00
9	Lucas Halloway	lucas.h@gmail.com	555-0109	44 Forest Ln, Denver	2026-02-20 15:10:00
10	Mia Kensington	mia.k@gmail.com	555-0110	302 London Way, Boston	2026-02-22 10:05:00
11	Jacob Mercer	jacob.m@gmail.com	555-0111	15 Industrial Pkwy, Detroit	2026-02-25 13:40:00
12	Charlotte Webb	charlotte.w@gmail.com	555-0112	88 Silk Rd, San Francisco	2026-02-28 17:50:00
13	William Ashford	william.a@gmail.com	555-0113	5 Manor Dr, Greenwich	2026-03-01 08:30:00
14	Amelia Hart	amelia.h@gmail.com	555-0114	12 Love St, Paris (TX)	2026-03-02 11:00:00
15	Jameson Cole	jameson.c@gmail.com	555-0115	404 Error Ave, Austin	2026-03-04 14:25:00
16	Harper Lane	harper.l@gmail.com	555-0116	67 Country Rd, Nashville	2026-03-05 09:15:00
17	Benjamin Frost	benjamin.f@gmail.com	555-0117	2 Winter St, Aspen	2026-03-07 10:45:00
18	Evelyn Stone	evelyn.s@gmail.com	555-0118	500 Granite Dr, Phoenix	2026-03-08 16:20:00
19	Alexander Knight	alexander.k@gmail.com	555-0119	1 Castle Way, Orlando	2026-03-10 12:00:00
21	Daniel Brooks	daniel.b@gmail.com	555-0121	34 River St, St. Louis	2026-03-14 08:45:00
22	Luna Lovegood	luna.l@gmail.com	555-0122	9 Rookery Dr, Ottery St Catchpole	2026-03-15 11:30:00
23	Sebastian Cain	sebastian.c@gmail.com	555-0123	666 Mystery Rd, New Orleans	2026-03-17 15:55:00
24	Grace Miller	grace.m@gmail.com	555-0124	14 Wheat Dr, Kansas City	2026-03-19 10:10:00
25	Henry Ford	henry.f@gmail.com	555-0125	1903 Assembly Ln, Dearborn	2026-03-20 09:00:00
26	Victoria Reign	victoria.r@gmail.com	555-0126	1 Buckingham Pl, London (KY)	2026-03-22 14:40:00
27	Samuel Adams	samuel.a@gmail.com	555-0127	1776 Freedom Rd, Boston	2026-03-24 12:20:00
28	Chloe Price	chloe.p@gmail.com	555-0128	201 Arcadia Bay, Oregon	2026-03-25 16:15:00
29	Owen Wright	owen.w@gmail.com	555-0129	88 Justice Blvd, New York	2026-03-27 10:00:00
30	Zoe Saldana	zoe.s@gmail.com	555-0130	52 Pandora Way, Los Angeles	2026-03-29 13:30:00
33	Dominic Barone	d.barone@ferrari.it	555-0131	12 Maranello Way, Italy	2026-04-01 09:00:00
34	Eleanor Shellstrop	eleanor.s@goodplace.com	555-0132	777 Architect Blvd, Phoenix	2026-04-03 11:30:00
35	Arthur Curry	a.curry@atlantis.gov	555-0133	1 Lighthouse Point, Maine	2026-04-05 14:15:00
36	Selina Kyle	cat@kyle-enterprises.com	555-0134	Penthouse A, Gotham Heights	2026-04-07 10:00:00
37	Tony Soprano	tony.s@satriales.com	555-0135	633 Deercrest Ln, New Jersey	2026-04-10 16:45:00
38	Walter White	w.white@pollos.com	555-0136	308 Negra Arroyo Lane, Albuquerque	2026-04-12 08:30:00
39	Diane Lockhart	diane.l@reddick.com	555-0137	120 LaSalle St, Chicago	2026-04-15 13:00:00
40	Kendall Roy	k.roy@waystar.com	555-0138	900 5th Ave, New York	2026-04-18 15:20:00
41	Lara Croft	lara@croftmanor.uk	555-0139	Croft Manor, Surrey	2026-04-20 09:00:00
43	Miranda Priestly	m.priestly@runway.com	555-0141	750 Madison Ave, New York	2026-04-25 14:00:00
44	Sherlock Holmes	s.holmes@221b.co.uk	555-0142	221B Baker St, London	2026-04-28 10:30:00
45	Saul Goodman	s.goodman@justice4all.com	555-0143	980 Montgomery Blvd, Albuquerque	2026-05-01 16:00:00
46	Peggy Carter	p.carter@shield.gov	555-0144	Secret Base 01, Washington DC	2026-05-02 09:15:00
47	Lex Luthor	l.luthor@lexcorp.com	555-0145	LexCorp Plaza, Metropolis	2026-05-03 13:00:00
48	Annalise Keating	a.keating@keatinglaw.com	555-0146	Central Ave, Philadelphia	2026-05-04 15:45:00
49	John Wick	j.wick@continental.com	555-0147	81 Beaver St, New York	2026-05-05 11:00:00
50	Olivia Pope	o.pope@opa.com	555-0148	1100 G St NW, Washington DC	2026-05-06 14:30:00
51	Don Draper	d.draper@scdp.com	555-0149	405 Madison Ave, New York	2026-05-07 10:00:00
52	Shiv Oberoy	s.roy@waystar.com	555-0150	TriBeCa Loft, New York	2026-05-08 12:00:00
55	Logan Sanders	logan@sanders.com	555-0101	200 Park Ave, NY	2026-05-14 22:03:43.411685
56	Dana Scott	scottie@pearson.com	555-0202	London Office, UK	2026-05-14 22:04:45.173627
57	Wilson Fisk	kingpin@nyc.gov	555-0303	Hell's Kitchen, NY	2026-05-14 22:05:32.1477
58	Sheila Sazs	sheila@columbia.edu	555-0404	Columbia University, NY	2026-05-14 22:06:20.14841
\.


--
-- Data for Name: court_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.court_dates (court_date_id, case_id, court_name, date, notes) FROM stdin;
1	1	U.S. District Court (SDNY)	2026-05-15	Initial hearing for Hedge Fund Audit.
2	2	Manhattan Housing Court	2026-05-18	Final eviction trial.
3	3	Delaware Court of Chancery	2026-06-02	Approval hearing for Tech Acquisition merger.
4	5	New York Criminal Court	2026-05-20	Plea bargaining session for DUI case.
6	9	New York Supreme Court	2026-06-15	Shareholder Lawsuit - Motion to dismiss.
7	10	Federal Building (NY)	2026-06-25	Mortgage Fraud sentencing hearing.
8	1	U.S. District Court (SDNY)	2026-07-05	Discovery status conference.
9	2	Manhattan Housing Court	2026-05-25	Compliance check for settlement terms.
10	13	Civil Court of the City of NY	2026-06-08	Pre-trial conference for Breach of Contract.
13	22	New York Supreme Court	2026-06-05	Motion for summary judgment in employment case.
14	25	Delaware Court of Chancery	2026-06-08	Expedited trial for shareholder injunction.
15	30	U.S. Tax Court	2026-06-10	Corporate tax evasion oral arguments.
16	35	Manhattan Housing Court	2026-06-12	Landlord-tenant mediation session.
17	40	Queens County Civil Court	2026-06-15	Personal injury pre-trial conference.
18	45	U.S. District Court (EDNY)	2026-06-16	Cybersecurity breach discovery hearing.
19	50	New York Criminal Court	2026-06-18	Arraignment for corporate fraud allegations.
20	55	Brooklyn Family Court	2026-06-19	Custody modification hearing.
21	60	U.S. District Court (SDNY)	2026-06-22	Class action certification hearing.
22	65	Manhattan Housing Court	2026-06-23	Lease violation evidentiary hearing.
23	70	New York Supreme Court	2026-06-25	Expert witness deposition for medical malpractice.
24	71	U.S. District Court (EDNY)	2026-06-26	Zoning dispute initial hearing.
26	77	Civil Court of the City of NY	2026-06-30	Breach of contract settlement conference.
27	78	U.S. District Court (SDNY)	2026-07-01	Maritime liability pre-trial motion.
29	82	New York Supreme Court	2026-07-06	IP infringement jury selection.
30	84	Civil Court of the City of NY	2026-07-07	Contract arbitration hearing.
31	86	U.S. District Court (EDNY)	2026-07-08	Royalty audit discovery status.
32	88	Manhattan Housing Court	2026-07-10	Compliance hearing for property repairs.
33	90	U.S. Tax Court	2026-07-13	Final arguments for tax audit defense.
34	93	New York Supreme Court	2026-07-14	Defamation trial opening statements.
35	95	U.S. District Court (SDNY)	2026-07-15	Supply chain litigation evidentiary hearing.
36	97	Brooklyn Civil Court	2026-07-16	Zoning appeal oral arguments.
37	99	Federal Building (NY)	2026-07-17	Securities fraud sentencing.
38	100	New York Supreme Court	2026-07-20	Likeness rights final verdict.
39	1	U.S. District Court (SDNY)	2026-07-21	Post-audit compliance review.
40	3	Delaware Court of Chancery	2026-07-22	Tech acquisition post-closing dispute.
42	13	Civil Court of the City of NY	2026-07-24	Breach of contract trial date.
43	19	Queens County Civil Court	2026-07-27	Real estate dispute mediation.
46	51	U.S. District Court (SDNY)	2026-07-30	Securities fraud pre-trial conference.
47	62	Brooklyn Civil Court	2026-07-31	Property line dispute site inspection report.
48	81	Detroit City Hall (Remote)	2026-07-31	Remote safety compliance status.
49	85	Texas District Court (Remote)	2026-07-31	Austin server recovery final order.
\.


--
-- Data for Name: lawyers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lawyers (lawyer_id, name, email, phone, specialization, joined_date) FROM stdin;
1	Alice Johnson	alice.johnson@lawfirm.com	555-1234	Criminal Law	2026-03-12 22:25:28.807526
2	Robert Smith	robert.smith@lawfirm.com	555-5678	Civil Law	2026-03-12 22:25:28.807526
3	Emma Brown	emma.brown@lawfirm.com	555-8765	Family Law	2026-03-12 22:25:28.807526
4	Mike Ross	mike.ross@specterlitt.com	555-2020	Pro Bono / Litigation	2026-04-01 09:00:00
5	Harvey Specter	harvey@specterlitt.com	555-2020	Civil Law	2026-04-01 09:00:00
7	Donna Paulsen	donna.p@specterlitt.com	555-1111	Legal Operations	2026-04-03 08:15:00
8	Rachel Zane	rachel.zane@specterlitt.com	555-3030	Research & Paralegal	2026-04-04 11:45:00
9	Katrina Bennett	katrina.b@specterlitt.com	555-5566	Corporate Law	2026-04-05 14:20:00
10	Samantha Wheeler	samantha.w@specterlitt.com	555-9900	Trial Advocacy	2026-04-06 16:00:00
11	Alex Williams	alex.w@specterlitt.com	555-7722	General Counsel	2026-04-07 13:10:00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (message_id, sender_id, receiver_id, message, created_at) FROM stdin;
1	4	1	Hey, Alice!	2026-05-17 13:32:00.553479
2	1	4	Hello, Mike!	2026-05-17 13:32:22.584555
3	4	1	How are you doing?	2026-05-17 13:32:39.713398
4	1	4	Very well!\nWhat about you?	2026-05-17 13:33:02.900075
5	4	1	I'm doing good too...	2026-05-17 13:33:19.181704
6	1	4	so wahts up???????	2026-05-17 14:25:30.329062
7	1	5	Heyyy King	2026-05-17 14:38:17.310216
8	5	1	Hi Alice	2026-05-17 14:39:12.041423
9	4	1	nm wbu	2026-05-17 18:26:42.492952
10	1	4	umm testing this app n fixing bugs	2026-05-17 18:33:43.077734
11	4	5	Hey partner, where you at?	2026-05-17 18:34:18.192295
12	5	4	at the game with lebron	2026-05-17 18:37:47.664414
13	4	5	lemme guess he begged you to come with him?	2026-05-17 18:38:12.750706
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, case_id, amount, payment_date, payment_method, payment_status, transaction_id, notes) FROM stdin;
1	1	5000.00	2026-04-27 21:40:58.082614+05	Wire Transfer	Completed	\N	Retainer for Hedge Fund Audit
2	2	1200.00	2026-04-27 21:40:58.082614+05	Credit Card	Completed	\N	Final settlement fee for Eviction case
3	3	15000.00	2026-04-27 21:40:58.082614+05	Wire Transfer	Pending	\N	Initial deposit for Tech Acquisition
4	4	3500.00	2026-04-27 21:40:58.082614+05	Check	Completed	\N	Consultation and filing fees
5	5	750.00	2026-04-27 21:40:58.082614+05	Credit Card	Failed	\N	Insufficient funds - follow up required
6	6	2500.00	2026-04-27 21:40:58.082614+05	Wire Transfer	Completed	\N	Prenuptial agreement flat fee
8	9	8000.00	2026-04-27 21:40:58.082614+05	Wire Transfer	Completed	\N	Quarterly billing for Shareholder suit
9	10	5500.00	2026-04-27 21:40:58.082614+05	Check	Completed	\N	Closing costs for Mortgage Fraud case
10	1	2000.00	2026-04-27 21:40:58.082614+05	Credit Card	Completed	\N	Additional discovery hours
11	1	125000.00	2026-04-10 10:00:00+05	Wire Transfer	Completed	TXN-9901	Initial retainer for Starlight Tech Merger
12	3	250000.00	2026-04-12 14:30:00+05	Wire Transfer	Completed	TXN-9902	Success fee for Retail Chain Buyout completion
14	13	45000.00	2026-04-18 11:00:00+05	Check	Completed	TXN-9904	Settlement payout for Source Code Copyright
15	17	95000.00	2026-04-20 16:45:00+05	Wire Transfer	Completed	TXN-9905	Zoning dispute litigation retainer
16	22	110000.00	2026-04-22 13:20:00+05	Wire Transfer	Pending	TXN-9906	Pending escrow for Sexual Harassment Defense
17	31	200000.00	2026-04-25 10:00:00+05	Wire Transfer	Completed	TXN-9907	Aviation Safety Lawsuit - Lead counsel fee
19	51	60000.00	2026-05-01 09:00:00+05	Wire Transfer	Completed	TXN-9909	Securities Fraud Defense - Monthly bill
20	60	150000.00	2026-05-02 11:45:00+05	Wire Transfer	Completed	TXN-9910	Export Control Compliance - Global audit fee
21	1	35000.00	2026-05-03 10:00:00+05	Wire Transfer	Completed	TXN-9911	Document review hours for Starlight Tech
22	5	25000.00	2026-05-03 14:00:00+05	Credit Card	Completed	TXN-9912	Shareholder Proxy Dispute - Emergency filing
23	10	40000.00	2026-05-04 12:00:00+05	Wire Transfer	Completed	TXN-9913	Cybercrime Defense - Forensic analysis fees
24	12	55000.00	2026-05-04 16:00:00+05	Check	Completed	TXN-9914	AI Algorithm Patent - USPTO filing costs
25	15	30000.00	2026-05-05 08:30:00+05	Wire Transfer	Completed	TXN-9915	Bio-Tech Trade Secret - Investigation deposit
26	19	80000.00	2026-05-05 13:00:00+05	Wire Transfer	Completed	TXN-9916	Luxury Condo Closing - Escrow management
27	24	45000.00	2026-05-06 10:00:00+05	Wire Transfer	Completed	TXN-9917	Unfair Dismissal Claim - Pre-trial prep
28	28	65000.00	2026-05-06 15:00:00+05	Check	Completed	TXN-9918	Defamation Libel Suit - Consultant fees
29	33	90000.00	2026-05-07 09:00:00+05	Wire Transfer	Completed	TXN-9919	Product Liability - Class action defense
30	37	50000.00	2026-05-07 14:00:00+05	Wire Transfer	Completed	TXN-9920	Maritime Salvage Claim - Initial deposit
31	41	120000.00	2026-05-08 11:00:00+05	Wire Transfer	Completed	TXN-9921	Divorce Asset Division - High-value art appraisal
32	48	35000.00	2026-05-08 15:30:00+05	Credit Card	Completed	TXN-9922	Privacy Data Breach - Notification management
33	53	42000.00	2026-05-09 10:00:00+05	Wire Transfer	Completed	TXN-9923	Telecommunications Licensing - Spectrum auction
34	58	28000.00	2026-05-09 14:00:00+05	Check	Completed	TXN-9924	Professional Negligence - Expert witness fees
35	63	110000.00	2026-05-10 12:00:00+05	Wire Transfer	Completed	TXN-9925	Sovereign Debt Dispute - International counsel
36	67	225000.00	2026-05-10 16:00:00+05	Wire Transfer	Completed	TXN-9926	Sports Franchise Sale - Closing commission
37	2	15000.00	2026-05-11 09:00:00+05	Wire Transfer	Completed	TXN-9927	Hedge fund restructuring - Phase 2
38	4	20000.00	2026-05-11 11:30:00+05	Credit Card	Completed	TXN-9928	Venture Capital Round B - Document drafting
39	6	18000.00	2026-05-11 14:00:00+05	Check	Completed	TXN-9929	Joint Venture Agreement - Negotiation fees
40	8	12000.00	2026-05-11 16:30:00+05	Credit Card	Failed	TXN-9930	Insufficient funds - DUI Appeal
41	11	22000.00	2026-05-12 08:00:00+05	Wire Transfer	Completed	TXN-9931	Witness Protection Liaison - Gov meeting fees
43	16	25000.00	2026-05-12 13:00:00+05	Wire Transfer	Completed	TXN-9933	Entertainment Licensing - Studio negotiation
44	20	19000.00	2026-05-12 15:30:00+05	Wire Transfer	Completed	TXN-9934	Eminent Domain Challenge - Filing fees
45	23	21000.00	2026-05-13 09:15:00+05	Credit Card	Completed	TXN-9935	Non-Compete Litigation - Court appearance
46	26	17000.00	2026-05-13 11:45:00+05	Check	Completed	TXN-9936	Employee Misclassification - Research hours
47	30	24000.00	2026-05-13 14:00:00+05	Wire Transfer	Completed	TXN-9937	Family Trust Formation - Legal setup
48	35	16000.00	2026-05-13 16:30:00+05	Wire Transfer	Completed	TXN-9938	Insurance Coverage Denial - Claims audit
49	39	29000.00	2026-05-14 08:45:00+05	Check	Completed	TXN-9939	Sports Contract Negotiation - Draft review
52	50	18500.00	2026-05-14 16:00:00+05	Check	Completed	TXN-9942	Entertainment Royalty Audit - Preliminary findings
53	55	23000.00	2026-05-15 09:00:00+05	Wire Transfer	Completed	TXN-9943	Child Custody Modification - Court prep
54	61	38000.00	2026-05-15 11:30:00+05	Wire Transfer	Completed	TXN-9944	Global IP Licensing - International filing
55	64	44000.00	2026-05-15 14:00:00+05	Wire Transfer	Completed	TXN-9945	Maritime Collision - Coast Guard liaison
57	70	78000.00	2026-05-16 10:00:00+05	Wire Transfer	Completed	TXN-9947	Space Law Compliance - Satellite launch permit
58	1	45000.00	2026-05-16 13:00:00+05	Wire Transfer	Completed	TXN-9948	Final closing bill - Starlight Merger
59	3	92000.00	2026-05-16 15:30:00+05	Wire Transfer	Completed	TXN-9949	Quarterly retainer - Retail Chain Buyout
61	71	45000.00	2026-04-12 10:00:00+05	Wire Transfer	Completed	TXN-A001	Retainer for Oak Ave Rezoning dispute
62	72	120000.00	2026-04-14 14:30:00+05	Wire Transfer	Completed	TXN-A002	Sophia Vance vs Gotham City - Legal fund
63	73	55000.00	2026-04-16 09:15:00+05	Check	Completed	TXN-A003	Star City Tech Patent filing fees
65	75	65000.00	2026-04-22 16:45:00+05	Wire Transfer	Pending	TXN-A005	Ethan Blackwood - Employment litigation deposit
66	76	48000.00	2026-04-24 13:20:00+05	Check	Completed	TXN-A006	Ava Montgomery - Eco-audit consultation
67	77	95000.00	2026-04-25 10:00:00+05	Wire Transfer	Completed	TXN-A007	Mason Wolfe - Breach of contract retainer
68	78	110000.00	2026-04-26 15:30:00+05	Wire Transfer	Completed	TXN-A008	Isabella Claire - Maritime liability settlement
69	79	42000.00	2026-04-28 09:00:00+05	Credit Card	Completed	TXN-A009	Lucas Halloway - Zoning modification fee
71	81	75000.00	2026-05-02 10:00:00+05	Wire Transfer	Completed	TXN-A011	Detroit Industrial Liability - Safety audit
72	82	62000.00	2026-05-02 14:00:00+05	Check	Completed	TXN-A012	Charlotte Webb - SF IP dispute retainer
73	83	140000.00	2026-05-03 12:00:00+05	Wire Transfer	Completed	TXN-A013	William Ashford - Greenwich Trust setup
74	84	35000.00	2026-05-03 16:00:00+05	Credit Card	Completed	TXN-A014	Amelia Hart - Paris TX Boutique contract fee
75	85	90000.00	2026-05-04 08:30:00+05	Wire Transfer	Pending	TXN-A015	Jameson Cole - Austin Server recovery fund
76	86	125000.00	2026-05-04 13:00:00+05	Wire Transfer	Completed	TXN-A016	Harper Lane - Nashville Royalty Audit success fee
77	87	58000.00	2026-05-05 10:00:00+05	Check	Completed	TXN-A017	Benjamin Frost - Aspen personal injury retainer
78	88	72000.00	2026-05-05 15:00:00+05	Wire Transfer	Completed	TXN-A018	Evelyn Stone - Phoenix development filing
79	89	160000.00	2026-05-06 09:00:00+05	Wire Transfer	Completed	TXN-A019	Alexander Knight - Orlando Merger finalization
80	90	85000.00	2026-05-06 14:00:00+05	Wire Transfer	Completed	TXN-A020	Scarlett O’Hara - Atlanta estate audit
82	92	47000.00	2026-05-07 15:30:00+05	Wire Transfer	Completed	TXN-A022	Luna Lovegood - Property rights consultation
83	93	105000.00	2026-05-08 10:00:00+05	Wire Transfer	Completed	TXN-A023	Sebastian Cain - Defamation defense retainer
84	94	98000.00	2026-05-08 14:00:00+05	Check	Completed	TXN-A024	Grace Miller - Agricultural contract settlement
85	95	66000.00	2026-05-09 12:00:00+05	Wire Transfer	Pending	TXN-A025	Henry Ford - Parts supplier litigation fund
86	96	130000.00	2026-05-09 16:00:00+05	Wire Transfer	Completed	TXN-A026	Victoria Reign - KY Inheritance legal fees
87	97	82000.00	2026-05-10 09:00:00+05	Check	Completed	TXN-A027	Samuel Adams - Boston Zoning appeal
89	99	155000.00	2026-05-10 14:00:00+05	Wire Transfer	Completed	TXN-A029	Owen Wright - NYC Securities Fraud defense
90	100	115000.00	2026-05-10 16:30:00+05	Wire Transfer	Completed	TXN-A030	Zoe Saldana - Likeness rights litigation
92	23	240000.00	2026-05-11 22:36:00+05	Wire Transfer	Completed	TXN-110239	Bail fees for drunk and drive case
93	89	11000.00	2026-05-14 14:24:00+05	Wire Transfer	Refunded	TXN-110345	PI's fee
\.


--
-- Name: appointments_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_appointment_id_seq', 42, true);


--
-- Name: case_documents_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.case_documents_document_id_seq', 1, false);


--
-- Name: cases_case_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cases_case_id_seq', 135, true);


--
-- Name: clients_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_client_id_seq', 58, true);


--
-- Name: court_dates_court_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.court_dates_court_date_id_seq', 51, true);


--
-- Name: lawyers_lawyer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lawyers_lawyer_id_seq', 13, true);


--
-- Name: messages_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_message_id_seq', 13, true);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 93, true);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (appointment_id);


--
-- Name: case_documents case_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_pkey PRIMARY KEY (document_id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (case_id);


--
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (client_id);


--
-- Name: court_dates court_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_dates
    ADD CONSTRAINT court_dates_pkey PRIMARY KEY (court_date_id);


--
-- Name: lawyers lawyers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lawyers
    ADD CONSTRAINT lawyers_email_key UNIQUE (email);


--
-- Name: lawyers lawyers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lawyers
    ADD CONSTRAINT lawyers_pkey PRIMARY KEY (lawyer_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: clients new_client_added; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER new_client_added AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.notify_new_client();


--
-- Name: appointments validate_appointment_date; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER validate_appointment_date BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.check_appointment_date();


--
-- Name: appointments appointments_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE;


--
-- Name: appointments appointments_lawyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_lawyer_id_fkey FOREIGN KEY (lawyer_id) REFERENCES public.lawyers(lawyer_id) ON DELETE CASCADE;


--
-- Name: case_documents case_documents_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id);


--
-- Name: cases cases_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(client_id) ON DELETE CASCADE;


--
-- Name: cases cases_lawyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_lawyer_id_fkey FOREIGN KEY (lawyer_id) REFERENCES public.lawyers(lawyer_id) ON DELETE CASCADE;


--
-- Name: court_dates court_dates_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.court_dates
    ADD CONSTRAINT court_dates_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.lawyers(lawyer_id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.lawyers(lawyer_id);


--
-- Name: payments payments_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(case_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict L6cHfllanLjj1DmfXYTcu77OU9U3kBXMOG3VYn2fx1pEzmTe74EVVO41QgjAccN

