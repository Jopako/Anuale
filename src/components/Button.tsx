interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({
  children,
  disabled = false,
}: ButtonProps) {
  return (
    <button type="submit" disabled={disabled}>
      {children}
    </button>
  );
}