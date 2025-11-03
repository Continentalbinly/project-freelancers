"use client";

export default function FooterSocial() {
  const socials = [
    {
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775..." />
        </svg>
      ),
    },
    {
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.46 6c-.77.35-1.6.58-2.46.69..." />
        </svg>
      ),
    },
    {
      href: "#",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569..." />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex space-x-4">
      {socials.map((s, i) => (
        <a
          key={i}
          href={s.href}
          className="text-text-secondary hover:text-primary transition-colors"
        >
          {s.icon}
        </a>
      ))}
    </div>
  );
}
