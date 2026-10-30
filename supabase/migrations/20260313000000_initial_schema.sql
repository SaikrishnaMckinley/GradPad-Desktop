-- GradPad initial schema, RLS, and profile bootstrap trigger

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.community_visibility as enum ('public', 'private', 'hidden');
create type public.membership_role as enum ('owner', 'admin', 'moderator', 'member');
create type public.membership_status as enum ('pending', 'active', 'rejected', 'banned');
create type public.connection_status as enum ('pending', 'accepted', 'rejected', 'blocked');
create type public.conversation_type as enum ('direct', 'group');
create type public.rsvp_status as enum ('going', 'interested', 'not_going');
create type public.event_visibility as enum ('public', 'community', 'private');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  headline text,
  institution text,
  graduation_year smallint,
  location text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles (username);

-- ---------------------------------------------------------------------------
-- Communities & membership
-- ---------------------------------------------------------------------------

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  institution text,
  location text,
  logo_url text,
  cover_image_url text,
  visibility public.community_visibility not null default 'public',
  join_approval_required boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null default 'member',
  status public.membership_status not null default 'pending',
  joined_at timestamptz not null default now(),
  unique (community_id, user_id)
);

create index community_members_user_idx on public.community_members (user_id);
create index community_members_community_idx on public.community_members (community_id);

-- ---------------------------------------------------------------------------
-- Channels
-- ---------------------------------------------------------------------------

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, slug)
);

create index channels_community_idx on public.channels (community_id);

-- ---------------------------------------------------------------------------
-- Posts & engagement
-- ---------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid references public.communities (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete set null,
  title text,
  content text not null,
  visibility text not null default 'community',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index posts_community_created_idx on public.posts (community_id, created_at desc);
create index posts_channel_created_idx on public.posts (channel_id, created_at desc);
create index posts_author_idx on public.posts (author_id);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table public.post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_comment_id uuid references public.comments (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_created_idx on public.comments (post_id, created_at);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete set null,
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'UTC',
  event_type text,
  location text,
  meeting_url text,
  visibility public.event_visibility not null default 'community',
  price_cents bigint,
  currency char(3) default 'USD',
  capacity int,
  registration_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_start_at_idx on public.events (start_at);
create index events_community_start_idx on public.events (community_id, start_at);

create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.rsvp_status not null default 'going',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null default 'direct',
  title text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  unique (conversation_id, user_id)
);

create index conversation_members_user_idx on public.conversation_members (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  attachment_url text,
  attachment_type text,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Connections & notifications
-- ---------------------------------------------------------------------------

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index connections_addressee_idx on public.connections (addressee_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);

create table public.post_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  content text,
  community_id uuid references public.communities (id) on delete set null,
  channel_id uuid references public.channels (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_community_member(p_community_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_members m
    where m.community_id = p_community_id
      and m.user_id = p_user_id
      and m.status = 'active'
  );
$$;

create or replace function public.is_community_admin(p_community_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_members m
    where m.community_id = p_community_id
      and m.user_id = p_user_id
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

create trigger communities_updated_at before update on public.communities
for each row execute function public.handle_updated_at();

create trigger channels_updated_at before update on public.channels
for each row execute function public.handle_updated_at();

create trigger posts_updated_at before update on public.posts
for each row execute function public.handle_updated_at();

create trigger events_updated_at before update on public.events
for each row execute function public.handle_updated_at();

-- Bootstrap profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, headline)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'headline'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.channels enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.connections enable row level security;
alter table public.notifications enable row level security;
alter table public.post_drafts enable row level security;

-- Profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Communities
create policy "Public communities are discoverable"
  on public.communities for select to authenticated
  using (
    visibility = 'public'
    or public.is_community_member(id, auth.uid())
    or created_by = auth.uid()
  );

create policy "Authenticated users can create communities"
  on public.communities for insert to authenticated
  with check (auth.uid() = created_by);

create policy "Community admins can update communities"
  on public.communities for update to authenticated
  using (public.is_community_admin(id, auth.uid()))
  with check (public.is_community_admin(id, auth.uid()));

-- Community members
create policy "Members can read membership in their communities"
  on public.community_members for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_community_member(community_id, auth.uid())
  );

create policy "Users can request membership"
  on public.community_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and role = 'member'
    and status in ('pending', 'active')
  );

create policy "Admins manage membership"
  on public.community_members for update to authenticated
  using (public.is_community_admin(community_id, auth.uid()))
  with check (public.is_community_admin(community_id, auth.uid()));

-- Channels
create policy "Channel read for community members"
  on public.channels for select to authenticated
  using (public.is_community_member(community_id, auth.uid()));

create policy "Admins manage channels"
  on public.channels for all to authenticated
  using (public.is_community_admin(community_id, auth.uid()))
  with check (public.is_community_admin(community_id, auth.uid()));

-- Posts
create policy "Read posts in member communities"
  on public.posts for select to authenticated
  using (
    deleted_at is null
    and (
      community_id is null
      or public.is_community_member(community_id, auth.uid())
    )
  );

create policy "Create posts in member communities"
  on public.posts for insert to authenticated
  with check (
    author_id = auth.uid()
    and (
      community_id is null
      or public.is_community_member(community_id, auth.uid())
    )
  );

create policy "Authors edit own posts"
  on public.posts for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "Authors delete own posts"
  on public.posts for delete to authenticated
  using (author_id = auth.uid());

-- Post media (follow post access)
create policy "Post media readable with post access"
  on public.post_media for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.deleted_at is null
        and (
          p.community_id is null
          or public.is_community_member(p.community_id, auth.uid())
        )
    )
  );

