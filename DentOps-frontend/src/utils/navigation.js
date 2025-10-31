// utils/navigation.js (or inline in component)
export function getDashboardRoute(user) {
    if (!user) return '/';
    if (user.role === 'PATIENT') return '/dashboard/patient';
    if (user.role === 'DENTAL_STAFF') {
      if (user.specialization === 'CLINIC_MANAGER') return '/dashboard/manager';
      return '/dashboard/dentist';
    }
    return '/';
  }  