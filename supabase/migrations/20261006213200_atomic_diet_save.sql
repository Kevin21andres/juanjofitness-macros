BEGIN;

-- ============================================================
-- ATOMIC DIET SAVE
--
-- Guarda una versión completa de dieta en una única
-- transacción PostgreSQL:
--
--   - valida autenticación y propiedad del cliente;
--   - serializa guardados concurrentes por cliente;
--   - desactiva versiones activas anteriores;
--   - crea la nueva dieta;
--   - crea comidas;
--   - crea alimentos principales;
--   - resuelve sustituciones;
--   - crea suplementos.
--
-- Cualquier error provoca rollback de TODA la operación.
--
-- Esta migración NO corrige todavía los datos históricos
-- con múltiples is_active=true.
-- ============================================================


CREATE OR REPLACE FUNCTION public.create_diet_version(
    p_client_id uuid,
    p_name text,
    p_meals_count integer,
    p_notes text,
    p_meals jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
    v_locked_client_id uuid;

    v_diet_id uuid;
    v_diet_result jsonb;

    v_meal jsonb;
    v_meal_id uuid;
    v_meal_index integer;

    v_items jsonb;
    v_item jsonb;
    v_item_id uuid;
    v_food_id uuid;
    v_grams numeric;
    v_role text;

    v_local_id text;
    v_parent_local_id text;
    v_parent_db_id uuid;

    /*
     * Mapa:
     *
     * local_id del frontend
     *        ->
     * UUID real insertado en diet_items
     *
     * Se reinicia para cada comida.
     */
    v_main_item_map jsonb;

    v_supplements jsonb;
    v_supplement jsonb;
    v_supplement_name text;
BEGIN

    -- ========================================================
    -- AUTENTICACIÓN
    -- ========================================================

    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado'
            USING ERRCODE = '42501';
    END IF;


    -- ========================================================
    -- VALIDACIÓN DE PARÁMETROS GENERALES
    -- ========================================================

    IF p_client_id IS NULL THEN
        RAISE EXCEPTION 'client_id es obligatorio'
            USING ERRCODE = '22023';
    END IF;

    IF nullif(btrim(coalesce(p_name, '')), '') IS NULL THEN
        RAISE EXCEPTION 'El nombre de la dieta es obligatorio'
            USING ERRCODE = '22023';
    END IF;

    IF char_length(btrim(p_name)) > 200 THEN
        RAISE EXCEPTION 'El nombre de la dieta es demasiado largo'
            USING ERRCODE = '22023';
    END IF;

    IF p_meals_count IS NULL
       OR p_meals_count < 1
       OR p_meals_count > 12 THEN
        RAISE EXCEPTION 'Número de comidas no válido'
            USING ERRCODE = '22023';
    END IF;

    IF p_meals IS NULL
       OR jsonb_typeof(p_meals) <> 'array' THEN
        RAISE EXCEPTION 'p_meals debe ser un array JSON'
            USING ERRCODE = '22023';
    END IF;

    IF jsonb_array_length(p_meals) <> p_meals_count THEN
        RAISE EXCEPTION
            'El número de comidas no coincide con meals_count'
            USING ERRCODE = '22023';
    END IF;


    -- ========================================================
    -- VALIDAR PROPIETARIO + BLOQUEAR CLIENTE
    --
    -- FOR UPDATE serializa dos guardados simultáneos para
    -- un mismo cliente.
    -- ========================================================

    SELECT c.id
    INTO v_locked_client_id
    FROM public.clients c
    WHERE c.id = p_client_id
      AND c.user_id = v_user_id
    FOR UPDATE;

    IF v_locked_client_id IS NULL THEN
        RAISE EXCEPTION
            'Cliente no encontrado o sin permisos'
            USING ERRCODE = '42501';
    END IF;


    -- ========================================================
    -- VALIDAR ÍNDICES DE COMIDAS DUPLICADOS
    -- ========================================================

    IF EXISTS (
        SELECT 1
        FROM (
            SELECT
                (meal.value ->> 'meal_index')::integer
                    AS meal_index,
                COUNT(*) AS total
            FROM jsonb_array_elements(p_meals)
                AS meal(value)
            GROUP BY
                (meal.value ->> 'meal_index')::integer
            HAVING COUNT(*) > 1
        ) duplicated
    ) THEN
        RAISE EXCEPTION
            'Existen índices de comida duplicados'
            USING ERRCODE = '22023';
    END IF;


    -- ========================================================
    -- DESACTIVAR VERSIONES ANTERIORES
    --
    -- Forma parte de ESTA MISMA transacción.
    -- Si algo posterior falla, PostgreSQL revierte esto.
    -- ========================================================

    UPDATE public.diets
    SET is_active = false
    WHERE client_id = p_client_id
      AND is_active = true;


    -- ========================================================
    -- CREAR NUEVA DIETA
    -- ========================================================

    v_diet_id := gen_random_uuid();

    INSERT INTO public.diets (
        id,
        client_id,
        name,
        meals_count,
        is_active,
        notes
    )
    VALUES (
        v_diet_id,
        p_client_id,
        btrim(p_name),
        p_meals_count,
        true,
        nullif(btrim(coalesce(p_notes, '')), '')
    );


    -- ========================================================
    -- CREAR COMIDAS
    -- ========================================================

    FOR v_meal IN
        SELECT value
        FROM jsonb_array_elements(p_meals)
    LOOP

        IF jsonb_typeof(v_meal) <> 'object' THEN
            RAISE EXCEPTION
                'Formato de comida no válido'
                USING ERRCODE = '22023';
        END IF;

        BEGIN
            v_meal_index :=
                (v_meal ->> 'meal_index')::integer;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE EXCEPTION
                    'meal_index no válido'
                    USING ERRCODE = '22023';
        END;

        IF v_meal_index < 0
           OR v_meal_index >= p_meals_count THEN
            RAISE EXCEPTION
                'meal_index fuera de rango: %',
                v_meal_index
                USING ERRCODE = '22023';
        END IF;


        v_items := COALESCE(
            v_meal -> 'items',
            '[]'::jsonb
        );

        IF jsonb_typeof(v_items) <> 'array' THEN
            RAISE EXCEPTION
                'items debe ser un array'
                USING ERRCODE = '22023';
        END IF;


        v_supplements := COALESCE(
            v_meal -> 'supplements',
            '[]'::jsonb
        );

        IF jsonb_typeof(v_supplements) <> 'array' THEN
            RAISE EXCEPTION
                'supplements debe ser un array'
                USING ERRCODE = '22023';
        END IF;


        v_meal_id := gen_random_uuid();

        INSERT INTO public.diet_meals (
            id,
            diet_id,
            meal_index,
            notes
        )
        VALUES (
            v_meal_id,
            v_diet_id,
            v_meal_index,
            nullif(
                btrim(
                    coalesce(
                        v_meal ->> 'notes',
                        ''
                    )
                ),
                ''
            )
        );


        -- ====================================================
        -- MAPA DE ITEMS PRINCIPALES DE ESTA COMIDA
        -- ====================================================

        v_main_item_map := '{}'::jsonb;


        -- ====================================================
        -- VALIDAR ROLES
        -- ====================================================

        IF EXISTS (
            SELECT 1
            FROM jsonb_array_elements(v_items)
                AS item(value)
            WHERE coalesce(
                item.value ->> 'role',
                ''
            ) NOT IN (
                'main',
                'substitute'
            )
        ) THEN
            RAISE EXCEPTION
                'Rol de alimento no válido'
                USING ERRCODE = '22023';
        END IF;


        -- ====================================================
        -- ITEMS PRINCIPALES
        -- ====================================================

        FOR v_item IN
            SELECT value
            FROM jsonb_array_elements(v_items)
            WHERE value ->> 'role' = 'main'
        LOOP

            v_local_id := nullif(
                btrim(
                    coalesce(
                        v_item ->> 'local_id',
                        ''
                    )
                ),
                ''
            );

            IF v_local_id IS NULL THEN
                RAISE EXCEPTION
                    'Un alimento principal no tiene local_id'
                    USING ERRCODE = '22023';
            END IF;

            IF v_main_item_map ? v_local_id THEN
                RAISE EXCEPTION
                    'local_id duplicado en la comida'
                    USING ERRCODE = '22023';
            END IF;


            BEGIN
                v_food_id :=
                    (v_item ->> 'food_id')::uuid;

                v_grams :=
                    (v_item ->> 'grams')::numeric;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE EXCEPTION
                        'Datos de alimento no válidos'
                        USING ERRCODE = '22023';
            END;


            IF v_grams <= 0 THEN
                RAISE EXCEPTION
                    'Los gramos deben ser mayores que 0'
                    USING ERRCODE = '22023';
            END IF;


            IF NOT EXISTS (
                SELECT 1
                FROM public.foods f
                WHERE f.id = v_food_id
            ) THEN
                RAISE EXCEPTION
                    'Alimento no encontrado'
                    USING ERRCODE = '22023';
            END IF;


            v_item_id := gen_random_uuid();

            INSERT INTO public.diet_items (
                id,
                meal_id,
                food_id,
                grams,
                role,
                parent_item_id
            )
            VALUES (
                v_item_id,
                v_meal_id,
                v_food_id,
                v_grams,
                'main',
                NULL
            );


            v_main_item_map :=
                v_main_item_map
                ||
                jsonb_build_object(
                    v_local_id,
                    v_item_id::text
                );

        END LOOP;


        -- ====================================================
        -- SUSTITUCIONES
        -- ====================================================

        FOR v_item IN
            SELECT value
            FROM jsonb_array_elements(v_items)
            WHERE value ->> 'role' = 'substitute'
        LOOP

            v_parent_local_id := nullif(
                btrim(
                    coalesce(
                        v_item ->> 'parent_local_id',
                        ''
                    )
                ),
                ''
            );

            IF v_parent_local_id IS NULL THEN
                RAISE EXCEPTION
                    'Una sustitución no tiene alimento principal'
                    USING ERRCODE = '22023';
            END IF;


            IF NOT (
                v_main_item_map
                ? v_parent_local_id
            ) THEN
                RAISE EXCEPTION
                    'No se encontró el alimento principal de una sustitución'
                    USING ERRCODE = '22023';
            END IF;


            v_parent_db_id :=
                (
                    v_main_item_map
                    ->> v_parent_local_id
                )::uuid;


            BEGIN
                v_food_id :=
                    (v_item ->> 'food_id')::uuid;

                v_grams :=
                    (v_item ->> 'grams')::numeric;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE EXCEPTION
                        'Datos de sustitución no válidos'
                        USING ERRCODE = '22023';
            END;


            IF v_grams <= 0 THEN
                RAISE EXCEPTION
                    'Los gramos deben ser mayores que 0'
                    USING ERRCODE = '22023';
            END IF;


            IF NOT EXISTS (
                SELECT 1
                FROM public.foods f
                WHERE f.id = v_food_id
            ) THEN
                RAISE EXCEPTION
                    'Alimento no encontrado'
                    USING ERRCODE = '22023';
            END IF;


            INSERT INTO public.diet_items (
                id,
                meal_id,
                food_id,
                grams,
                role,
                parent_item_id
            )
            VALUES (
                gen_random_uuid(),
                v_meal_id,
                v_food_id,
                v_grams,
                'substitute',
                v_parent_db_id
            );

        END LOOP;


        -- ====================================================
        -- SUPLEMENTOS
        -- ====================================================

        FOR v_supplement IN
            SELECT value
            FROM jsonb_array_elements(
                v_supplements
            )
        LOOP

            IF jsonb_typeof(v_supplement) <> 'object' THEN
                RAISE EXCEPTION
                    'Formato de suplemento no válido'
                    USING ERRCODE = '22023';
            END IF;


            v_supplement_name :=
                nullif(
                    btrim(
                        coalesce(
                            v_supplement ->> 'name',
                            ''
                        )
                    ),
                    ''
                );


            IF v_supplement_name IS NULL THEN
                RAISE EXCEPTION
                    'El nombre del suplemento es obligatorio'
                    USING ERRCODE = '22023';
            END IF;


            INSERT INTO public.diet_supplements (
                id,
                meal_id,
                name,
                amount,
                unit,
                timing,
                notes
            )
            VALUES (
                gen_random_uuid(),

                v_meal_id,

                v_supplement_name,

                CASE
                    WHEN nullif(
                        v_supplement ->> 'amount',
                        ''
                    ) IS NULL
                        THEN NULL
                    ELSE
                        (
                            v_supplement
                            ->> 'amount'
                        )::numeric
                END,

                nullif(
                    btrim(
                        coalesce(
                            v_supplement ->> 'unit',
                            ''
                        )
                    ),
                    ''
                ),

                nullif(
                    btrim(
                        coalesce(
                            v_supplement ->> 'timing',
                            ''
                        )
                    ),
                    ''
                ),

                nullif(
                    btrim(
                        coalesce(
                            v_supplement ->> 'notes',
                            ''
                        )
                    ),
                    ''
                )
            );

        END LOOP;

    END LOOP;


    -- ========================================================
    -- DEVOLVER NUEVA DIETA
    -- ========================================================

    SELECT to_jsonb(d)
    INTO v_diet_result
    FROM public.diets d
    WHERE d.id = v_diet_id;

    RETURN v_diet_result;

END;
$$;


-- ============================================================
-- OWNER
-- ============================================================

ALTER FUNCTION public.create_diet_version(
    uuid,
    text,
    integer,
    text,
    jsonb
)
OWNER TO postgres;


-- ============================================================
-- PERMISOS
-- ============================================================

REVOKE ALL
ON FUNCTION public.create_diet_version(
    uuid,
    text,
    integer,
    text,
    jsonb
)
FROM PUBLIC, anon, authenticated, service_role;


GRANT EXECUTE
ON FUNCTION public.create_diet_version(
    uuid,
    text,
    integer,
    text,
    jsonb
)
TO authenticated;


COMMIT;