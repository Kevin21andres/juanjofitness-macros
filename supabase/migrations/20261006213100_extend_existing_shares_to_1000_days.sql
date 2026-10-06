BEGIN;

-- ============================================================
-- DECISIÓN TEMPORAL
--
-- Los enlaces compartidos se mantienen activos durante
-- 1000 días hasta confirmar con Juanjo la política definitiva.
--
-- Una migración posterior deberá sustituir este valor cuando
-- se acuerde la política final de expiración.
-- ============================================================

UPDATE public.diet_shares
SET expires_at =
    created_at + interval '1000 days'
WHERE is_active = true
  AND expires_at IS DISTINCT FROM
      created_at + interval '1000 days';

COMMIT;