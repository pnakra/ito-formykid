import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  email?: string
  roles?: string
  source?: string
  campaign?: string
  signedUpAt?: string
}

const Email = ({ email, roles, source, campaign, signedUpAt }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New early access signup: {email ?? 'someone'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New early access signup</Heading>
        <Text style={row}><b>Email:</b> {email ?? '—'}</Text>
        <Text style={row}><b>Fits:</b> {roles || 'Not answered'}</Text>
        <Text style={row}><b>Source:</b> {source || 'Direct'}{campaign ? ` (${campaign})` : ''}</Text>
        <Text style={row}><b>When:</b> {signedUpAt ?? '—'}</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `New signup: ${d.email ?? 'early access'}`,
  displayName: 'New signup alert (to team)',
  to: 'priya@overridelabsprevention.org',
  previewData: {
    email: 'parent@example.com',
    roles: 'I have kids',
    source: 'reddit',
    campaign: 'launch',
    signedUpAt: 'Sep 24, 2026, 5:10 PM CT',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px' }
const h1 = { fontSize: '20px', color: '#10231c', margin: '0 0 16px' }
const row = { fontSize: '15px', color: '#333333', margin: '0 0 8px' }
