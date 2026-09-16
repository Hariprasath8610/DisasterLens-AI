import React from 'react';

export const ICON_SIZE = { inline: 16, control: 20, feature: 24, display: 36 };

/** A single Lucide presentation layer for dashboard, map, and alert icons. */
export default function Icon({ icon: Glyph, size = 'control', strokeWidth, className, ...props }) {
  const resolvedSize = typeof size === 'number' ? size : ICON_SIZE[size] ?? ICON_SIZE.control;
  const resolvedStroke = strokeWidth ?? (resolvedSize <= ICON_SIZE.inline ? 2 : 1.5);

  return <Glyph size={resolvedSize} strokeWidth={resolvedStroke} className={`shrink-0 ${className ?? ''}`} aria-hidden="true" {...props} />;
}
