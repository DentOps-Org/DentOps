// src/pages/Inventory/InventoryList.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInventory,
  deleteInventoryItem,
  adjustInventoryQuantity
} from "../../redux/slices/inventorySlice";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";

/** Helper: pick dashboard route based on user */
function getDashboardRoute(user) {
  if (!user) return "/";
  if (user.role === "PATIENT") return "/dashboard/patient";
  if (user.role === "DENTAL_STAFF") {
    if (user.specialization === "CLINIC_MANAGER") return "/dashboard/manager";
    return "/dashboard/dentist";
  }
  return "/";
}

export default function InventoryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isLoading, error } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);

  const [adjusting, setAdjusting] = useState({}); // { [id]: deltaInput }

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // CHANGE: any DENTAL_STAFF has full access (create/edit/delete/adjust)
  const isStaff = user?.role === "DENTAL_STAFF";

  const onDelete = (id) => {
    if (!window.confirm("Delete this item? This action is permanent.")) return;
    dispatch(deleteInventoryItem(id));
  };

  const onAdjust = (id) => {
    const delta = Number(adjusting[id]);
    if (Number.isNaN(delta) || delta === 0) {
      alert("Enter non-zero numeric delta (e.g. 5 or -3).");
      return;
    }
    dispatch(adjustInventoryQuantity(id, delta));
    setAdjusting(prev => ({ ...prev, [id]: "" }));
  };

  // dashboard route computed here
  const dashboardRoute = getDashboardRoute(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard - Top Left */}
        <div className="mb-4">
          <Link
            to={dashboardRoute}
            className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header with + New Item button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <div className="flex items-center gap-2">
              {isStaff && (
                <Link to="/inventory/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  + New Item
                </Link>
              )}
              <button onClick={() => dispatch(fetchInventory())} className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">
                Refresh
              </button>
            </div>
          </div>

        {isLoading && <div className="text-gray-600">Loading...</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Reorder</th>
                <th className="py-2">Price</th>
                <th className="py-2">Expiry</th>
                <th className="py-2">Last Updated</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const isLow = Number(item.quantity) < Number(item.reorderThreshold);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-sm text-gray-600">{item.category}</td>
                    <td className={`py-2 font-medium ${isLow ? "text-red-600" : "text-gray-800"}`}>
                      {item.quantity} {isLow && <span className="text-xs bg-red-100 px-1 rounded ml-2">LOW</span>}
                    </td>
                    <td className="py-2">{item.reorderThreshold}</td>
                    <td className="py-2">{item.price ?? "—"}</td>
                    <td className="py-2">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}</td>
                    <td className="py-2 text-sm text-gray-500">{item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : "—"}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {/* Edit/Delete now visible/enabled for any dental staff */}
                        <button
                          onClick={() => navigate(`/inventory/${item._id}/edit`)}
                          className={`text-sm ${isStaff ? "text-indigo-600 hover:underline" : "text-gray-400"}`}
                          disabled={!isStaff}
                        >
                          Edit
                        </button>

                        {isStaff && (
                          <button onClick={() => onDelete(item._id)} className="text-sm text-red-600 hover:underline">
                            Delete
                          </button>
                        )}

                        {/* Adjust quantity: available to any dental staff */}
                        {isStaff && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={adjusting[item._id] ?? ""}
                              onChange={(e) => setAdjusting(prev => ({ ...prev, [item._id]: e.target.value }))}
                              placeholder="+5 or -2"
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <button onClick={() => onAdjust(item._id)} className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">
                              Apply
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !isLoading && <div className="mt-4 text-gray-600">No inventory items found.</div>}
        </div>
      </div>
    </div>
  );
}
