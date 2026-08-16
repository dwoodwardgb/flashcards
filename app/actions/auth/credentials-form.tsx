import type { Handle } from 'remix/ui'
import { css } from 'remix/ui'

import { Document } from '../document.tsx'
import { Header } from '../../ui/header.tsx'

export interface CredentialsFormProps {
  title: string
  submitLabel: string
  csrfToken: string
  user: { username: string } | null
  error?: string | undefined
  fieldErrors?: { username?: string; password?: string } | undefined
  alternate: { href: string; label: string; text: string }
}

export function CredentialsForm(handle: Handle<CredentialsFormProps>) {
  return () => {
    let { title, submitLabel, csrfToken, user, error, fieldErrors, alternate } = handle.props

    return (
      <Document title={title}>
        <div
          mix={css({
            '--surface-0': '#dee2e6',
            '--surface-3': '#f0f4f7',
            '--text-primary': '#313539',
            '--text-tertiary': '#94989c',
            '--brand-blue': '#2dacf9',
            '@media (prefers-color-scheme: dark)': {
              '--surface-0': '#1e2226',
              '--surface-3': '#313539',
              '--text-primary': '#dee2e6',
            },
            '& *, & *::before, & *::after': { boxSizing: 'border-box' },
            minHeight: '100vh',
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: '14px',
            lineHeight: 1.5,
          })}
        >
          <Header user={user} csrfToken={csrfToken} />
          <main
            mix={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
            })}
          >
            <form
              method="post"
              mix={css({
                width: '100%',
                maxWidth: '360px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'var(--surface-3)',
                borderRadius: '20px',
                padding: '32px',
              })}
            >
              <h1
                mix={css({
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                })}
              >
                {title}
              </h1>
              <input type="hidden" name="_csrf" value={csrfToken} />
              {error ? (
                <p role="alert" mix={css({ margin: 0, color: '#d64545' })}>
                  {error}
                </p>
              ) : null}
              <Field
                label="Username"
                name="username"
                type="text"
                autoComplete="username"
                error={fieldErrors?.username}
              />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                error={fieldErrors?.password}
              />
              <button
                type="submit"
                mix={css({
                  appearance: 'none',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  font: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#fff',
                  background: 'var(--brand-blue)',
                })}
              >
                {submitLabel}
              </button>
              <p mix={css({ margin: 0, color: 'var(--text-tertiary)', fontSize: '12px' })}>
                {alternate.text}{' '}
                <a href={alternate.href} mix={css({ color: 'var(--brand-blue)' })}>
                  {alternate.label}
                </a>
              </p>
            </form>
          </main>
        </div>
      </Document>
    )
  }
}

function Field(
  handle: Handle<{
    label: string
    name: string
    type: 'text' | 'password'
    autoComplete: string
    error?: string | undefined
  }>,
) {
  return () => {
    let { label, name, type, autoComplete, error } = handle.props

    return (
      <label mix={css({ display: 'flex', flexDirection: 'column', gap: '6px' })}>
        <span mix={css({ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' })}>
          {label}
        </span>
        {type === 'password' ? (
          <input required name={name} type="password" autoComplete={autoComplete} mix={inputStyle} />
        ) : (
          <input required name={name} type="text" autoComplete={autoComplete} mix={inputStyle} />
        )}
        {error ? (
          <span role="alert" mix={css({ color: '#d64545', fontSize: '12px' })}>
            {error}
          </span>
        ) : null}
      </label>
    )
  }
}

const inputStyle = css({
  font: 'inherit',
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid var(--text-tertiary)',
  background: 'var(--surface-0)',
  color: 'var(--text-primary)',
})
