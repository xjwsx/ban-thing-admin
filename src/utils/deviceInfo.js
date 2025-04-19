export const getDeviceInfo = () => {
  // 브라우저 정보 가져오기
  const getBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1)
      return "Internet Explorer";
    return "Unknown";
  };

  // OS 정보 가져오기
  const getOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "MacOS";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    if (userAgent.indexOf("Android") > -1) return "Android";
    if (userAgent.indexOf("iOS") > -1) return "iOS";
    return "Unknown";
  };

  // 요청 형식에 맞게 장치 정보 반환
  return {
    deviceType: "web",
    deviceInfo: {
      browser: getBrowser(),
      os: getOS(),
    },
  };
};
