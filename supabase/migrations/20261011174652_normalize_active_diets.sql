BEGIN;

-- ============================================================
-- NORMALIZACIÓN DE DIETAS ACTIVAS
-- JuanjoFitness
--
-- Objetivos:
-- 1. Conservar todas las dietas históricas.
-- 2. Mantener la última versión activa por cliente.
-- 3. Excluir a Joan Giralt por tener únicamente versiones
--    incompletas.
-- 4. Impedir futuras duplicidades mediante índice único.
--
-- No elimina dietas, comidas, alimentos, suplementos
-- ni enlaces compartidos.
-- ============================================================

SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '60s';

-- Evita escrituras concurrentes mientras normalizamos
-- los datos y creamos el índice de integridad.
LOCK TABLE public.diets
IN SHARE ROW EXCLUSIVE MODE;

-- ============================================================
-- 1. COMPROBACIONES PREVIAS
-- ============================================================

DO $$
DECLARE
    v_joan_client_id uuid :=
        '46223450-8328-493b-a07f-398d2a4402b9';

    v_total_diets bigint;
    v_clients bigint;
    v_multiple bigint;
    v_without_active bigint;
    v_extra_flags bigint;
    v_joan_active bigint;
    v_incomplete_other_latest bigint;
BEGIN
    SELECT COUNT(*)
    INTO v_total_diets
    FROM public.diets;

    WITH stats AS (
        SELECT
            client_id,
            COUNT(*) FILTER (
                WHERE is_active IS TRUE
            ) AS active_count
        FROM public.diets
        GROUP BY client_id
    )
    SELECT
        COUNT(*),
        COUNT(*) FILTER (
            WHERE active_count > 1
        ),
        COUNT(*) FILTER (
            WHERE active_count = 0
        ),
        COALESCE(
            SUM(
                GREATEST(active_count - 1, 0)
            ),
            0
        )
    INTO
        v_clients,
        v_multiple,
        v_without_active,
        v_extra_flags
    FROM stats;

    SELECT COUNT(*)
    INTO v_joan_active
    FROM public.diets
    WHERE client_id = v_joan_client_id
      AND is_active IS TRUE;

    -- No ejecutar si los datos han cambiado desde
    -- la auditoría. En ese caso habrá que revisarlos.
    IF v_total_diets <> 311
       OR v_clients <> 102
       OR v_multiple <> 58
       OR v_without_active <> 0
       OR v_extra_flags <> 183
       OR v_joan_active <> 7
    THEN
        RAISE EXCEPTION
            'Los datos han cambiado desde la auditoría. '
            'Revisar antes de normalizar.';
    END IF;

    -- Comprobar nuevamente que ninguna de las últimas
    -- versiones de los otros 57 clientes afectados
    -- parece incompleta según nuestros criterios.
    WITH ranked AS (
        SELECT
            d.id,
            d.client_id,
            d.meals_count,
            ROW_NUMBER() OVER (
                PARTITION BY d.client_id
                ORDER BY d.created_at DESC, d.id DESC
            ) AS rn,
            COUNT(*) OVER (
                PARTITION BY d.client_id
            ) AS active_count
        FROM public.diets d
        WHERE d.is_active IS TRUE
    ),
    latest AS (
        SELECT
            r.id,
            r.meals_count,
            (
                SELECT COUNT(*)
                FROM public.diet_meals dm
                WHERE dm.diet_id = r.id
            ) AS actual_meals,
            (
                SELECT COUNT(*)
                FROM public.diet_items di
                JOIN public.diet_meals dm
                    ON dm.id = di.meal_id
                WHERE dm.diet_id = r.id
            ) AS actual_items
        FROM ranked r
        WHERE r.rn = 1
          AND r.active_count > 1
          AND r.client_id <> v_joan_client_id
    )
    SELECT COUNT(*)
    INTO v_incomplete_other_latest
    FROM latest
    WHERE actual_meals <> meals_count
       OR actual_items = 0;

    IF v_incomplete_other_latest <> 0 THEN
        RAISE EXCEPTION
            'Se han detectado nuevas dietas potencialmente '
            'incompletas. Revisar antes de continuar.';
    END IF;

    RAISE NOTICE
        'Validación inicial correcta: 311 dietas, '
        '58 clientes con duplicados y Joan identificado.';
END;
$$;

-- ============================================================
-- 2. NORMALIZACIÓN
-- ============================================================

DO $$
DECLARE
    v_joan_client_id uuid :=
        '46223450-8328-493b-a07f-398d2a4402b9';

    v_updated integer;
BEGIN
    WITH ranked AS (
        SELECT
            id,
            client_id,
            ROW_NUMBER() OVER (
                PARTITION BY client_id
                ORDER BY created_at DESC, id DESC
            ) AS rn
        FROM public.diets
        WHERE is_active IS TRUE
    )
    UPDATE public.diets d
    SET is_active = false
    FROM ranked r
    WHERE d.id = r.id
      AND (
          r.rn > 1
          OR r.client_id = v_joan_client_id
      );

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated <> 184 THEN
        RAISE EXCEPTION
            'Se esperaban 184 actualizaciones; '
            'se han realizado %.',
            v_updated;
    END IF;

    RAISE NOTICE
        'Normalización correcta: % dietas desactivadas.',
        v_updated;
END;
$$;

-- ============================================================
-- 3. RESTRICCIÓN DE INTEGRIDAD
--
-- Como máximo una dieta activa por cliente.
-- Se permite cero dietas activas.
-- ============================================================

CREATE UNIQUE INDEX diets_one_active_per_client_uidx
ON public.diets (client_id)
WHERE is_active IS TRUE;

-- ============================================================
-- 4. VALIDACIÓN FINAL
-- ============================================================

DO $$
DECLARE
    v_total_diets bigint;
    v_one_active bigint;
    v_zero_active bigint;
    v_multiple_active bigint;
    v_joan_active bigint;
BEGIN
    SELECT COUNT(*)
    INTO v_total_diets
    FROM public.diets;

    WITH stats AS (
        SELECT
            client_id,
            COUNT(*) FILTER (
                WHERE is_active IS TRUE
            ) AS active_count
        FROM public.diets
        GROUP BY client_id
    )
    SELECT
        COUNT(*) FILTER (
            WHERE active_count = 1
        ),
        COUNT(*) FILTER (
            WHERE active_count = 0
        ),
        COUNT(*) FILTER (
            WHERE active_count > 1
        )
    INTO
        v_one_active,
        v_zero_active,
        v_multiple_active
    FROM stats;

    SELECT COUNT(*)
    INTO v_joan_active
    FROM public.diets
    WHERE client_id =
        '46223450-8328-493b-a07f-398d2a4402b9'
      AND is_active IS TRUE;

    IF v_total_diets <> 311
       OR v_one_active <> 101
       OR v_zero_active <> 1
       OR v_multiple_active <> 0
       OR v_joan_active <> 0
    THEN
        RAISE EXCEPTION
            'La validación final de integridad ha fallado.';
    END IF;

    RAISE NOTICE
        'INTEGRIDAD OK: 311 dietas, 101 clientes '
        'con una activa, Joan sin dieta activa, '
        '0 duplicados.';
END;
$$;

COMMIT;