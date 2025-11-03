import Link from "next/link";

export default function HeaderNav({ pathname, t, user }: any) {
  const linkClasses = (path: string) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? "text-primary border-b-2 border-primary"
        : "text-text-primary hover:text-primary"
    }`;

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link href="/" className={linkClasses("/")}>
        {t("header.home")}
      </Link>

      {user ? (
        <>
          <Link href="/proposals" className={linkClasses("/proposals")}>
            {t("header.proposals")}
          </Link>
          <Link href="/transactions" className={linkClasses("/transactions")}>
            {t("header.transactions")}
          </Link>
        </>
      ) : (
        <>
          <Link href="/projects" className={linkClasses("/projects")}>
            {t("header.projects")}
          </Link>
          <Link href="/freelancers" className={linkClasses("/freelancers")}>
            {t("header.freelancers")}
          </Link>
          <Link href="/clients" className={linkClasses("/clients")}>
            {t("header.clients")}
          </Link>
        </>
      )}

      {user ? (
        <Link href="/withdraw" className={linkClasses("/withdraw")}>
          {t("header.withdraw")}
        </Link>
      ) : (
        <Link href="/about" className={linkClasses("/about")}>
          {t("header.about")}
        </Link>
      )}
    </nav>
  );
}
