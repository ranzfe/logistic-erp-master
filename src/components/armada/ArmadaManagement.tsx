import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Armada, ArmadaStatus, TruckType } from '../../types/erp';
import { 
  Truck, 
  Plus, 
  Search, 
  Wrench, 
  Calendar, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Trash2, 
  Edit, 
  X 
} from 'lucide-react';

export const ArmadaManagement: React.FC = () => {
  const { armadaList, addArmada, updateArmada, deleteArmada, hasPermission } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [plateNumber, setPlateNumber] = useState('');
  const [truckType, setTruckType] = useState<TruckType>('Tronton Wingbox');
  const [brandModel, setBrandModel] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [capacityTon, setCapacityTon] = useState<number>(18);
  const [capacityCbm, setCapacityCbm] = useState<number>(40);
  const [odometerKm, setOdometerKm] = useState<number>(85000);
  const [fuelEfficiencyKmL, setFuelEfficiencyKmL] = useState<number>(3.5);
  const [stnkExpiry, setStnkExpiry] = useState('2028-08-15');
  const [kirExpiry, setKirExpiry] = useState('2026-12-20');
  const [status, setStatus] = useState<ArmadaStatus>('Available');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setPlateNumber('');
    setTruckType('Tronton Wingbox');
    setBrandModel('Hino Ranger FL 260 JW');
    setYear(2023);
    setCapacityTon(20);
    setCapacityCbm(45);
    setOdometerKm(75000);
    setFuelEfficiencyKmL(3.6);
    setStnkExpiry('2028-05-10');
    setKirExpiry('2027-01-20');
    setStatus('Available');
    setDriverName('');
    setDriverPhone('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (arm: Armada) => {
    setEditingId(arm.id);
    setPlateNumber(arm.plateNumber);
    setTruckType(arm.truckType);
    setBrandModel(arm.brandModel);
    setYear(arm.year);
    setCapacityTon(arm.capacityTon);
    setCapacityCbm(arm.capacityCbm);
    setOdometerKm(arm.odometerKm);
    setFuelEfficiencyKmL(arm.fuelEfficiencyKmL);
    setStnkExpiry(arm.stnkExpiry);
    setKirExpiry(arm.kirExpiry);
    setStatus(arm.status);
    setDriverName(arm.currentDriverName || '');
    setDriverPhone(arm.currentDriverPhone || '');
    setNotes(arm.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber) return;

    if (editingId) {
      updateArmada(editingId, {
        plateNumber,
        truckType,
        brandModel,
        year,
        capacityTon,
        capacityCbm,
        odometerKm,
        fuelEfficiencyKmL,
        stnkExpiry,
        kirExpiry,
        status,
        currentDriverName: driverName,
        currentDriverPhone: driverPhone,
        notes
      });
    } else {
      addArmada({
        plateNumber,
        truckType,
        brandModel,
        year,
        capacityTon,
        capacityCbm,
        odometerKm,
        fuelEfficiencyKmL,
        stnkExpiry,
        kirExpiry,
        status,
        currentDriverName: driverName,
        currentDriverPhone: driverPhone,
        lastServiceDate: new Date().toISOString().split('T')[0],
        nextServiceKm: odometerKm + 10000,
        notes
      });
    }

    setIsModalOpen(false);
  };

  // Filter
  const filteredArmada = armadaList.filter(arm => {
    const matchSearch = 
      arm.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arm.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (arm.currentDriverName && arm.currentDriverName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'All' || arm.status === statusFilter;
    const matchType = typeFilter === 'All' || arm.truckType === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const statuses = ['All', 'Available', 'In Transit', 'Maintenance', 'Scheduled'];
  const truckTypes = ['All', 'Tronton Wingbox', 'Fuso Heavy Cargo', 'CDD Box (Colt Diesel)', 'CDE Engkel Box', 'Trailer 40ft', 'Blind Van High Roof'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <span>Manajemen Data Armada &amp; Kendaraan</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaris truk, masa berlaku uji berkala KIR &amp; STNK, kapasitas muat Ton/CBM, dan status pemeliharaan bengkel.
          </p>
        </div>

        {hasPermission('armada') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Armada Baru</span>
          </button>
        )}
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Total Populasi Armada</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {armadaList.length} <span className="text-xs font-normal text-slate-500">Unit Terdaftar</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Milik sendiri &amp; dedicated fleet
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Armada Siap Jalan (Standby)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            {armadaList.filter(a => a.status === 'Available').length} <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Siap muat di pool &amp; staging area
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Armada Beroperasi (In Transit)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">
            {armadaList.filter(a => a.status === 'In Transit').length} <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
          <div className="text-[11px] text-blue-600 mt-1">
            Aktif di jalur lintas pengiriman
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Dalam Perawatan (Bengkel)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">
            {armadaList.filter(a => a.status === 'Maintenance').length} <span className="text-xs font-normal text-slate-500">Unit</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Servis berkala &amp; uji kelayakan
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'Semua Status' : st}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            {truckTypes.map(tt => (
              <option key={tt} value={tt}>{tt === 'All' ? 'Semua Tipe Truk' : tt}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari Plat Nomor, Model, Supir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Armada Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Plat &amp; Tipe Unit</th>
                <th className="py-3 px-4">Merek &amp; Tahun</th>
                <th className="py-3 px-4">Kapasitas Muat</th>
                <th className="py-3 px-4">Odometer &amp; Efisiensi</th>
                <th className="py-3 px-4">Masa Berlaku Dokumen</th>
                <th className="py-3 px-4">Supir Bertugas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredArmada.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ditemukan data armada dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredArmada.map(arm => {
                  // Check expiring KIR
                  const isKirExpiring = new Date(arm.kirExpiry).getTime() - new Date('2026-10-23').getTime() < 30 * 24 * 60 * 60 * 1000;

                  return (
                    <tr key={arm.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">{arm.plateNumber}</div>
                        <div className="text-[11px] text-indigo-700 font-medium">{arm.truckType}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{arm.brandModel}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Tahun {arm.year}</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{arm.capacityTon} Ton</div>
                        <div className="text-[11px] text-slate-500">{arm.capacityCbm} CBM</div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-800">{arm.odometerKm.toLocaleString('id-ID')} km</div>
                        <div className="text-[11px] text-slate-500">{arm.fuelEfficiencyKmL} km/L</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500 text-[10px]">KIR:</span>
                          <span className={`font-mono ${isKirExpiring ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                            {arm.kirExpiry}
                          </span>
                          {isKirExpiring && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                              Habis Segera
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">STNK: {arm.stnkExpiry}</div>
                      </td>

                      <td className="py-3 px-4">
                        {arm.currentDriverName ? (
                          <div>
                            <div className="font-medium text-slate-800">{arm.currentDriverName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{arm.currentDriverPhone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Ada Supir</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          arm.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : arm.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : arm.status === 'Maintenance'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {arm.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {hasPermission('armada') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(arm)}
                              title="Edit Data Armada"
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors inline-flex items-center"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus unit ${arm.plateNumber}?`)) {
                                  deleteArmada(arm.id);
                                }
                              }}
                              title="Hapus Armada"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors inline-flex items-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Armada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Data Kendaraan Armada' : 'Pendaftaran Unit Armada Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Polisi (Plat):</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 9912 UXX"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipe Kendaraan:</label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value as TruckType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="Tronton Wingbox">Tronton Wingbox (10 Roda)</option>
                    <option value="Fuso Heavy Cargo">Fuso Heavy Cargo</option>
                    <option value="CDD Box (Colt Diesel)">CDD Box (Colt Diesel)</option>
                    <option value="CDE Engkel Box">CDE Engkel Box</option>
                    <option value="Trailer 40ft">Trailer 40ft</option>
                    <option value="Blind Van High Roof">Blind Van High Roof</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status Operasional:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArmadaStatus)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold"
                  >
                    <option value="Available">Available (Standby Siap)</option>
                    <option value="In Transit">In Transit (Di Jalan)</option>
                    <option value="Maintenance">Maintenance (Bengkel)</option>
                    <option value="Scheduled">Scheduled (Terjadwal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Merek &amp; Model Karoseri:</label>
                  <input
                    type="text"
                    required
                    placeholder="Hino Ranger FL 260 JW (Wingbox Karoseri Antika)"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tahun Perakitan:</label>
                  <input
                    type="number"
                    min="2010"
                    max="2027"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kapasitas (Ton):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={capacityTon}
                    onChange={(e) => setCapacityTon(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Volume (CBM):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={capacityCbm}
                    onChange={(e) => setCapacityCbm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Odometer (Km):</label>
                  <input
                    type="number"
                    required
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">BBM (Km/Liter):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelEfficiencyKmL}
                    onChange={(e) => setFuelEfficiencyKmL(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jatuh Tempo Pajak STNK:</label>
                  <input
                    type="date"
                    required
                    value={stnkExpiry}
                    onChange={(e) => setStnkExpiry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jatuh Tempo Uji Berkala KIR:</label>
                  <input
                    type="date"
                    required
                    value={kirExpiry}
                    onChange={(e) => setKirExpiry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supir Penugasan Tetap:</label>
                  <input
                    type="text"
                    placeholder="Nama Supir Utama"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Kontak Supir:</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Catatan Kondisi Fisik Truk / GPS:</label>
                <input
                  type="text"
                  placeholder="Kondisi ban, no IMEI GPS tracker, asuransi kendaraan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold"
                >
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Armada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
