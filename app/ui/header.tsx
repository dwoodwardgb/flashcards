import type { Handle } from 'remix/ui'
import { css } from 'remix/ui'

import { routes } from '../routes.ts'

export interface HeaderProps {
  user: { username: string } | null
  csrfToken: string
}

export function Header(handle: Handle<HeaderProps>) {
  return () => {
    let { user, csrfToken } = handle.props

    return (
      <header
        mix={css({
          '--text-primary': '#313539',
          '--text-tertiary': '#94989c',
          '--surface-4': '#f7fbff',
          '@media (prefers-color-scheme: dark)': {
            '--text-primary': '#dee2e6',
            '--surface-4': '#363a3e',
          },
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          height: '49px',
          padding: '12px 24px',
          background: 'var(--surface-4)',
          borderBottom: '1px solid var(--text-tertiary)',
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
          fontSize: '14px',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
        })}
      >
        <a
          href={routes.home.href()}
          mix={css({
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          })}
        >
          Flashcards
        </a>
        {user ? (
          <div mix={css({ display: 'flex', alignItems: 'center', gap: '16px' })}>
            <span mix={css({ color: 'var(--text-tertiary)' })}>
              Signed in as <strong mix={css({ color: 'var(--text-primary)' })}>{user.username}</strong>
            </span>
            <form method="post" action={routes.auth.logout.href()}>
              <input type="hidden" name="_csrf" value={csrfToken} />
              <button type="submit" mix={linkButtonStyle}>
                Log out
              </button>
            </form>
          </div>
        ) : (
          <nav mix={css({ display: 'flex', alignItems: 'center', gap: '16px' })}>
            <a href={routes.auth.login.index.href()} mix={linkStyle}>
              Log in
            </a>
            <a href={routes.auth.register.index.href()} mix={linkStyle}>
              Register
            </a>
          </nav>
        )}
      </header>
    )
  }
}

const linkStyle = css({
  color: 'inherit',
  textDecoration: 'none',
  '&:hover, &:focus-visible': { textDecoration: 'underline', outline: 'none' },
})

const linkButtonStyle = css({
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
  '&:hover, &:focus-visible': { textDecoration: 'underline', outline: 'none' },
})
