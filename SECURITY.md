# Security Policy

## Reporting a Vulnerability

**Please do not publicly disclose security vulnerabilities.** 

If you discover a security vulnerability in MessWala, please report it responsibly by:

1. **Email:** soumyadeep.sarkar@example.com (Mark subject line as "SECURITY VULNERABILITY")
2. **GitHub Security Advisory:** Use the [Report a vulnerability](https://github.com/soumyadeepsarkar-2004/MessWala/security/advisories/new) button on the Security tab
3. **GitHub Private Vulnerability Reporting:** If available, use the private vulnerability reporting feature

## What to Include

When reporting a vulnerability, please provide:

- A clear description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact (info disclosure, auth bypass, data loss, etc.)
- Suggested fix (if you have one)
- Your contact information (email/GitHub username)

## Response Timeline

- **Acknowledgment:** Within 48 hours of report submission
- **Initial Assessment:** Within 1 week
- **Fix Development:** Depends on severity (urgent fixes prioritized)
- **Public Disclosure:** After patch is released (typically 30-90 days)

## Severity Levels

### Critical (CVSS 9.0-10.0)
- Remote code execution
- Complete authentication bypass
- Unauthorized data access
- **Response Priority:** Immediate (24-48 hours)

### High (CVSS 7.0-8.9)
- Significant data breach
- Privilege escalation
- Denial of service
- **Response Priority:** High (3-5 days)

### Medium (CVSS 4.0-6.9)
- Limited data exposure
- Information disclosure
- Unauthorized modifications
- **Response Priority:** Medium (1-2 weeks)

### Low (CVSS 0.1-3.9)
- Minor information leaks
- Limited impact vulnerabilities
- **Response Priority:** Normal (monthly releases)

## Security Best Practices

When using MessWala, please follow these practices:

### Environment Variables
- Never commit `.env` files to the repository
- Rotate secrets regularly
- Use strong, randomly generated API keys
- Store MongoDB credentials securely

### API Security
- Always validate user input on the backend
- Use HTTPS for all communications
- Implement rate limiting (already done)
- Use JWT tokens with expiration

### Database Security
- Use strong MongoDB credentials
- Enable MongoDB authentication and encryption
- Whitelist IP addresses accessing your MongoDB cluster
- Regular backups with encryption

### Deployment Security
- Keep dependencies updated
- Deploy with security headers (Helmet.js enabled)
- Use environment-based configuration
- Enable CORS for trusted origins only
- Monitor logs for suspicious activity

### Frontend Security
- Validate inputs client-side for UX
- Never store sensitive data in localStorage
- Use httpOnly cookies for tokens
- Implement CSRF protection

## Known Issues

None currently known. Please report any issues confidentially.

## Security Headers

MessWala includes the following security headers via Helmet.js:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)

## Dependency Security

We use GitHub's Dependabot to monitor and alert on vulnerable dependencies.

## Vulnerability Disclosure Timeline Example

1. **Day 1:** Vulnerability reported
2. **Day 2:** Acknowledgment sent, severity assessed
3. **Day 5-10:** Patch developed and tested
4. **Day 30-60:** Security release issued
5. **Day 60+:** Details disclosed publicly (after sufficient patch adoption)

## Public Disclosure

Once a patch is released, we typically:
- Publish a security advisory
- Detail the vulnerability without exploitation instructions
- Thank the reporter (with permission)
- Include links to update guidance

## Questions?

If you have questions about this security policy, please contact the maintainers at soumyadeep.sarkar@example.com

---

**Last Updated:** March 18, 2026
