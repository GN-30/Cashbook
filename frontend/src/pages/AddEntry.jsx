import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";

const AddEntry = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSchemas();
  }, [ledgerId]);

  const fetchSchemas = async () => {
    try {
      const res = await api.get(`/ledgers/${ledgerId}/schemas`);
      setSchemas(res.data);
      if (res.data.length > 0) {
        handleSchemaChange(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchemaChange = (schema) => {
    setSelectedSchema(schema);
    const initialData = {};
    schema.fields.forEach(field => {
      if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'dropdown' && field.options.length > 0) {
        initialData[field.name] = field.options[0];
      } else {
        initialData[field.name] = "";
      }
    });
    setFormData(initialData);
  };

  const handleInputChange = (e, fieldName, type) => {
    const value = type === 'boolean' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/ledgers/${ledgerId}/entries`, {
        schema_id: selectedSchema.id,
        data: formData
      });
      navigate(`/ledgers/${ledgerId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link to={`/ledgers/${ledgerId}`} className="text-brand-600 hover:underline mb-2 inline-block">&larr; Back to Ledger</Link>
        <h1 className="text-3xl font-bold text-slate-800">Add New Entry</h1>
      </div>

      {schemas.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-500">
          <p className="mb-4">You need to create a schema template first.</p>
          <Link to={`/ledgers/${ledgerId}/schema-builder`} className="btn-primary inline-block">Create Schema</Link>
        </div>
      ) : (
        <div className="glass-card p-8 shadow-2xl">
          <div className="mb-6 pb-6 border-b border-slate-100">
            <label className="block text-sm font-medium text-slate-500 mb-2">Select Template</label>
            <select 
              className="input-field max-w-xs font-semibold text-brand-600 border-brand-200 focus:border-brand-500 focus:ring-brand-500 bg-brand-50"
              value={selectedSchema?.id}
              onChange={(e) => {
                const schema = schemas.find(s => s.id === e.target.value);
                handleSchemaChange(schema);
              }}
            >
              {schemas.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {selectedSchema?.fields.map(field => (
              <div key={field.name} className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  <span>{field.name}</span>
                  {field.isAmount && <span className="text-xs text-brand-500 font-bold bg-brand-50 px-2 py-0.5 rounded">Amount Field</span>}
                </label>
                
                {field.type === 'text' && (
                  <input type="text" className="input-field" value={formData[field.name]} onChange={(e) => handleInputChange(e, field.name, 'text')} required />
                )}
                
                {field.type === 'number' && (
                  <input type="number" step="0.01" className="input-field" value={formData[field.name]} onChange={(e) => handleInputChange(e, field.name, 'number')} required />
                )}
                
                {field.type === 'date' && (
                  <input type="date" className="input-field" value={formData[field.name]} onChange={(e) => handleInputChange(e, field.name, 'date')} required />
                )}
                
                {field.type === 'dropdown' && (
                  <select className="input-field" value={formData[field.name]} onChange={(e) => handleInputChange(e, field.name, 'dropdown')} required>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                
                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" checked={formData[field.name]} onChange={(e) => handleInputChange(e, field.name, 'boolean')} />
                    <span className="text-sm text-slate-600">Yes</span>
                  </label>
                )}
              </div>
            ))}
            
            <button type="submit" className="btn-primary w-full mt-8 py-3 text-lg relative overflow-hidden group">
              <span className="relative z-10">Save Entry</span>
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddEntry;
