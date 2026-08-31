interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({
  children,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type="submit"
      className="submit-button"
      disabled={disabled}
    >
      {children}
    </button>
  );
}