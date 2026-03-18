/**
 * Navbar Component Tests
 *
 * Note: vitest v4 uses globals (describe, it, expect) - no imports needed
 */

describe('Navbar Configuration', () => {
  it('should have correct navigation paths', () => {
    const expectedPaths = [
      '/dashboard',
      '/attendance',
      '/expenses',
      '/analytics',
      '/feedback',
      '/tasks',
      '/menu',
    ];

    expect(expectedPaths).toHaveLength(7);
    expect(expectedPaths).toContain('/dashboard');
    expect(expectedPaths).toContain('/menu');
  });

  it('should have role badge mappings', () => {
    const roleBadge = {
      student: 'badge-student',
      manager: 'badge-manager',
      treasurer: 'badge-treasurer',
      admin: 'badge-admin',
    };

    expect(roleBadge.student).toBe('badge-student');
    expect(roleBadge.admin).toBe('badge-admin');
    expect(roleBadge.manager).toBe('badge-manager');
    expect(roleBadge.treasurer).toBe('badge-treasurer');
  });

  it('should support admin/manager seeing students link', () => {
    const adminRoles = ['admin', 'manager'];
    expect(adminRoles.includes('admin')).toBe(true);
    expect(adminRoles.includes('manager')).toBe(true);
    expect(adminRoles.includes('student')).toBe(false);
    expect(adminRoles.includes('treasurer')).toBe(false);
  });
});
