import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, FolderPlus, Upload, Search, Bell, User as UserIcon,
  LogOut, ChevronRight, ChevronDown, MoreVertical, Image as ImageIcon,
  Trash2, Edit2, Plus, X, Download, ArrowLeft
} from 'lucide-react';
import { User, Folder as FolderType, Photo } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  addNotification: (msg: string, type?: any) => void;
}

export const Dashboard = ({ user, onLogout, addNotification }: DashboardProps) => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [foldersRes, photosRes] = await Promise.all([
          fetch('/api/folders', { credentials: 'include' }),
          fetch('/api/photos', { credentials: 'include' }),
        ]);

        if (!foldersRes.ok || !photosRes.ok) {
          addNotification('Не вдалося завантажити дані', 'error');
          return;
        }

        const foldersData: FolderType[] = await foldersRes.json();
        const photosData: Photo[] = await photosRes.json();
        setFolders(foldersData);
        setPhotos(photosData);
      } catch {
        addNotification('Сталася помилка при завантаженні даних', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id, addNotification]);

  const handleCreateFolder = async (name: string) => {
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, parentId: currentFolder?.id || null }),
      });
      if (!res.ok) {
        addNotification('Не вдалося створити папку', 'error');
        return;
      }
      const folder: FolderType = await res.json();
      setFolders(prev => [...prev, folder]);
      addNotification('Папку створено', 'success');
      setShowFolderModal(false);
    } catch {
      addNotification('Сталася помилка при створенні папки', 'error');
    }
  };

  const handleUploadPhoto = async (name: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('file', file);
      if (currentFolder?.id) {
        formData.append('folderId', String(currentFolder.id));
      }

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        addNotification('Не вдалося завантажити фото', 'error');
        return;
      }
      const photo: Photo = await res.json();
      setPhotos(prev => [...prev, photo]);
      addNotification('Фото завантажено', 'success');
      setShowUploadModal(false);
    } catch {
      addNotification('Сталася помилка при завантаженні фото', 'error');
    }
  };

  const handleDeletePhoto = (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити це фото?')) return;
    const remove = async () => {
      try {
        const res = await fetch(`/api/photos/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          addNotification('Не вдалося видалити фото', 'error');
          return;
        }
        setPhotos(prev => prev.filter(p => p.id !== id));
        addNotification('Фото видалено', 'success');
        setSelectedPhoto(null);
      } catch {
        addNotification('Сталася помилка при видаленні фото', 'error');
      }
    };
    remove();
  };

  const handleDeleteFolder = (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити цю папку та весь її вміст?')) return;
    const remove = async () => {
      try {
        const res = await fetch(`/api/folders/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) {
          addNotification('Не вдалося видалити папку', 'error');
          return;
        }
        setFolders(prev => prev.filter(f => f.id !== id));
        setPhotos(prev => prev.filter(p => p.folder_id !== id));
        addNotification('Папку видалено', 'success');
        if (currentFolder?.id === id) setCurrentFolder(null);
      } catch {
        addNotification('Сталася помилка при видаленні папки', 'error');
      }
    };
    remove();
  };

  const handleMovePhoto = async (photoId: number, folderId: number | null) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId }),
      });
      if (!res.ok) {
        addNotification('Не вдалося перемістити фото', 'error');
        return;
      }
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, folder_id: folderId } : p));
      addNotification('Фото переміщено', 'success');
    } catch {
      addNotification('Сталася помилка при переміщенні фото', 'error');
    }
  };

  const filteredFolders = folders.filter(f =>
    f.parent_id === (currentFolder?.id || null) &&
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhotos = photos.filter(p =>
    p.folder_id === (currentFolder?.id || null) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBreadcrumbPath = (): FolderType[] => {
    if (!currentFolder) return [];
    const path: FolderType[] = [currentFolder];
    let parent = folders.find(f => f.id === currentFolder.parent_id);
    while (parent) {
      path.unshift(parent);
      parent = folders.find(f => f.id === parent!.parent_id);
    }
    return path;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-30`}>
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ImageIcon size={18} />
            </div>
            <span className="font-display font-bold text-lg">Lumina</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-100 rounded-lg">
            <ChevronRight className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          <div>
            <p className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 ${!isSidebarOpen && 'hidden'}`}>
              Основне
            </p>
            <button
              onClick={() => { setCurrentFolder(null); setShowProfile(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${!currentFolder && !showProfile ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ImageIcon size={20} />
              <span className={`text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>Всі фото</span>
            </button>
            {/* <button
              onClick={() => { setActiveTab('shared'); setCurrentFolder(null); setShowProfile(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${activeTab === 'shared' && !showProfile ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Share2 size={20} />
              <span className={`text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>Спільні зі мною</span>
            </button> */}
          </div>

          <div>
            <p className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 ${!isSidebarOpen && 'hidden'}`}>
              Мої папки
            </p>
            {folders.filter(f => !f.parent_id).map(folder => (
              <button
                key={folder.id}
                onClick={() => { setCurrentFolder(folder); setShowProfile(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${currentFolder?.id === folder.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Folder size={20} />
                <span className={`text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>{folder.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setShowProfile(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors mb-2 ${showProfile ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <UserIcon size={20} />
            <span className={`text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>Профіль</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
            <LogOut size={20} />
            <span className={`text-sm font-medium ${!isSidebarOpen && 'hidden'}`}>Вийти</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Пошук фото та папок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={() => setShowProfile(true)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{user.email.split('@')[0]}</p>
                <p className="text-xs text-slate-500 mt-1">Власник</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200">
                <UserIcon size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {showProfile ? (
              <ProfileSection user={user} onBack={() => setShowProfile(false)} addNotification={addNotification} />
            ) : (
              <>
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">
                      {currentFolder ? currentFolder.name : 'Всі фото'}
                    </h1>
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-1 flex-wrap">
                      <button
                        onClick={() => setCurrentFolder(null)}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        Мій диск
                      </button>
                      {getBreadcrumbPath().map((folder, index) => (
                        <div key={folder.id} className="flex items-center gap-1">
                          <ChevronRight size={14} />
                          <button
                            onClick={() => setCurrentFolder(folder)}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {folder.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowFolderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <Plus size={18} />
                        Папка
                      </button>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                      >
                        <Upload size={18} />
                        Завантажити
                      </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredFolders.length === 0 && filteredPhotos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                          <ImageIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Тут поки порожньо</h3>
                        <p className="text-slate-500 max-w-xs">Завантажте своє перше фото або створіть папку, щоб почати.</p>
                      </div>
                    ) : (
                      <div 
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ${isDragging ? 'bg-indigo-50/50' : ''}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const photoId = e.dataTransfer.getData('photoId');
                          if (photoId) {
                            handleMovePhoto(Number(photoId), null);
                          }
                        }}
                      >
                        {/* Folders */}
                        {filteredFolders.map(folder => (
                          <motion.div
                            key={folder.id}
                            layoutId={`folder-${folder.id}`}
                            className={`group relative bg-white p-4 rounded-2xl border ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'} hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer`}
                            onClick={() => setCurrentFolder(folder)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const photoId = e.dataTransfer.getData('photoId');
                              if (photoId) {
                                handleMovePhoto(Number(photoId), folder.id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Folder size={24} />
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                  className="p-1 text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-semibold text-slate-900 truncate">{folder.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">Папка</p>
                          </motion.div>
                        ))}

                        {/* Photos */}
                        {filteredPhotos.map(photo => (
                          <motion.div
                            key={photo.id}
                            layoutId={`photo-${photo.id}`}
                            className="group relative aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer"
                            onClick={() => setSelectedPhoto(photo)}
                            draggable
                            onDragStart={(e) => {
                              (e as DragEvent).dataTransfer?.setData('photoId', String(photo.id));
                              setIsDragging(true);
                            }}
                            onDragEnd={() => setIsDragging(false)}
                          >
                            <img
                              src={photo.url}
                              alt={photo.name}
                              style={{ pointerEvents: 'none' }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                              <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-white/70 text-xs">{(photo.size / 1024 / 1024).toFixed(1)} MB</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                                    className="p-1.5 bg-white/20 hover:bg-rose-500 rounded-lg text-white backdrop-blur-sm"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showFolderModal && (
          <Modal title="Створити папку" onClose={() => setShowFolderModal(false)}>
            <FolderForm onSubmit={handleCreateFolder} onCancel={() => setShowFolderModal(false)} />
          </Modal>
        )}
        {showUploadModal && (
          <Modal title="Завантажити фото" onClose={() => setShowUploadModal(false)}>
            <UploadForm onSubmit={handleUploadPhoto} onCancel={() => setShowUploadModal(false)} />
          </Modal>
        )}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col"
            >
              <div className="flex items-center justify-between p-4 text-white">
                <h3 className="font-display font-bold text-xl">{selectedPhoto.name}</h3>
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2">
                    <Download size={20} />
                    <span className="hidden sm:inline">Завантажити</span>
                  </button>

                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden rounded-3xl bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.name}
                  style={{ pointerEvents: 'none' }}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  </div>
);

const FolderForm = ({ onSubmit, onCancel }: { onSubmit: (name: string) => Promise<void>, onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(name);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Назва папки</label>
        <input
          autoFocus
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="Наприклад: Відпустка 2024"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50">
          Скасувати
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? 'Створення...' : 'Створити'}
        </button>
      </div>
    </form>
  );
};

const UploadForm = ({ onSubmit, onCancel }: { onSubmit: (name: string, file: File) => Promise<void>, onCancel: () => void }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(name, file);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
          <Upload size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Натисніть для вибору або перетягніть</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG до 10MB</p>
        </div>
        {file && <p className="text-xs text-emerald-600 font-medium">Фото вибрано: {file.name}</p>}
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);
            if (f && !name) setName(f.name);
          }}
        />
      </label>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Назва фото</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            placeholder="Назва файлу"
          />
        </div>
        <p className="text-xs text-slate-500">Файл буде завантажено у ваше S3 сховище.</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50">
          Скасувати
        </button>
        <button type="submit" disabled={!file || submitting} className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Завантаження...' : 'Завантажити'}
        </button>
      </div>
    </form>
  );
};

const ProfileSection = ({ user, onBack, addNotification }: { user: User, onBack: () => void, addNotification: any }) => {
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification('Пароль змінено (симуляція)', 'success');
    setNewPassword('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl"
    >
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={20} />
        <span>Назад до фото</span>
      </button>

      <h2 className="text-3xl font-display font-bold mb-8">Мій профіль</h2>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Інформація про акаунт</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Дата реєстрації</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Безпека</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Новий пароль</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Оновити пароль
            </button>
          </form>
        </div>

        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
          <h3 className="text-lg font-bold text-rose-900 mb-2">Небезпечна зона</h3>
          <p className="text-rose-700 text-sm mb-4">Видалення акаунту призведе до безповоротного видалення всіх ваших фото та папок.</p>
          <button className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
            Видалити акаунт
          </button>
        </div>
      </div>
    </motion.div>
  );
};
