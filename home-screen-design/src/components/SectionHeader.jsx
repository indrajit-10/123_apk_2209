import React from 'react';
import Icon from './Icon.jsx';

export default function SectionHeader({ id, eyebrow, eyebrowUrgent, title, action = 'See all', onAction }) {
  return (
    <div className="section-head">
      <div className="section-head__text">
        {eyebrow && <p className={`eyebrow${eyebrowUrgent ? ' eyebrow--urgent' : ''}`}>{eyebrow}</p>}
        <h2 className="section-title" id={id}>
          {title}
        </h2>
      </div>
      {onAction && (
        <button type="button" className="link-btn" onClick={onAction}>
          {action}
          <Icon name="chevron" size={16} strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
