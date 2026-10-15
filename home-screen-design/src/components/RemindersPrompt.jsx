import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { track } from '../lib/track.js';

// Uses the app's existing contacts permission and Reminders tab. Hidden once dismissed or granted.
export default function RemindersPrompt() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <section className="section">
      <div className="reminder-card">
        <span className="reminder-card__icon">
          <Icon name="contacts" size={24} />
        </span>
        <div className="reminder-card__body">
          <h2 className="reminder-card__title">Never miss a birthday</h2>
          <p>Add birthdays from your contacts. We’ll remind you the day before, with cards ready to send.</p>
          <div className="reminder-card__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                track('REMINDERS_PROMPT_ADD_CONTACTS');
                setHidden(true);
              }}
            >
              Add from contacts
            </button>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                track('REMINDERS_PROMPT_DISMISS');
                setHidden(true);
              }}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
