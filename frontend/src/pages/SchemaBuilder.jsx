import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { Plus, Trash2, CheckSquare, RefreshCw, Edit2 } from "lucide-react";

const SchemaBuilder = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState([]);
  
  // New Schema State
  const [editingSchemaId, setEditingSchemaId] = useState(null);
  const [schemaName, setSchemaName] = useState("");
  const [schemaType, setSchemaType] = useState("expense");
  const [fields, setFields] = useState([
    { id: Date.now().toString(), name: "Description", type: "text", options: "", isAmount: false }
  ]);

  useEffect(() => {
    fetchSchemas();
  }, [ledgerId]);

  const fetchSchemas = async () => {
    try {
      const res = await api.get(`/ledgers/${ledgerId}/schemas`);
      setSchemas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addField = () => {
    setFields([...fields, { 
      id: Date.now().toString(), 
      name: "", 
      type: "text", 
      options: "", 
      isAmount: false 
    }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => {
      if (f.id === id) {
        // Enforce only one amount field
        if (key === 'isAmount' && value === true) {
          // Uncheck others
          fields.forEach(other => { if (other.id !== id) other.isAmount = false; });
        }
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveSchema = async (e) => {
    e.preventDefault();
    try {
      // Process options string into array for dropdowns
      const processedFields = fields.map(f => ({
        ...f,
        options: f.type === 'dropdown' ? (typeof f.options === 'string' ? f.options.split(',').map(s => s.trim()) : f.options) : []
      }));

      if (editingSchemaId) {
        await api.put(`/ledgers/${ledgerId}/schemas/${editingSchemaId}`, {
          name: schemaName,
          type: schemaType,
          fields: processedFields
        });
        setEditingSchemaId(null);
      } else {
        await api.post(`/ledgers/${ledgerId}/schemas`, {
          name: schemaName,
          type: schemaType,
          fields: processedFields
        });
      }

      setSchemaName("");
      setFields([{ id: Date.now().toString(), name: "Description", type: "text", options: "", isAmount: false }]);
      fetchSchemas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (schema) => {
    setEditingSchemaId(schema.id);
    setSchemaName(schema.name);
    setSchemaType(schema.type);
    
    // Transform options back to string for the input field
    const hydratedFields = schema.fields.map(f => ({
      ...f,
      id: f.id || Date.now().toString() + Math.random().toString(), // fallback if missing
      options: f.type === 'dropdown' && Array.isArray(f.options) ? f.options.join(', ') : f.options
    }));
    
    setFields(hydratedFields.length > 0 ? hydratedFields : [{ id: Date.now().toString(), name: "Description", type: "text", options: "", isAmount: false }]);
  };
  
  const cancelEdit = () => {
    setEditingSchemaId(null);
    setSchemaName("");
    setSchemaType("expense");
    setFields([{ id: Date.now().toString(), name: "Description", type: "text", options: "", isAmount: false }]);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link to={`/ledgers/${ledgerId}`} className="text-brand-600 hover:underline mb-2 inline-block">&larr; Back to Ledger</Link>
        <h1 className="text-3xl font-bold text-slate-800">Dynamic Schema Builder</h1>
        <p className="text-slate-500 text-sm mt-1">Define custom form templates for your ledger entries.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-brand-500" /> {editingSchemaId ? "Edit Schema Template" : "Create New Schema"}
          </h2>
          <form onSubmit={handleSaveSchema}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Schema Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Travel, Salary, Utilities"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="input-field"
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-2">
              <h3 className="font-semibold text-slate-700 mb-3 ml-1">Fields Definition</h3>
              
              {fields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 relative">
                  <button type="button" onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="text"
                        placeholder="Field Name (e.g. Vendor)"
                        className="input-field text-sm"
                        value={field.name}
                        onChange={(e) => updateField(field.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <select 
                        className="input-field text-sm"
                        value={field.type}
                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                      >
                        <option value="text">Text Context</option>
                        <option value="number">Numeric Value</option>
                        <option value="dropdown">Selection (Dropdown)</option>
                        <option value="date">Date Picker</option>
                        <option value="boolean">Yes/No Toggle</option>
                      </select>
                    </div>
                  </div>

                  {field.type === 'dropdown' && (
                    <div className="mt-2 text-xs">
                      <input 
                        type="text" 
                        placeholder="Options comma-separated (e.g. Bus, Train, Air)"
                        className="w-full p-2 border border-slate-200 rounded text-slate-600 bg-white"
                        value={field.options}
                        onChange={(e) => updateField(field.id, 'options', e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {field.type === 'number' && (
                    <div className="mt-3 flex items-center gap-2 bg-indigo-50 p-2 rounded border border-indigo-100">
                      <input 
                        type="checkbox"
                        id={`isAmount-${field.id}`}
                        checked={field.isAmount}
                        onChange={(e) => updateField(field.id, 'isAmount', e.target.checked)}
                      />
                      <label htmlFor={`isAmount-${field.id}`} className="text-xs text-indigo-800 font-medium cursor-pointer flex-1">
                        Use this field as the main "Amount" for Dashboard Stats
                      </label>
                    </div>
                  )}
                </div>
              ))}
              
              <button type="button" onClick={addField} className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1 mt-2">
                <Plus size={14} /> Add Another Field
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              {editingSchemaId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary flex-1">
                  Cancel
                </button>
              )}
              <button type="submit" className={`btn-primary flex-[2] bg-slate-800 hover:bg-slate-900 border-none ${editingSchemaId ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}>
                {editingSchemaId ? "Update Schema Template" : "Save Schema Template"}
              </button>
            </div>
          </form>
        </div>

        <div className="glass-card p-6 h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-green-500" /> Existing Schemas
          </h2>
          
          {schemas.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No schemas created yet.</p>
          ) : (
            <div className="space-y-4">
              {schemas.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-white/50 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${s.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800 ml-2">{s.name}</h3>
                      <p className="text-xs text-slate-500 ml-2 uppercase font-semibold">{s.type}</p>
                    </div>
                    <button onClick={() => handleEditClick(s)} className="text-brand-500 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 p-1.5 rounded-md transition-colors mr-2">
                      <Edit2 size={16} />
                    </button>
                  </div>
                  
                  <div className="ml-2 flex flex-wrap gap-2">
                    {s.fields.map((f, i) => (
                      <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 flex items-center gap-1">
                        {f.name} <span className="opacity-50">({f.type})</span>
                        {f.isAmount && <span title="Accounted Value" className="text-indigo-600 font-bold ml-1">$</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;
