/**
 * Frontend Accessibility & A11y Enhancements
 * WCAG 2.1 Level AA compliance utilities
 */

// Utility hooks and components for accessibility

/**
 * useAccessibility - Custom hook for accessible interactions
 */
export const useAccessibility = () => {
  const announceToScreenReader = (message, priority = 'polite') => {
    const announcer = document.getElementById('aria-announcer') || createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  };

  const createAnnouncer = () => {
    const div = document.createElement('div');
    div.id = 'aria-announcer';
    div.setAttribute('aria-live', 'polite');
    div.setAttribute('aria-atomic', 'true');
    div.style.position = 'absolute';
    div.style.left = '-10000px';
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.overflow = 'hidden';
    document.body.appendChild(div);
    return div;
  };

  const handleKeyboardNavigation = (e) => {
    // Implement focus management and keyboard shortcuts
    if (e.key === 'Escape') {
      // Handle escape key
      const focusedElement = document.activeElement;
      if (focusedElement?.hasAttribute('aria-modal')) {
        focusedElement.dispatchEvent(new Event('close'));
      }
    }
  };

  return {
    announceToScreenReader,
    handleKeyboardNavigation,
  };
};

/**
 * AccessibleButton - Accessible button component
 */
export const AccessibleButton = ({
  onClick,
  children,
  ariaLabel,
  ariaPressed,
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || children}
      aria-pressed={ariaPressed}
      aria-disabled={disabled}
      className={`btn btn-${variant} ${disabled ? 'disabled' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * AccessibleModal - Accessible modal with proper ARIA and keyboard handling
 */
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  role = 'dialog',
  ...props
}) => {
  const previousActiveElement = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const handleEscapePress = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapePress);

      // Focus the modal
      const modalElement = document.querySelector('[role="dialog"]');
      modalElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleEscapePress);
      };
    } else {
      document.body.style.overflow = 'unset';
      previousActiveElement.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        role={role}
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-content"
        {...props}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </>
  );
};

/**
 * AccessibleForm - Form with proper label associations and error messaging
 */
export const AccessibleForm = ({ onSubmit, children, ...props }) => {
  const [errors, setErrors] = React.useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(new FormData(e.target));
      setErrors({});
    } catch (err) {
      setErrors(err.fieldErrors || {});
      // Announce errors to screen readers
      const errorMessages = Object.values(err.fieldErrors || {}).flat();
      const announcer = document.getElementById('aria-announcer');
      if (announcer) {
        announcer.setAttribute('aria-live', 'assertive');
        announcer.textContent = `Form has ${errorMessages.length} error(s): ${errorMessages.join(', ')}`;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate {...props}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { errors }),
      )}
    </form>
  );
};

/**
 * AccessibleFormField - Form field with proper labeling and error display
 */
export const AccessibleFormField = ({
  label,
  name,
  type = 'text',
  required = false,
  description,
  errors = {},
  ...props
}) => {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const descriptionId = `desc-${name}`;
  const hasError = errors[name];

  return (
    <div className="form-group">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      {description && (
        <div id={descriptionId} className="form-description">
          {description}
        </div>
      )}
      <input
        id={fieldId}
        name={name}
        type={type}
        required={required}
        aria-required={required}
        aria-invalid={!!hasError}
        aria-describedby={`${description ? descriptionId : ''} ${hasError ? errorId : ''}`.trim()}
        className={`form-input ${hasError ? 'input-error' : ''}`}
        {...props}
      />
      {hasError && (
        <div id={errorId} className="form-error" role="alert">
          {Array.isArray(hasError) ? hasError.join(', ') : hasError}
        </div>
      )}
    </div>
  );
};

/**
 * SkipToMainContent - Link for keyboard users to skip navigation
 */
export const SkipToMainContent = () => {
  return (
    <a
      href="#main-content"
      className="skip-to-main"
      tabIndex="0"
    >
      Skip to main content
    </a>
  );
};

/**
 * AccessibilityChecker - Development utility to check for accessibility issues
 */
export const checkAccessibility = (element = document) => {
  const issues = [];

  // Check for images without alt text
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt || img.alt.trim() === '') {
      issues.push({
        type: 'image-alt',
        message: `Image missing alt text: ${img.src}`,
        severity: 'error',
      });
    }
  });

  // Check for form fields without labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const id = input.id;
    const hasLabel = id && element.querySelector(`label[for="${id}"]`);
    if (!hasLabel && !input.hasAttribute('aria-label')) {
      issues.push({
        type: 'unlabeled-input',
        message: `Form field lacks label: ${input.name}`,
        severity: 'error',
      });
    }
  });

  // Check for proper heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    if (level > lastLevel + 1) {
      issues.push({
        type: 'heading-hierarchy',
        message: `Heading hierarchy broken: ${heading.tagName}`,
        severity: 'warning',
      });
    }
    lastLevel = level;
  });

  // Check for color contrast (basic check)
  const elementsWithText = element.querySelectorAll('p, span, a, button, label');
  elementsWithText.forEach((el) => {
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const bgColor = styles.backgroundColor;
    // Basic contrast check - in production, use a proper library like 'axe-core'
    if (color === bgColor) {
      issues.push({
        type: 'contrast',
        message: `Low contrast for text in ${el.tagName}`,
        severity: 'warning',
      });
    }
  });

  return issues;
};

export default {
  useAccessibility,
  AccessibleButton,
  AccessibleModal,
  AccessibleForm,
  AccessibleFormField,
  SkipToMainContent,
  checkAccessibility,
};
