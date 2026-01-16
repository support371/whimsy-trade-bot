CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portfolios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT 'Main Portfolio'::text NOT NULL,
    starting_balance numeric(18,2) DEFAULT 10000.00 NOT NULL,
    current_balance numeric(18,2) DEFAULT 10000.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    portfolio_id uuid NOT NULL,
    symbol text NOT NULL,
    side text NOT NULL,
    quantity numeric(18,8) NOT NULL,
    entry_price numeric(18,8) NOT NULL,
    exit_price numeric(18,8),
    pnl numeric(18,8),
    status text DEFAULT 'OPEN'::text NOT NULL,
    signal_confidence numeric(5,2),
    risk_score numeric(5,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    CONSTRAINT trades_side_check CHECK ((side = ANY (ARRAY['BUY'::text, 'SELL'::text]))),
    CONSTRAINT trades_status_check CHECK ((status = ANY (ARRAY['OPEN'::text, 'CLOSED'::text])))
);


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    risk_tolerance numeric(3,2) DEFAULT 0.5 NOT NULL,
    spread_stress_threshold numeric(5,4) DEFAULT 0.002 NOT NULL,
    volatility_sensitivity numeric(3,2) DEFAULT 0.5 NOT NULL,
    position_size_fraction numeric(3,2) DEFAULT 0.1 NOT NULL,
    auto_trade_enabled boolean DEFAULT false NOT NULL,
    sound_alerts_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watchlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    symbol text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_user_id_symbol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_symbol_key UNIQUE (user_id, symbol);


--
-- Name: portfolios update_portfolios_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: portfolios portfolios_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trades trades_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: watchlist watchlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: watchlist Users can add to their watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add to their watchlist" ON public.watchlist FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: portfolios Users can create their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own portfolios" ON public.portfolios FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_settings Users can create their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: trades Users can create trades in their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create trades in their portfolios" ON public.trades FOR INSERT WITH CHECK ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));


--
-- Name: portfolios Users can delete their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can delete their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own settings" ON public.user_settings FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: trades Users can delete trades from their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete trades from their portfolios" ON public.trades FOR DELETE USING ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));


--
-- Name: watchlist Users can remove from their watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove from their watchlist" ON public.watchlist FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: portfolios Users can update their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own portfolios" ON public.portfolios FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can update their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: trades Users can update trades in their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update trades in their portfolios" ON public.trades FOR UPDATE USING ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));


--
-- Name: portfolios Users can view their own portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own portfolios" ON public.portfolios FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_settings Users can view their own settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: watchlist Users can view their own watchlist; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: trades Users can view trades from their portfolios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view trades from their portfolios" ON public.trades FOR SELECT USING ((portfolio_id IN ( SELECT portfolios.id
   FROM public.portfolios
  WHERE (portfolios.user_id = auth.uid()))));


--
-- Name: portfolios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

--
-- Name: trades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: watchlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;