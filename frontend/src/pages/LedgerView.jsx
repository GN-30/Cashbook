import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { Plus, Settings, TrendingUp, TrendingDown, Trash2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const LedgerView = () => {
  const { ledgerId } = useParams();
  const location = useLocation();
  const [ledger, setLedger] = useState(null);
  const [entries, setEntries] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (location.state?.showIncomeConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, [ledgerId]);

  const fetchData = async () => {
    try {
      // Find current ledger name (We can pass it via state, or fetch, but since we don't have a specific getLedger route, let's fetch all and filter)
      const ledgerRes = await api.get("/ledgers");
      const current = ledgerRes.data.find(l => l.id === ledgerId);
      setLedger(current);

      const [entriesRes, schemasRes] = await Promise.all([
        api.get(`/ledgers/${ledgerId}/entries`),
        api.get(`/ledgers/${ledgerId}/schemas`)
      ]);
      
      setEntries(entriesRes.data);
      setSchemas(schemasRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await api.delete(`/entries/${id}`);
        setEntries(entries.filter(e => e.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const buildAndDownloadCSV = (filteredEntries, type, fieldNames) => {
    if (filteredEntries.length === 0) return;

    const headers = ["Date", "Schema", ...fieldNames];

    const rows = filteredEntries.map(entry => {
      const date = new Date(entry.created_at).toLocaleDateString();
      const schemaName = entry.schema_name;
      const fieldValues = fieldNames.map(fieldName => {
        const val = entry.data[fieldName] !== undefined ? entry.data[fieldName] : "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [`"${date}"`, `"${schemaName}"`, ...fieldValues].join(",");
    });

    const csvString = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");

    // Use Blob + createObjectURL — works on mobile browsers (iOS/Android)
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${ledger?.name || 'ledger'}_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // free memory
  };

  const handleDownloadCSV = () => {
    if (entries.length === 0) return alert("No entries to download.");

    const incomeEntries = entries.filter(e => e.schema_type === "income");
    const expenseEntries = entries.filter(e => e.schema_type === "expense");

    if (incomeEntries.length === 0 && expenseEntries.length === 0) {
      return alert("No entries to download.");
    }

    // Collect field names only from income schemas
    const incomeFieldNames = [];
    schemas
      .filter(s => s.type === "income")
      .forEach(schema => {
        (schema.fields || []).forEach(field => {
          if (!incomeFieldNames.includes(field.name)) incomeFieldNames.push(field.name);
        });
      });

    // Collect field names only from expense schemas
    const expenseFieldNames = [];
    schemas
      .filter(s => s.type === "expense")
      .forEach(schema => {
        (schema.fields || []).forEach(field => {
          if (!expenseFieldNames.includes(field.name)) expenseFieldNames.push(field.name);
        });
      });

    // Download income CSV (with a small delay so both files trigger properly)
    buildAndDownloadCSV(incomeEntries, "income", incomeFieldNames);
    setTimeout(() => {
      buildAndDownloadCSV(expenseEntries, "expense", expenseFieldNames);
    }, 300);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // Calculate stats based on 'isAmount' field in schema
  let totalIncome = 0;
  let totalExpense = 0;

  entries.forEach(entry => {
    const schema = schemas.find(s => s.id === entry.schema_id);
    if (!schema) return;

    // Find the field that is marked as 'isAmount'
    const amountField = schema.fields.find(f => f.isAmount);
    
    if (amountField && entry.data[amountField.name]) {
      const val = parseFloat(entry.data[amountField.name]) || 0;
      if (schema.type === 'income') totalIncome += val;
      if (schema.type === 'expense') totalExpense += val;
    }
  });

  const chartData = [
    { name: "Income", amount: totalIncome, fill: "#10b981" },
    { name: "Expense", amount: totalExpense, fill: "#ef4444" }
  ];

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />
        </div>
      )}
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-end mb-8">
        <div>
          <Link to="/dashboard" className="text-brand-600 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-slate-800">{ledger?.name || "Loading..."}</h1>
        </div>
        <div className="flex gap-3">
          <Link to={`/ledgers/${ledgerId}/schema-builder`} className="btn-secondary flex items-center gap-2">
            <Settings size={18} /> Manage Schemas
          </Link>
          {schemas.length > 0 && (
            <Link to={`/ledgers/${ledgerId}/add-entry`} className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Add Entry
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex flex-col justify-center">
          <p className="text-sm text-slate-500 mb-1">Total Balance</p>
          <p className={`text-4xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            ${(totalIncome - totalExpense).toFixed(2)}
          </p>
        </div>
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="glass-card p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Expense</p>
            <p className="text-2xl font-bold text-red-500">${totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Transaction History</h2>
            <button 
              onClick={handleDownloadCSV} 
              disabled={entries.length === 0}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
          {entries.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No entries found. Make sure you have created a schema first, then add an entry.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm">
                    <th className="pb-3 pt-2 font-medium">Date</th>
                    <th className="pb-3 pt-2 font-medium">Schema</th>
                    <th className="pb-3 pt-2 font-medium">Details</th>
                    <th className="pb-3 pt-2 font-medium">Type</th>
                    <th className="pb-3 pt-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm">{new Date(entry.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                          {entry.schema_name}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-slate-600 max-w-[200px] truncate">
                        {Object.entries(entry.data).map(([k,v]) => `${k}: ${v}`).join(", ")}
                      </td>
                      <td className="py-3">
                        {entry.schema_type === 'income' ? (
                          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Income</span>
                        ) : (
                          <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs">Expense</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => handleDelete(entry.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1 glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Income vs Expense</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LedgerView;
