import { Link } from 'react-router-dom';

// variant: 'primary' | 'cta' | 'secondary'. Pass `to` to render a router link.
export default function Button({ variant = 'primary', size, to, className = '', children, ...props }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}