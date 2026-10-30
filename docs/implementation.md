PROJECT: GRADPAD
TASK: Convert the existing static UI into a fully functional,
production-quality, responsive full-stack application.

IMPORTANT:
The application UI has already been implemented, and Supabase
has already been connected.

Do NOT start the project from scratch.
Do NOT replace the existing application with a new template.
Do NOT unnecessarily rewrite working components.

Your responsibility is to inspect the existing implementation,
understand what is already working, and systematically transform
the application into a fully functional product.

============================================================
1. PRIMARY OBJECTIVE
============================================================

Read and follow:

- @docs/architecture.md
- All attached GradPad UI reference screenshots.
- The existing application source code.
- The existing Supabase database schema and migrations.
- The existing environment and deployment configuration.

The attached screenshots define the intended visual design.

The existing application currently contains static or hardcoded
data. I want every feature to work using real Supabase data.

The finished application must have:

1. Real authentication and user profiles.
2. Real communities and memberships.
3. Real channels.
4. Real posts, comments, likes, and bookmarks.
5. Real event creation and management.
6. Real event RSVP functionality.
7. A working event calendar.
8. Real direct and group messaging.
9. Supabase Realtime where appropriate.
10. User connections.
11. Notifications.
12. Global search.
13. Image and file uploads.
14. Community administration.
15. Responsive desktop, tablet, and mobile experiences.
16. Secure database access.
17. Reliable loading, error, and empty states.
18. High frontend and database performance.
19. Automated validation and testing.

Do not stop at creating buttons, forms, or visual components.

Every implemented interaction must perform the expected operation,
persist the result where applicable, and update the UI correctly.

============================================================
2. FIRST: AUDIT THE EXISTING APPLICATION
============================================================

Before changing code, inspect the complete existing project.

Inspect:

- package.json
- Next.js configuration
- TypeScript configuration
- Tailwind configuration
- App Router structure
- Shared layouts
- All application pages
- All reusable components
- Existing hooks
- Existing Supabase client configuration
- Existing Supabase server configuration
- Authentication implementation
- Middleware or proxy configuration, if present
- Environment variable usage
- Existing SQL migrations
- Existing database tables
- Existing database relationships
- Existing RLS policies
- Existing storage buckets and policies
- Existing seed scripts
- Existing API routes and server actions
- Existing data fetching and caching
- Existing image assets
- Existing tests
- Existing build and lint scripts

Determine which components use hardcoded data.

Search for:

- Hardcoded user names.
- Hardcoded communities.
- Hardcoded events.
- Hardcoded posts.
- Hardcoded conversations.
- Hardcoded message histories.
- Hardcoded notifications.
- Static counts.
- Placeholder arrays.
- Mock API responses.
- TODOs.
- Fake success responses.
- Unused components.
- Duplicate Supabase queries.
- N+1 database query patterns.
- Missing authorization checks.

Create a concise implementation audit document:

docs/implementation-audit.md

For each feature, classify its status as:

- Complete and verified.
- Partially implemented.
- Static UI only.
- Missing.
- Broken.
- Blocked by external configuration.

Record the relevant files and the work required.

Do not treat a feature as complete simply because its UI exists.

After the audit, start implementing the fixes immediately.
Do not stop after producing the audit document.

============================================================
3. PROTECT EXISTING DATA AND CONFIGURATION
============================================================

Supabase is already connected.

Do not replace the existing Supabase project.

Do not change project credentials.

Do not overwrite .env files.

Do not print secrets.

Do not delete existing tables, data, migrations, or storage
buckets merely to simplify implementation.

Do not reset the database.

Do not use destructive migrations without an explicitly
justified requirement and appropriate safeguards.

Before changing the schema:

1. Inspect the current schema.
2. Inspect migration history.
3. Identify existing data and relationships.
4. Compare the schema with the application requirements.
5. Write incremental migrations for missing functionality.

Preserve existing working functionality.

Avoid creating duplicate tables when an appropriate table
already exists.

If the current schema differs from architecture.md, document
the difference and implement the safest compatible approach.

Use migrations to manage schema changes.

Never assume that the local schema and remote Supabase schema
are identical.

