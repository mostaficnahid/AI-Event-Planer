import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null) {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date | undefined | null) {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy h:mm a");
}

export function formatTime(date: string | Date | undefined | null) {
  if (!date) return "";
  return format(new Date(date), "h:mm a");
}
