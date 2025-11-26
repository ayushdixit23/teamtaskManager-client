import { ToastContainer } from "react-toastify";
import AuthProvider from "./AuthContext";

const Providers = ({
  children,
}: { children: React.ReactNode } & React.PropsWithChildren) => {
  return (
    <>
      <AuthProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </>
  );
};

export default Providers;
