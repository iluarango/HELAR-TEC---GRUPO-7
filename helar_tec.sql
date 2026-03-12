--
-- PostgreSQL database dump
--

\restrict aCzyyVXF5uZc0sFqVnJXIbZMt06ehujO2xkXIr4YAe8cMynd5dFHgf03DgH0jFD

-- Dumped from database version 17.8
-- Dumped by pg_dump version 17.8

-- Started on 2026-03-12 03:20:44

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
-- TOC entry 943 (class 1247 OID 16703)
-- Name: estado_compra_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_compra_enum AS ENUM (
    'pendiente',
    'completada',
    'cancelada'
);


ALTER TYPE public.estado_compra_enum OWNER TO postgres;

--
-- TOC entry 967 (class 1247 OID 16861)
-- Name: estado_gasto_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_gasto_enum AS ENUM (
    'pendiente',
    'pagado'
);


ALTER TYPE public.estado_gasto_enum OWNER TO postgres;

--
-- TOC entry 937 (class 1247 OID 16690)
-- Name: estado_insumo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_insumo_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_insumo_enum OWNER TO postgres;

--
-- TOC entry 949 (class 1247 OID 16787)
-- Name: estado_pedido_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pedido_enum AS ENUM (
    'pendiente',
    'entregado'
);


ALTER TYPE public.estado_pedido_enum OWNER TO postgres;

--
-- TOC entry 946 (class 1247 OID 16740)
-- Name: estado_producto_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_producto_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_producto_enum OWNER TO postgres;

--
-- TOC entry 940 (class 1247 OID 16697)
-- Name: estado_proveedor_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_proveedor_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_proveedor_enum OWNER TO postgres;

--
-- TOC entry 931 (class 1247 OID 16655)
-- Name: tipo_insumo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_insumo_enum AS ENUM (
    'Saborizantes',
    'Lácteos',
    'Frutas',
    'Granos/cereales',
    'Endulzantes'
);


ALTER TYPE public.tipo_insumo_enum OWNER TO postgres;

--
-- TOC entry 934 (class 1247 OID 16666)
-- Name: unidad_medida_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.unidad_medida_enum AS ENUM (
    'L',
    'kg',
    'g',
    'ml',
    'Unidades',
    'Cajas',
    'Paquetes'
);


ALTER TYPE public.unidad_medida_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 253 (class 1259 OID 16835)
-- Name: adicionales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adicionales (
    idadicional integer NOT NULL,
    nombre character varying(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    estado character varying(10) DEFAULT 'activo'::character varying
);


ALTER TABLE public.adicionales OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16834)
-- Name: adicionales_idadicional_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adicionales_idadicional_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adicionales_idadicional_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 252
-- Name: adicionales_idadicional_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adicionales_idadicional_seq OWNED BY public.adicionales.idadicional;


--
-- TOC entry 243 (class 1259 OID 16570)
-- Name: archivos_generados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archivos_generados (
    idarchivo integer NOT NULL,
    nombrearchivo character varying(100) NOT NULL,
    tipoarchivo character varying(20) NOT NULL,
    fechageneracion timestamp without time zone NOT NULL,
    idusuario integer NOT NULL
);


ALTER TABLE public.archivos_generados OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16569)
-- Name: archivos_generados_idarchivo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.archivos_generados_idarchivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.archivos_generados_idarchivo_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 242
-- Name: archivos_generados_idarchivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.archivos_generados_idarchivo_seq OWNED BY public.archivos_generados.idarchivo;


--
-- TOC entry 247 (class 1259 OID 16797)
-- Name: categorias_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_producto (
    idcategoria integer NOT NULL,
    nombrecategoria character varying(50) NOT NULL,
    estado public.estado_producto_enum DEFAULT 'activo'::public.estado_producto_enum
);


ALTER TABLE public.categorias_producto OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16796)
-- Name: categorias_producto_idcategoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_producto_idcategoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_producto_idcategoria_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 246
-- Name: categorias_producto_idcategoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_producto_idcategoria_seq OWNED BY public.categorias_producto.idcategoria;


--
-- TOC entry 231 (class 1259 OID 16474)
-- Name: compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compras (
    idcompra integer NOT NULL,
    fechacompra date NOT NULL,
    idproveedor integer NOT NULL,
    totalcompra numeric(10,2) DEFAULT 0
);


ALTER TABLE public.compras OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16473)
-- Name: compras_idcompra_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compras_idcompra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compras_idcompra_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 230
-- Name: compras_idcompra_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compras_idcompra_seq OWNED BY public.compras.idcompra;


--
-- TOC entry 233 (class 1259 OID 16486)
-- Name: detalle_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_compra (
    iddetallecompra integer NOT NULL,
    idcompra integer NOT NULL,
    idinsumo integer NOT NULL,
    cantidadcompra integer NOT NULL,
    preciounitario numeric(10,2) NOT NULL,
    fechacaducidad date
);


