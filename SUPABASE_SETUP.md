# Supabase Setup

Create a `.env.local` file using [.env.example](/C:/project/petshop/.env.example:1).

Required values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PRODUCT_BUCKET=product-images
```

Create a public storage bucket named `product-images`.

Run this SQL in Supabase:

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Fish', 'Birds', 'Accessories')),
  subcategory text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  original_price numeric(10, 2),
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique,
  image_url text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();
```

Recommended next step:

1. Restart the app after adding `.env.local`.
2. Open `/admin/dashboard`.
3. Add a product with an image file.
4. Check `/shop` or `/birds-fish` to see it on the customer side.
