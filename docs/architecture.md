PROJECT: GRADPAD — FULL-STACK COMMUNITY PLATFORM
TYPE: Responsive Web Application with Desktop-First UI
DATABASE: Supabase (PostgreSQL)
DEVELOPMENT APPROACH: Production-quality, modular, scalable implementation

========================================================
1. YOUR ROLE
========================================================

Act as a senior full-stack engineer, UI/UX designer, frontend
architect, database architect, and product engineer.

Build a complete, production-quality community platform called
"GradPad", inspired by the eight reference screenshots I have
attached to this conversation.

I have created a new project folder named "gradpad".

The application must be implemented from scratch inside this
folder. Inspect the existing project before making changes.

Do not assume the project is empty without checking it.

If a project already exists, understand its configuration and
preserve useful existing code.

If the project is empty, initialize it using the recommended
technology stack described below.

The application must support:

1. Desktop and laptop screens.
2. Tablets.
3. Mobile phones.
4. Responsive navigation.
5. Real authentication.
6. Real database operations through Supabase.
7. Community management.
8. Channels and discussions.
9. Posts, comments, likes, and bookmarks.
10. Event creation, discovery, and RSVP management.
11. One-to-one and group messaging.
12. User profiles and connections.
13. Notifications.
14. Search.
15. Community administration.
16. File and image uploads.
17. Proper loading, error, and empty states.

This must be a functional application, not a static UI prototype.

Do not merely create the home page and stop.

Build the application systematically, keeping the architecture
maintainable and making every implemented screen functional.

========================================================
2. REFERENCE SCREENSHOTS AND DESIGN DIRECTION
========================================================

I have attached eight screenshots showing the intended GradPad
interface.

Study every screenshot before writing the UI.

Treat these screenshots as the primary visual reference.

The screenshots demonstrate:

A. Home feed
B. Community overview
C. Community events and posts
D. Events feed
E. Events calendar
F. Chat inbox and conversation
G. Create post interface

Some screenshots show different scroll positions or states of
the same page. Interpret them as parts of the same application.

Recreate the overall visual design as closely as practical.

Do not redesign the application into a generic social media UI.

Do not use a generic dashboard template.

Do not create an entirely different visual language.

The objective is to preserve the reference application's
visual identity while improving responsiveness, accessibility,
consistency, and real-world usability.

DESIGN CHARACTERISTICS:

- Clean, premium university community platform.
- White navigation and content cards.
- Very light blue-gray page background.
- Blue primary actions.
- Rounded cards and input fields.
- Thin neutral borders.
- Soft shadows.
- Generous whitespace.
- Clear visual hierarchy.
- Consistent typography.
- Subtle hover and active states.
- Minimal and professional iconography.
- Readable text.
- Consistent spacing throughout the application.

The result should feel like a polished SaaS community platform.

========================================================
3. TECHNOLOGY STACK
========================================================

Use the following stack unless the existing project already
has a compatible, well-structured setup.

FRONTEND:

- Next.js with App Router.
- React.
- TypeScript with strict type checking.
- Tailwind CSS.
- shadcn/ui where appropriate.
- Lucide React for icons.
- Supabase JavaScript client.
- React Hook Form for forms.
- Zod for validation.
- date-fns for date formatting and calendar operations.
- Sonner or an equivalent toast notification library.

BACKEND:

- Supabase PostgreSQL.
- Supabase Authentication.
- Supabase Storage.
- Supabase Realtime where useful.
- PostgreSQL Row Level Security.
- Supabase migrations and seed data.

PREFERRED ADDITIONS:

- TanStack Query for complex client-side server-state management
  where it provides meaningful value.
- A lightweight state management solution only when required.
- A calendar component or custom calendar built using existing
  UI primitives.
- A rich-text editor for creating formatted posts, if needed.

Avoid unnecessary dependencies.

Do not install multiple libraries that solve the same problem.

Use stable, mutually compatible package versions.

Use the latest compatible versions available in the existing
development environment instead of blindly upgrading packages.

========================================================
4. INITIAL PROJECT SETUP
========================================================

First inspect:

- package.json
- Existing Next.js configuration
- TypeScript configuration
- Tailwind configuration
- Existing application routes
- Installed dependencies
- Existing Supabase configuration
- Environment variables
- Existing components and styles

Then determine what needs to be initialized.

If the project is empty, initialize Next.js with:

- TypeScript
- App Router
- Tailwind CSS
- ESLint
- A src directory
- A clear component architecture

Use npm if no package manager is already established.

Create a clean, understandable directory structure.

Suggested structure:

src/
  app/
    (auth)/
      login/
      signup/
      forgot-password/
      auth/
    (platform)/
      layout.tsx
      home/
      communities/
      events/
      chat/
      create/
      profile/
      settings/
      notifications/
      search/
    globals.css
    layout.tsx
    page.tsx

  components/
    layout/
      AppShell.tsx
      DesktopSidebar.tsx
      TopNavigation.tsx
      MobileNavigation.tsx
      MobileHeader.tsx
      PageContainer.tsx

    ui/
      buttons
      inputs
      dialogs
      dropdowns
      avatars
      badges
      cards
      skeletons
      empty-states

    home/
      HomeFeed.tsx
      CommunityFilters.tsx
      FeaturedEventCard.tsx
      PostCard.tsx
      RightSidebar.tsx

    communities/
      CommunityCard.tsx
      CommunityHeader.tsx
      CommunityOverview.tsx
      CommunityMembership.tsx
      CommunityChannels.tsx
      CommunityMembers.tsx
      CommunityPosts.tsx
      CommunityEvents.tsx
      CommunityAdminDashboard.tsx

    events/
      EventCard.tsx
      EventList.tsx
      EventCalendar.tsx
      EventDetails.tsx
      EventForm.tsx
      RSVPButton.tsx
      UpcomingEvents.tsx

    chat/
      ChatInbox.tsx
      ConversationList.tsx
      ConversationView.tsx
      MessageBubble.tsx
      MessageComposer.tsx
      ConversationDetails.tsx

    posts/
      PostForm.tsx
      PostEditor.tsx
      CommentSection.tsx
      PostActions.tsx

    profile/
      ProfileCard.tsx
      ProfileForm.tsx
      ConnectionsList.tsx

  features/
    auth/
    communities/
    channels/
    posts/
    comments/
    events/
    messaging/
    profiles/
    connections/
    notifications/
    search/

  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    validations/
    utils/
    constants/

  hooks/
  types/

