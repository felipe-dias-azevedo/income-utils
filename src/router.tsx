import { Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PAGE_DEFINITIONS, PAGE_ROUTES } from "./routes";
import { Spinner } from "@radix-ui/themes";

export function AppRouter() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {Object.values(PAGE_DEFINITIONS).map((page) => {
          const Component = page.component as ComponentType<any>;
          const componentProps = page.componentProps ?? {};

          return (
            <Route
              key={page.path}
              path={page.path}
              element={<Component {...componentProps} />}
            />
          );
        })}
        <Route path="*" element={<Navigate to={PAGE_ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  );
}
