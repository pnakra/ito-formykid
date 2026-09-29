import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  pid?: string
  anonId?: string
  completedAt?: string
}

const Email = ({ pid, anonId, completedAt }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Study submission finished: {pid ?? 'a participant'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>A participant finished the study</Heading>
        <Text style={row}><b>Prolific ID:</b> {pid ?? '—'}</Text>
        <Text style={row}><b>Anon ID:</b> {anonId ?? '—'}</Text>
        <Text style={row}><b>When:</b> {completedAt ?? '—'}</Text>
        <Text style={row}>Their answers are in the study tables, matched by Prolific ID or anon ID.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Study completed: ${d.pid ?? 'participant'}`,
  displayName: 'Study completion alert (to team)',
  to: 'priya@overridelabsprevention.org',
  previewData: {
    pid: 'abc123prolific',
    anonId: 'anon-xyz',
    completedAt: 'Sep 29, 2026, 12:10 PM CT',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px' }
const h1 = { fontSize: '20px', color: '#10231c', margin: '0 0 16px' }
const row = { fontSize: '15px', color: '#333333', margin: '0 0 8px' }
