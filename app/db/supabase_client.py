from supabase import create_client, Client
from app.config import settings


# supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


# ✅ After — uses service_role key, bypasses RLS on server-side
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)