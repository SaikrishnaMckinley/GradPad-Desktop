/** Staging API user shape (`users/detail/`, gradpad-web UserSerializer). */
export type StagingUserDetail = {
  id: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  alternative_email?: string | null;
  nickname?: string | null;
  graduation_year?: number | string | null;
  company?: string | null;
  country?: string | null;
  program?: string | null;
  current_industry?: string | null;
  hometown?: string | null;
  phone?: string | null;
  short_bio?: string | null;
  photo?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
};

export type UserProfileView = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  nickname: string | null;
  shortBio: string | null;
  photo: string | null;
  program: string | null;
  graduationYear: string | null;
  currentIndustry: string | null;
  company: string | null;
  country: string | null;
  hometown: string | null;
  phone: string | null;
  linkedin: string | null;
};
