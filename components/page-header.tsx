'use client';

import Image from 'next/image';

type Props = {
  title: string;
  description?: string;
  tag?: string;
};

export function PageHeader({ title, description, tag }: Props) {
  return (
    <div className="page-header-wrap relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="page-header-line" />
      <div className="page-header-glow page-header-glow-1" />
      <div className="page-header-glow page-header-glow-2" />

      <div className="relative z-10 flex items-start justify-between gap-6">
        <div className="max-w-3xl">
          {tag ? <span className="pill">{tag}</span> : null}
          <h1 className="mt-4 text-4xl font-black tracking-tight text-main md:text-6xl">
            <span className="page-header-title">{title}</span>
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted md:text-xl">{description}</p>
          ) : null}
        </div>

        <div className="relative hidden shrink-0 items-start justify-end md:flex">
          <div className="page-header-logo-ring" />
          <div className="page-header-logo-shell">
            <Image
              src="/logo.png"
              alt="Fair Share Logo"
              width={72}
              height={72}
              className="page-header-logo"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