supabase/
  migrations/
  seed.sql

public/
  images/
  icons/

This is a suggested structure, not a requirement to create
empty directories or unnecessary abstractions.

Create actual files as features are implemented.

Keep components focused and reusable.

Use Server Components by default.

Use Client Components only when browser interaction,
client-side state, event handlers, or realtime subscriptions
require them.

Do not make the entire application a Client Component.

========================================================
5. VISUAL DESIGN SYSTEM
========================================================

Recreate the colors and styling from the reference screenshots.

Use the following starting palette and adjust it after
comparing the rendered UI with the screenshots.

PRIMARY BLUE:

- Primary: #0B66C3
- Primary hover: #0957A5
- Primary light: #EAF3FF
- Primary border: #BFD8F5

PAGE BACKGROUND:

- Main background: #F4F6FA
- Secondary background: #F8FAFD
- Card background: #FFFFFF

TEXT:

- Primary text: #172033
- Secondary text: #667085
- Muted text: #8792A5

BORDERS:

- Standard border: #E3E8EF
- Input border: #D7DFEA

STATUS COLORS:

- Success: #16A36A
- Success background: #E8F7EF
- Warning: #E9A23B
- Error: #DC3545

Use these as design tokens rather than scattering color
values across components.

TYPOGRAPHY:

- Use Inter as the primary font.
- Use a consistent type scale.
- Page headings should be prominent without being oversized.
- Body text should remain readable.
- Secondary information should have sufficient contrast.
- Use font weights consistently.

Suggested typography:

- Page title: 26–30px, semibold.
- Section title: 17–20px, semibold.
- Card title: 15–17px, semibold.
- Body: 14–15px.
- Supporting text: 13–14px.
- Small labels: 12–13px.

SPACING:

Use a consistent spacing system based on 4px increments.

Suggested values:

- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px

BORDER RADIUS:

- Inputs: 12px.
- Buttons: 10–12px.
- Cards: 18–22px.
- Avatars: circular.
- Small badges: 8–12px.

SHADOWS:

Use subtle shadows.

Cards should feel elevated from the page background without
appearing dark or excessively raised.

BUTTONS:

Primary actions should use blue backgrounds and white text.

Secondary actions should use white backgrounds with subtle
blue or neutral borders.

Tertiary actions should use transparent backgrounds.

Create reusable button variants.

Do not use emoji as replacements for interface icons.

Use Lucide React icons with consistent sizes and stroke widths.

Use the screenshots to fine-tune spacing, card dimensions,
navigation height, and alignment.

========================================================
6. GLOBAL APPLICATION SHELL
========================================================

Build a shared application layout used by all main sections.

DESKTOP LAYOUT:

At desktop widths, reproduce the three-part visual structure:

1. Left sidebar.
2. Top navigation.
3. Main content area with optional right sidebar.

LEFT SIDEBAR:

Target width: approximately 270–280px at a 1536px viewport.

The sidebar should have:

- GradPad logo.
- Active community selector.
- Channels section.
- Add-channel action.
- Community list.
- Add-community action.
- Browse all communities button.
- Current user profile card at the bottom.

The sidebar should remain visually stable when the main content
scrolls.

The user profile section should remain anchored near the bottom
when sufficient vertical space is available.

The sidebar should include:

GRADPAD BRANDING:

Create a clean logo treatment.

If no official logo asset exists, create a simple, tasteful
placeholder using CSS or an SVG icon.

Do not copy or use unrelated copyrighted logo assets.

ACTIVE COMMUNITY:

Display:

- Community logo.
- Community name.
- Active community status.

CHANNELS:

Display channel names with hashtag icons.

Example:

- General
- Career advice
- Local meetups
- Class of 2020

Clicking a channel should navigate to the appropriate
community channel.

COMMUNITIES:

Display communities with:

- Logo or fallback initials.
- Community name.
- Active selection state.

The active community should use a pale blue background and
blue text, as shown in the screenshots.

Allow the user to switch communities.

The list must come from Supabase, not hardcoded production data.

Provide a loading skeleton and an empty state.

TOP NAVIGATION:

Create navigation items for:

- Home
- Communities
- Events
- Chat
- Create

Include:

- Search field.
- Keyboard shortcut hint.
- Notifications icon.
- User avatar.

The active navigation item must display blue text/icon and
a blue underline.

The top navigation should remain fixed or sticky in a manner
consistent with the screenshots.

MAIN CONTENT:

Use a light blue-gray background.

Use a centered content container and responsive grid layouts.

Cards should have white backgrounds, thin borders, rounded
corners, and subtle shadows.

RIGHT SIDEBAR:

Where applicable, display contextual widgets:

- User profile summary.
- Community memberships.
- Quick actions.
- Upcoming events.
- People you may know.

The right sidebar should be present on desktop where space
allows.

It must not squeeze the primary content excessively.

At intermediate widths, hide or rearrange nonessential widgets.

At mobile widths, move contextual information into the relevant
page or hide redundant desktop-only widgets.

========================================================
7. RESPONSIVE DESIGN — CRITICAL REQUIREMENT
========================================================

The desktop screenshots are the primary visual references.

However, the application must also work well on mobile.

