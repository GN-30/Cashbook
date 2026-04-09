import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { Plus, BookOpen, LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [ledgers, setLedgers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLedgerName, setNewLedgerName] = useState("");
  const [newLedgerDesc, setNewLedgerDesc] = useState("");

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const res = await api.get("/ledgers");
      setLedgers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLedger = async (e) => {
    e.preventDefault();
    try {
      await api.post("/ledgers", { name: newLedgerName, description: newLedgerDesc });
      setIsModalOpen(false);
      setNewLedgerName("");
      setNewLedgerDesc("");
      fetchLedgers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="-m-4 md:-m-8 px-4 py-8 md:p-8 min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('/home-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-sm"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-3xl font-bold text-slate-800">Hello, {user.name}</h1>
          <p className="text-slate-500">Manage your custom ledgers below</p>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create New Ledger Card */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-500 hover:bg-slate-100 hover:border-slate-400 transition-all cursor-pointer min-h-[200px]"
        >
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Plus size={32} className="text-brand-500" />
          </div>
          <h3 className="font-semibold text-lg">Create New Ledger</h3>
        </div>

        {/* List of Ledgers */}
        {ledgers.map(ledger => (
          <Link to={`/ledgers/${ledger.id}`} key={ledger.id}>
            <div className="glass-card hover:shadow-2xl transition-all cursor-pointer p-6 h-full flex flex-col min-h-[200px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{ledger.name}</h3>
              </div>
              <p className="text-slate-500 text-sm flex-grow">{ledger.description || "No description provided."}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">Created: {new Date(ledger.created_at).toLocaleDateString()}</span>
                <span className="text-brand-600 font-medium text-sm">Open &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Modal for Creating Ledger */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md p-6 m-4 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">New Ledger</h2>
            <form onSubmit={handleCreateLedger} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ledger Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newLedgerName}
                  onChange={(e) => setNewLedgerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="input-field" 
                  value={newLedgerDesc}
                  onChange={(e) => setNewLedgerDesc(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
