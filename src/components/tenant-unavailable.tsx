type TenantUnavailableProps = Readonly<{
  title: string;
  description: string;
}>;

export function TenantUnavailable({
  title,
  description,
}: TenantUnavailableProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--bg) px-4 text-(--text)">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-(--text-muted) text-center text-sm">{description}</p>
    </div>
  );
}
