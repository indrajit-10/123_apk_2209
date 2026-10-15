import React from 'react';
import Icon from './Icon.jsx';

// Pushed-screen header: back, a title that fades in once the page header scrolls away, actions.
export default function TopBar({ title, showTitle, elevated, onBack, children }) {
  return (
    <header className={`topbar${elevated ? ' topbar--elevated' : ''}`}>
      <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
        <Icon name="back" size={24} strokeWidth={2.1} />
      </button>
      <p className={`topbar__title${showTitle ? ' is-on' : ''}`} aria-hidden={!showTitle}>
        {title}
      </p>
      <div className="topbar__actions">{children}</div>
    </header>
  );
}