============================================================
4. IMPLEMENTATION RULES
============================================================

Use the existing technology stack and established conventions.

Expected stack:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Existing UI component library.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Supabase Realtime where appropriate.

Use the installed and compatible versions of dependencies.

Do not upgrade major dependencies without a concrete reason.

Use Server Components by default.

Use Client Components when interactivity requires them.

Keep server-only code separate from client code.

Use server actions or route handlers where appropriate.

Choose a consistent data access strategy for each feature.

Avoid unnecessary libraries and abstractions.

Do not make the entire application a Client Component.

Do not create duplicate data fetching layers that compete
with the existing architecture.

Do not bypass Supabase RLS.

Do not use the service-role key in browser code.

Do not trust client-supplied user IDs or role values.

============================================================
5. REMOVE STATIC DATA AND CONNECT REAL DATABASE OPERATIONS
============================================================

Find every static data source and replace it with appropriate
Supabase queries or mutations.

Examples of static data that must become dynamic:

- Community lists.
- Community member counts.
- Channel lists.
- Home feed.
- Post authors.
- Post timestamps.
- Like counts.
- Comment counts.
- Bookmark state.
- Event listings.
- Event attendee counts.
- User profile cards.
- Connection counts.
- Conversation lists.
- Message histories.
- Unread message counts.
- Notifications.
- Search results.

Do not simply fetch a record and leave related counts hardcoded.

For example:

A post must retrieve or efficiently calculate its actual
like count and comment count.

An event must retrieve the correct RSVP status for the current
user and the appropriate attendee count.

A conversation must display its real latest message and
unread state.

A community must display accurate membership information
subject to the viewer's permissions.

Use appropriate joins, aggregation, views, RPCs, or separate
queries depending on the existing schema and query performance.

Avoid issuing a separate query for every card when a batched
query can provide the same information.

Use pagination for large lists.

Use deterministic ordering where appropriate.

Handle missing relationships gracefully.

Never silently substitute mock data when a real database
query fails.

Show an error state and log useful diagnostic information
without exposing sensitive information.

============================================================
6. AUTHENTICATION AND USER PROFILES
============================================================

Verify the entire authentication lifecycle.

Test:

- Signup.
- Login.
- Logout.
- Session persistence.
- Browser refresh.
- Protected routes.
- Session expiration.
- Password reset.
- Profile creation.
- Profile updates.
- Avatar uploads.

Use the appropriate Supabase SSR integration for the
existing Next.js App Router setup.

Ensure that server-side authorization checks are applied
where necessary.

Do not rely only on client-side route protection.

Verify that user profile records are reliably associated
with auth.users.

Profile information must come from Supabase.

Implement profile editing and image uploads.

Ensure that a user can edit only their own profile unless
an explicitly authorized administrative action is involved.

============================================================
7. COMMUNITIES AND MEMBERSHIPS
============================================================

Implement the complete community lifecycle.

Features:

- Browse communities.
- Search communities.
- Open community details.
- Create a community.
- Edit a community.
- Upload a logo.
- Upload a cover image.
- Join a community.
- Leave a community.
- Request membership in restricted communities.
- Approve or reject membership requests.
- Display member lists.
- Display accurate member counts.
- Assign and manage community roles.
- Remove members when authorized.
- Open the community administration dashboard.

The sidebar community list must update from real membership
data.

Selecting a community must update the active community state
and navigate to the correct page.

The channel list must reflect the selected community.

Prevent duplicate membership records.

Do not allow a regular member to assign themselves an
admin or owner role.

Verify role permissions in the database and server-side
operations.

The interface must not display administrative actions to
unauthorized users.

Even if a user manually invokes an endpoint, authorization
must still be enforced.

============================================================
8. CHANNELS
============================================================

Implement:

- Create channel.
- Edit channel.
- Delete channel when authorized.
- View channel details.
- Browse channel posts.
- Create posts in channels.
- Display channel membership/access rules.
- Search or filter posts when appropriate.

Channel creation and modification must persist in Supabase.

Respect the parent community's visibility and membership rules.

Handle channels that have no posts.

