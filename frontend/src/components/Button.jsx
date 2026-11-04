import { Link } from 'react-router-dom';

export default function Button({
  variant = 'primary',
  to,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const base =
    variant === 'primary' || variant === 'cta'
      ? 'wire-btn wire-btn-primary'
      : variant === 'dark'
      ? 'wire-btn'
      : 'wire-btn wire-btn-secondary';

  const cls = `${base} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...props}>
      {children}
    </button>
  );
}
