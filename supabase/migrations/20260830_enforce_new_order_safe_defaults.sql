-- Enforce that a newly created order can never be inserted already paid/confirmed.
--
-- order/index.html inserts a new row into public.orders directly from the browser
-- (Supabase anon key + RLS), and the insert payload includes payment_status,
-- payment_confirmation_status and planting_status as plain client-supplied values.
-- The current frontend always sends 'pending' / 'pending_confirmation' / 'ordered',
-- but nothing in the database stops a tampered request (e.g. via browser devtools)
-- from sending 'paid' / 'confirmed' instead, which would let an order skip Manager
-- payment verification entirely and become immediately eligible for supplier
-- assignment in manager-ops.html.
--
-- This trigger makes those three columns non-negotiable at insert time: whatever
-- the client sends, a brand-new order always starts pending. It does not touch
-- UPDATE, so it does not affect how manager-ops.html verifies/rejects payment or
-- how planter-dashboard.html advances planting_status after assignment.
--
-- Out of scope for this change (tracked separately): total_amount_mnt is also
-- client-supplied at insert time and is not re-validated against
-- planting_products pricing server-side. Closing that requires persisting which
-- service tier (tree-only vs tree+planting+maintenance) was chosen, which isn't
-- captured on the order today - see project notes.

create or replace function public.enforce_new_order_defaults()
returns trigger
language plpgsql
as $$
begin
  new.payment_status := 'pending';
  new.payment_confirmation_status := 'pending_confirmation';
  new.planting_status := 'ordered';
  return new;
end;
$$;

drop trigger if exists orders_enforce_new_defaults on public.orders;
create trigger orders_enforce_new_defaults
before insert on public.orders
for each row execute function public.enforce_new_order_defaults();
