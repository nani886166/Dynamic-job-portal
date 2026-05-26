import React from "react";
import { NavLink, useLocation } from "react-router";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((item) => item);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
      <NavLink to="/" className="hover:text-primary">
        Home
      </NavLink>

      {pathnames.map((name, index) => {
        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");

        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={routeTo}>
            <span>/</span>

            {isLast ? (
              <span className="text-foreground font-medium">
                {name.replace("-", " ")}
              </span>
            ) : (
              <NavLink to={routeTo} className="hover:text-primary">
                {name.replace("-", " ")}
              </NavLink>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
