BEGIN;

-- ============================================================
-- JUANJOFITNESS
-- SECURITY HARDENING BASELINE
--
-- Esta migración versiona el estado de seguridad aplicado
-- manualmente a producción el 06/10/2026.
--
-- Requiere que el esquema funcional de la aplicación
-- (clients, diets, diet_meals, etc.) ya exista.
-- ============================================================


-- ============================================================
-- 1. PRECONDICIONES DE PROPIEDAD
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.clients
        WHERE user_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Existen clients sin user_id. Corregir propiedad antes de aplicar la migración.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.diets
        WHERE client_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Existen diets sin client_id. Corregir relaciones antes de aplicar la migración.';
    END IF;
END
$$;


-- ============================================================
-- 2. PROPIEDAD DE DATOS
-- ============================================================

ALTER TABLE public.clients
    ALTER COLUMN user_id
    SET DEFAULT auth.uid();

ALTER TABLE public.clients
    ALTER COLUMN user_id
    SET NOT NULL;

ALTER TABLE public.diets
    ALTER COLUMN client_id
    SET NOT NULL;


-- ============================================================
-- 3. ÍNDICES NECESARIOS PARA RELACIONES / RLS
-- ============================================================

CREATE INDEX IF NOT EXISTS clients_user_id_idx
    ON public.clients (user_id);

CREATE INDEX IF NOT EXISTS diets_client_id_idx
    ON public.diets (client_id);

CREATE INDEX IF NOT EXISTS diet_meals_diet_id_idx
    ON public.diet_meals (diet_id);

CREATE INDEX IF NOT EXISTS diet_items_meal_id_idx
    ON public.diet_items (meal_id);

CREATE INDEX IF NOT EXISTS diet_items_food_id_idx
    ON public.diet_items (food_id);

CREATE INDEX IF NOT EXISTS diet_supplements_meal_id_idx
    ON public.diet_supplements (meal_id);


-- ============================================================
-- 4. ELIMINAR POLICIES LEGACY
-- ============================================================

DO $$
DECLARE
    r record;
BEGIN
    FOR r IN
        SELECT
            schemaname,
            tablename,
            policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
              'clients',
              'diets',
              'diet_meals',
              'diet_items',
              'diet_supplements',
              'foods',
              'diet_shares'
          )
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname,
            r.schemaname,
            r.tablename
        );
    END LOOP;
END
$$;


-- ============================================================
-- 5. HABILITAR RLS
-- ============================================================

ALTER TABLE public.clients
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.diets
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.diet_meals
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.diet_items
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.diet_supplements
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.foods
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.diet_shares
    ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 6. CLIENTS
-- ============================================================

CREATE POLICY clients_select_own
ON public.clients
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);

CREATE POLICY clients_insert_own
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY clients_update_own
ON public.clients
FOR UPDATE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
)
WITH CHECK (
    user_id = (SELECT auth.uid())
);

CREATE POLICY clients_delete_own
ON public.clients
FOR DELETE
TO authenticated
USING (
    user_id = (SELECT auth.uid())
);


-- ============================================================
-- 7. DIETS
-- ============================================================

CREATE POLICY diets_select_own
ON public.diets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = diets.client_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diets_insert_own
ON public.diets
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = diets.client_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diets_update_own
ON public.diets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = diets.client_id
          AND c.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = diets.client_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diets_delete_own
ON public.diets
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.clients c
        WHERE c.id = diets.client_id
          AND c.user_id = (SELECT auth.uid())
    )
);


-- ============================================================
-- 8. DIET_MEALS
-- ============================================================

CREATE POLICY diet_meals_select_own
ON public.diet_meals
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = diet_meals.diet_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_meals_insert_own
ON public.diet_meals
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = diet_meals.diet_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_meals_update_own
ON public.diet_meals
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = diet_meals.diet_id
          AND c.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = diet_meals.diet_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_meals_delete_own
ON public.diet_meals
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = diet_meals.diet_id
          AND c.user_id = (SELECT auth.uid())
    )
);


-- ============================================================
-- 9. DIET_ITEMS
-- ============================================================

CREATE POLICY diet_items_select_own
ON public.diet_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_items.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_items_insert_own
ON public.diet_items
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_items.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_items_update_own
ON public.diet_items
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_items.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_items.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_items_delete_own
ON public.diet_items
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_items.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);


-- ============================================================
-- 10. DIET_SUPPLEMENTS
-- ============================================================

CREATE POLICY diet_supplements_select_own
ON public.diet_supplements
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_supplements.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_supplements_insert_own
ON public.diet_supplements
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_supplements.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_supplements_update_own
ON public.diet_supplements
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_supplements.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_supplements.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY diet_supplements_delete_own
ON public.diet_supplements
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.diet_meals dm
        JOIN public.diets d
          ON d.id = dm.diet_id
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE dm.id = diet_supplements.meal_id
          AND c.user_id = (SELECT auth.uid())
    )
);


-- ============================================================
-- 11. FOODS
-- ============================================================

CREATE POLICY foods_select_authenticated
ON public.foods
FOR SELECT
TO authenticated
USING (true);


