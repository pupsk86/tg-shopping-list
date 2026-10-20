const iconProps = {
  className: 'icon',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const;

export function PencilIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