Use pagination for channel feeds.

Prevent unauthorized channel access.

============================================================
9. HOME FEED AND POSTS
============================================================

Make the Home page fully dynamic.

Implement:

- All updates filter.
- Community-specific filters.
- Event-related filters where applicable.
- Feed pagination.
- Post creation.
- Post editing.
- Post deletion.
- Image uploads.
- Likes.
- Unlike.
- Comments.
- Comment editing/deletion where permitted.
- Bookmarks.
- Unbookmark.
- Share/copy-link actions.
- Post visibility rules.

Every action must use the real authenticated user.

Prevent duplicate likes and bookmarks.

Make counts update accurately.

Use optimistic UI updates only when rollback and error
handling are implemented.

Avoid race conditions when multiple actions happen quickly.

A post card should display:

- Author.
- Avatar.
- Community and channel.
- Timestamp.
- Title and content.
- Media.
- Like count.
- Comment count.
- Current user's like state.
- Current user's bookmark state.

Support text-only posts and image posts.

Use proper image dimensions and responsive rendering.

Do not load the full feed without pagination.

Ensure that private community posts are not exposed publicly.

============================================================
10. CREATE PAGE
============================================================

Make the Create page functional for all three creation types:

- Post.
- Event.
- Community.

POST:

- Select destination.
- Select community.
- Select channel when applicable.
- Enter title.
- Enter content.
- Upload media.
- Save draft.
- Publish.
- Handle validation errors.
- Prevent duplicate submission.

EVENT:

Use the complete event creation flow described below.

COMMUNITY:

- Name.
- Slug.
- Description.
- Institution.
- Location.
- Logo.
- Cover image.
- Visibility.
- Membership approval settings.

All forms must persist to Supabase.

The currently selected community must not be confused with
the community receiving a new post.

Ensure that dropdown options reflect the authenticated
user's actual permissions.

============================================================
11. EVENTS AND CALENDAR
============================================================

Implement the entire event lifecycle.

Features:

- List events.
- Filter events.
- Search events.
- View event details.
- Create events.
- Edit events.
- Delete events when authorized.
- Upload event images.
- RSVP.
- Cancel RSVP.
- Display attendee information.
- Manage attendees where authorized.
- Display upcoming events.
- Calendar navigation.
- Select a date.
- Show events on selected dates.
- Support different time zones.

Event information must come from Supabase.

The calendar must display the correct events for the selected
month and selected date.

Avoid loading every event in the database for each calendar
render.

Query only the required date range.

Ensure the query uses the correct time zone boundaries.

Prevent duplicate RSVP records.

Respect event capacity and registration deadlines.

If capacity enforcement requires transactional logic, use
a database transaction or a suitable controlled database
function rather than relying on the client.

Do not allow unauthorized users to edit events.

For private events, enforce access restrictions.

Paid events must not be marked as paid unless a real payment
integration confirms the payment.

============================================================
12. CHAT AND REALTIME MESSAGING
============================================================

Implement real one-to-one and group messaging.

Features:

- Conversation list.
- Search contacts.
- Search conversations.
- Create direct conversation.
- Create group conversation.
- Load message history.
- Send messages.
- Receive messages.
- Update latest-message previews.
- Unread counts.
- Read-state updates.
- Conversation details.
- Attachment support if already planned.
- Supabase Realtime subscriptions.

All messages must persist in Supabase.

When a user sends a message:

1. Validate the input.
2. Verify conversation membership.
3. Insert the message.
4. Update the UI.
5. Handle errors and retries appropriately.
6. Update the latest-message preview.
7. Maintain unread state correctly.

Use realtime subscriptions scoped to the relevant conversation.

Clean up subscriptions on component unmount.

Avoid duplicate messages when combining optimistic updates
with realtime events.

Implement stable message ordering and pagination.

Do not subscribe to every conversation globally.

On mobile, display the conversation list and conversation
view as separate screens.

Only conversation members may read messages.

Verify message access through RLS.

============================================================
13. CONNECTIONS
============================================================

Implement:

- Send connection request.
- Accept request.
- Reject request.
- Cancel outgoing request.
- Remove an existing connection.
- List connections.
- Display pending requests.
- Display accurate connection counts.
- Show connection status on profiles.