-- ============================================================
-- 12. RPC: CREAR / REUTILIZAR ENLACE
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_diet_share(
    p_diet_id uuid,
    p_channel text,
    p_sent_to text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_channel text;
    v_sent_to text;
    v_token text;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado'
            USING ERRCODE = '42501';
    END IF;

    v_channel := lower(btrim(p_channel));

    v_sent_to := nullif(
        btrim(coalesce(p_sent_to, '')),
        ''
    );

    IF v_channel NOT IN ('whatsapp', 'email') THEN
        RAISE EXCEPTION 'Canal no válido'
            USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.diets d
        JOIN public.clients c
          ON c.id = d.client_id
        WHERE d.id = p_diet_id
          AND c.user_id = v_user_id
    ) THEN
        RAISE EXCEPTION
            'Dieta no encontrada o sin permisos'
            USING ERRCODE = '42501';
    END IF;

    SELECT ds.token
      INTO v_token
    FROM public.diet_shares ds
    WHERE ds.diet_id = p_diet_id
      AND ds.channel = v_channel
      AND ds.sent_to IS NOT DISTINCT FROM v_sent_to
      AND ds.is_active = true
      AND (
          ds.expires_at IS NULL
          OR ds.expires_at > now()
      )
    ORDER BY ds.created_at DESC
    LIMIT 1;

    IF v_token IS NOT NULL THEN
        RETURN v_token;
    END IF;

    LOOP
        v_token := gen_random_uuid()::text;

        BEGIN
            INSERT INTO public.diet_shares (
                diet_id,
                token,
                is_active,
                expires_at,
                channel,
                sent_to
            )
            VALUES (
                p_diet_id,
                v_token,
                true,

                -- Valor temporal pendiente de validar con Juanjo.
                now() + interval '1000 days',

                v_channel,
                v_sent_to
            );

            EXIT;

        EXCEPTION
            WHEN unique_violation THEN
                NULL;
        END;
    END LOOP;

    RETURN v_token;
END;
$$;


-- ============================================================
-- 13. RPC: LEER DIETA PÚBLICA POR TOKEN
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_shared_diet(
    p_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_result jsonb;
    v_token text;
BEGIN
    v_token := btrim(
        coalesce(p_token, '')
    );

    IF char_length(v_token) < 20
       OR char_length(v_token) > 200 THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_build_object(
        'id', d.id,
        'name', d.name,
        'notes', d.notes,

        'meals',
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', dm.id,
                        'meal_index', dm.meal_index,
                        'notes', dm.notes,

                        'items',
                        COALESCE(
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', di.id,
                                        'grams', di.grams,
                                        'role', di.role,
                                        'parent_item_id',
                                            di.parent_item_id,

                                        'food',
                                        jsonb_build_object(
                                            'id', f.id,
                                            'name', f.name,
                                            'kcal_100',
                                                f.kcal_100,
                                            'protein_100',
                                                f.protein_100,
                                            'carbs_100',
                                                f.carbs_100,
                                            'fat_100',
                                                f.fat_100
                                        )
                                    )
                                    ORDER BY
                                        di.role,
                                        di.id
                                )
                                FROM public.diet_items di
                                JOIN public.foods f
                                  ON f.id = di.food_id
                                WHERE di.meal_id = dm.id
                            ),
                            '[]'::jsonb
                        ),

                        'supplements',
                        COALESCE(
                            (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        'id', dsup.id,
                                        'meal_id',
                                            dsup.meal_id,
                                        'name',
                                            dsup.name,
                                        'amount',
                                            dsup.amount,
                                        'unit',
                                            dsup.unit,
                                        'timing',
                                            dsup.timing,
                                        'notes',
                                            dsup.notes,
                                        'created_at',
                                            dsup.created_at
                                    )
                                    ORDER BY
                                        dsup.created_at,
                                        dsup.id
                                )
                                FROM public.diet_supplements dsup
                                WHERE dsup.meal_id = dm.id
                            ),
                            '[]'::jsonb
                        )
                    )
                    ORDER BY
                        dm.meal_index,
                        dm.id
                )
                FROM public.diet_meals dm
                WHERE dm.diet_id = d.id
            ),
            '[]'::jsonb
        )
    )
    INTO v_result
    FROM public.diet_shares share
    JOIN public.diets d
      ON d.id = share.diet_id
    WHERE share.token = v_token
      AND share.is_active = true
      AND (
          share.expires_at IS NULL
          OR share.expires_at > now()
      )
    LIMIT 1;

    RETURN v_result;
END;
$$;


-- ============================================================
-- 14. OWNER DE LAS RPC
-- ============================================================

ALTER FUNCTION public.create_diet_share(
    uuid,
    text,
    text
)
OWNER TO postgres;

ALTER FUNCTION public.get_shared_diet(
    text
)
OWNER TO postgres;


-- ============================================================
-- 15. PRIVILEGIOS DE TABLAS
-- ============================================================

REVOKE ALL PRIVILEGES
ON TABLE
    public.clients,
    public.diets,
    public.diet_meals,
    public.diet_items,
    public.diet_supplements,
    public.foods,
    public.diet_shares
FROM anon, authenticated, PUBLIC;


GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE
    public.clients,
    public.diets,
    public.diet_meals,
    public.diet_items,
    public.diet_supplements
TO authenticated;


GRANT SELECT
ON TABLE public.foods
TO authenticated;


-- ============================================================
-- 16. PRIVILEGIOS DE RPC
-- ============================================================

REVOKE ALL
ON FUNCTION public.create_diet_share(
    uuid,
    text,
    text
)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.create_diet_share(
    uuid,
    text,
    text
)
TO authenticated;


REVOKE ALL
ON FUNCTION public.get_shared_diet(
    text
)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE
ON FUNCTION public.get_shared_diet(
    text
)
TO anon, authenticated;


COMMIT;