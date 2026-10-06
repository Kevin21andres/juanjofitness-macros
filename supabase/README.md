\# Supabase - JuanjoFitness



\## Estado



La base de datos de producción de JuanjoFitness existía antes de incorporar

Supabase CLI y el sistema de migraciones al repositorio.



Por este motivo, las primeras migraciones de este directorio NO representan

la creación completa del esquema desde cero.



\## Baseline de seguridad



\### 20261006213000\_security\_hardening.sql



Versiona el hardening de seguridad aplicado manualmente a producción el

06/10/2026.



Incluye:



\- Modelo de propiedad mediante `clients.user\_id`.

\- `clients.user\_id NOT NULL`.

\- `diets.client\_id NOT NULL`.

\- Índices utilizados por relaciones y RLS.

\- Row Level Security.

\- Políticas por propietario.

\- Eliminación del acceso directo de `anon` a las tablas.

\- Restricción de privilegios de `authenticated`.

\- RPC `create\_diet\_share`.

\- RPC `get\_shared\_diet`.

\- Permisos de ejecución de las RPC.



La migración presupone que las tablas funcionales de JuanjoFitness ya existen.



\### 20261006213100\_extend\_existing\_shares\_to\_1000\_days.sql



Registra la decisión temporal de mantener los enlaces compartidos durante

1000 días.



Este valor queda pendiente de revisión con Juanjo y deberá modificarse mediante

una migración posterior cuando se determine la política definitiva.



\## Importante



No ejecutar `supabase db push` contra producción hasta haber alineado el

historial de migraciones remoto con este baseline.



Estos cambios ya fueron aplicados manualmente y validados en producción antes

de incorporarse al repositorio.



\## Flujo de seguridad actual



\- `anon` no tiene acceso directo a tablas.

\- `authenticated` accede únicamente a los datos permitidos mediante RLS.

\- `create\_diet\_share()` solo puede ejecutarse autenticado.

\- `get\_shared\_diet(token)` puede ejecutarse anónimamente y devuelve únicamente

&#x20; la dieta asociada a un token activo y no expirado.