Prevent self-connections.

Prevent duplicate connection relationships.

Ensure that only the intended recipient can accept or reject
an incoming request.

============================================================
14. NOTIFICATIONS
============================================================

Implement database-backed notifications for relevant events:

- Connection requests.
- Connection acceptance.
- New messages.
- Post comments.
- Post likes.
- Event updates.
- Membership requests.
- Membership approvals.

Implement:

- Notification list.
- Unread indicator.
- Mark as read.
- Mark all as read.
- Navigation to the relevant resource.

Use real data.

Avoid generating duplicate notifications from repeated
operations.

If notifications are generated by triggers, server actions,
or database functions, choose a consistent approach and
prevent duplicate generation.

============================================================
15. GLOBAL SEARCH
============================================================

Implement real search for:

- Communities.
- Events.
- Profiles.
- Posts.
- Channels when appropriate.

Features:

- Search input.
- Debounced queries.
- Search results.
- Filters.
- Loading states.
- Empty states.
- Error states.

Search must respect RLS and visibility rules.

Do not fetch the entire database into the browser.

Use suitable indexes or full-text search where useful.

============================================================
16. SUPABASE STORAGE
============================================================

Audit the existing storage configuration.

Implement or repair uploads for:

- User avatars.
- Community logos.
- Community cover images.
- Post media.
- Event images.
- Message attachments where supported.

Requirements:

- Validate file types.
- Validate file sizes.
- Display upload progress where practical.
- Display upload errors.
- Preview uploaded images.
- Support replacement/removal.
- Restrict uploads to authorized users.
- Prevent unauthorized overwrites.
- Use appropriate public or private buckets.
- Use signed URLs for private files where appropriate.

Do not expose private storage objects accidentally.

Avoid uploading the same file repeatedly on every render.

Handle orphaned uploads carefully when records are deleted.

============================================================
17. DATABASE AUDIT AND MIGRATIONS
============================================================

Inspect the real Supabase schema before writing migrations.

Compare the existing schema with docs/architecture.md.

Identify missing tables, columns, relationships, indexes,
constraints, triggers, and policies.

Create incremental SQL migrations for missing functionality.

Do not recreate existing tables blindly.

Review all core relationships, including:

- Profiles and auth users.
- Community memberships.
- Channels and communities.
- Posts and authors.
- Posts and media.
- Comments and posts.
- Likes and posts.
- Events and communities.
- Event RSVPs.
- Conversations and members.
- Messages and conversations.
- Connections.
- Notifications.
- Drafts.

Use foreign keys, unique constraints, check constraints,
and appropriate indexes.

Use timestamptz for actual moments in time.

Use suitable numeric types for monetary amounts.

Prevent invalid states at the database level wherever practical.

Verify RLS policies for every relevant table.

RLS must be enabled AND the policies must correctly permit
legitimate operations while blocking unauthorized access.

Test the policies using different user roles.

Review security-sensitive database functions carefully.

Use an appropriate fixed search_path where relevant.

Avoid SECURITY DEFINER functions unless genuinely needed,
and secure their execution privileges.

Do not use service-role credentials to bypass ordinary user
permissions unnecessarily.

============================================================
18. SEED DATA AND DEVELOPMENT SCRIPTS
============================================================

I want working development data for:

- Communities.
- Memberships.
- Channels.
- User profiles.
- Posts.
- Comments.
- Likes.
- Events.
- Event RSVPs.
- Conversations.
- Messages.
- Connections.
- Notifications.

Create a repeatable, idempotent development seeding workflow.

Use the existing Supabase CLI and project conventions.

First inspect the existing seed scripts.

If missing, create appropriate files such as:

supabase/seed.sql

and a separate development-only script when authenticated
users or storage uploads require additional logic.

Provide an npm script such as:

npm run db:seed

only if it can be implemented safely using the existing
tooling and configuration.

The seed script must:

1. Be repeatable.
2. Avoid creating duplicate records on every run.
3. Preserve unrelated user data.
4. Never reset the production database.
5. Never print secrets.
6. Clearly distinguish development data from production data.