Do not simply shrink the desktop layout to fit a phone.

Create responsive layouts appropriate for each device.

DESKTOP: 1200px AND ABOVE

- Persistent left sidebar.
- Top navigation.
- Main content.
- Optional right sidebar.
- Multi-column cards when appropriate.

TABLET: APPROXIMATELY 768px–1199px

- Sidebar becomes collapsible or compact.
- Main content receives more available width.
- Right sidebar may disappear.
- Cards adapt to available space.
- Navigation remains usable.

MOBILE: BELOW 768px

- No permanently visible desktop sidebar.
- Compact mobile header.
- Hamburger menu or slide-over navigation.
- Bottom navigation for primary destinations.
- Full-width main content.
- Appropriate card padding.
- Touch-friendly controls.
- No horizontal page overflow.

MOBILE NAVIGATION:

Provide:

- Home
- Communities
- Events
- Chat
- Create

Use icons with concise labels.

The active destination must be clearly identifiable.

Place the navigation where it does not obscure content.

Account for device safe areas.

COMMUNITY PAGE ON MOBILE:

- Full-width community cover image.
- Community logo and name.
- Community description.
- Membership actions.
- Channels and posts.
- Events displayed vertically.
- Optional tabs for Overview, Posts, Events, and Members.

EVENTS ON MOBILE:

- List view should be the default.
- Cards should stack vertically.
- Important event information must remain visible.
- Calendar navigation must work on touch screens.
- Avoid a cramped seven-column calendar.

For the calendar, either use a compact monthly layout with
horizontal scrolling when necessary or provide an alternative
agenda view.

CHAT ON MOBILE:

Use a two-screen interaction model.

Screen one:
- Conversation list.
- Search contacts.
- Unread filter.
- Group filter.

Screen two:
- Selected conversation.
- Message history.
- Message composer.
- Back button.

Do not show the desktop inbox and conversation panes
side-by-side on a narrow screen.

CREATE ON MOBILE:

Use a full-width form.

Make title, content, community selection, media upload, and
submit actions easy to use.

Ensure all dropdowns and dialogs fit the viewport.

GLOBAL RESPONSIVENESS:

- Prevent horizontal overflow.
- Use responsive CSS Grid and Flexbox.
- Avoid fixed widths for main content.
- Avoid absolute positioning for primary layouts.
- Keep buttons usable with touch.
- Maintain readable text.
- Respect keyboard navigation.
- Respect prefers-reduced-motion.

Test the UI at:

- 1536 × 960
- 1440 × 900
- 1280 × 800
- 1024 × 768
- 768 × 1024
- 390 × 844
- 375 × 812

========================================================
8. AUTHENTICATION
========================================================

Implement authentication using Supabase Auth.

Required screens:

- Login.
- Sign up.
- Forgot password.
- Password reset.
- Logout.
- Authentication callback handling.
- Session persistence.

Support email and password authentication.

Structure the code so additional OAuth providers can be
introduced later.

The signup flow should collect basic profile information.

After signup, create the associated user profile using a secure
database trigger or an equivalent reliable server-side flow.

Do not expose Supabase service-role keys to the browser.

Protect authenticated routes appropriately.

Use server-side session verification where appropriate.

Do not rely exclusively on client-side redirects to protect
private data.

Handle expired sessions and authentication errors gracefully.

If Supabase credentials are missing, display a clear setup
instruction instead of silently pretending authentication
works.

========================================================
9. HOME PAGE
========================================================

Recreate the Home page shown in the first screenshot.

DESKTOP STRUCTURE:

- Shared application shell.
- Community/update filters.
- Featured event card.
- Main social feed.
- Right sidebar with profile and event information.

FILTERS:

Include:

- All updates.
- Communities the user belongs to.
- Events.

Filters should update the displayed feed.

FEATURED EVENT:

Display:

- Date.
- Community name.
- Event title.
- Time.
- Short description.
- Organizer.
- Location.
- RSVP action.

Clicking the event opens its details.

POST FEED:

Each post card should display:

- Community/channel breadcrumb.
- Author avatar.
- Author name.
- Timestamp.
- Post content.
- Optional image or media.
- Like count.
- Comment count.
- Like button.
- Comment button.
- Share action.
- Bookmark action.
- More-actions menu.

Support:

- Text posts.
- Image posts.
- Comments.
- Likes.
- Bookmarks.
- Sharing or copying a post link.

Like, bookmark, and comment counts must update from real
database state.

Use optimistic updates only when they can be reconciled
safely with server responses.

RIGHT SIDEBAR:

PROFILE SUMMARY:

- Avatar.
- User name.
- Education or alumni description.
- Connection count.
- Community count.

UPCOMING EVENTS:

Show upcoming events with date and time.

PEOPLE YOU MAY KNOW:

Show suggested users and a Connect action.

The layout should match the screenshots closely.

On mobile, the feed becomes a single column.

========================================================
10. COMMUNITIES
========================================================

Build a complete community discovery and management system.

COMMUNITY DISCOVERY:

Provide:

- Browse communities.
- Search communities.
- Filter communities.
- Community cards.
- Community descriptions.
- Member counts.
- Join or request-to-join actions.
- Membership status.

COMMUNITY OVERVIEW:

Recreate the screenshots showing the UCLA community page.

The main community card should contain:

- Cover image.
- Community logo overlapping the cover.
- Community name.
- Location.
- Description.
- Member avatar stack.
- Additional member count.
- Membership controls.
- Admin dashboard action when authorized.

Below the community header, include:

CHANNELS:

Show available discussion channels.

Each channel card should contain:

- Channel icon.
- Channel name.
- Short description.
- Open channel action.

EVENTS:

Show upcoming community events.

Each event card should contain:

- Date.
- Time.
- Event title.
- Description.
- RSVP or Manage action.

POSTS:

Display community posts using the shared PostCard component.

RIGHT SIDEBAR:

Include:

- User profile summary.
- Community memberships.
- Quick actions.
- Upcoming events.

COMMUNITY MANAGEMENT:

Authorized community owners and admins should be able to:

- Edit community information.
- Upload logos and cover images.
- Create channels.
- Edit channels.
- Delete channels when permitted.
- Manage membership requests.
- Remove members when authorized.
- Manage community events.
- Moderate posts.

Enforce permissions on the backend using RLS and secure
server-side operations.

Hiding a button in the UI is not sufficient authorization.

Create an admin dashboard with meaningful management screens.

========================================================
11. CHANNELS AND DISCUSSIONS
========================================================

Implement community channels.

Each channel should have:

- Name.
- Description.
- Parent community.
- Membership or access rules.
- Posts.
- Moderation controls.

Example channels:

- General.
- Career advice.
- Local meetups.
- Class of 2020.

Channel functionality:

- Browse posts.
- Create posts.
- Comment on posts.
- Like posts.
- Bookmark posts.
- Filter or sort posts.
- Open author profiles.
- Report inappropriate content where appropriate.

Use pagination or infinite loading.

Do not load every post into the browser at once.

Support appropriate empty states for new channels.

========================================================
12. EVENTS
========================================================

Recreate both Events screenshots.

The Events page must support two primary modes:

1. Feed.
2. Calendar.

EVENTS PAGE HEADER:

- Title: Your events.
- Supporting description.
- Create button.
- Feed/Calendar segmented control.

EVENT FEED:

Each event card should display:

- Time.
- Date or relative date.
- Event thumbnail.
- Community or chapter.
- Event title.
- Description.
- Event status.
- Privacy badge.
- Location.
- Price.
- Attendee avatars.
- Attendee count.
- Primary action.

Primary actions depend on permissions and RSVP status:

- RSVP.
- View details.
- Manage event.

Use consistent card dimensions and spacing.

CALENDAR VIEW:

Build a functional monthly calendar.

Include:

- Previous month.
- Next month.
- Current month and year.
- Seven weekday columns on sufficiently wide screens.
- Event indicators on dates.
- Selected date styling.
- Selected-day event list.

Clicking a date should display events scheduled for that date.

Clicking an event should open the event detail page or dialog.

Provide a list/agenda alternative on mobile.

UPCOMING EVENTS SIDEBAR:

Display:

- Current month or relevant date range.
- Upcoming event title.
- Date.
- Time.
- Location.
- View calendar action.

CREATE EVENT:

Provide a form with:

- Event title.
- Description.
- Community.
- Optional channel.
- Start date and time.
- End date and time.
- Time zone.
- Online or in-person format.
- Location or meeting URL.
- Cover image.
- Free or paid event.
- Price and currency if applicable.
- Public or private visibility.
- RSVP capacity.
- Registration deadline when applicable.

Validate dates and required fields.

Do not allow the end time to precede the start time.

EVENT DETAILS:

Display all event information.

Include:

- Organizer.
- Community.
- Date and time.
- Location.
- Description.
- Attendees.
- RSVP action.
- Edit/manage actions for authorized users.

RSVP:

Implement actual RSVP persistence.

Prevent duplicate registrations.

Support suitable statuses such as:

- Going.
- Interested.
- Cancelled.

Keep event attendee counts accurate.

For paid events, do not pretend a payment has succeeded.
Payment integration can be added separately.

========================================================
13. CHAT AND MESSAGING
========================================================

Recreate the chat interface shown in the screenshot.

DESKTOP LAYOUT:

Two primary panels.

LEFT PANEL:

- Inbox title.
- Conversation count.
- New conversation button.
- Contact search.
- All filter.
- Unread filter.
- Groups filter.
- Conversation list.

Each conversation row should display:

- Avatar.
- Name.
- User type or group description.
- Last message preview.
- Last activity.
- Unread count.

RIGHT PANEL:

- Conversation header.
- Avatar.
- Name.
- Online status when available.
- Conversation information button.
- Message history.
- Message composer.
- Send button.

MESSAGE BUBBLES:

Incoming messages should use light backgrounds.

Outgoing messages should use the primary blue color.

Display timestamps.

Support long messages and appropriate wrapping.

MESSAGING FEATURES:

- One-to-one conversations.
- Group conversations.
- Sending messages.
- Receiving messages.
- Conversation history.
- Unread indicators.
- Read state where appropriate.
- Message pagination.
- Realtime updates.
- Conversation search.
- Basic attachment support if implemented safely.
- New conversation creation.

Use Supabase Realtime for live message updates when configured.

Do not subscribe to every table or every conversation globally.

Subscribe only to the relevant conversation and clean up
subscriptions when components unmount.

Persist all messages in Supabase.

Enforce conversation membership through RLS.

A user must not be able to read messages from a conversation
they do not belong to.

On mobile, use a conversation-list screen and a separate
conversation screen.

========================================================
14. CREATE EXPERIENCE
========================================================

Recreate the Create page from the screenshot.

The top navigation's Create item should navigate to a page
where users can choose what they want to create.

Provide three creation modes:

1. Post.
2. Event.
3. Community.

Use a segmented selector or tab-like interface.

The active mode should have a white elevated card and a clear
blue accent.

POST CREATION FORM:

Include:

- Author avatar.
- Create a post heading.
- Supporting description.
- Post destination.
- Community selection.
- Optional channel selection.
- Title.
- Rich-text or formatted content.
- Image upload.
- Draft support.
- Character count.
- Save draft.
- Publish post.

The screenshot shows a post creation form with:

- Post to selector.
- Selected community selector.
- Title input.
- Large content editor.
- Basic formatting actions.
- Character counter.
- Save draft button.
- Post button.

Recreate this structure.

POST DESTINATION:

Support the appropriate destinations:

