export function getScopeFilter(user, additionalQuery = {}) {
  if (user && user.role === 'admin') {
    return { ...additionalQuery };
  }
  
  const school = user ? user.username : 'school1';
  
  return {
    ...additionalQuery,
    schoolId: school
  };
}