create policy "Authors manage post media"
  on public.post_media for all to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- Likes & bookmarks
create policy "Users manage own likes"
  on public.post_likes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Likes visible in accessible posts"
  on public.post_likes for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.community_id is null
          or public.is_community_member(p.community_id, auth.uid())
        )
    )
  );

create policy "Users manage own bookmarks"
  on public.post_bookmarks for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Comments
create policy "Comments on accessible posts"
  on public.comments for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.community_id is null
          or public.is_community_member(p.community_id, auth.uid())
        )
    )
  );

create policy "Users comment on accessible posts"
  on public.comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and (
          p.community_id is null
          or public.is_community_member(p.community_id, auth.uid())
        )
    )
  );

create policy "Authors edit own comments"
  on public.comments for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Events
create policy "Events visible to community members"
  on public.events for select to authenticated
  using (public.is_community_member(community_id, auth.uid()));

create policy "Members create events"
  on public.events for insert to authenticated
  with check (
    organizer_id = auth.uid()
    and public.is_community_member(community_id, auth.uid())
  );

create policy "Organizers and admins update events"
  on public.events for update to authenticated
  using (
    organizer_id = auth.uid()
    or public.is_community_admin(community_id, auth.uid())
  )
  with check (
    organizer_id = auth.uid()
    or public.is_community_admin(community_id, auth.uid())
  );

-- RSVPs
create policy "Users manage own RSVPs"
  on public.event_rsvps for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "RSVPs visible for accessible events"
  on public.event_rsvps for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and public.is_community_member(e.community_id, auth.uid())
    )
  );

-- Conversations & messages
create policy "Conversation members read conversations"
  on public.conversations for select to authenticated
  using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = id and cm.user_id = auth.uid()
    )
  );

create policy "Authenticated users create conversations"
  on public.conversations for insert to authenticated
  with check (created_by = auth.uid());

create policy "Conversation members read membership"
  on public.conversation_members for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
    )
  );

create policy "Users join conversations they create"
  on public.conversation_members for insert to authenticated
  with check (user_id = auth.uid());

create policy "Members read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
    )
  );

create policy "Members send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversation_id and cm.user_id = auth.uid()
    )
  );

-- Connections
create policy "Users read own connections"
  on public.connections for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "Users create connection requests"
  on public.connections for insert to authenticated
  with check (requester_id = auth.uid());

create policy "Participants update connection requests"
  on public.connections for update to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid())
  with check (requester_id = auth.uid() or addressee_id = auth.uid());

-- Notifications
create policy "Users read own notifications"
  on public.notifications for select to authenticated
  using (recipient_id = auth.uid());

create policy "Users update own notifications"
  on public.notifications for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Drafts
create policy "Users manage own drafts"
  on public.post_drafts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