Use deterministic identifiers or other appropriate idempotency
mechanisms.

Create believable sample communities such as:

- UCLA.
- Boston Latin School.
- Pepperdine University.
- USC Alumni.
- Duke University.

These are development examples inspired by the screenshots.

Create sample channels, posts, events, and conversations
that make the application visually useful.

Ensure foreign keys reference valid records.

Do not insert arbitrary auth user IDs that do not exist.

Do not assume that profiles can be created independently
of the existing auth configuration.

For local development, document how demo users should be
created safely.

Do not create publicly accessible demo credentials.

If remote development data is needed, require explicit
confirmation of the target environment and ensure that
the script cannot accidentally run against production.

If storage uploads are required for logos and cover images,
provide a safe script or documented process for uploading
appropriate image assets.

Do not copy entire UI screenshots into the database as
community logos.

============================================================
19. LOGOS, ICONS, AND IMAGES FROM THE REFERENCES
============================================================

Inspect the attached reference screenshots.

Identify:

- GradPad branding.
- Community logo positions.
- Community icon dimensions.
- Avatar treatment.
- Icon sizes.
- Card imagery.
- Event thumbnails.
- Cover images.
- Navigation icons.
- Sidebar icons.

Use the screenshots to match the visual appearance.

For interface icons, use the existing icon library, preferably
Lucide React if it is already installed.

Use consistent icon size, stroke width, and alignment.

Do not create screenshots of icons and use those screenshots
as interface icons.

For the GradPad logo, first check whether an original logo
asset already exists in the project.

If it exists, reuse it.

If the screenshot contains a logo that is not available as an
asset, recreate a simple clean vector treatment only if
appropriate and legally permissible.

For university/community logos, check existing project assets
and permitted image sources.

Do not assume that every logo can legally be copied from
a screenshot.

For community images and avatars:

- Reuse existing legitimate assets where available.
- Use appropriate image URLs or local assets for development.
- Preserve aspect ratios.
- Use object-fit correctly.
- Provide fallbacks when images are unavailable.
- Avoid broken-image icons.
- Use suitable alt text.

Keep logos, icons, and image assets separate from components.

Do not download unrelated images from random websites merely
to fill empty space.

============================================================
20. UI/UX REFINEMENT AGAINST SCREENSHOTS
============================================================

The current UI exists, but it must be audited and refined
against all attached screenshots.

Do not replace the current visual design unnecessarily.

Preserve the existing GradPad design language:

- White navigation surfaces.
- Light blue-gray backgrounds.
- Blue primary actions.
- Rounded white cards.
- Subtle borders and shadows.
- Consistent spacing.
- Inter typography.
- Left desktop sidebar.
- Top navigation.
- Main content.
- Contextual right sidebar.
- Responsive mobile navigation.

Compare the actual rendered application with the screenshots.

Check:

- Sidebar width and padding.
- Logo alignment.
- Header height.
- Active navigation underline.
- Search field size.
- Main content width.
- Right sidebar width.
- Grid proportions.
- Card heights.
- Border radius.
- Button size.
- Avatar alignment.
- Event card layout.
- Post image proportions.
- Calendar spacing.
- Chat message bubbles.
- Create form alignment.
- Typography hierarchy.
- Responsive behavior.

Pay particular attention to the Home page, Community page,
Events feed, Events calendar, Chat inbox, and Create page.

Use actual browser screenshots of the running application
when browser testing is available.

Do not guess whether a visual fix worked.

Recheck the rendered result after making changes.

On mobile, create a deliberate responsive layout rather than
simply shrinking the desktop UI.

Do not introduce unnecessary visual redesigns.

============================================================
21. FCP, LCP, CLS, INP, AND FRONTEND PERFORMANCE
============================================================

Measure performance before and after optimization.

Do not guess performance improvements.

Collect a baseline for representative pages:

- Home.
- Community details.
- Events.
- Chat.
- Create.

Measure both desktop and mobile where possible.

IMPORTANT METRICS:

FCP:
First Contentful Paint.

LCP:
Largest Contentful Paint.