- Community.
- Channel, where applicable.
- A broader feed if the product's permission model allows it.

Do not show communities that the user is not authorized to post
to, unless the selected destination explicitly permits it.

EVENT CREATION:

Reuse the event form described in the Events section.

COMMUNITY CREATION:

Include:

- Community name.
- Slug.
- Description.
- Institution.
- Location.
- Logo.
- Cover image.
- Visibility.
- Membership approval settings.

Add clear validation and submission states.

POST TIPS SIDEBAR:

Recreate the right-hand card shown in the screenshot.

Example content:

POST TIPS

Start a meaningful conversation.

- Use a clear, descriptive title.
- Share context with your community.
- Be respectful and constructive.

The tips should change appropriately for Event and Community
creation modes.

MOBILE:

Use a full-width layout and avoid the narrow centered desktop
form.

========================================================
15. USER PROFILES AND CONNECTIONS
========================================================

Implement user profiles.

PROFILE INFORMATION:

- Full name.
- Avatar.
- Headline or short bio.
- Institution.
- Graduation year.
- Location.
- Interests.
- Website or professional profile, if provided.

PROFILE PAGE:

Include:

- Profile header.
- Avatar.
- Name.
- Bio.
- Institution and graduation information.
- Connection count.
- Community membership count.
- Shared communities where appropriate.
- Posts.
- Connection action.

Allow users to edit their own profiles.

Allow users to upload avatars using Supabase Storage.

CONNECTIONS:

Support:

- Sending connection requests.
- Accepting requests.
- Rejecting requests.
- Removing connections.
- Viewing connections.
- Showing connection status.

Prevent users from creating duplicate or invalid connection
requests.

Do not expose private profile information unnecessarily.

========================================================
16. NOTIFICATIONS
========================================================

Build a notifications interface.

Notification types can include:

- Connection requests.
- Connection acceptance.
- New messages.
- Comments on posts.
- Likes on posts.
- Event reminders.
- Event updates.
- Community membership updates.

Display:

- Notification icon.
- Unread indicator.
- Notification list.
- Timestamp.
- Read/unread status.
- Mark all as read.

Clicking a notification should navigate to the appropriate
resource when possible.

Use database-backed notifications.

Do not display fake notifications as if they were real.

========================================================
17. SEARCH
========================================================

Implement application-wide search.

Search across the resources the current user is permitted to
discover:

- Communities.
- Events.
- Users.
- Posts.
- Channels, where applicable.

Provide:

- Search input.
- Search suggestions where useful.
- Search results page.
- Loading states.
- Empty states.
- Appropriate filters.

Debounce user input when necessary.

Use indexed database queries or other suitable search
mechanisms.

Do not retrieve the entire database and filter it in the
browser.

Respect community visibility and access permissions.

========================================================
18. SUPABASE DATABASE ARCHITECTURE
========================================================

Use Supabase PostgreSQL as the primary database.

Design a relational schema with foreign keys, indexes,
constraints, and appropriate uniqueness rules.

Create migrations inside:

supabase/migrations/

Do not rely on manually creating tables in the Supabase
dashboard as the only setup method.

The schema should be reproducible using SQL migrations.

Create the following core tables or equivalent well-designed
structures.

1. profiles

Fields:

- id UUID primary key referencing auth.users(id).
- full_name.
- username, if supported.
- avatar_url.
- bio.
- headline.
- institution.
- graduation_year.
- location.
- website.
- created_at.
- updated_at.

2. communities

Fields:

- id UUID primary key.
- name.
- slug.
- description.
- institution.
- location.
- logo_url.
- cover_image_url.
- visibility.
- join_approval_required.
- created_by.
- created_at.
- updated_at.

3. community_members

Fields:

- id UUID primary key.
- community_id.
- user_id.
- role.
- status.
- joined_at.

Enforce one membership record per user/community pair.

Roles may include:

- owner.
- admin.
- moderator.
- member.

Membership statuses may include:

- pending.
- active.
- rejected.
- banned.

4. channels

Fields:

- id UUID primary key.
- community_id.
- name.
- slug.
- description.
- created_by.
- created_at.
- updated_at.

Enforce appropriate uniqueness within a community.

5. posts

Fields:

- id UUID primary key.
- author_id.
- community_id, nullable when permitted.
- channel_id, nullable when permitted.
- title.
- content.
- visibility.
- created_at.
- updated_at.
- deleted_at, if soft deletion is used.

Support text and image-based posts.

Use a separate media table if that produces a cleaner model.

6. post_media

Fields:

- id UUID primary key.
- post_id.
- media_url.
- media_type.
- display_order.
- created_at.

7. post_likes

Fields:

- id UUID primary key.
- post_id.
- user_id.
- created_at.

Enforce one like per user/post.

8. post_bookmarks

Fields:

- id UUID primary key.
- post_id.
- user_id.
- created_at.

Enforce one bookmark per user/post.

9. comments

Fields:

- id UUID primary key.
- post_id.
- author_id.
- parent_comment_id, nullable.
- content.
- created_at.
- updated_at.

Support a reasonable comment structure without allowing
uncontrolled recursive loading.

10. events

Fields:

- id UUID primary key.
- community_id.
- channel_id, nullable.
- organizer_id.
- title.
- description.
- cover_image_url.
- start_at.
- end_at.
- timezone.
- event_type.
- location.
- meeting_url.
- visibility.
- price.
- currency.
- capacity.
- registration_deadline.
- created_at.
- updated_at.

Use appropriate numeric types for monetary values.

Do not use floating-point columns for financial amounts.

11. event_rsvps

Fields:

- id UUID primary key.
- event_id.
- user_id.
- status.
- created_at.
- updated_at.

Enforce one RSVP per user/event.

12. conversations

Fields:

- id UUID primary key.
- type.
- title, nullable for direct messages.
- created_by.
- created_at.
- updated_at.

