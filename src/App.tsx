import { Routes, Route } from 'react-router-dom';
import { StorefrontLayout } from './StorefrontLayout';
import { LoginPage } from './admin/LoginPage';
import { AdminLayout } from './admin/AdminLayout';
import { SimCardTable } from './admin/SimCardTable';
import { SimCardForm } from './admin/SimCardForm';
import { BulkUpload } from './admin/BulkUpload';

function App() {

  return (
    <Routes>
      <Route path="/" element={<StorefrontLayout />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<SimCardTable />} />
        <Route path="add" element={<SimCardForm />} />
        <Route path="edit/:id" element={<SimCardForm />} />
        <Route path="bulk-upload" element={<BulkUpload />} />
      </Route>
    </Routes>
  );
}

export default App;