CLS:
Cumulative Layout Shift.

INP:
Interaction to Next Paint.

Also inspect:

- TTFB.
- JavaScript bundle sizes.
- Hydration overhead.
- Network request count.
- Image payload sizes.
- Long tasks.
- Database query duration.
- Client-side rerenders.

Use Lighthouse or the available browser performance tools.

If browser automation is already available, use it to measure
the actual running application.

Otherwise, set up an appropriate repeatable Lighthouse
workflow.

Record the test environment, viewport, and whether the
measurement was a local lab test or field data.

Do not claim that local Lighthouse scores represent real-user
field performance.

CORE WEB VITAL TARGETS:

Where feasible, aim for these user-experience targets:

- LCP: 2.5 seconds or less.
- INP: 200 milliseconds or less.
- CLS: 0.1 or less.

For FCP, aim for approximately 1.8 seconds or less under
appropriate test conditions.

These are targets, not assumed results.

Do not claim they have been achieved without measurements.

Optimize in this order:

1. Establish baseline measurements.
2. Identify the actual bottleneck.
3. Fix the highest-impact issue.
4. Rerun the same measurements.
5. Document the improvement or regression.

============================================================
22. NEXT.JS PERFORMANCE
============================================================

Inspect the App Router implementation.

Prioritize:

- Server Components by default.
- Smaller client bundles.
- Dynamic imports for genuinely heavy components.
- Correct use of next/image.
- Correct image dimensions.
- Responsive image sizes.
- Lazy loading below-the-fold images.
- Avoiding unnecessary client-side JavaScript.
- Avoiding duplicate data fetching.
- Reducing unnecessary hydration.
- Reducing layout shifts.
- Proper loading.tsx and Suspense boundaries.
- Stable component props.
- Avoiding unnecessary context rerenders.
- Efficient feed pagination.

Do not add "use client" to entire page trees unnecessarily.

Do not introduce client-side data fetching when server-side
rendering is a better fit.

Do not optimize blindly.

Use profiling and measurements to guide decisions.

============================================================
23. LCP AND IMAGE OPTIMIZATION
============================================================

Identify the actual LCP element on each important page.

If the LCP element is an image:

- Use next/image where appropriate.
- Provide width and height or a suitable aspect ratio.
- Use responsive sizes.
- Optimize the image payload.
- Avoid lazy-loading the actual LCP image.
- Use priority or the appropriate preload mechanism only
  for the genuinely critical image.
- Avoid preloading every image.

If the LCP element is text or a card, investigate the actual
rendering and data-fetching bottleneck.

Do not assume that every page has the same LCP element.

For avatars and logos:

- Use small, appropriate dimensions.
- Avoid downloading large images for tiny displays.
- Prevent layout shifts with fixed dimensions.

For post and event images:

- Preserve their aspect ratios.
- Load below-the-fold media lazily.
- Avoid unnecessarily large image payloads.

If remote images are used, configure the approved image
domains correctly.

============================================================
24. DATABASE PERFORMANCE
============================================================

Inspect the real queries used by each feature.

Look for:

- N+1 query patterns.
- Missing indexes.
- Overfetching.
- Excessive joins.
- Duplicate queries.
- Repeated count queries.
- Slow feed pagination.
- Unbounded message history.
- Inefficient search.
- Unnecessary realtime subscriptions.

Use database EXPLAIN or EXPLAIN ANALYZE where available
and safe to diagnose important queries.

Do not run expensive production queries casually.

Use a representative development environment when possible.

Create indexes based on actual query patterns.

Prefer keyset pagination for large feeds or message histories
where it provides a clear benefit.

Avoid fetching entire related tables merely to calculate counts.

Use appropriate aggregation or RPCs when beneficial.

Consider whether frequently requested counts should be
calculated dynamically or maintained through a reliable
database mechanism.

Do not introduce denormalization without a consistency strategy.

Use query timeouts or reasonable limits where appropriate.

Keep database payloads small.

============================================================
25. CACHING AND DATA CONSISTENCY
============================================================

Choose a consistent caching strategy.

Public community metadata may be cacheable if its visibility
and freshness requirements permit it.

