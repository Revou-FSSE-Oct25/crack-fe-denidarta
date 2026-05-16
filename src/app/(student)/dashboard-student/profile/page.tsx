"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  FluidTextInput,
  InlineNotification,
  Loading,
  Select,
  SelectItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextArea,
} from "@carbon/react";
import { Edit } from "@carbon/icons-react";
import { apiFetch } from "@/lib/api-client";
import { getCurrentUserId } from "@/utils/auth";
import {
  Profile,
  ProfileFormValues,
  Gender,
  EducationLevel,
  StudentProfile,
} from "@/types/index.type";
import styles from "./page.module.scss";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor" },
  { value: "master", label: "Master" },
  { value: "doctorate", label: "Doctorate" },
  { value: "other", label: "Other" },
];

const ACADEMIC_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  dropped_out: "Dropped Out",
  on_leave: "On Leave",
};

function Field({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value || "—"}</span>
    </div>
  );
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ProfileFormValues>();

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const userId = getCurrentUserId();
        const [profileRes, userRes] = await Promise.all([
          apiFetch("/profiles/me"),
          userId ? apiFetch(`/users/me`) : Promise.resolve(null),
        ]);

        if (profileRes.ok) {
          const { data } = (await profileRes.json()) as { data: Profile };
          if (mounted) setProfile(data);
        } else if (profileRes.status !== 404) {
          throw new Error(`Failed to load profile (${profileRes.status})`);
        }

        if (userRes?.ok) {
          const { data } = (await userRes.json()) as {
            data: { studentProfile: StudentProfile | null };
          };
          if (mounted) setStudentProfile(data?.studentProfile ?? null);
        }
      } catch (err) {
        if (mounted)
          setFetchError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void fetchData();
    return () => { mounted = false; };
  }, []);

  function startEditing() {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        streetAddress: profile.streetAddress,
        city: profile.city,
        province: profile.province,
        district: profile.district,
        subdistrict: profile.subdistrict,
        postalCode: profile.postalCode,
        country: profile.country,
        currentOccupation: profile.currentOccupation,
        company: profile.company,
        highestEducation: profile.highestEducation,
        fieldOfStudy: profile.fieldOfStudy,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        personalWebsite: profile.personalWebsite,
        shortBio: profile.shortBio,
      });
    }
    setEditing(true);
  }

  function cancelEditing() {
    reset();
    setSaveError(null);
    setEditing(false);
  }

  async function onSubmit(values: ProfileFormValues) {
    setSaveError(null);
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : value])
    );
    const res = await apiFetch("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = (await res.json()) as { message?: string | string[] };
      setSaveError(
        Array.isArray(err.message) ? err.message.join(", ") : err.message ?? "Failed to save profile"
      );
      return;
    }
    const { data } = (await res.json()) as { data: Profile };
    setProfile(data);
    setEditing(false);
  }

  if (loading) return <Loading withOverlay={false} description="Loading profile..." />;
  if (fetchError) {
    return (
      <InlineNotification kind="error" title="Error" subtitle={fetchError} lowContrast />
    );
  }

  return (
    <div className={styles.container}>
      <Tabs>
        <TabList aria-label="Profile tabs">
          <Tab>Personal Info</Tab>
          <Tab>Academic Info</Tab>
        </TabList>
        <TabPanels>
          {/* ── Tab 1: Personal Info ── */}
          <TabPanel>
            {!editing ? (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>My Profile</h1>
                  <Button kind="secondary" renderIcon={Edit} onClick={startEditing}>
                    Edit Profile
                  </Button>
                </div>

                {!profile && (
                  <InlineNotification
                    kind="info"
                    title="Profile incomplete"
                    subtitle="You haven't completed your profile yet."
                    lowContrast
                  />
                )}

                {profile && (
                  <>
                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Personal Info</h2>
                      <div className={styles.fieldGrid}>
                        <Field label="Full Name" value={profile.fullName} />
                        <Field label="Phone Number" value={profile.phoneNumber} />
                        <Field label="Date of Birth" value={profile.dateOfBirth} />
                        <Field label="Gender" value={profile.gender} />
                      </div>
                    </section>

                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Address</h2>
                      <div className={styles.fieldGrid}>
                        <Field label="Street Address" value={profile.streetAddress} />
                        <Field label="City" value={profile.city} />
                        <Field label="Province" value={profile.province} />
                        <Field label="District" value={profile.district} />
                        <Field label="Subdistrict" value={profile.subdistrict} />
                        <Field label="Postal Code" value={profile.postalCode} />
                        <Field label="Country" value={profile.country} />
                      </div>
                    </section>

                    <section className={styles.section}>
                      <h2 className={styles.sectionTitle}>Professional & Education</h2>
                      <div className={styles.fieldGrid}>
                        <Field label="Occupation" value={profile.currentOccupation} />
                        <Field label="Company" value={profile.company} />
                        <Field label="Education" value={profile.highestEducation} />
                        <Field label="Field of Study" value={profile.fieldOfStudy} />
                        <Field label="LinkedIn" value={profile.linkedinUrl} />
                        <Field label="GitHub" value={profile.githubUrl} />
                        <Field label="Website" value={profile.personalWebsite} />
                        <Field label="Bio" value={profile.shortBio} />
                      </div>
                    </section>
                  </>
                )}
              </>
            ) : (
              <>
                <div className={styles.header}>
                  <h1 className={styles.title}>Edit Profile</h1>
                  <Button kind="ghost" onClick={cancelEditing} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>

                {saveError && (
                  <InlineNotification
                    kind="error"
                    title="Error"
                    subtitle={saveError}
                    lowContrast
                    style={{ marginBottom: "1.5rem" }}
                  />
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Personal Info</h2>
                    <div className={styles.grid}>
                      <FluidTextInput id="fullName" labelText="Full Name"
                        invalid={!!errors.fullName} invalidText={errors.fullName?.message}
                        {...register("fullName", { maxLength: 255 })} />
                      <FluidTextInput id="phoneNumber" labelText="Phone Number"
                        placeholder="+628123456789"
                        invalid={!!errors.phoneNumber} invalidText={errors.phoneNumber?.message}
                        {...register("phoneNumber", {
                          pattern: { value: /^(\+62\d{8,13})?$/, message: "Use format +62xxxxxxxxxx" },
                        })} />
                      {/* @ts-expect-error FluidTextInput missing type prop in types */}
                      <FluidTextInput id="dateOfBirth" labelText="Date of Birth" type="date"
                        {...register("dateOfBirth")} />
                      <Controller name="gender" control={control} render={({ field }) => (
                        <Select id="gender" labelText="Gender" {...field}>
                          <SelectItem value="" text="Select gender" />
                          {GENDER_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} text={o.label} />
                          ))}
                        </Select>
                      )} />
                    </div>
                  </section>

                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Address</h2>
                    <div className={styles.grid}>
                      <div className={styles.fullWidth}>
                        <TextArea id="streetAddress" labelText="Street Address" rows={2}
                          {...register("streetAddress", { maxLength: 500 })} />
                      </div>
                      <FluidTextInput id="city" labelText="City" {...register("city", { maxLength: 100 })} />
                      <FluidTextInput id="province" labelText="Province" {...register("province", { maxLength: 100 })} />
                      <FluidTextInput id="district" labelText="District" {...register("district", { maxLength: 100 })} />
                      <FluidTextInput id="subdistrict" labelText="Subdistrict" {...register("subdistrict", { maxLength: 100 })} />
                      <FluidTextInput id="postalCode" labelText="Postal Code" {...register("postalCode", { maxLength: 20 })} />
                      <FluidTextInput id="country" labelText="Country" {...register("country", { maxLength: 100 })} />
                    </div>
                  </section>

                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Professional & Education</h2>
                    <div className={styles.grid}>
                      <FluidTextInput id="currentOccupation" labelText="Current Occupation"
                        {...register("currentOccupation", { maxLength: 255 })} />
                      <FluidTextInput id="company" labelText="Company"
                        {...register("company", { maxLength: 255 })} />
                      <Controller name="highestEducation" control={control} render={({ field }) => (
                        <Select id="highestEducation" labelText="Highest Education" {...field}>
                          <SelectItem value="" text="Select education level" />
                          {EDUCATION_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} text={o.label} />
                          ))}
                        </Select>
                      )} />
                      <FluidTextInput id="fieldOfStudy" labelText="Field of Study"
                        {...register("fieldOfStudy", { maxLength: 255 })} />
                      {/* @ts-expect-error FluidTextInput missing type prop */}
                      <FluidTextInput id="linkedinUrl" labelText="LinkedIn URL" type="url"
                        {...register("linkedinUrl")} />
                      {/* @ts-expect-error FluidTextInput missing type prop */}
                      <FluidTextInput id="githubUrl" labelText="GitHub URL" type="url"
                        {...register("githubUrl")} />
                      {/* @ts-expect-error FluidTextInput missing type prop */}
                      <FluidTextInput id="personalWebsite" labelText="Personal Website" type="url"
                        {...register("personalWebsite")} />
                      <div className={styles.fullWidth}>
                        <TextArea id="shortBio" labelText="Short Bio" rows={3}
                          {...register("shortBio")} />
                      </div>
                    </div>
                  </section>

                  <div className={styles.submitRow}>
                    <Button type="submit" kind="primary" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </TabPanel>

          {/* ── Tab 2: Academic Info ── */}
          <TabPanel>
            <div className={styles.header}>
              <h1 className={styles.title}>Academic Info</h1>
            </div>

            {!studentProfile ? (
              <InlineNotification
                kind="info"
                title="No academic info"
                subtitle="Academic information is managed by your program administrator."
                lowContrast
              />
            ) : (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Student Record</h2>
                <div className={styles.fieldGrid}>
                  <Field label="NIM" value={studentProfile.nim} />
                  <Field label="Enrollment Year" value={String(studentProfile.enrollmentYear)} />
                  <Field label="Major" value={studentProfile.major} />
                  <Field label="Faculty" value={studentProfile.faculty} />
                  <Field label="Current Semester" value={studentProfile.currentSemester != null ? String(studentProfile.currentSemester) : null} />
                  <Field label="GPA" value={studentProfile.gpa != null ? Number(studentProfile.gpa).toFixed(2) : null} />
                  <Field label="Academic Status" value={ACADEMIC_STATUS_LABELS[studentProfile.academicStatus] ?? studentProfile.academicStatus} />
                </div>
              </section>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
