import { useTeacherStore } from "../stores/teacherStore";

export const usePermission = (menuCode) => {
  const { teacherInfo } = useTeacherStore();

  const checkPermission = (permission) => {
    if (!teacherInfo) return false;

    if (teacherInfo.role === "admin") return true;

    const menuPermission = teacherInfo.permissions.find(
      (p) => p.menuCode === menuCode
    );

    return menuPermission?.[permission] || false;
  };

  return { checkPermission };
};
