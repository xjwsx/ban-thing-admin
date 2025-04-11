import { useDoctorStore } from "../stores/doctorStore";

export const usePermission = (menuCode) => {
  const { doctorInfo } = useDoctorStore();

  const checkPermission = (permission) => {
    if (!doctorInfo) return false;

    if (doctorInfo.role === "admin") return true;

    const menuPermission = doctorInfo.permissions.find(
      (p) => p.menuCode === menuCode
    );

    return menuPermission?.[permission] || false;
  };

  return { checkPermission };
};
