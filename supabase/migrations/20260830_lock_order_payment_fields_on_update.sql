-- Defense-in-depth: prevent non-admins from changing payment_status or
-- payment_confirmation_status via UPDATE on orders.
--
-- Audit finding: RLS policies orders_update_own and
-- orders_update_supplier_assigned allow a customer (owner) or an assigned
-- supplier to UPDATE their own/assigned order row with no column-level
-- restriction. A customer could therefore call
--   supabase.from('orders').update({payment_status:'paid', payment_confirmation_status:'confirmed'}).eq('id', ownOrderId)
-- directly and self-mark their order as paid, bypassing manager verification.
-- The existing BEFORE INSERT trigger(s) only protect order creation, not
-- later updates.
--
-- This trigger does NOT change RLS and does NOT touch planting_status, so
-- the legitimate supplier workflow (planter-dashboard.html saveJob(), which
-- updates only planting_status on assigned orders) keeps working, and the
-- admin payment-verification flow (manager-ops.html verifyPayment(), gated
-- by is_admin()) is unaffected.
--
-- Tested locally against a mock schema before applying to production:
--  - non-admin attempting to set payment_status/payment_confirmation_status -> blocked, value unchanged
--  - non-admin updating planting_status only -> allowed (unaffected)
--  - admin updating all three fields -> allowed (unaffected)

create or replace function public.enforce_order_update_payment_lock()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    new.payment_status := old.payment_status;
    new.payment_confirmation_status := old.payment_confirmation_status;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_lock_payment_fields on public.orders;
create trigger orders_lock_payment_fields
before update on public.orders
for each row execute function public.enforce_order_update_payment_lock();
