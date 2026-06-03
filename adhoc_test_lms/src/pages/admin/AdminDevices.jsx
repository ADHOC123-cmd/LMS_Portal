// adhoc_test_lms/src/pages/admin/AdminDevices.jsx
import React, { useState, useEffect } from 'react';
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute";
import { api } from "../../services/api";
import { StorageService } from "../../services/storage";
import { Smartphone, Laptop, Search, Trash2, Loader2, ShieldAlert, Clock, User, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function AdminDevices() {
  return (
    <AdminProtectedRoute>
      <AdminDevicesContent />
    </AdminProtectedRoute>
  );
}

function AdminDevicesContent() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const token = StorageService.getToken();
      const response = await api.admin.getAllDevices(token);
      if (response && response.success) {
        setDevices(response.data || []);
      } else {
        toast.error("Failed to load device logs");
      }
    } catch (error) {
      console.error("Load devices error:", error);
      toast.error(error.message || "Failed to load registered devices");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (id, userName, deviceType) => {
    if (!window.confirm(`Are you sure you want to remove the registered ${deviceType} device for "${userName}"? This will allow them to register a new device upon their next login.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const token = StorageService.getToken();
      const response = await api.admin.deleteDevice(id, token);
      if (response && response.success) {
        toast.success("Device authorization successfully removed");
        // Update local state
        setDevices(prev => prev.filter(d => d.id !== id));
      } else {
        toast.error("Failed to remove device");
      }
    } catch (error) {
      console.error("Remove device error:", error);
      toast.error(error.message || "Failed to remove device");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDevices = devices.filter(device => {
    const userMatches = device.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       device.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       device.deviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatches = deviceTypeFilter === "all" || device.deviceType === deviceTypeFilter;
    
    return userMatches && typeMatches;
  });

  const mobileCount = devices.filter(d => d.deviceType === 'mobile').length;
  const desktopCount = devices.filter(d => d.deviceType === 'desktop').length;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8 font-body">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Header Block */}
        <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em]">Access Management System</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-extrabold text-primary tracking-tighter italic">
              Authorized Device Node Manager
            </h1>
            <p className="text-on-surface-variant text-sm font-medium opacity-60 mt-1">
              Oversee and reset active device locks for students and admins.
            </p>
          </div>
          <button 
            onClick={loadDevices}
            disabled={loading}
            className="px-5 py-3 bg-surface-container-low border border-surface-dim/20 rounded-xl font-bold text-secondary hover:bg-surface-container transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh List
          </button>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-dim/20 shadow-lg">
            <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Total Devices Locked</p>
            <p className="text-3xl font-headline font-extrabold text-primary">{devices.length}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-dim/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Active Mobile Locks</p>
              <p className="text-3xl font-headline font-extrabold text-secondary">{mobileCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-dim/20 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Active Desktop Locks</p>
              <p className="text-3xl font-headline font-extrabold text-primary">{desktopCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Laptop className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-dim/20 shadow-md mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by student name, email, or browser..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {['all', 'desktop', 'mobile'].map(filter => (
              <button
                key={filter}
                onClick={() => setDeviceTypeFilter(filter)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex-grow md:flex-grow-0 ${
                  deviceTypeFilter === filter
                    ? 'bg-primary-container text-white' 
                    : 'bg-surface-container text-secondary hover:bg-surface-container-high'
                }`}
              >
                {filter === 'all' ? 'All Filters' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Devices List Table */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[2rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <ShieldAlert className="w-12 h-12 text-surface-dim mx-auto mb-4" />
            <h3 className="text-xl font-headline font-bold text-primary mb-2">No Registered Devices Found</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
              {searchTerm 
                ? "No authorized devices match your search parameters. Try altering your filters." 
                : "There are currently no device registrations recorded in the system database."}
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-dim/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-on-surface">
                <thead className="bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-5">User Profile</th>
                    <th className="p-5">Authorized Node</th>
                    <th className="p-5">Unique Fingerprint</th>
                    <th className="p-5">Last Activity</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-dim/20">
                  {filteredDevices.map(device => (
                    <tr key={device.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{device.user ? device.user.name : "Deleted User"}</p>
                            <p className="text-xs text-on-surface-variant">{device.user ? device.user.email : "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          {device.deviceType === 'mobile' ? (
                            <span className="flex items-center gap-1.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                              <Smartphone className="w-3.5 h-3.5" /> Mobile
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                              <Laptop className="w-3.5 h-3.5" /> Desktop
                            </span>
                          )}
                          <span className="text-xs text-on-surface font-medium">{device.deviceName}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <code className="text-xs bg-surface-container px-2 py-1 rounded text-outline font-mono block max-w-[200px] truncate" title={device.deviceFingerprint}>
                          {device.deviceFingerprint}
                        </code>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <Clock className="w-3.5 h-3.5 text-outline" />
                          <span>{new Date(device.lastLogin).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleRemoveDevice(device.id, device.user?.name || "User", device.deviceType)}
                          disabled={deletingId === device.id}
                          className="px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 ml-auto"
                        >
                          {deletingId === device.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Reset Lock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
