import { Route, Routes } from 'react-router-dom'
import { AdminGate } from './admin/AdminGate'
import { OrderCancelled } from './pages/OrderCancelled'
import { OrderSuccess } from './pages/OrderSuccess'
import { Site } from './Site'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Site />} />
      <Route path="/admin" element={<AdminGate />} />
      <Route path="/commande/succes" element={<OrderSuccess />} />
      <Route path="/commande/annulee" element={<OrderCancelled />} />
    </Routes>
  )
}

export default App
