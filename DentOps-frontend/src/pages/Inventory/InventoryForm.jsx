// src/pages/Inventory/InventoryForm.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInventoryItem, updateInventoryItem } from "../../redux/slices/inventorySlice";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function InventoryForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const editingId = id;
  const { isLoading, error } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    // allow any dental staff — otherwise redirect to dashboard
    if (!(user?.role === "DENTAL_STAFF")) {
      navigate(getDashboardRoute(user));
    }
  }, [user, navigate]);


  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "CONSUMABLE",
    quantity: 0,
    reorderThreshold: 5,
    price: "",
    expiryDate: ""
  });

  useEffect(() => {
    if (editingId) {
      (async () => {
        try {
          const res = await api.get(`/inventory/${editingId}`);
          const d = res.data.data;
          setForm({
            name: d.name || "",
            description: d.description || "",
            category: d.category || "CONSUMABLE",
            quantity: d.quantity ?? 0,
            reorderThreshold: d.reorderThreshold ?? 5,
            price: d.price ?? "",
            expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().slice(0,10) : ""
          });
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [editingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      quantity: Number(form.quantity),
      reorderThreshold: Number(form.reorderThreshold),
      price: form.price === "" ? undefined : Number(form.price),
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined
    };
    if (editingId) dispatch(updateInventoryItem(editingId, payload, navigate));
    else dispatch(createInventoryItem(payload, navigate));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">{editingId ? "Edit" : "New"} Inventory Item</h2>

        {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
                   className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500">
              <option value="CONSUMABLE">Consumable</option>
              <option value="INSTRUMENT">Instrument</option>
              <option value="MEDICATION">Medication</option>
              <option value="OFFICE">Office</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Quantity</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} min="0"
                   className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Reorder Threshold</label>
            <input name="reorderThreshold" type="number" value={form.reorderThreshold} onChange={handleChange} min="0"
                   className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Price</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} min="0" step="0.01"
                   className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Expiry Date</label>
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange}
                   className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              {isLoading ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => navigate("/inventory")} className="flex-1 bg-gray-100 py-2 rounded hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
