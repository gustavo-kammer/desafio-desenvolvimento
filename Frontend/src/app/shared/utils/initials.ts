export function getInitials(name: string): string {
  const parts: string[] = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  const first: string = parts[0].charAt(0);
  const last: string = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}
