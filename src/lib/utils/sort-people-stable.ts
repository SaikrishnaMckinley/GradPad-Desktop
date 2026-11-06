/** Stable roster order (matches gradpad-web) so lists do not reshuffle on refetch. */

function personDate(person: Record<string, unknown>): string {
  const date =
    person.registration_date ??
    person.created_at ??
    person.joined_at ??
    person.signed_up_at;
  return typeof date === "string" ? date : "";
}

function personStableId(person: Record<string, unknown>): string {
  return String(
    person.registration_id ??
      person.id ??
      person._id ??
      person.attendee_id ??
      person.email ??
      person.first_name ??
      person.name ??
      "",
  );
}

export function sortPeopleStable<T extends Record<string, unknown>>(
  people: T[] | null | undefined,
): T[] {
  if (!Array.isArray(people) || people.length === 0) return [];

  return [...people].sort((a, b) => {
    const aDate = personDate(a);
    const bDate = personDate(b);
    if (aDate !== bDate) {
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate < bDate ? -1 : 1;
    }
    return personStableId(a).localeCompare(personStableId(b));
  });
}
