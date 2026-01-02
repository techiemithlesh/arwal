import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../components/common/ProtectedRoute";
import PropertyListPage from "./pages/PropertyListPage";
import AdminLayout from "../../layout/AdminLayout";
import Details from "./pages/Details";
import ReAssesment from "./pages/ReAssesment";
import Mutation from "./pages/Mutation";
import Preview from "../saf/components/Preview";
import ReportRoute from "./ReportRoute";
import EditHolding from "./pages/EditHolding";
import AddExisitingHolding from "./pages/AddExistingHolding";

const PropertyRoutes = () => {
  return (
    <>
      <Suspense
        fallback={
          <div className="p-6 text-center">
            <span className="inline-block border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin loader"></span>
            <p className="mt-2">Loading...</p>
          </div>
        }
      >
        <AdminLayout>
          <Routes>
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <PropertyListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:propId"
              element={
                <ProtectedRoute>
                  <Details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:propId/reassessment"
              element={
                <ProtectedRoute>
                  <ReAssesment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:propId/mutation"
              element={
                <ProtectedRoute>
                  <Mutation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/details/:propId/edit"
              element={
                <ProtectedRoute>
                  <EditHolding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/preview"
              element={
                <ProtectedRoute>
                  <Preview />
                </ProtectedRoute>
              }
            />
            <Route path="/add-existing-holding" element={<ProtectedRoute>
              <AddExisitingHolding />
            </ProtectedRoute>} />
            <Route path="/report/*" element={<ReportRoute />} />
          </Routes>
        </AdminLayout>
      </Suspense>
    </>
  );
};

export default PropertyRoutes;