13. conversation_members

Fields:

- id UUID primary key.
- conversation_id.
- user_id.
- joined_at.
- last_read_at.

Enforce unique conversation/user membership.

14. messages

Fields:

- id UUID primary key.
- conversation_id.
- sender_id.
- content.
- attachment_url, if needed.
- attachment_type, if needed.
- created_at.
- edited_at.
- deleted_at, if supported.

15. connections

Fields:

- id UUID primary key.
- requester_id.
- addressee_id.
- status.
- created_at.
- updated_at.

Prevent self-connections and duplicate relationships.

16. notifications

Fields:

- id UUID primary key.
- recipient_id.
- actor_id, nullable.
- type.
- resource_type.
- resource_id.
- message or metadata.
- read_at.
- created_at.

17. post_drafts

Fields:

- id UUID primary key.
- user_id.
- title.
- content.
- community_id, nullable.
- channel_id, nullable.
- updated_at.
- created_at.

18. community_membership_requests, if needed separately.

19. reports, if moderation reporting is implemented.

20. event or community media records only if needed beyond
the fields already described.

You may adjust the schema when a better relational design
is justified.

Avoid unnecessary duplication.

Use proper foreign keys and indexes.

Use database constraints wherever they can prevent invalid
states.

Store timestamps in a consistent format.

Use timestamptz for timestamps representing actual moments
in time.

Respect event time zones.

Create indexes for common query patterns, including:

- Community membership lookups.
- Community post feeds.
- Channel post feeds.
- Event date queries.
- Event RSVP lookups.
- Conversation membership.
- Conversation message pagination.
- Notification lists.
- Connection requests.

Do not create an excessive number of redundant indexes.

========================================================
19. ROW LEVEL SECURITY AND DATA SECURITY
========================================================

Enable Row Level Security on all relevant application tables.

Write actual RLS policies in the migrations.

Do not merely enable RLS without adding policies.

Define policies based on the product's access rules.

Examples:

PROFILES:

- Users can update their own profile.
- Users can read profiles that are intended to be discoverable.
- Sensitive information must not be exposed unnecessarily.

COMMUNITIES:

- Public communities can be discovered according to visibility
  rules.
- Private community details must respect access restrictions.
- Only authorized owners/admins can update community settings.

COMMUNITY MEMBERS:

- Users can read appropriate membership records.
- Users cannot assign themselves an owner or admin role.
- Only authorized users can approve or reject requests.
- Membership role changes must be restricted.

CHANNELS:

- Channel access follows the parent community's rules.
- Only authorized users can create or manage restricted channels.

POSTS:

- Users can create posts only in destinations where they have
  the required permission.
- Users can edit or delete their own posts, subject to policy.
- Moderators may have additional permissions.
- Private community content must not be exposed to outsiders.

LIKES AND BOOKMARKS:

- Users can create or remove their own likes/bookmarks.
- Users cannot impersonate another user.

EVENTS:

- Event visibility follows community and event privacy.
- Only authorized users can edit or delete events.
- RSVP actions must be restricted to eligible users.

MESSAGING:

- Only conversation members can read conversation messages.
- Only authorized conversation members can send messages.
- Users cannot add themselves to private conversations
  without the appropriate authorization.

CONNECTIONS:

- Users can manage their own connection requests.
- Prevent forged acceptance or modification of another user's
  requests.

NOTIFICATIONS:

- Users can read and update only their own notifications.

DRAFTS:

- Users can access only their own drafts.

Do not solve security problems by trusting values submitted
by the browser.

Do not allow arbitrary users to change their role through a
direct database update.

If a security-sensitive operation requires a server-side
function or controlled RPC, implement it deliberately and
validate the caller.

Review the interaction between triggers, RLS policies,
foreign keys, and database functions.

Never expose:

- Supabase service-role keys.
- Private API keys.
- Database passwords.
- Server secrets.

========================================================
20. SUPABASE STORAGE
========================================================

Create an upload strategy using Supabase Storage.

Suggested buckets:

- avatars
- community-assets
- post-media
- event-media
- message-attachments

Choose public or private bucket access according to the
sensitivity of the content.

Use signed URLs for private media where appropriate.

Validate file types and sizes.

Provide:

- Upload progress where practical.
- Image preview.
- Upload error handling.
- Retry behavior where appropriate.
- Image replacement and removal.
- Accessible upload controls.

Do not assume that hiding an upload button provides security.

Storage policies must restrict users to permitted operations.

Community owners/admins should have the necessary permissions
to manage community assets.

Do not allow arbitrary users to overwrite another user's files.

========================================================
21. REALTIME AND LIVE UPDATES
========================================================

Use Supabase Realtime where it meaningfully improves the UX.

Prioritize:

- Incoming chat messages.
- Conversation changes.
- Relevant notification updates.
- Optional live event or community updates.

Do not use realtime subscriptions unnecessarily.

Ensure subscriptions:

- Are scoped to the correct resources.
- Respect authorization.
- Are cleaned up correctly.
- Do not create duplicate event handlers.
- Handle reconnects and transient failures.

Use ordinary database queries for content that does not require
instant updates.

========================================================
22. DATA FETCHING AND PERFORMANCE
========================================================

Use the Next.js App Router appropriately.

Requirements:

- Prefer Server Components for initial data fetching.
- Use Client Components for interactive features.
- Avoid unnecessary useEffect-based data fetching.
- Avoid fetching the same data repeatedly.
- Use pagination for feeds and messages.
- Use selective database columns.
- Avoid N+1 queries.
- Use database indexes.
- Avoid unnecessary rerenders.
- Use stable component boundaries.
- Use optimized image rendering.
- Lazy-load nonessential UI when appropriate.

Use appropriate cache settings.

Do not accidentally cache private user-specific information
across different authenticated users.