ALTER TABLE public.detalle_compra OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16485)
-- Name: detalle_compra_iddetallecompra_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_compra_iddetallecompra_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_compra_iddetallecompra_seq OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 232
-- Name: detalle_compra_iddetallecompra_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_compra_iddetallecompra_seq OWNED BY public.detalle_compra.iddetallecompra;


--
-- TOC entry 229 (class 1259 OID 16457)
-- Name: detalle_pedido; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido (
    iddetallepedido integer NOT NULL,
    idpedido integer NOT NULL,
    toppings text,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    subtotal numeric(10,2),
    idproducto integer,
    sabores text,
    salsas text
);


ALTER TABLE public.detalle_pedido OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 16843)
-- Name: detalle_pedido_adicionales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido_adicionales (
    id integer NOT NULL,
    iddetallepedido integer NOT NULL,
    idadicional integer NOT NULL,
    cantidad integer DEFAULT 1
);


ALTER TABLE public.detalle_pedido_adicionales OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16842)
-- Name: detalle_pedido_adicionales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_adicionales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_adicionales_id_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 254
-- Name: detalle_pedido_adicionales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_adicionales_id_seq OWNED BY public.detalle_pedido_adicionales.id;


--
-- TOC entry 228 (class 1259 OID 16456)
-- Name: detalle_pedido_iddetallepedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_iddetallepedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_iddetallepedido_seq OWNER TO postgres;

--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 228
-- Name: detalle_pedido_iddetallepedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_iddetallepedido_seq OWNED BY public.detalle_pedido.iddetallepedido;


--
-- TOC entry 251 (class 1259 OID 16818)
-- Name: detalle_pedido_sabor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido_sabor (
    iddetallepedidosabor integer NOT NULL,
    iddetallepedido integer NOT NULL,
    idsabor integer NOT NULL
);


ALTER TABLE public.detalle_pedido_sabor OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16817)
-- Name: detalle_pedido_sabor_iddetallepedidosabor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_pedido_sabor_iddetallepedidosabor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pedido_sabor_iddetallepedidosabor_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 250
-- Name: detalle_pedido_sabor_iddetallepedidosabor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_pedido_sabor_iddetallepedidosabor_seq OWNED BY public.detalle_pedido_sabor.iddetallepedidosabor;


--
-- TOC entry 237 (class 1259 OID 16520)
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    idfactura integer NOT NULL,
    direccionfactura character varying(150) DEFAULT NULL::character varying,
    fechafactura date NOT NULL,
    idventa integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    metodopago character varying(50) NOT NULL,
    adicionales text,
    idusuario integer NOT NULL
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16519)
-- Name: facturas_idfactura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_idfactura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_idfactura_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 236
-- Name: facturas_idfactura_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_idfactura_seq OWNED BY public.facturas.idfactura;


--
-- TOC entry 239 (class 1259 OID 16540)
-- Name: gastos_operativos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gastos_operativos (
    idgastooperativo integer NOT NULL,
    fechagasto date NOT NULL,
    categoriagasto character varying(50) NOT NULL,
    montogasto numeric(10,2) NOT NULL,
    metodopago character varying(50),
    fechavencimiento date,
    estadogasto public.estado_gasto_enum NOT NULL,
    idusuario integer NOT NULL
);


ALTER TABLE public.gastos_operativos OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16539)
-- Name: gastos_operativos_idgastooperativo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gastos_operativos_idgastooperativo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gastos_operativos_idgastooperativo_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 238
-- Name: gastos_operativos_idgastooperativo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gastos_operativos_idgastooperativo_seq OWNED BY public.gastos_operativos.idgastooperativo;


--
-- TOC entry 225 (class 1259 OID 16438)
-- Name: insumos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insumos (
    idinsumo integer NOT NULL,
    nombreinsumo character varying(100) NOT NULL,
    tipoinsumo public.tipo_insumo_enum NOT NULL,
    stock integer NOT NULL,
    stockminimo integer NOT NULL,
    unidadmedida public.unidad_medida_enum NOT NULL,
    fechacaducidad date,
    estado public.estado_insumo_enum DEFAULT 'activo'::public.estado_insumo_enum
);


ALTER TABLE public.insumos OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16437)
-- Name: insumos_idinsumo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.insumos_idinsumo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insumos_idinsumo_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 224
-- Name: insumos_idinsumo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.insumos_idinsumo_seq OWNED BY public.insumos.idinsumo;


--
-- TOC entry 241 (class 1259 OID 16552)
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    idmovimiento integer NOT NULL,
    idinsumo integer NOT NULL,
    cantidadmovimiento integer NOT NULL,
    fechamovimiento timestamp without time zone NOT NULL,
    motivomovimiento character varying(100) DEFAULT NULL::character varying,
    idusuario integer NOT NULL
);


