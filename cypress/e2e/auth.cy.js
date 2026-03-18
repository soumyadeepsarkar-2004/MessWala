describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain', 'Login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('contain', 'Invalid credentials');
  });

  it('should navigate to dashboard on successful login', () => {
    cy.login('student@test.com', 'testpass123');
    cy.url().should('include', '/dashboard');
  });
});

describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('student@test.com', 'testpass123');
    cy.url().should('include', '/dashboard');
  });

  it('should display dashboard widgets', () => {
    cy.get('[data-testid="expense-widget"]').should('be.visible');
    cy.get('[data-testid="menu-widget"]').should('be.visible');
    cy.get('[data-testid="attendance-widget"]').should('be.visible');
  });
});