For user-specific or sensitive data, use an appropriate
uncached or properly isolated data-fetching strategy.

Ensure realtime data updates do not conflict with pagination.

Avoid overengineering.

The application should remain maintainable as the number of
communities, posts, events, and messages grows.

========================================================
23. FORMS AND VALIDATION
========================================================

Use React Hook Form and Zod where appropriate.

Validate important data on both the client and server.

Forms should include:

- Clear labels.
- Helpful placeholders.
- Inline validation errors.
- Disabled submit states while submitting.
- Success feedback.
- Error feedback.
- Duplicate-submission prevention.
- Accessible keyboard interaction.

Never display a success message before a database operation
has succeeded.

Use confirmation dialogs for destructive operations.

Provide unsaved-changes protection for lengthy forms when
appropriate.

========================================================
24. LOADING, EMPTY, AND ERROR STATES
========================================================

Every data-driven page must handle:

1. Initial loading.
2. Empty results.
3. Request failures.
4. Unauthorized access.
5. Expired sessions.
6. Missing records.
7. Successful mutations.
8. Network interruptions where appropriate.

Use skeleton loaders that match the page layout.

Examples:

- Feed skeleton.
- Community card skeleton.
- Event card skeleton.
- Conversation list skeleton.
- Message history skeleton.

Provide useful empty states.

Examples:

- No communities joined.
- No posts available.
- No upcoming events.
- No conversations yet.
- No notifications.
- No search results.

Avoid blank screens.

Do not replace real database errors with fake successful data.

Use error boundaries where appropriate.

========================================================
25. SEED DATA AND DEMONSTRATION EXPERIENCE
========================================================

Create optional development seed data.

The reference screenshots include example communities such as:

- UCLA.
- Boston Latin School.
- Pepperdine University.
- USC Alumni.
- Duke University.

Use these as development examples only.

Do not assume they are actual production communities.

Create believable sample records for local development.

Include sample:

- Profiles.
- Communities.
- Community memberships.
- Channels.
- Posts.
- Comments.
- Events.
- RSVPs.
- Conversations and messages where appropriate.

Seed data should use deterministic IDs where practical.

Do not hardcode sample posts or communities directly inside
production UI components.

Create a documented and repeatable seed workflow.

Because Supabase Auth users are required for some relationships,
document how to create local/demo users safely.

Never include real credentials in seed files.

Do not create a public demo account with a known password
unless the application is explicitly configured for a safe,
isolated demo environment.

========================================================
26. ENVIRONMENT CONFIGURATION
========================================================

Create a .env.example file.

Include the variables required by the implementation.

For example:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

If the current Supabase configuration uses a publishable key,
use that supported key format instead.

If server-side operations require a secret or service-role key,
keep it in a server-only environment variable.

Never prefix private secrets with NEXT_PUBLIC_.

Do not hardcode credentials in source code.

Do not overwrite an existing .env file.

Do not print secret values in logs or terminal output.

Provide clear setup documentation.

========================================================
27. APPLICATION ROUTES
========================================================

Implement the main routes with sensible navigation.

Suggested routes:

/
Redirect authenticated users to /home and unauthenticated users
to /login, or provide an appropriate public landing page.

 /login
 /signup
 /forgot-password
 /auth/callback
 /home
 /communities
 /communities/[slug]
 /communities/[slug]/channels/[channelSlug]
 /communities/[slug]/members
 /communities/[slug]/settings
 /communities/[slug]/admin
 /events
 /events/[eventId]
 /events/create
 /events/[eventId]/edit
 /chat
 /chat/[conversationId]
 /create
 /profile/[username]
 /settings/profile
 /settings/account
 /notifications
 /search

You may adjust route names where appropriate.

Use Next.js route groups and layouts to avoid duplicating
the shared application shell.

Ensure that navigation works.

Do not build buttons that point to nonexistent pages.

For unsupported or unfinished functionality, provide an
appropriate disabled state or a clearly marked implementation
boundary instead of a broken interaction.

========================================================
28. ACCESSIBILITY
========================================================

Follow practical WCAG accessibility principles.

Requirements:

- Semantic HTML.
- Keyboard-accessible navigation.
- Visible focus states.
- Proper form labels.
- Accessible dialogs.
- Meaningful alt text.
- Appropriate ARIA attributes.
- Adequate color contrast.
- Screen-reader-friendly button labels.
- Reduced-motion support.
- Correct focus handling for mobile menus and modals.

Do not rely exclusively on color to communicate state.

========================================================
29. CODE QUALITY
========================================================

Follow these requirements strictly.

- Use TypeScript throughout the application.
- Avoid using any unless there is a clear reason.
- Do not put the entire application into one large file.
- Avoid giant components.
- Avoid duplicate UI implementations.
- Extract reusable components.
- Keep business logic separate from presentation.
- Keep Supabase queries in sensible feature modules or data
  access layers.
- Centralize shared validation schemas.
- Use consistent naming conventions.
- Keep server-only code separate from client-side code.
- Use clear error handling.
- Avoid unnecessary abstractions.
- Avoid unnecessary dependencies.
- Do not leave fake API calls in place of real operations.
- Do not leave TODOs for core functionality.
- Do not suppress TypeScript errors just to make builds pass.
- Do not use @ts-ignore as a shortcut.
- Do not disable ESLint rules globally to hide problems.
- Do not use mock data as a fallback that silently hides
  Supabase failures.
- Do not implement authorization only in the frontend.

Use comments when they explain meaningful decisions.

Do not comment on every line.

========================================================
30. IMPLEMENTATION PHASES
========================================================

Do not attempt to generate the entire application in one
unstructured code-generation pass.

Work in the following phases.

PHASE 1 — PROJECT FOUNDATION