ALTER TABLE public.movimientos_inventario OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16551)
-- Name: movimientos_inventario_idmovimiento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_idmovimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movimientos_inventario_idmovimiento_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 240
-- Name: movimientos_inventario_idmovimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_idmovimiento_seq OWNED BY public.movimientos_inventario.idmovimiento;


--
-- TOC entry 227 (class 1259 OID 16445)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    idpedido integer NOT NULL,
    fechapedido timestamp without time zone NOT NULL,
    estadopedido public.estado_pedido_enum DEFAULT 'pendiente'::public.estado_pedido_enum NOT NULL,
    idusuario integer NOT NULL
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16444)
-- Name: pedidos_idpedido_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_idpedido_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_idpedido_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 226
-- Name: pedidos_idpedido_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_idpedido_seq OWNED BY public.pedidos.idpedido;


--
-- TOC entry 245 (class 1259 OID 16590)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    idproducto integer NOT NULL,
    nombreproducto character varying(100) NOT NULL,
    descripcionproducto text,
    preciobase numeric(10,2) NOT NULL,
    estado public.estado_producto_enum DEFAULT 'activo'::public.estado_producto_enum,
    idcategoria integer NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16589)
-- Name: productos_idproducto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_idproducto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_idproducto_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 244
-- Name: productos_idproducto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_idproducto_seq OWNED BY public.productos.idproducto;


--
-- TOC entry 223 (class 1259 OID 16428)
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    idproveedor integer NOT NULL,
    nombreproveedor character varying(100) NOT NULL,
    contactoproveedor character varying(100) DEFAULT NULL::character varying,
    telefonoproveedor character varying(20) DEFAULT NULL::character varying,
    correoproveedor character varying(100) DEFAULT NULL::character varying,
    estado public.estado_proveedor_enum DEFAULT 'activo'::public.estado_proveedor_enum
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16427)
-- Name: proveedores_idproveedor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_idproveedor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_idproveedor_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 222
-- Name: proveedores_idproveedor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_idproveedor_seq OWNED BY public.proveedores.idproveedor;


--
-- TOC entry 218 (class 1259 OID 16389)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    idrol integer NOT NULL,
    nombrerol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: roles_idrol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_idrol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_idrol_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_idrol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_idrol_seq OWNED BY public.roles.idrol;


--
-- TOC entry 249 (class 1259 OID 16805)
-- Name: sabores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sabores (
    idsabor integer NOT NULL,
    nombresabor character varying(50) NOT NULL,
    estado public.estado_producto_enum DEFAULT 'activo'::public.estado_producto_enum
);


ALTER TABLE public.sabores OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16804)
-- Name: sabores_idsabor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sabores_idsabor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sabores_idsabor_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 248
-- Name: sabores_idsabor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sabores_idsabor_seq OWNED BY public.sabores.idsabor;


--
-- TOC entry 257 (class 1259 OID 16870)
-- Name: salsas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salsas (
    idsalsa integer NOT NULL,
    nombresalsa character varying(100) NOT NULL,
    estado character varying(20) DEFAULT 'activo'::character varying,
    CONSTRAINT salsas_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'inactivo'::character varying])::text[])))
);


ALTER TABLE public.salsas OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16869)
-- Name: salsas_idsalsa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salsas_idsalsa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salsas_idsalsa_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 256
-- Name: salsas_idsalsa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salsas_idsalsa_seq OWNED BY public.salsas.idsalsa;


--
-- TOC entry 221 (class 1259 OID 16412)
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_rol (
    idusuario integer NOT NULL,
    idrol integer NOT NULL
);


ALTER TABLE public.usuario_rol OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16398)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    idusuario integer NOT NULL,
    nombreusuario character varying(100) NOT NULL,
    correousuario character varying(100) NOT NULL,
    contrasenausuario character varying(255) NOT NULL,
    estado character varying DEFAULT 'activo'::character varying,
    fecharegistro date DEFAULT CURRENT_DATE
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16397)
-- Name: usuarios_idusuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_idusuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_idusuario_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_idusuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_idusuario_seq OWNED BY public.usuarios.idusuario;


--
-- TOC entry 235 (class 1259 OID 16503)
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    idventa integer NOT NULL,
    fechaventa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    idpedido integer NOT NULL,
    idusuario integer NOT NULL,
    totalventa numeric(10,2)
);


ALTER TABLE public.ventas OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16502)
-- Name: ventas_idventa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_idventa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ventas_idventa_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 234
-- Name: ventas_idventa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_idventa_seq OWNED BY public.ventas.idventa;