User-specific data must not leak across users through shared
caches.

Do not cache private profiles, private messages, drafts,
or sensitive user-specific responses incorrectly.

After mutations, invalidate or refresh the appropriate
data.

Examples:

- Creating a post updates the relevant feed.
- Joining a community updates membership state and counts.
- RSVP updates event status and attendee counts.
- Sending a message updates the conversation preview.
- Marking a notification read updates the unread count.

Avoid reloading the entire application after every action.

Use targeted revalidation or state updates.

Ensure realtime subscriptions and optimistic updates do not
cause duplicate records or inconsistent UI state.

============================================================
26. SECURITY AUDIT
============================================================

Review every table and sensitive operation.

Verify:

- RLS enabled.
- Appropriate SELECT policies.
- Appropriate INSERT policies.
- Appropriate UPDATE policies.
- Appropriate DELETE policies.
- Storage access policies.
- Role assignment permissions.
- Community membership authorization.
- Private event visibility.
- Private post visibility.
- Conversation membership.
- Message access.
- Notification ownership.
- Draft ownership.
- Profile update permissions.

Test using different authenticated users.

At minimum, verify that:

1. User A cannot read User B's private messages.
2. User A cannot update User B's profile.
3. A normal member cannot promote themselves to admin.
4. An outsider cannot read private community posts.
5. An unauthorized user cannot edit another user's event.
6. A user cannot alter another user's notification state.
7. A user cannot access another user's drafts.

Do not expose service-role credentials.

Do not log passwords, tokens, or secrets.

Do not trust authorization information supplied by the browser.

Document any security issue that cannot be tested because
the external environment is unavailable.

============================================================
27. AUTOMATED TESTING
============================================================

Inspect the existing testing setup.

Add or extend tests using compatible tools.

Prioritize:

- Authentication.
- Community creation and membership.
- Post creation.
- Like/unlike.
- Comment creation.
- Event creation.
- RSVP.
- Calendar date selection.
- Messaging.
- Connection requests.
- Notifications.
- Search.
- Mobile navigation.

Use unit tests for isolated logic.

Use integration tests for database operations.

Use browser-based end-to-end tests where appropriate.

Test authorization failures as well as successful operations.

Do not make tests pass by disabling assertions.

Do not use production credentials in automated tests.

Use an isolated test environment.

Add repeatable scripts where appropriate.

For example, if compatible with the project:

npm run lint
npm run typecheck
npm run test
npm run build

Use the actual scripts configured in package.json.

Do not claim a command passed unless you ran it and verified
the exit status.

If a test requires external configuration, document the
missing requirement.

============================================================
28. RESPONSIVE AND CROSS-BROWSER QA
============================================================

Test:

Desktop:
- 1536 × 960.
- 1440 × 900.
- 1280 × 800.

Tablet:
- 1024 × 768.
- 768 × 1024.

Mobile:
- 390 × 844.
- 375 × 812.

Verify:

- No horizontal overflow.
- No clipped content.
- No broken navigation.
- No inaccessible controls.
- No overlapping cards.
- No broken images.
- No unusable dropdowns.
- No overflowing chat messages.
- No inaccessible dialogs.
- No keyboard-navigation regressions.

The mobile Chat interface must use a separate conversation
list and conversation view.

The Events calendar must remain usable on narrow screens.

============================================================
29. IMPLEMENTATION ORDER
============================================================

Work feature by feature.

Do not implement all features in one giant code-generation pass.

PHASE 1:
Audit existing implementation and fix the foundation.

PHASE 2:
Authentication and user profiles.

PHASE 3:
Communities and memberships.

PHASE 4:
Channels.

PHASE 5:
Posts, feed, comments, likes, bookmarks, and drafts.

PHASE 6:
Events, calendar, and RSVP.

PHASE 7:
Direct messaging, group chat, and realtime updates.

PHASE 8:
Connections and notifications.

PHASE 9:
Global search and remaining functionality.

PHASE 10:
Seed data and development workflows.

PHASE 11:
UI/UX visual refinement.

PHASE 12:
Performance optimization and security audit.

PHASE 13:
Automated tests and final QA.