- Inspect the project.
- Initialize the framework if needed.
- Configure TypeScript and Tailwind.
- Install required dependencies.
- Establish design tokens.
- Configure Supabase clients.
- Establish the shared layout.
- Build the desktop sidebar.
- Build top navigation.
- Build responsive mobile navigation.
- Create reusable buttons, cards, avatars, and inputs.

Acceptance criteria:

The application starts successfully.

The shared layout resembles the reference screenshots.

The layout adapts correctly to desktop and mobile screens.

PHASE 2 — DATABASE AND AUTHENTICATION

- Create database migrations.
- Create initial RLS policies.
- Configure Supabase authentication.
- Implement signup, login, and logout.
- Create user profiles.
- Implement protected routes.
- Configure storage buckets and policies.
- Add setup documentation.

Acceptance criteria:

A user can create an account, sign in, refresh the browser,
and retain the correct session.

Unauthorized users cannot access protected data.

PHASE 3 — COMMUNITIES AND CHANNELS

- Community discovery.
- Community membership.
- Community detail page.
- Community header.
- Channel listing.
- Channel detail page.
- Community administration.
- Community membership management.

Acceptance criteria:

Community data comes from Supabase.

Membership changes persist.

Permission restrictions are enforced.

PHASE 4 — HOME FEED AND POSTS

- Home feed.
- Community filters.
- Post cards.
- Post creation.
- Post editing and deletion.
- Image uploads.
- Likes.
- Comments.
- Bookmarks.
- Drafts.
- Feed pagination.

Acceptance criteria:

Posts and interactions persist in Supabase.

The feed matches the reference design.

PHASE 5 — EVENTS

- Event feed.
- Calendar.
- Event creation.
- Event detail page.
- Event editing.
- RSVP functionality.
- Attendee information.
- Upcoming events sidebar.
- Permissions and validation.

Acceptance criteria:

Calendar navigation works.

Events display on the correct dates.

RSVPs persist and duplicate registrations are prevented.

PHASE 6 — CHAT

- Conversation list.
- Direct messages.
- Group conversations.
- Message composer.
- Message history.
- Realtime updates.
- Unread state.
- Mobile chat navigation.
- Conversation permissions.

Acceptance criteria:

Messages persist in Supabase.

Realtime messages appear without refreshing when properly
configured.

Unauthorized users cannot read private conversations.

PHASE 7 — PROFILES, SEARCH, AND NOTIFICATIONS

- Profile pages.
- Profile editing.
- Connections.
- Notifications.
- Global search.
- Search filters.
- Loading and empty states.

Acceptance criteria:

These features use real database data.

User permissions are respected.

PHASE 8 — POLISH AND QUALITY ASSURANCE

- Compare each page against the screenshots.
- Improve spacing and alignment.
- Test responsive breakpoints.
- Test keyboard navigation.
- Fix TypeScript errors.
- Fix lint errors.
- Run a production build.
- Test authentication and database permissions.
- Review image optimization.
- Review loading and error states.
- Document deployment.

Do not claim that a phase is complete until its acceptance
criteria have been checked.

========================================================
31. VISUAL QUALITY ASSURANCE
========================================================

The screenshots are a key part of the specification.

After implementing each page, compare the rendered UI with
the corresponding reference screenshot.

Focus on:

- Sidebar width.
- Header height.
- Main content width.
- Right sidebar width.
- Horizontal spacing.
- Vertical spacing.
- Card radius.
- Border color.
- Background color.
- Font sizes.
- Typography weights.
- Button dimensions.
- Icon size and alignment.
- Avatar size.
- Image aspect ratios.
- Active navigation states.
- Filter states.
- Calendar cell alignment.
- Message bubble positioning.
- Form spacing.

Do not stop after the page merely renders.

Make visual adjustments until the page is reasonably close
to the provided screenshots.

Avoid adding visual elements that are absent from the
reference unless they improve usability without changing
the overall design.

Ensure mobile layouts are intentionally designed rather than
being desktop screenshots compressed into narrow columns.

========================================================
32. FINAL DELIVERABLES
========================================================

The completed project should contain:

1. Working Next.js application.
2. Responsive desktop interface.
3. Responsive mobile interface.
4. Shared design system.
5. Supabase authentication.
6. Database migrations.
7. Row Level Security policies.
8. Storage configuration.
9. Community management.
10. Channels and discussions.
11. Home feed.
12. Post creation and interactions.
13. Event feed and calendar.
14. Event creation and RSVP management.
15. Chat and messaging.
16. User profiles.
17. Connections.
18. Notifications.
19. Global search.
20. Loading, empty, and error states.
21. Development seed data.
22. .env.example.
23. README with setup instructions.
24. Build and lint validation.

Also document:

- How to create a Supabase project.
- Which environment variables are required.
- How to run database migrations.
- How to seed development data.
- How to run the application locally.
- How to configure Supabase Storage.
- How to deploy the application.
- Which external services are required.
- Which features require additional configuration.

========================================================
33. START NOW
========================================================

Begin by inspecting the current gradpad project folder.

Then:

1. Report the existing project structure and configuration.
2. Identify missing setup requirements.
3. Establish the design system.
4. Implement the shared application shell.
5. Build the responsive desktop and mobile layouts.
6. Configure Supabase integration.
7. Proceed through the implementation phases.

Do not stop after generating a plan.

Start implementing the actual project immediately.

Make reasonable technical decisions without asking me to
approve every component or file.

If a required external configuration is missing, implement
the relevant integration and clearly document what I must
configure.

Never invent credentials or pretend external services are
connected when they are not.

After each phase:

- Summarize the files created or modified.
- Explain what is working.
- Run relevant validation commands.
- Fix errors before moving forward.
- Identify any external configuration that remains.

Prioritize working, maintainable features over generating
large quantities of incomplete code.

The end result should be a polished GradPad application
that closely matches the reference screenshots and works
well on desktop, tablet, and mobile.