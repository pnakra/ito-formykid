// Shared brand styles for auth emails, matching the site's earthy forest theme.
// Body background stays #ffffff (email requirement); brand colors appear inside.

export const colors = {
  ink: '#1e2b1b', // deep mossy green (headings, dark band)
  moss: '#2c3a28', // card green
  cream: '#e9edde', // warm cream text on dark
  ochre: '#edd288', // warm ochre action accent
  ochreText: '#1e2b1b', // dark text on ochre buttons
  body: '#4a5546', // gray-green body text
  hint: '#8a9482', // muted footer text
  border: '#dde3d2', // soft green-gray border
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', Arial, sans-serif",
}

export const container = {
  padding: '32px 25px',
  maxWidth: '520px',
}

export const brandBand = {
  backgroundColor: colors.ink,
  borderRadius: '16px',
  padding: '28px 28px 24px',
  marginBottom: '28px',
}

export const brandName = {
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: colors.ochre,
  margin: '0 0 14px',
  letterSpacing: '0.02em',
}

export const h1 = {
  fontFamily: "'Space Grotesk', Arial, sans-serif",
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: colors.cream,
  margin: '0',
  lineHeight: '1.3',
}

export const text = {
  fontSize: '15px',
  color: colors.body,
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const link = { color: colors.ink, textDecoration: 'underline' }

export const button = {
  backgroundColor: colors.ochre,
  color: colors.ochreText,
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '999px',
  padding: '13px 26px',
  textDecoration: 'none',
}

export const footer = {
  fontSize: '12px',
  color: colors.hint,
  margin: '28px 0 0',
  lineHeight: '1.5',
}

export const hr = {
  borderColor: colors.border,
  margin: '28px 0 0',
}
