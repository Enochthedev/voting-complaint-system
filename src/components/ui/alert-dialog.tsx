'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <DialogContent className={cn('sm:max-w-[500px]', className)} {...props}>
      {children}
    </DialogContent>
  );
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AlertDialogHeader({ className, children, ...props }: AlertDialogHeaderProps) {
  return (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  );
}

interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function AlertDialogTitle({ className, children, ...props }: AlertDialogTitleProps) {
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  );
}

interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function AlertDialogDescription({
  className,
  children,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  );
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AlertDialogFooter({ className, children, ...props }: AlertDialogFooterProps) {
  return (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  );
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AlertDialogAction({
  className,
  children,
  onClick,
  ...props
}: AlertDialogActionProps) {
  return (
    <Button className={className} onClick={onClick} {...props}>
      {children}
    </Button>
  );
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AlertDialogCancel({ className, children, ...props }: AlertDialogCancelProps) {
  return (
    <Button variant="outline" className={className} {...props}>
      {children}
    </Button>
  );
}