You may implement tightly coupled subfeatures together when
doing so improves correctness.

Do not mark a phase complete until its important operations
have been verified.

============================================================
30. HOW TO WORK DURING EACH PHASE
============================================================

For each phase:

1. Inspect existing code.
2. Identify the smallest coherent implementation scope.
3. Implement the required feature.
4. Update database migrations if needed.
5. Update types and validation.
6. Implement server-side authorization.
7. Connect the UI to actual data.
8. Add loading and error states.
9. Test success cases.
10. Test failure and authorization cases.
11. Run lint and TypeScript checks.
12. Inspect the rendered UI.
13. Fix regressions.
14. Update docs/implementation-audit.md.

Do not stop after listing files to change.

Do not stop after writing SQL without connecting the UI.

Do not stop after connecting a read query while leaving
create/update/delete operations static.

Do not replace real operations with simulated timeouts.

Do not report a feature as working if it has not been verified.

If something is blocked, explain the exact blocker and continue
with other work that can be completed safely.

============================================================
31. FINAL ACCEPTANCE CRITERIA
============================================================

The project is ready for a release candidate only when:

- The existing UI remains intact and has been visually refined.
- The application works on desktop and mobile.
- Supabase authentication works.
- Profiles load and update correctly.
- Communities load from Supabase.
- Membership actions persist.
- Channels work.
- Posts persist.
- Likes and comments persist.
- Bookmarks persist.
- Event creation works.
- Calendar navigation works.
- RSVP works.
- Messaging persists.
- Realtime messaging works where configured.
- Notifications are database-backed.
- Search returns appropriate results.
- Image uploads work.
- RLS policies enforce access restrictions.
- Seed scripts work safely in development.
- Loading and error states are implemented.
- Critical queries are reasonably efficient.
- Performance has been measured.
- LCP and FCP bottlenecks have been investigated.
- Relevant tests pass.
- TypeScript checks pass.
- Lint checks pass.
- Production build succeeds.

Where an external dependency prevents verification, document
the exact limitation.

============================================================
32. REQUIRED FINAL REPORT
============================================================

When the work is complete, provide a report containing:

1. Features implemented.
2. Features that were already working.
3. Static data replaced with Supabase queries.
4. Database schema changes.
5. Migrations created.
6. RLS policies created or modified.
7. Storage changes.
8. Seed scripts and commands.
9. Tests executed and their actual results.
10. Build and lint results.
11. Performance measurements before optimization.
12. Performance measurements after optimization.
13. FCP, LCP, CLS, INP, and TTFB results where measured.
14. Database queries optimized.
15. Security issues found and fixed.
16. Remaining issues and external configuration.
17. Recommended next steps.

Do not invent test results or performance numbers.

Distinguish measured results from estimates.

============================================================
START NOW
============================================================

Read @docs/architecture.md and inspect the existing project.

Supabase is already connected and the UI already exists.

Do not rebuild from scratch.

Begin by auditing the current implementation, then implement
the highest-priority missing functionality.

Proceed phase by phase until the application is genuinely
dynamic, secure, responsive, and performant.

Start coding immediately.

============================================================
33. IMPLEMENTATION PROGRESS (maintained by agent)
============================================================

**2026-03-16 — Feature 1 (Authentication & profiles)**
- **Security UX:** Signup/login/forgot-password moved to **client Supabase Auth**
  (`src/lib/auth/client-auth.ts`) so passwords are **not** posted to Next.js
  Server Actions (`POST /signup` no longer contains password fields).
- Signup confirmation UI, login session-expired message, logout, protected routes.
- Profiles: auto-username, `/profile/[username]`, `/settings/profile` (edit),
  `/settings/account` (password update), avatar upload UI (needs storage migration).
- **Verified:** `npm run lint`, `npm run build` pass.
- **Blocked:** Supabase auth rate limit during repeated signup tests; apply
  `supabase/migrations/20260316120000_storage_avatars.sql` for avatars.
- **Next feature:** Communities & memberships (Supabase-backed sidebar).

**2026-03-16 (earlier)**
- Initial audit, shell user from `profiles`, first profile settings form.

