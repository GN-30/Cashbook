import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const AddEntry = () => {
  const { ledgerId } = useParams();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [typeFilter, setTypeFilter] = useState("expense");

  useEffect(() => {
    fetchSchemas();
  }, [ledgerId]);

  const fetchSchemas = async () => {
    try {
      const res = await api.get(`/ledgers/${ledgerId}/schemas`);
      setSchemas(res.data);
      const expenseSchemas = res.data.filter(s => s.type === "expense");
      const incomeSchemas = res.data.filter(s => s.type === "income");
      const defaultType = expenseSchemas.length > 0 ? "expense" : (incomeSchemas.length > 0 ? "income" : "expense");
      setTypeFilter(defaultType);
      
      const defaultList = defaultType === "expense" ? expenseSchemas : incomeSchemas;
      if (defaultList.length > 0) {
        handleSchemaChange(defaultList[0]);
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
      if (typeFilter === "income") {
        navigate(`/ledgers/${ledgerId}`, { state: { showIncomeConfetti: true } });
      } else {
        navigate(`/ledgers/${ledgerId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTypeToggle = (type) => {
    setTypeFilter(type);
    const filtered = schemas.filter(s => s.type === type);
    if (filtered.length > 0) {
      handleSchemaChange(filtered[0]);
    } else {
      setSelectedSchema(null);
      setFormData({});
    }
  };

  const filteredSchemas = schemas.filter(s => s.type === typeFilter);


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
          <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Entry Type</label>
              <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                <button 
                  type="button" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => handleTypeToggle('expense')}
                >
                  Expense
                </button>
                <button 
                  type="button" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === 'income' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => handleTypeToggle('income')}
                >
                  Income
                </button>
              </div>
            </div>

            {filteredSchemas.length === 0 && (
              <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                No {typeFilter} template available. Please configure it in the Schema Builder.
              </div>
            )}
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
            
            {selectedSchema && (
              <button type="submit" className="btn-primary w-full mt-8 py-3 text-lg relative overflow-hidden group">
                <span className="relative z-10">Save {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</span>
                <div className={`absolute inset-0 opacity-20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ${typeFilter === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default AddEntry;
