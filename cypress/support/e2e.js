// Cypress support file - put common helpers and commands here

// Custom command example
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command for intercepting API calls
Cypress.Commands.add('interceptApi', (method, path, fixture) => {
  cy.intercept(method, path, {
    statusCode: 200,
    fixture: fixture,
  });
});
