export default function ProfileInfo({ profile, user, t, handleEditName }: any) {
  return (
    <div className="flex-1 text-center lg:text-left">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold  ">
            {profile?.fullName || user.email?.split("@")[0]}
          </h2>
          <p className="text-sm text-text-secondary">
            {profile?.email || user.email}
          </p>
        </div>

        <button
          onClick={handleEditName}
          className="px-3 py-2 text-sm bg-primary/10 text-primary rounded-lg flex items-center gap-2 cursor-pointer"
        >
          {t("common.edit")}
        </button>
      </div>
    </div>
  );
}
