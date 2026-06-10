--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: business_language_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.business_language_enum AS ENUM (
    'en',
    'sr'
);


--
-- Name: business_supplier_language_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.business_supplier_language_enum AS ENUM (
    'en',
    'sr'
);


--
-- Name: change_request_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_request_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected',
    'revoked'
);


--
-- Name: employee_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.employee_role_enum AS ENUM (
    'manager',
    'basic'
);


--
-- Name: identity_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.identity_type_enum AS ENUM (
    'employee',
    'supplier',
    'business',
    'admin'
);


--
-- Name: meal_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meal_type_enum AS ENUM (
    'breakfast',
    'lunch',
    'dinner',
    'bread',
    'soup',
    'salad',
    'dessert'
);


--
-- Name: report_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.report_type_enum AS ENUM (
    'full',
    'delta'
);


--
-- Name: supplier_language_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.supplier_language_enum AS ENUM (
    'en',
    'sr'
);


--
-- Name: supplier_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.supplier_type_enum AS ENUM (
    'managed',
    'standalone'
);


--
-- Name: user_preferences_language_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_preferences_language_enum AS ENUM (
    'en',
    'sr'
);


--
-- Name: user_preferences_theme_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_preferences_theme_enum AS ENUM (
    'light',
    'dark',
    'system'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: business; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business (
    id character varying(26) NOT NULL,
    name character varying(100) NOT NULL,
    contact_email character varying(100) NOT NULL,
    contact_phone character varying(20),
    language public.business_language_enum DEFAULT 'en'::public.business_language_enum NOT NULL
);


--
-- Name: business_invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_invite (
    id character varying(26) NOT NULL,
    business_id character varying(26) NOT NULL,
    email character varying(255) NOT NULL,
    token character varying(36) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone
);


--
-- Name: business_supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_supplier (
    id character varying(26) NOT NULL,
    business_id character varying(26),
    supplier_id character varying(26),
    language public.business_supplier_language_enum DEFAULT 'en'::public.business_supplier_language_enum NOT NULL
);


--
-- Name: change_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_request (
    id character varying(26) NOT NULL,
    employee_id character varying(26) NOT NULL,
    meal_selection_id character varying(26),
    new_quantity integer,
    clear_selection boolean DEFAULT false NOT NULL,
    status public.change_request_status_enum NOT NULL,
    approved_by character varying(26),
    approved_at timestamp without time zone,
    new_menu_item_id character varying(26),
    meal_selection_window_id character varying(26) NOT NULL
);


--
-- Name: employee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee (
    id character varying(26) NOT NULL,
    name character varying(100) NOT NULL,
    role public.employee_role_enum DEFAULT 'basic'::public.employee_role_enum NOT NULL,
    business_id character varying(26) NOT NULL,
    identity_id character varying(26) NOT NULL
);


--
-- Name: extra_quantity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.extra_quantity (
    id character varying(26) NOT NULL,
    window_id character varying(26) NOT NULL,
    menu_item_id character varying(26) NOT NULL,
    quantity integer NOT NULL,
    guest_name character varying(255)
);


--
-- Name: identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identity (
    id character varying(26) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    type public.identity_type_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: meal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal (
    id character varying(26) NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    type public.meal_type_enum NOT NULL,
    price numeric(10,2),
    supplier_id character varying(26)
);


--
-- Name: meal_selection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_selection (
    id character varying(26) NOT NULL,
    employee_id character varying(26) NOT NULL,
    quantity integer,
    date date NOT NULL,
    menu_item_id character varying(26),
    meal_selection_window_id character varying(26) NOT NULL
);


--
-- Name: meal_selection_window; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_selection_window (
    id character varying(26) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    target_dates date[] NOT NULL,
    business_id character varying(26),
    is_locked boolean DEFAULT true NOT NULL,
    notify_on_deadline boolean DEFAULT false NOT NULL
);


--
-- Name: meal_selection_window_menu_periods_menu_period; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_selection_window_menu_periods_menu_period (
    meal_selection_window_id character varying(26) NOT NULL,
    menu_period_id character varying(26) NOT NULL
);


--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_item (
    id character varying(26) NOT NULL,
    price numeric,
    day date NOT NULL,
    menu_period_id character varying(26),
    meal_id character varying(26)
);


--
-- Name: menu_period; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_period (
    id character varying(26) NOT NULL,
    supplier_id character varying(26) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


--
-- Name: order_summary_send; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_summary_send (
    id character varying(26) NOT NULL,
    window_id character varying(26) NOT NULL,
    supplier_id character varying(26) NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    sent_by_employee_id character varying(26) NOT NULL,
    subject character varying(500) DEFAULT ''::character varying NOT NULL,
    html_content text DEFAULT ''::text NOT NULL
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id character varying(26) NOT NULL,
    identity_id character varying(26) NOT NULL,
    family_id character varying(26) NOT NULL,
    secret_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    is_revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier (
    id character varying(26) NOT NULL,
    name character varying(100) NOT NULL,
    type public.supplier_type_enum NOT NULL,
    email character varying(255),
    identity_id character varying(26),
    managing_business_id character varying(26),
    language public.supplier_language_enum DEFAULT 'en'::public.supplier_language_enum NOT NULL,
    CONSTRAINT "CHK_9548a3fa65e1d3fc200c2bc135" CHECK (((type <> 'standalone'::public.supplier_type_enum) OR (identity_id IS NOT NULL)))
);


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id character varying(26) NOT NULL,
    identity_id character varying(26) NOT NULL,
    theme public.user_preferences_theme_enum DEFAULT 'system'::public.user_preferences_theme_enum NOT NULL,
    language public.user_preferences_language_enum DEFAULT 'en'::public.user_preferences_language_enum NOT NULL
);


--
-- Name: business PK_0bd850da8dafab992e2e9b058e5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business
    ADD CONSTRAINT "PK_0bd850da8dafab992e2e9b058e5" PRIMARY KEY (id);


--
-- Name: meal_selection PK_179d944580a3a5c30c572621dc5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection
    ADD CONSTRAINT "PK_179d944580a3a5c30c572621dc5" PRIMARY KEY (id);


--
-- Name: extra_quantity PK_27c8e263aee39852be8727650f4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extra_quantity
    ADD CONSTRAINT "PK_27c8e263aee39852be8727650f4" PRIMARY KEY (id);


--
-- Name: supplier PK_2bc0d2cab6276144d2ff98a2828; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "PK_2bc0d2cab6276144d2ff98a2828" PRIMARY KEY (id);


--
-- Name: employee PK_3c2bc72f03fd5abbbc5ac169498; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY (id);


--
-- Name: meal_selection_window PK_4ba916b4f056a7a8bef3c37b778; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection_window
    ADD CONSTRAINT "PK_4ba916b4f056a7a8bef3c37b778" PRIMARY KEY (id);


--
-- Name: order_summary_send PK_505ad7ec92cb694598cd401a58e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary_send
    ADD CONSTRAINT "PK_505ad7ec92cb694598cd401a58e" PRIMARY KEY (id);


--
-- Name: meal_selection_window_menu_periods_menu_period PK_5c25f58828ccc8c0be64f13daff; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection_window_menu_periods_menu_period
    ADD CONSTRAINT "PK_5c25f58828ccc8c0be64f13daff" PRIMARY KEY (meal_selection_window_id, menu_period_id);


--
-- Name: business_invite PK_5d514f4df7a42b3fc8a9cc068ef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_invite
    ADD CONSTRAINT "PK_5d514f4df7a42b3fc8a9cc068ef" PRIMARY KEY (id);


--
-- Name: business_supplier PK_5fe35d0afc46fb686b3f1811046; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_supplier
    ADD CONSTRAINT "PK_5fe35d0afc46fb686b3f1811046" PRIMARY KEY (id);


--
-- Name: menu_item PK_722c4de0accbbfafc77947a8556; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "PK_722c4de0accbbfafc77947a8556" PRIMARY KEY (id);


--
-- Name: change_request PK_75687d06f07daedcb0de54d75e6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "PK_75687d06f07daedcb0de54d75e6" PRIMARY KEY (id);


--
-- Name: refresh_tokens PK_7d8bee0204106019488c4c50ffa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY (id);


--
-- Name: menu_period PK_949416dd65a21493bc7352cbf3f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_period
    ADD CONSTRAINT "PK_949416dd65a21493bc7352cbf3f" PRIMARY KEY (id);


--
-- Name: meal PK_ada510a5aba19e6bb500f8f7817; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal
    ADD CONSTRAINT "PK_ada510a5aba19e6bb500f8f7817" PRIMARY KEY (id);


--
-- Name: user_preferences PK_e8cfb5b31af61cd363a6b6d7c25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY (id);


--
-- Name: identity PK_ff16a44186b286d5e626178f726; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity
    ADD CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY (id);


--
-- Name: employee REL_09001ff86519ad171b4bd28e2b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "REL_09001ff86519ad171b4bd28e2b" UNIQUE (identity_id);


--
-- Name: supplier REL_fa0ac5304142ec1fbda2159a0a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "REL_fa0ac5304142ec1fbda2159a0a" UNIQUE (identity_id);


--
-- Name: identity UQ_0d9005670fa2ee7dcc48842f64d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identity
    ADD CONSTRAINT "UQ_0d9005670fa2ee7dcc48842f64d" UNIQUE (email);


--
-- Name: business UQ_4e823e693a59e413ac281bda705; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business
    ADD CONSTRAINT "UQ_4e823e693a59e413ac281bda705" UNIQUE (contact_email);


--
-- Name: business_invite UQ_5c0d7269d51b874530534b346a7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_invite
    ADD CONSTRAINT "UQ_5c0d7269d51b874530534b346a7" UNIQUE (token);


--
-- Name: business_supplier UQ_business_supplier_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_supplier
    ADD CONSTRAINT "UQ_business_supplier_pair" UNIQUE (business_id, supplier_id);


--
-- Name: business UQ_c6894e962b80bc10a694c0271e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business
    ADD CONSTRAINT "UQ_c6894e962b80bc10a694c0271e2" UNIQUE (name);


--
-- Name: user_preferences UQ_cd44f8055e45bb603b4d12515f6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT "UQ_cd44f8055e45bb603b4d12515f6" UNIQUE (identity_id);


--
-- Name: menu_item UQ_menu_item_period_meal_day; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "UQ_menu_item_period_meal_day" UNIQUE (menu_period_id, meal_id, day);


--
-- Name: IDX_0029ee78c119475746185ae09e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0029ee78c119475746185ae09e" ON public.meal_selection_window_menu_periods_menu_period USING btree (menu_period_id);


--
-- Name: IDX_aa3b9dc2e5f4d948f77a7a6f4a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_aa3b9dc2e5f4d948f77a7a6f4a" ON public.meal_selection_window_menu_periods_menu_period USING btree (meal_selection_window_id);


--
-- Name: IDX_change_request_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_change_request_employee_id" ON public.change_request USING btree (employee_id);


--
-- Name: IDX_change_request_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_change_request_status" ON public.change_request USING btree (status);


--
-- Name: IDX_meal_selection_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_meal_selection_date" ON public.meal_selection USING btree (date);


--
-- Name: IDX_meal_selection_employee_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_meal_selection_employee_id" ON public.meal_selection USING btree (employee_id);


--
-- Name: IDX_meal_selection_window_business_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_meal_selection_window_business_id" ON public.meal_selection_window USING btree (business_id);


--
-- Name: IDX_menu_item_meal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_menu_item_meal_id" ON public.menu_item USING btree (meal_id);


--
-- Name: IDX_menu_item_menu_period_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_menu_item_menu_period_id" ON public.menu_item USING btree (menu_period_id);


--
-- Name: IDX_refresh_token_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refresh_token_family_id" ON public.refresh_tokens USING btree (family_id);


--
-- Name: IDX_refresh_token_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refresh_token_identity_id" ON public.refresh_tokens USING btree (identity_id);


--
-- Name: meal_selection_window_menu_periods_menu_period FK_0029ee78c119475746185ae09ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection_window_menu_periods_menu_period
    ADD CONSTRAINT "FK_0029ee78c119475746185ae09ea" FOREIGN KEY (menu_period_id) REFERENCES public.menu_period(id);


--
-- Name: employee FK_09001ff86519ad171b4bd28e2b4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "FK_09001ff86519ad171b4bd28e2b4" FOREIGN KEY (identity_id) REFERENCES public.identity(id);


--
-- Name: meal_selection FK_113aac64ed8ba06d9773e46d902; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection
    ADD CONSTRAINT "FK_113aac64ed8ba06d9773e46d902" FOREIGN KEY (meal_selection_window_id) REFERENCES public.meal_selection_window(id);


--
-- Name: change_request FK_1a4fd6954e4166be24b7d45ed45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "FK_1a4fd6954e4166be24b7d45ed45" FOREIGN KEY (meal_selection_id) REFERENCES public.meal_selection(id);


--
-- Name: menu_item FK_1b3bca72edca6e0c0a6e5eaeef5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "FK_1b3bca72edca6e0c0a6e5eaeef5" FOREIGN KEY (menu_period_id) REFERENCES public.menu_period(id) ON DELETE CASCADE;


--
-- Name: menu_period FK_26e2487be427c50cbb37dc04c1b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_period
    ADD CONSTRAINT "FK_26e2487be427c50cbb37dc04c1b" FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: change_request FK_2d51524fb79aa70f7a8a9cd3b5c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "FK_2d51524fb79aa70f7a8a9cd3b5c" FOREIGN KEY (meal_selection_window_id) REFERENCES public.meal_selection_window(id);


--
-- Name: change_request FK_36319cacdadc5f601fceb934560; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "FK_36319cacdadc5f601fceb934560" FOREIGN KEY (new_menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: extra_quantity FK_3aa75a320cefc0b69771eca0764; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extra_quantity
    ADD CONSTRAINT "FK_3aa75a320cefc0b69771eca0764" FOREIGN KEY (window_id) REFERENCES public.meal_selection_window(id);


--
-- Name: refresh_tokens FK_3bb5d0f23db3b03f9be5e16295f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "FK_3bb5d0f23db3b03f9be5e16295f" FOREIGN KEY (identity_id) REFERENCES public.identity(id);


--
-- Name: extra_quantity FK_63af84207d9951eda5e4d0ed65f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extra_quantity
    ADD CONSTRAINT "FK_63af84207d9951eda5e4d0ed65f" FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: employee FK_6e0822ef6f0a0adb541c1aa31df; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT "FK_6e0822ef6f0a0adb541c1aa31df" FOREIGN KEY (business_id) REFERENCES public.business(id);


--
-- Name: business_supplier FK_70d8544864cfefbaa31fc73fa0e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_supplier
    ADD CONSTRAINT "FK_70d8544864cfefbaa31fc73fa0e" FOREIGN KEY (business_id) REFERENCES public.business(id);


--
-- Name: business_invite FK_8ec5e935e51a3830f9b4f3d8613; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_invite
    ADD CONSTRAINT "FK_8ec5e935e51a3830f9b4f3d8613" FOREIGN KEY (business_id) REFERENCES public.business(id);


--
-- Name: order_summary_send FK_983a345789be130c9f2be2a999a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary_send
    ADD CONSTRAINT "FK_983a345789be130c9f2be2a999a" FOREIGN KEY (sent_by_employee_id) REFERENCES public.employee(id);


--
-- Name: business_supplier FK_9bd5f6b6e8329758c38d783c6f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_supplier
    ADD CONSTRAINT "FK_9bd5f6b6e8329758c38d783c6f4" FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: menu_item FK_a6089c3a1aaf9890be3a304297b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT "FK_a6089c3a1aaf9890be3a304297b" FOREIGN KEY (meal_id) REFERENCES public.meal(id);


--
-- Name: change_request FK_a9c1e72d5a024750768890bf24b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "FK_a9c1e72d5a024750768890bf24b" FOREIGN KEY (employee_id) REFERENCES public.employee(id);


--
-- Name: meal_selection_window_menu_periods_menu_period FK_aa3b9dc2e5f4d948f77a7a6f4a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection_window_menu_periods_menu_period
    ADD CONSTRAINT "FK_aa3b9dc2e5f4d948f77a7a6f4a7" FOREIGN KEY (meal_selection_window_id) REFERENCES public.meal_selection_window(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_summary_send FK_ad644eedb80d3db2c87d79bcd5e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary_send
    ADD CONSTRAINT "FK_ad644eedb80d3db2c87d79bcd5e" FOREIGN KEY (window_id) REFERENCES public.meal_selection_window(id);


--
-- Name: change_request FK_af54b3317bdfdb782e39ebce25a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_request
    ADD CONSTRAINT "FK_af54b3317bdfdb782e39ebce25a" FOREIGN KEY (approved_by) REFERENCES public.employee(id);


--
-- Name: meal_selection FK_c3edc0b314c6ebfb2a8a2747e50; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection
    ADD CONSTRAINT "FK_c3edc0b314c6ebfb2a8a2747e50" FOREIGN KEY (employee_id) REFERENCES public.employee(id);


--
-- Name: user_preferences FK_cd44f8055e45bb603b4d12515f6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT "FK_cd44f8055e45bb603b4d12515f6" FOREIGN KEY (identity_id) REFERENCES public.identity(id);


--
-- Name: supplier FK_d6bd3cfd718fe8fb0d90c7ab85e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "FK_d6bd3cfd718fe8fb0d90c7ab85e" FOREIGN KEY (managing_business_id) REFERENCES public.business(id);


--
-- Name: meal FK_df96bebae6249ebce8b13cf63b8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal
    ADD CONSTRAINT "FK_df96bebae6249ebce8b13cf63b8" FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: order_summary_send FK_e5685ddc46af5bd66108e6c7674; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_summary_send
    ADD CONSTRAINT "FK_e5685ddc46af5bd66108e6c7674" FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: meal_selection FK_f8bb895cb2758d16164048cd609; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection
    ADD CONSTRAINT "FK_f8bb895cb2758d16164048cd609" FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: supplier FK_fa0ac5304142ec1fbda2159a0a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "FK_fa0ac5304142ec1fbda2159a0a2" FOREIGN KEY (identity_id) REFERENCES public.identity(id);


--
-- Name: meal_selection_window FK_feddb931fe33694b5bd0b453831; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_selection_window
    ADD CONSTRAINT "FK_feddb931fe33694b5bd0b453831" FOREIGN KEY (business_id) REFERENCES public.business(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

