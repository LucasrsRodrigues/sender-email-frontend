import { useLocation, useNavigate } from "react-router";

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (path) => {
    navigate(path);
  };

  const isCurrentPage = (path) => {
    return location.pathname === path;
  };

  return {
    navigateTo,
    isCurrentPage,
    currentPath: location.pathname,
  };
};
