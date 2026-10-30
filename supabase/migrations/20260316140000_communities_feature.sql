-- Communities feature: RPC helpers, leave/join, owner bootstrap, storage

-- ---------------------------------------------------------------------------
-- Storage: community assets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-assets',
  'community-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Community assets public read"
  on storage.objects for select
  using (bucket_id = 'community-assets');

create policy "Admins upload community assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'community-assets'
    and (storage.foldername(name))[1] in (
      select cm.community_id::text
      from public.community_members cm
      where cm.user_id = auth.uid()
        and cm.status = 'active'
        and cm.role in ('owner', 'admin')
    )
  );

create policy "Admins update community assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'community-assets'
    and (storage.foldername(name))[1] in (
      select cm.community_id::text
      from public.community_members cm
      where cm.user_id = auth.uid()
        and cm.status = 'active'
        and cm.role in ('owner', 'admin')
    )
  );

create policy "Admins delete community assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'community-assets'
    and (storage.foldername(name))[1] in (
      select cm.community_id::text
      from public.community_members cm
      where cm.user_id = auth.uid()
        and cm.status = 'active'
        and cm.role in ('owner', 'admin')
    )
  );

-- ---------------------------------------------------------------------------
-- Membership: leave + prevent role escalation on self-update
-- ---------------------------------------------------------------------------

create policy "Users can leave community"
  on public.community_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    and role <> 'owner'
  );

create policy "Users can cancel pending request"
  on public.community_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    and status = 'pending'
  );

-- Admins manage membership: restrict promoting to owner
drop policy if exists "Admins manage membership" on public.community_members;

create policy "Admins manage membership"
  on public.community_members for update
  to authenticated
  using (public.is_community_admin(community_id, auth.uid()))
  with check (
    public.is_community_admin(community_id, auth.uid())
    and role <> 'owner'
  );

-- Owners may update roles except assigning new owners
create policy "Owners manage membership"
  on public.community_members for update
  to authenticated
  using (
    exists (
      select 1 from public.community_members om
      where om.community_id = community_members.community_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.community_members om
      where om.community_id = community_members.community_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.role = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- RPC: create community + owner + default channel
-- ---------------------------------------------------------------------------

create or replace function public.create_community_with_owner(
  p_name text,
  p_slug text,
  p_description text default null,
  p_institution text default null,
  p_location text default null,
  p_visibility public.community_visibility default 'public',
  p_join_approval_required boolean default false,
  p_logo_url text default null,
  p_cover_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.communities (
    name, slug, description, institution, location,
    visibility, join_approval_required, logo_url, cover_image_url, created_by
  )
  values (
    p_name, p_slug, p_description, p_institution, p_location,
    p_visibility, p_join_approval_required, p_logo_url, p_cover_image_url, v_uid
  )
  returning id into v_id;

  insert into public.community_members (community_id, user_id, role, status)
  values (v_id, v_uid, 'owner', 'active');

  insert into public.channels (community_id, name, slug, description, created_by)
  values (v_id, 'General', 'general', 'Community-wide discussion.', v_uid);

  return v_id;
end;
$$;

revoke all on function public.create_community_with_owner from public;
grant execute on function public.create_community_with_owner to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: join community (handles approval + duplicate)
-- ---------------------------------------------------------------------------

create or replace function public.join_community(p_community_id uuid)
returns public.membership_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_requires boolean;
  v_visibility public.community_visibility;
  v_status public.membership_status;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select join_approval_required, visibility
  into v_requires, v_visibility
  from public.communities
  where id = p_community_id;

  if not found then
    raise exception 'Community not found';
  end if;

  if v_visibility = 'hidden' then
    raise exception 'Community is not joinable';
  end if;

  if exists (
    select 1 from public.community_members
    where community_id = p_community_id and user_id = v_uid and status = 'active'
  ) then
    return 'active';
  end if;

  v_status := case when v_requires then 'pending'::public.membership_status else 'active'::public.membership_status end;

  insert into public.community_members (community_id, user_id, role, status)
  values (p_community_id, v_uid, 'member', v_status)
  on conflict (community_id, user_id) do update
  set status = excluded.status,
      joined_at = case
        when public.community_members.status is distinct from excluded.status then now()
        else public.community_members.joined_at
      end;

  return v_status;
end;
$$;

revoke all on function public.join_community from public;
grant execute on function public.join_community to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: leave community
-- ---------------------------------------------------------------------------

create or replace function public.leave_community(p_community_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.membership_role;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select role into v_role
  from public.community_members
  where community_id = p_community_id and user_id = v_uid and status = 'active';

  if v_role is null then
    return;
  end if;

  if v_role = 'owner' then
    raise exception 'Owners cannot leave. Transfer ownership or delete the community first.';
  end if;

  delete from public.community_members
  where community_id = p_community_id and user_id = v_uid;
end;
$$;

revoke all on function public.leave_community from public;
grant execute on function public.leave_community to authenticated;

-- Member counts helper (security invoker)
create or replace function public.community_active_member_count(p_community_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.community_members
  where community_id = p_community_id and status = 'active';
$$;

grant execute on function public.community_active_member_count to authenticated;

create or replace function public.community_member_counts(p_community_ids uuid[])
returns table (community_id uuid, member_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select cm.community_id, count(*)::bigint as member_count
  from public.community_members cm
  where cm.community_id = any (p_community_ids)
    and cm.status = 'active'
  group by cm.community_id;
$$;

grant execute on function public.community_member_counts to authenticated;

create policy "Admins remove members"
  on public.community_members for delete
  to authenticated
  using (
    public.is_community_admin(community_id, auth.uid())
    and user_id <> auth.uid()
    and role <> 'owner'
  );
