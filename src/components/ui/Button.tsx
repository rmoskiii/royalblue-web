import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonStyleProps } from './buttonClass';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<ButtonStyleProps, 'className'> {}

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, block, className })} {...props} />
  );
}
