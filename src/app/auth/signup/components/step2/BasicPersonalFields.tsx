import { SignupCredentials } from "@/types/auth";
import { useTranslationContext } from "@/app/components/LanguageProvider";

interface BasicPersonalFieldsProps {
  formData: SignupCredentials;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

export default function BasicPersonalFields({
  formData,
  handleChange,
}: BasicPersonalFieldsProps) {
  const { t } = useTranslationContext();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date of Birth and Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.dateOfBirth")}
          </label>
          <input
            suppressHydrationWarning
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.gender")}
          </label>
          <select
            id="gender"
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          >
            <option value="prefer_not_to_say">
              {t("auth.signup.step2.genderOptions.preferNotToSay")}
            </option>
            <option value="male">
              {t("auth.signup.step2.genderOptions.male")}
            </option>
            <option value="female">
              {t("auth.signup.step2.genderOptions.female")}
            </option>
            <option value="other">
              {t("auth.signup.step2.genderOptions.other")}
            </option>
          </select>
        </div>
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
        >
          {t("auth.signup.step2.phone")}
        </label>
        <input
          suppressHydrationWarning
          id="phone"
          name="phone"
          type="tel"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          placeholder={t("auth.signup.step2.phonePlaceholder")}
        />
      </div>

      {/* Country and City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.country")}
          </label>
          <input
            suppressHydrationWarning
            id="country"
            name="country"
            type="text"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder={t("auth.signup.step2.countryPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3"
          >
            {t("auth.signup.step2.city")}
          </label>
          <input
            suppressHydrationWarning
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder={t("auth.signup.step2.cityPlaceholder")}
          />
        </div>
      </div>
    </div>
  );
}