--
-- TOC entry 4897 (class 2604 OID 16838)
-- Name: adicionales idadicional; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adicionales ALTER COLUMN idadicional SET DEFAULT nextval('public.adicionales_idadicional_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 16573)
-- Name: archivos_generados idarchivo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archivos_generados ALTER COLUMN idarchivo SET DEFAULT nextval('public.archivos_generados_idarchivo_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 16800)
-- Name: categorias_producto idcategoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_producto ALTER COLUMN idcategoria SET DEFAULT nextval('public.categorias_producto_idcategoria_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 16477)
-- Name: compras idcompra; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras ALTER COLUMN idcompra SET DEFAULT nextval('public.compras_idcompra_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 16489)
-- Name: detalle_compra iddetallecompra; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compra ALTER COLUMN iddetallecompra SET DEFAULT nextval('public.detalle_compra_iddetallecompra_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 16460)
-- Name: detalle_pedido iddetallepedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido ALTER COLUMN iddetallepedido SET DEFAULT nextval('public.detalle_pedido_iddetallepedido_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 16846)
-- Name: detalle_pedido_adicionales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_adicionales ALTER COLUMN id SET DEFAULT nextval('public.detalle_pedido_adicionales_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16821)
-- Name: detalle_pedido_sabor iddetallepedidosabor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_sabor ALTER COLUMN iddetallepedidosabor SET DEFAULT nextval('public.detalle_pedido_sabor_iddetallepedidosabor_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 16523)
-- Name: facturas idfactura; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN idfactura SET DEFAULT nextval('public.facturas_idfactura_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 16543)
-- Name: gastos_operativos idgastooperativo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos_operativos ALTER COLUMN idgastooperativo SET DEFAULT nextval('public.gastos_operativos_idgastooperativo_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 16441)
-- Name: insumos idinsumo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos ALTER COLUMN idinsumo SET DEFAULT nextval('public.insumos_idinsumo_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 16555)
-- Name: movimientos_inventario idmovimiento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN idmovimiento SET DEFAULT nextval('public.movimientos_inventario_idmovimiento_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 16448)
-- Name: pedidos idpedido; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN idpedido SET DEFAULT nextval('public.pedidos_idpedido_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16593)
-- Name: productos idproducto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN idproducto SET DEFAULT nextval('public.productos_idproducto_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 16431)
-- Name: proveedores idproveedor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN idproveedor SET DEFAULT nextval('public.proveedores_idproveedor_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 16392)
-- Name: roles idrol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN idrol SET DEFAULT nextval('public.roles_idrol_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16808)
-- Name: sabores idsabor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sabores ALTER COLUMN idsabor SET DEFAULT nextval('public.sabores_idsabor_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 16873)
-- Name: salsas idsalsa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salsas ALTER COLUMN idsalsa SET DEFAULT nextval('public.salsas_idsalsa_seq'::regclass);


--
-- TOC entry 4866 (class 2604 OID 16401)
-- Name: usuarios idusuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN idusuario SET DEFAULT nextval('public.usuarios_idusuario_seq'::regclass);


--
-- TOC entry 4882 (class 2604 OID 16506)
-- Name: ventas idventa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN idventa SET DEFAULT nextval('public.ventas_idventa_seq'::regclass);


--
-- TOC entry 5152 (class 0 OID 16835)
-- Dependencies: 253
-- Data for Name: adicionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adicionales (idadicional, nombre, precio, estado) FROM stdin;
4	Salsa de chocolate	800.00	activo
5	Chantilly	2000.00	activo
6	Nutella	1000.00	activo
\.


--
-- TOC entry 5142 (class 0 OID 16570)
-- Dependencies: 243
-- Data for Name: archivos_generados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.archivos_generados (idarchivo, nombrearchivo, tipoarchivo, fechageneracion, idusuario) FROM stdin;
15	reporte-2026-03-12-04-51-46.pdf	PDF	2026-03-11 23:51:46.103763	1
16	reporte-2026-03-12-04-57-56.pdf	PDF	2026-03-11 23:57:56.955367	1
\.


--
-- TOC entry 5146 (class 0 OID 16797)
-- Dependencies: 247
-- Data for Name: categorias_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias_producto (idcategoria, nombrecategoria, estado) FROM stdin;
1	Copas	activo
2	Waffles	activo
3	Ensaladas de frutas	activo
4	Salpicones	activo
5	Brownies	activo
6	Bebidas	activo
7	Malteadas	activo
8	Infantiles	activo
9	Obleas	activo
\.


--
-- TOC entry 5130 (class 0 OID 16474)
-- Dependencies: 231
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (idcompra, fechacompra, idproveedor, totalcompra) FROM stdin;
1	2026-03-06	2	15.00
2	2026-03-06	1	150.00
3	2026-03-07	1	180.00
4	2026-03-09	3	5000.00
5	2026-03-11	1	200000.00
\.


--
-- TOC entry 5132 (class 0 OID 16486)
-- Dependencies: 233
-- Data for Name: detalle_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_compra (iddetallecompra, idcompra, idinsumo, cantidadcompra, preciounitario, fechacaducidad) FROM stdin;
1	1	1	3	5.00	\N
2	2	4	3	50.00	\N
3	3	11	2	90.00	2026-03-26
4	4	1	1	5000.00	2026-03-14
5	5	4	20	10000.00	2026-03-16
\.


--
-- TOC entry 5128 (class 0 OID 16457)
-- Dependencies: 229
-- Data for Name: detalle_pedido; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido (iddetallepedido, idpedido, toppings, cantidad, precio, subtotal, idproducto, sabores, salsas) FROM stdin;
9	10	\N	1	15000.00	17000.00	1	\N	\N
10	11	\N	1	15000.00	17800.00	1	Chispitas, Veteado de mora	\N
11	12	\N	1	20000.00	22800.00	2	Chocolate, Veteado de mora	\N
12	12	\N	1	20000.00	21000.00	2	Chocolate, Cookies and cream	\N
13	12	\N	1	15000.00	17800.00	1	Chispitas, Ron con pasas	\N
14	13	\N	1	15000.00	17800.00	1	Chocolate, Cookies and cream	\N
15	14	\N	1	17000.00	19800.00	4	\N	\N
16	15	\N	1	16000.00	17000.00	5	Chocolate, Mora	\N
\.


--
-- TOC entry 5154 (class 0 OID 16843)
-- Dependencies: 255
-- Data for Name: detalle_pedido_adicionales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido_adicionales (id, iddetallepedido, idadicional, cantidad) FROM stdin;
1	9	5	1
2	10	5	1
3	10	4	1
4	11	5	1
5	11	4	1
6	12	6	1
7	13	4	1
8	13	5	1
9	14	4	1
10	14	5	1
11	15	4	1
12	15	5	1
13	16	6	1
\.


--
-- TOC entry 5150 (class 0 OID 16818)
-- Dependencies: 251
-- Data for Name: detalle_pedido_sabor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido_sabor (iddetallepedidosabor, iddetallepedido, idsabor) FROM stdin;
\.


--
-- TOC entry 5136 (class 0 OID 16520)
-- Dependencies: 237
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (idfactura, direccionfactura, fechafactura, idventa, subtotal, total, metodopago, adicionales, idusuario) FROM stdin;
1	CR 34 CL 116 E - 7	2026-03-09	8	17800.00	17800.00	efectivo	Ninguna	16
2	CR 34 CL 116 E - 7	2026-03-09	10	61600.00	61600.00	efectivo	Ninguna	16
3	CR 34 CL 116 E - 7	2026-03-10	11	17800.00	17800.00	efectivo	Ninguna	16
4	CR 34 CL 116 E - 7	2026-03-10	12	19800.00	19800.00	efectivo	Ninguna	16
5	CR 34 CL 116 E - 7	2026-03-11	13	17000.00	17000.00	efectivo	Ninguna	16
\.


--
-- TOC entry 5138 (class 0 OID 16540)
-- Dependencies: 239
-- Data for Name: gastos_operativos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gastos_operativos (idgastooperativo, fechagasto, categoriagasto, montogasto, metodopago, fechavencimiento, estadogasto, idusuario) FROM stdin;
3	2026-03-09	Arriendo	1200000.00	efectivo	2026-04-09	pagado	1
1	2026-03-09	Servicios públicos	500000.00	efectivo	2026-03-27	pagado	1
4	2026-03-11	Nómina	3000000.00	transferencia	2026-11-28	pendiente	1
\.


--
-- TOC entry 5124 (class 0 OID 16438)
-- Dependencies: 225
-- Data for Name: insumos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insumos (idinsumo, nombreinsumo, tipoinsumo, stock, stockminimo, unidadmedida, fechacaducidad, estado) FROM stdin;
9	Caja de Helado de chocolate	Endulzantes	5	2	L	2026-03-16	activo
7	Mora	Frutas	10	3	Cajas	2026-03-13	inactivo
11	Caja de helado de ron pasas	Endulzantes	4	1	Cajas	2026-03-26	activo
1	Leche entera	Lácteos	3	3	L	2026-03-14	activo
12	Paquetes de barquillos	Endulzantes	8	3	Unidades	2026-05-16	activo
8	Helado de chocolate	Endulzantes	1	2	L	2026-03-16	activo
6	Mango	Frutas	15	5	Cajas	2026-02-16	activo
4	Helado de chocolate	Endulzantes	23	1	Cajas	2026-03-16	activo
\.


--
-- TOC entry 5140 (class 0 OID 16552)
-- Dependencies: 241
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_inventario (idmovimiento, idinsumo, cantidadmovimiento, fechamovimiento, motivomovimiento, idusuario) FROM stdin;
4	11	1	2026-03-09 15:15:13.337995	Apertura para uso del día	16
5	1	13	2026-03-09 15:19:48.755722	Vencimiento	16
6	12	2	2026-03-09 23:42:24.368553	Abierto para ensaladas de frutas	16
7	8	2	2026-03-11 21:25:00.200826	Para uso del dia	16
8	6	5	2026-03-11 21:25:46.35773	Para ensalada de frutas	16
9	4	3	2026-03-11 21:26:29.868696	Para malteada de chocolate	16
\.


--
-- TOC entry 5126 (class 0 OID 16445)
-- Dependencies: 227
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (idpedido, fechapedido, estadopedido, idusuario) FROM stdin;
11	2026-03-09 10:00:49.162481	entregado	16
10	2026-03-09 09:04:16.835465	entregado	16
12	2026-03-09 23:39:08.07855	entregado	16
13	2026-03-10 15:08:51.562194	entregado	16
14	2026-03-10 19:58:48.20016	entregado	16
15	2026-03-11 21:33:21.147227	entregado	16
\.


--
-- TOC entry 5144 (class 0 OID 16590)
-- Dependencies: 245
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (idproducto, nombreproducto, descripcionproducto, preciobase, estado, idcategoria) FROM stdin;
1	Copa queso	Dos bolas de helado, queso, chantilly, fresa, cereza, 1 salsa y 1 barquillo.	15000.00	activo	1
2	Ensalada de frutas	Dos bolas de helado, con 5 frutas diferentes: fresa, mango, papaya, manzana y kiwi, con queso, una salsa y chantilly	20000.00	activo	3
3	Cucurucho	3 bolas de helado, con 2 salsas, un barquillo, y un topping adicional.	12000.00	activo	8
4	Malteada de chocolate	Malteada a base de helado de chocolate, con crema chantilly, salsa de chocolate y un barquillo.	17000.00	activo	6
5	Brownie	Brownie con dos bolas de helado, fresa, mango, crema chantilly y una cereza	16000.00	activo	5
\.


--
-- TOC entry 5122 (class 0 OID 16428)
-- Dependencies: 223
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (idproveedor, nombreproveedor, contactoproveedor, telefonoproveedor, correoproveedor, estado) FROM stdin;
1	Helados tony	Juan Perez	3001645781	heladostony2@gmail.com	activo
3	Fruveria la 43	Milena Lopez	3114897532	la43fruver@gmail.com	activo
2	Auralac	Auralac wsp	3496327841	lacteosAuralac@gmail.com	activo
\.


--
-- TOC entry 5117 (class 0 OID 16389)
-- Dependencies: 218
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (idrol, nombrerol) FROM stdin;
1	administrador
2	empleado
\.


--
-- TOC entry 5148 (class 0 OID 16805)
-- Dependencies: 249
-- Data for Name: sabores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sabores (idsabor, nombresabor, estado) FROM stdin;
1	Chocolate	activo
2	Veteado de mora	activo
3	Mora	activo
4	Ron con pasas	activo
5	Chispitas	activo
6	Cookies and cream	activo
7	Maní	activo
8	Arequipe	activo
9	Chicle	activo
\.


--
-- TOC entry 5156 (class 0 OID 16870)
-- Dependencies: 257
-- Data for Name: salsas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salsas (idsalsa, nombresalsa, estado) FROM stdin;
1	Chocolate	activo
2	Arequipe	activo
3	Lecherita	activo
4	Chicle	activo
5	Mora	activo
\.


--
-- TOC entry 5120 (class 0 OID 16412)
-- Dependencies: 221
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_rol (idusuario, idrol) FROM stdin;
1	1
16	2
\.


--
-- TOC entry 5119 (class 0 OID 16398)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (idusuario, nombreusuario, correousuario, contrasenausuario, estado, fecharegistro) FROM stdin;
1	iluarango	julianaarangohiguita22@gmail.com	$2b$10$F3vHGkGS37XO6xRovj3RWeveGUoAWoNXiQoU5i5UWDIeMhBP8hlme	activo	2026-03-01
16	aleja	alejahiguita@gmail.com	$2b$10$boNzaGr8VndXeS7Ed4x/2OW0KcTkqL3sjMh.uH7H2B7W0LhvzEfy2	activo	2026-03-01
\.


--
-- TOC entry 5134 (class 0 OID 16503)
-- Dependencies: 235
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (idventa, fechaventa, idpedido, idusuario, totalventa) FROM stdin;
8	2026-03-09 10:01:26.525146	11	16	17800.00
9	2026-03-09 13:27:26.645881	10	16	17000.00
10	2026-03-09 23:39:33.332012	12	16	61600.00
11	2026-03-10 15:09:10.623409	13	16	17800.00
12	2026-03-10 19:59:11.86224	14	16	19800.00
13	2026-03-11 21:33:44.462953	15	16	17000.00
\.


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 252
-- Name: adicionales_idadicional_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adicionales_idadicional_seq', 6, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 242
-- Name: archivos_generados_idarchivo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.archivos_generados_idarchivo_seq', 16, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 246
-- Name: categorias_producto_idcategoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_producto_idcategoria_seq', 9, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 230
-- Name: compras_idcompra_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compras_idcompra_seq', 5, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 232
-- Name: detalle_compra_iddetallecompra_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_compra_iddetallecompra_seq', 5, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 254
-- Name: detalle_pedido_adicionales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_adicionales_id_seq', 13, true);


--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 228
-- Name: detalle_pedido_iddetallepedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_iddetallepedido_seq', 16, true);


--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 250
-- Name: detalle_pedido_sabor_iddetallepedidosabor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_pedido_sabor_iddetallepedidosabor_seq', 1, false);


--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 236
-- Name: facturas_idfactura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_idfactura_seq', 5, true);


--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 238
-- Name: gastos_operativos_idgastooperativo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gastos_operativos_idgastooperativo_seq', 4, true);


--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 224
-- Name: insumos_idinsumo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.insumos_idinsumo_seq', 12, true);


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 240
-- Name: movimientos_inventario_idmovimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_inventario_idmovimiento_seq', 9, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 226
-- Name: pedidos_idpedido_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_idpedido_seq', 15, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 244
-- Name: productos_idproducto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_idproducto_seq', 5, true);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 222
-- Name: proveedores_idproveedor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_idproveedor_seq', 3, true);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 217
-- Name: roles_idrol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_idrol_seq', 5, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 248
-- Name: sabores_idsabor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sabores_idsabor_seq', 9, true);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 256
-- Name: salsas_idsalsa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salsas_idsalsa_seq', 5, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 219
-- Name: usuarios_idusuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_idusuario_seq', 16, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 234
-- Name: ventas_idventa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_idventa_seq', 13, true);


--
-- TOC entry 4945 (class 2606 OID 16841)
-- Name: adicionales adicionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adicionales
    ADD CONSTRAINT adicionales_pkey PRIMARY KEY (idadicional);


--
-- TOC entry 4935 (class 2606 OID 16575)
-- Name: archivos_generados archivos_generados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archivos_generados
    ADD CONSTRAINT archivos_generados_pkey PRIMARY KEY (idarchivo);


--
-- TOC entry 4939 (class 2606 OID 16803)
-- Name: categorias_producto categorias_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_producto
    ADD CONSTRAINT categorias_producto_pkey PRIMARY KEY (idcategoria);


--
-- TOC entry 4923 (class 2606 OID 16479)
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (idcompra);


--
-- TOC entry 4925 (class 2606 OID 16491)
-- Name: detalle_compra detalle_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compra
    ADD CONSTRAINT detalle_compra_pkey PRIMARY KEY (iddetallecompra);


--
-- TOC entry 4947 (class 2606 OID 16849)
-- Name: detalle_pedido_adicionales detalle_pedido_adicionales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_adicionales
    ADD CONSTRAINT detalle_pedido_adicionales_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 16467)
-- Name: detalle_pedido detalle_pedido_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT detalle_pedido_pkey PRIMARY KEY (iddetallepedido);


--
-- TOC entry 4943 (class 2606 OID 16823)
-- Name: detalle_pedido_sabor detalle_pedido_sabor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_sabor
    ADD CONSTRAINT detalle_pedido_sabor_pkey PRIMARY KEY (iddetallepedidosabor);


--
-- TOC entry 4929 (class 2606 OID 16528)
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (idfactura);


--
-- TOC entry 4931 (class 2606 OID 16545)
-- Name: gastos_operativos gastos_operativos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos_operativos
    ADD CONSTRAINT gastos_operativos_pkey PRIMARY KEY (idgastooperativo);


--
-- TOC entry 4917 (class 2606 OID 16443)
-- Name: insumos insumos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos
    ADD CONSTRAINT insumos_pkey PRIMARY KEY (idinsumo);


--
-- TOC entry 4933 (class 2606 OID 16558)
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (idmovimiento);


--
-- TOC entry 4919 (class 2606 OID 16450)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (idpedido);


--
-- TOC entry 4937 (class 2606 OID 16598)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (idproducto);


--
-- TOC entry 4915 (class 2606 OID 16436)
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (idproveedor);


--
-- TOC entry 4905 (class 2606 OID 16396)
-- Name: roles roles_nombrerol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombrerol_key UNIQUE (nombrerol);


--
-- TOC entry 4907 (class 2606 OID 16394)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (idrol);


--
-- TOC entry 4941 (class 2606 OID 16811)
-- Name: sabores sabores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sabores
    ADD CONSTRAINT sabores_pkey PRIMARY KEY (idsabor);


--
-- TOC entry 4949 (class 2606 OID 16877)
-- Name: salsas salsas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salsas
    ADD CONSTRAINT salsas_pkey PRIMARY KEY (idsalsa);


--
-- TOC entry 4913 (class 2606 OID 16416)
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (idusuario, idrol);


--
-- TOC entry 4909 (class 2606 OID 16406)
-- Name: usuarios usuarios_correousuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correousuario_key UNIQUE (correousuario);


--
-- TOC entry 4911 (class 2606 OID 16404)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (idusuario);


--
-- TOC entry 4927 (class 2606 OID 16508)
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (idventa);


--
-- TOC entry 4965 (class 2606 OID 16576)
-- Name: archivos_generados archivos_generados_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archivos_generados
    ADD CONSTRAINT archivos_generados_ibfk_1 FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4955 (class 2606 OID 16480)
-- Name: compras compras_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_ibfk_1 FOREIGN KEY (idproveedor) REFERENCES public.proveedores(idproveedor);


--
-- TOC entry 4956 (class 2606 OID 16492)
-- Name: detalle_compra detalle_compra_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compra
    ADD CONSTRAINT detalle_compra_ibfk_1 FOREIGN KEY (idcompra) REFERENCES public.compras(idcompra);


--
-- TOC entry 4957 (class 2606 OID 16497)
-- Name: detalle_compra detalle_compra_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compra
    ADD CONSTRAINT detalle_compra_ibfk_2 FOREIGN KEY (idinsumo) REFERENCES public.insumos(idinsumo);


--
-- TOC entry 4969 (class 2606 OID 16855)
-- Name: detalle_pedido_adicionales detalle_pedido_adicionales_idadicional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_adicionales
    ADD CONSTRAINT detalle_pedido_adicionales_idadicional_fkey FOREIGN KEY (idadicional) REFERENCES public.adicionales(idadicional);


--
-- TOC entry 4970 (class 2606 OID 16850)
-- Name: detalle_pedido_adicionales detalle_pedido_adicionales_iddetallepedido_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_adicionales
    ADD CONSTRAINT detalle_pedido_adicionales_iddetallepedido_fkey FOREIGN KEY (iddetallepedido) REFERENCES public.detalle_pedido(iddetallepedido);


--
-- TOC entry 4960 (class 2606 OID 16529)
-- Name: facturas facturas_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_ibfk_1 FOREIGN KEY (idventa) REFERENCES public.ventas(idventa);


--
-- TOC entry 4966 (class 2606 OID 16812)
-- Name: productos fk_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_categoria FOREIGN KEY (idcategoria) REFERENCES public.categorias_producto(idcategoria);


--
-- TOC entry 4953 (class 2606 OID 16623)
-- Name: detalle_pedido fk_detalle_pedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY (idpedido) REFERENCES public.pedidos(idpedido);


--
-- TOC entry 4954 (class 2606 OID 16628)
-- Name: detalle_pedido fk_detalle_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (idproducto) REFERENCES public.productos(idproducto);


--
-- TOC entry 4967 (class 2606 OID 16824)
-- Name: detalle_pedido_sabor fk_detallepedido; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_sabor
    ADD CONSTRAINT fk_detallepedido FOREIGN KEY (iddetallepedido) REFERENCES public.detalle_pedido(iddetallepedido);


--
-- TOC entry 4961 (class 2606 OID 16534)
-- Name: facturas fk_facturas_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT fk_facturas_usuarios FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4962 (class 2606 OID 16546)
-- Name: gastos_operativos fk_gastos_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gastos_operativos
    ADD CONSTRAINT fk_gastos_usuario FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4963 (class 2606 OID 16559)
-- Name: movimientos_inventario fk_movimientos_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_movimientos_usuario FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4968 (class 2606 OID 16829)
-- Name: detalle_pedido_sabor fk_sabor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_sabor
    ADD CONSTRAINT fk_sabor FOREIGN KEY (idsabor) REFERENCES public.sabores(idsabor);


--
-- TOC entry 4958 (class 2606 OID 16509)
-- Name: ventas fk_ventas_pedidos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_ventas_pedidos FOREIGN KEY (idpedido) REFERENCES public.pedidos(idpedido);


--
-- TOC entry 4964 (class 2606 OID 16564)
-- Name: movimientos_inventario movimientos_inventario_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_ibfk_1 FOREIGN KEY (idinsumo) REFERENCES public.insumos(idinsumo);


--
-- TOC entry 4952 (class 2606 OID 16451)
-- Name: pedidos pedidos_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4950 (class 2606 OID 16417)
-- Name: usuario_rol usuario_rol_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_ibfk_1 FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


--
-- TOC entry 4951 (class 2606 OID 16422)
-- Name: usuario_rol usuario_rol_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_ibfk_2 FOREIGN KEY (idrol) REFERENCES public.roles(idrol);


--
-- TOC entry 4959 (class 2606 OID 16514)
-- Name: ventas ventas_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_ibfk_1 FOREIGN KEY (idusuario) REFERENCES public.usuarios(idusuario);


-- Completed on 2026-03-12 03:20:45

--
-- PostgreSQL database dump complete
--

\unrestrict aCzyyVXF5uZc0sFqVnJXIbZMt06ehujO2xkXIr4YAe8cMynd5dFHgf03DgH0jFD

